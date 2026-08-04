<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

type CalendarEvent = {
  label?: string;
  tone?: string;
};

type CalendarDay = {
  day?: string | number;
  date?: string | number;
  muted?: boolean;
  today?: boolean;
  events?: CalendarEvent[];
};

function toText(value: unknown): string {
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
}

function toEvents(value: unknown): CalendarEvent[] {
  return Array.isArray(value) ? value.slice(0, 2) : [];
}

function toneClass(value: unknown): string {
  const key = toText(value).toLowerCase();
  if (["blue", "primary", "info"].includes(key)) return "monthCalendarEventBlue";
  if (["green", "success"].includes(key)) return "monthCalendarEventGreen";
  if (["amber", "orange", "warning", "yellow"].includes(key)) return "monthCalendarEventAmber";
  if (["red", "danger", "alert"].includes(key)) return "monthCalendarEventRed";
  return "monthCalendarEventBlue";
}

const monthTitle = computed(() => {
  const month = props.slide?.month;
  if (typeof month === "string" && month.trim()) return month;
  return "2026 / 08";
});

const subtitle = computed(() => {
  const raw = props.slide?.subtitle;
  return typeof raw === "string" ? raw : "";
});

const weekdays = computed(() => {
  const raw = props.slide?.weekdays;
  if (Array.isArray(raw) && raw.length >= 7) return raw.slice(0, 7).map((item: unknown) => toText(item) || "");
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
});

const days = computed<CalendarDay[]>(() => {
  const raw = props.slide?.days;
  if (Array.isArray(raw) && raw.length) {
    return raw.slice(0, 35).map((item: unknown, index: number) => {
      const record = item && typeof item === "object" && !Array.isArray(item) ? (item as Record<string, unknown>) : {};
      const rawDay = record.day ?? record.date ?? index + 1;
      return {
        day: typeof rawDay === "string" || typeof rawDay === "number" ? rawDay : index + 1,
        muted: Boolean(record.muted),
        today: Boolean(record.today),
        events: Array.isArray(record.events) ? record.events : []
      };
    });
  }

  return Array.from({ length: 35 }, (_, index) => ({
    day: index + 1,
    today: index === 11,
    muted: false,
    events:
      index === 2
        ? [{ label: "经营周会", tone: "blue" }]
        : index === 10
          ? [{ label: "里程碑评审", tone: "amber" }, { label: "资料归档", tone: "green" }]
          : index === 18
            ? [{ label: "投产窗口", tone: "red" }]
            : index === 24
              ? [{ label: "复盘会议", tone: "green" }]
              : []
  }));
});

const legend = computed(() => {
  const raw = props.slide?.legend;
  if (Array.isArray(raw) && raw.length) {
    return raw.slice(0, 4).map((item: unknown) => {
      const record = item && typeof item === "object" && !Array.isArray(item) ? (item as Record<string, unknown>) : {};
      return {
        label: toText(record.label) || "事项",
        tone: toneClass(record.tone)
      };
    });
  }

  return [
    { label: "关键会议", tone: "monthCalendarEventBlue" },
    { label: "里程碑", tone: "monthCalendarEventAmber" },
    { label: "已完成", tone: "monthCalendarEventGreen" },
    { label: "风险提醒", tone: "monthCalendarEventRed" }
  ];
});
</script>

<template>
  <div class="monthCalendarRoot">
    <div class="monthCalendarHeader">
      <div>
        <div class="monthCalendarBadge">Monthly View</div>
        <div class="monthCalendarMonth">{{ monthTitle }}</div>
        <div v-if="subtitle" class="monthCalendarSubtitle">{{ subtitle }}</div>
      </div>
      <div class="monthCalendarLegend">
        <div v-for="(item, index) in legend" :key="index" class="monthCalendarLegendItem">
          <span class="monthCalendarLegendDot" :class="item.tone"></span>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>

    <div class="monthCalendarBoard">
      <div v-for="(weekday, index) in weekdays" :key="index" class="monthCalendarWeekday">{{ weekday }}</div>

      <div
        v-for="(entry, index) in days"
        :key="index"
        class="monthCalendarCell"
        :class="{ monthCalendarCellMuted: entry.muted, monthCalendarCellToday: entry.today }"
      >
        <div class="monthCalendarDay">{{ toText(entry.day) || String(index + 1) }}</div>
        <div class="monthCalendarEvents">
          <div
            v-for="(event, eventIndex) in toEvents(entry.events)"
            :key="eventIndex"
            class="monthCalendarEvent"
            :class="toneClass(event?.tone)"
          >
            {{ toText(event?.label) || `事项 ${eventIndex + 1}` }}
          </div>
          <div v-if="Array.isArray(entry.events) && entry.events.length > 2" class="monthCalendarMore">
            +{{ entry.events.length - 2 }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.monthCalendarRoot {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 16px;
  height: 100%;
  min-height: 0;
}

.monthCalendarHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 22px;
  border-radius: 26px;
  background:
    radial-gradient(circle at top right, rgba(77, 160, 255, 0.18), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 248, 255, 0.98) 100%);
  border: 1px solid color-mix(in srgb, var(--fppt-border, #d7e3f4) 88%, transparent);
  box-shadow: 0 18px 30px rgba(20, 61, 122, 0.08);
}

.monthCalendarBadge {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(29, 111, 232, 0.08);
  color: var(--fppt-primary, #1d6fe8);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.monthCalendarMonth {
  margin-top: 10px;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
  color: var(--fppt-title, #143d7a);
}

.monthCalendarSubtitle {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--fppt-muted, #64748b);
  max-width: 460px;
}

.monthCalendarLegend {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px 14px;
  padding-top: 4px;
}

.monthCalendarLegendItem {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--fppt-muted, #64748b);
  font-size: 12px;
  font-weight: 700;
}

.monthCalendarLegendDot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.monthCalendarBoard {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-auto-rows: minmax(0, 1fr);
  gap: 10px;
  min-height: 0;
}

.monthCalendarWeekday {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  border-radius: 16px;
  background: rgba(29, 111, 232, 0.08);
  color: var(--fppt-primary, #1d6fe8);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.monthCalendarCell {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 10px;
  padding: 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid color-mix(in srgb, var(--fppt-border, #d7e3f4) 92%, transparent);
  box-shadow: 0 12px 22px rgba(20, 61, 122, 0.06);
  overflow: hidden;
}

.monthCalendarCellMuted {
  background: rgba(244, 247, 251, 0.88);
  opacity: 0.72;
}

.monthCalendarCellToday {
  border-color: rgba(29, 111, 232, 0.52);
  box-shadow: 0 16px 26px rgba(29, 111, 232, 0.12);
}

.monthCalendarDay {
  color: var(--fppt-title, #143d7a);
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
}

.monthCalendarEvents {
  min-height: 0;
  display: grid;
  align-content: start;
  gap: 6px;
  overflow: hidden;
}

.monthCalendarEvent {
  min-width: 0;
  padding: 7px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.35;
  white-space: normal;
  word-break: break-word;
}

.monthCalendarEventBlue {
  background: rgba(29, 111, 232, 0.12);
  color: #1d4ed8;
}

.monthCalendarEventGreen {
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
}

.monthCalendarEventAmber {
  background: rgba(245, 158, 11, 0.14);
  color: #b45309;
}

.monthCalendarEventRed {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
}

.monthCalendarMore {
  color: var(--fppt-muted, #64748b);
  font-size: 11px;
  font-weight: 700;
}

@media (max-width: 900px) {
  .monthCalendarHeader {
    flex-direction: column;
  }

  .monthCalendarLegend {
    justify-content: flex-start;
  }
}
</style>
