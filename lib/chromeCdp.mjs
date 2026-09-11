// 极简 CDP（Chrome DevTools Protocol）封装：启动 headless Chrome、开页面、求值、截图。
// 只依赖 Node 内置能力（node:child_process + 全局 WebSocket），不需要 puppeteer / playwright。
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser"
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function resolveChromeExecutable(explicit = "") {
  const candidates = [
    explicit,
    process.env.CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    ...CHROME_CANDIDATES
  ].filter((value) => typeof value === "string" && value.trim());

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error(
    `未找到 Chrome / Chromium 可执行文件。请安装 Chrome，或通过环境变量 CHROME_PATH 指定路径。已尝试：\n${candidates.join("\n")}`
  );
}

function waitForDevtoolsUrl(child, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    let stderr = "";
    const timer = setTimeout(() => {
      reject(new Error(`启动 Chrome 超时（${timeoutMs}ms）\n${stderr}`));
    }, timeoutMs);

    const done = (fn, value) => {
      clearTimeout(timer);
      fn(value);
    };

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
      const matched = stderr.match(/DevTools listening on (ws:\/\/\S+)/);
      if (matched) done(resolve, matched[1]);
    });
    child.once("error", (error) => done(reject, error));
    child.once("exit", (code) => done(reject, new Error(`Chrome 提前退出，code=${code}\n${stderr}`)));
  });
}

class CdpConnection {
  constructor(ws) {
    this.ws = ws;
    this.seq = 0;
    this.pending = new Map();
    this.waiters = new Set();
    ws.addEventListener("message", (event) => this.handleMessage(event));
    ws.addEventListener("close", () => this.handleClose());
  }

  static async connect(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", () => reject(new Error(`无法连接 CDP：${wsUrl}`)), { once: true });
    });
    return new CdpConnection(ws);
  }

  handleMessage(event) {
    let message;
    try {
      message = JSON.parse(typeof event.data === "string" ? event.data : String(event.data));
    } catch {
      return;
    }

    if (message.id && this.pending.has(message.id)) {
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(`${message.error.message}${message.error.data ? ` (${message.error.data})` : ""}`));
      else resolve(message.result ?? {});
      return;
    }

    if (!message.method) return;
    for (const waiter of [...this.waiters]) {
      if (waiter.method !== message.method) continue;
      if (waiter.sessionId && waiter.sessionId !== message.sessionId) continue;
      this.waiters.delete(waiter);
      clearTimeout(waiter.timer);
      waiter.resolve(message.params ?? {});
    }
  }

  handleClose() {
    for (const { reject } of this.pending.values()) reject(new Error("CDP 连接已关闭"));
    this.pending.clear();
    for (const waiter of this.waiters) {
      clearTimeout(waiter.timer);
      waiter.resolve(null);
    }
    this.waiters.clear();
  }

  send(method, params = {}, sessionId = "") {
    this.seq += 1;
    const id = this.seq;
    const payload = sessionId ? { id, method, params, sessionId } : { id, method, params };
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      try {
        this.ws.send(JSON.stringify(payload));
      } catch (error) {
        this.pending.delete(id);
        reject(error);
      }
    });
  }

  waitForEvent(method, { sessionId = "", timeoutMs = 30000 } = {}) {
    return new Promise((resolve) => {
      const waiter = { method, sessionId, resolve, timer: null };
      waiter.timer = setTimeout(() => {
        this.waiters.delete(waiter);
        resolve(null);
      }, timeoutMs);
      this.waiters.add(waiter);
    });
  }

  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

class CdpPage {
  constructor(connection, sessionId) {
    this.connection = connection;
    this.sessionId = sessionId;
  }

  send(method, params = {}) {
    return this.connection.send(method, params, this.sessionId);
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (result.exceptionDetails) {
      const detail = result.exceptionDetails.exception?.description ?? result.exceptionDetails.text ?? "未知错误";
      throw new Error(`页面求值失败：${detail}`);
    }
    return result.result?.value;
  }

  async goto(url, { timeoutMs = 30000 } = {}) {
    const loaded = this.connection.waitForEvent("Page.loadEventFired", { sessionId: this.sessionId, timeoutMs });
    await this.send("Page.navigate", { url });
    await loaded;
  }

  async waitForSelector(selector, { timeoutMs = 10000 } = {}) {
    const start = Date.now();
    for (;;) {
      const found = await this.evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`);
      if (found) return true;
      if (Date.now() - start > timeoutMs) return false;
      await sleep(120);
    }
  }

  async screenshot(clip) {
    const result = await this.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      fromSurface: true,
      clip: { ...clip, scale: 1 }
    });
    return Buffer.from(result.data, "base64");
  }
}

// 启动一个独立的 headless Chrome（独立 user-data-dir，不影响用户正在使用的浏览器）。
export async function launchBrowser(options = {}) {
  const executable = resolveChromeExecutable(options.chromePath);
  const viewport = { width: 1600, height: 900, ...(options.viewport ?? {}) };
  const deviceScaleFactor = Number(options.deviceScaleFactor) > 0 ? Number(options.deviceScaleFactor) : 3;
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "fast-ppt-chrome-"));

  const args = [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${userDataDir}`,
    `--window-size=${viewport.width},${viewport.height}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-gpu",
    "--hide-scrollbars",
    "--mute-audio",
    "about:blank"
  ];

  const child = spawn(executable, args, { stdio: ["ignore", "ignore", "pipe"] });
  let connection;
  try {
    const wsUrl = await waitForDevtoolsUrl(child);
    connection = await CdpConnection.connect(wsUrl);
  } catch (error) {
    try {
      child.kill("SIGKILL");
    } catch {}
    fs.rmSync(userDataDir, { recursive: true, force: true });
    throw error;
  }

  return {
    pid: child.pid,
    async newPage() {
      const { targetId } = await connection.send("Target.createTarget", { url: "about:blank" });
      const { sessionId } = await connection.send("Target.attachToTarget", { targetId, flatten: true });
      const page = new CdpPage(connection, sessionId);
      await page.send("Page.enable");
      await page.send("Runtime.enable");
      await page.send("Network.enable");
      await page.send("Network.setCacheDisabled", { cacheDisabled: true });
      await page.send("Emulation.setDeviceMetricsOverride", {
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor,
        mobile: false
      });
      return page;
    },
    async close() {
      try {
        await connection.send("Browser.close");
      } catch {}
      connection.close();
      try {
        child.kill("SIGTERM");
      } catch {}
      await sleep(150);
      fs.rmSync(userDataDir, { recursive: true, force: true });
    }
  };
}

export async function withBrowserPage(options, run) {
  const browser = await launchBrowser(options);
  try {
    const page = await browser.newPage();
    return await run(page, browser);
  } finally {
    await browser.close();
  }
}
