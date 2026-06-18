<script setup lang="ts">
const { slide } = defineProps<{ slide: any }>();

type Bone = { category?: string; causes?: string[] };

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toBones(value: unknown): Bone[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((b) => ({
      category: toText((b as any)?.category ?? (b as any)?.title ?? (b as any)?.name),
      causes: Array.isArray((b as any)?.causes) ? (b as any).causes.map((c: any) => toText(c)).filter(Boolean) : []
    }))
    .slice(0, 8);
}

function placeholders(): Bone[] {
  return [
    { category: "人", causes: ["技能不足", "沟通不畅"] },
    { category: "流程", causes: ["步骤缺失", "缺少门禁"] },
    { category: "工具", causes: ["链路不通", "缺少自动化"] },
    { category: "数据", causes: ["口径不一", "质量不稳"] },
    { category: "环境", causes: ["不可复现", "依赖漂移"] },
    { category: "指标", causes: ["目标不清", "缺少验证"] }
  ];
}
</script>

<template>
  <div style="width: 100%; height: 100%">
    <svg width="100%" height="100%" viewBox="0 0 1200 560" preserveAspectRatio="none">
      <defs>
        <marker id="arrowHead" markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto">
          <path d="M0,0 L14,7 L0,14 z" fill="#2563eb"/>
        </marker>
      </defs>

      <rect x="0" y="0" width="1200" height="560" rx="18" fill="rgba(241,245,249,0.7)"/>

      <g stroke="rgba(37,99,235,0.65)" stroke-width="8" fill="none">
        <line x1="110" y1="280" x2="980" y2="280" marker-end="url(#arrowHead)"/>
      </g>

      <g fill="#ffffff" stroke="rgba(37,99,235,0.30)" stroke-width="2">
        <rect x="990" y="230" width="190" height="100" rx="16"/>
      </g>
      <text x="1085" y="265" text-anchor="middle" font-size="18" font-weight="900" fill="#0f172a">结果 / 影响</text>
      <text x="1085" y="296" text-anchor="middle" font-size="14" font-weight="700" fill="rgba(15,23,42,0.72)">
        {{ toText(slide?.effect ?? slide?.problem ?? slide?.result) || "要解释的问题" }}
      </text>

      <g
        v-for="(bone, idx) in (toBones(slide?.bones).length ? toBones(slide?.bones) : placeholders())"
        :key="idx"
      >
        <g v-if="idx < 6 && idx % 2 === 0">
          <line
            :x1="220 + idx * 120"
            y1="280"
            :x2="170 + idx * 120"
            y2="140"
            stroke="rgba(15,23,42,0.35)"
            stroke-width="6"
          />
          <rect :x="110 + idx * 120" y="88" width="220" height="76" rx="14" fill="#ffffff" stroke="rgba(15,23,42,0.10)"/>
          <text :x="220 + idx * 120" y="118" text-anchor="middle" font-size="14" font-weight="900" fill="#2563eb">
            {{ bone.category || ("原因 " + (idx + 1)) }}
          </text>
          <text
            v-for="(c, j) in (bone.causes || []).slice(0, 2)"
            :key="j"
            :x="220 + idx * 120"
            :y="142 + j * 18"
            text-anchor="middle"
            font-size="12"
            fill="rgba(15,23,42,0.75)"
          >
            {{ c }}
          </text>
        </g>
        <g v-else-if="idx < 6">
          <line
            :x1="220 + idx * 120"
            y1="280"
            :x2="170 + idx * 120"
            y2="420"
            stroke="rgba(15,23,42,0.35)"
            stroke-width="6"
          />
          <rect :x="110 + idx * 120" y="396" width="220" height="76" rx="14" fill="#ffffff" stroke="rgba(15,23,42,0.10)"/>
          <text :x="220 + idx * 120" y="426" text-anchor="middle" font-size="14" font-weight="900" fill="#2563eb">
            {{ bone.category || ("原因 " + (idx + 1)) }}
          </text>
          <text
            v-for="(c, j) in (bone.causes || []).slice(0, 2)"
            :key="j"
            :x="220 + idx * 120"
            :y="450 + j * 18"
            text-anchor="middle"
            font-size="12"
            fill="rgba(15,23,42,0.75)"
          >
            {{ c }}
          </text>
        </g>
      </g>

      <g>
        <rect x="90" y="244" width="150" height="72" rx="16" fill="#ffffff" stroke="rgba(15,23,42,0.10)"/>
        <text x="165" y="274" text-anchor="middle" font-size="14" font-weight="900" fill="#0f172a">鱼骨图</text>
        <text x="165" y="298" text-anchor="middle" font-size="12" fill="rgba(15,23,42,0.60)">原因 → 结果</text>
      </g>
    </svg>
  </div>
</template>
