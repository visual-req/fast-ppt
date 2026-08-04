<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type IntroSection = {
  label?: string;
  title?: string;
  text?: string;
  items?: string[];
};

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => toText(item)).filter(Boolean).slice(0, 4);
}

const photo = computed(() => {
  const raw =
    props.slide?.photo && typeof props.slide.photo === "object" && !Array.isArray(props.slide.photo)
      ? props.slide.photo
      : props.slide?.image && typeof props.slide.image === "object" && !Array.isArray(props.slide.image)
        ? props.slide.image
        : {};
  return {
    src: toText(raw.src) || toText(raw.url),
    alt: toText(raw.alt) || toText(props.slide?.title) || "profile photo",
    caption: toText(raw.caption)
  };
});

const profile = computed(() => {
  const raw =
    props.slide?.profile && typeof props.slide.profile === "object" && !Array.isArray(props.slide.profile)
      ? props.slide.profile
      : {};
  return {
    name: toText(raw.name) || "姓名 Name",
    role: toText(raw.role) || "职位 / Role",
    summary: toText(raw.summary) || "用一段简短的话概括个人背景、职责和核心价值。",
    organization: toText(raw.organization),
    location: toText(raw.location),
    tags: toStrings(Array.isArray(raw.tags) && raw.tags.length ? raw.tags : props.slide?.tags)
  };
});

const sections = computed<IntroSection[]>(() => {
  const raw = Array.isArray(props.slide?.sections)
    ? props.slide.sections
    : Array.isArray(props.slide?.blocks)
      ? props.slide.blocks
      : [];
  return raw.slice(0, 4).map((section: unknown, index: number) => {
    if (typeof section === "string") return { title: `模块 ${index + 1}`, text: section };
    if (!section || typeof section !== "object" || Array.isArray(section)) return { title: `模块 ${index + 1}` };
    const record = section as Record<string, unknown>;
    return {
      label: toText(record.label) || `PART ${String(index + 1).padStart(2, "0")}`,
      title: toText(record.title) || `模块 ${index + 1}`,
      text: toText(record.text),
      items: toStrings(record.items)
    };
  });
});

const factPills = computed(() => {
  const values = [profile.value.organization, profile.value.location].filter(Boolean);
  return values.slice(0, 2);
});
</script>

<template>
  <Card v-if="!sections.length && !photo.src && !toText(profile.summary)" title="无数据" />
  <div v-else class="profileIntroRoot">
    <div class="profileIntroPhotoPanel">
      <div class="profileIntroPhotoShell">
        <img
          v-if="photo.src"
          :src="photo.src"
          :alt="photo.alt"
          class="profileIntroPhoto"
        />
        <div v-else class="profileIntroPlaceholder">
          <div class="profileIntroPlaceholderHalo"></div>
          <div class="profileIntroPlaceholderPortrait">
            <div class="profileIntroPlaceholderHead"></div>
            <div class="profileIntroPlaceholderBody"></div>
          </div>
          <div class="profileIntroPlaceholderGrid"></div>
        </div>

        <div class="profileIntroPhotoOverlay"></div>

        <div class="profileIntroPhotoMeta">
          <div class="profileIntroBadge">Profile</div>
          <div class="profileIntroName">{{ profile.name }}</div>
          <div class="profileIntroRole">{{ profile.role }}</div>
        </div>
      </div>

      <div v-if="photo.caption" class="profileIntroCaption">{{ photo.caption }}</div>
    </div>

    <div class="profileIntroInfoPanel">
      <div class="profileIntroSummaryCard">
        <div class="profileIntroSummaryLabel">Introduction</div>
        <div class="profileIntroSummaryTitle">{{ profile.name }}</div>
        <div class="profileIntroSummaryRole">{{ profile.role }}</div>
        <div class="profileIntroSummaryText">{{ profile.summary }}</div>

        <div v-if="factPills.length" class="profileIntroFacts">
          <div v-for="(fact, index) in factPills" :key="index" class="profileIntroFact">{{ fact }}</div>
        </div>

        <div v-if="profile.tags.length" class="profileIntroTags">
          <div v-for="(tag, index) in profile.tags" :key="index" class="profileIntroTag">{{ tag }}</div>
        </div>
      </div>

      <div class="profileIntroSections">
        <div v-for="(section, index) in sections" :key="index" class="profileIntroSection">
          <div class="profileIntroSectionLabel">{{ section.label || `PART ${String(index + 1).padStart(2, '0')}` }}</div>
          <div class="profileIntroSectionTitle">{{ section.title || `模块 ${index + 1}` }}</div>
          <div v-if="toText(section.text)" class="profileIntroSectionText">{{ section.text }}</div>
          <div v-if="section.items?.length" class="profileIntroSectionItems">
            <div v-for="(item, itemIndex) in section.items" :key="itemIndex" class="profileIntroSectionItem">
              {{ item }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profileIntroRoot {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(300px, 0.92fr) minmax(0, 1.08fr);
  gap: 18px;
}

.profileIntroPhotoPanel,
.profileIntroInfoPanel {
  min-width: 0;
  min-height: 0;
}

.profileIntroPhotoPanel {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 12px;
}

.profileIntroPhotoShell {
  position: relative;
  min-height: 0;
  border-radius: 30px;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(77, 160, 255, 0.24), transparent 30%),
    linear-gradient(180deg, #eef4fb 0%, #dfeaf7 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 22px 36px rgba(20, 61, 122, 0.1);
}

.profileIntroPhoto,
.profileIntroPlaceholder,
.profileIntroPhotoOverlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.profileIntroPhoto {
  object-fit: cover;
}

.profileIntroPhotoOverlay {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.06) 0%, rgba(15, 23, 42, 0.42) 100%);
}

.profileIntroPlaceholder {
  overflow: hidden;
}

.profileIntroPlaceholderHalo {
  position: absolute;
  inset: 8% 10% auto;
  height: 56%;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0.08) 68%, transparent 74%);
}

.profileIntroPlaceholderPortrait {
  position: absolute;
  left: 50%;
  bottom: 18%;
  width: 54%;
  height: 58%;
  transform: translateX(-50%);
}

.profileIntroPlaceholderHead {
  width: 32%;
  aspect-ratio: 1;
  margin: 0 auto;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 12px 24px rgba(20, 61, 122, 0.08);
}

.profileIntroPlaceholderBody {
  width: 88%;
  height: 68%;
  margin: 8% auto 0;
  border-radius: 42% 42% 18% 18%;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 12px 24px rgba(20, 61, 122, 0.08);
}

.profileIntroPlaceholderGrid {
  position: absolute;
  inset: auto -12% -16% auto;
  width: 58%;
  height: 34%;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.22) 1px, transparent 1px);
  background-size: 28px 28px;
  transform: rotate(-12deg);
}

.profileIntroPhotoMeta {
  position: absolute;
  left: 22px;
  right: 22px;
  bottom: 22px;
  z-index: 1;
  padding: 18px 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
}

.profileIntroBadge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.profileIntroName {
  margin-top: 10px;
  color: #ffffff;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.18;
}

.profileIntroRole {
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.88);
  font-size: 15px;
  line-height: 1.5;
}

.profileIntroCaption {
  padding: 0 4px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.55;
}

.profileIntroInfoPanel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 14px;
}

.profileIntroSummaryCard {
  padding: 22px 24px;
  border-radius: 28px;
  background: linear-gradient(135deg, #1f4f97 0%, #123b7a 100%);
  color: #ffffff;
  box-shadow: 0 20px 34px rgba(18, 59, 122, 0.16);
}

.profileIntroSummaryLabel {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
}

.profileIntroSummaryTitle {
  margin-top: 10px;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.15;
}

.profileIntroSummaryRole {
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.84);
  font-size: 15px;
  line-height: 1.5;
}

.profileIntroSummaryText {
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.88);
  font-size: 14px;
  line-height: 1.65;
}

.profileIntroFacts,
.profileIntroTags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.profileIntroFacts {
  margin-top: 14px;
}

.profileIntroTags {
  margin-top: 12px;
}

.profileIntroFact,
.profileIntroTag {
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.profileIntroFact {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.92);
}

.profileIntroTag {
  padding: 7px 12px;
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
}

.profileIntroSections {
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.profileIntroSection {
  min-width: 0;
  padding: 16px 16px 14px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 251, 255, 0.98) 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 16px 28px rgba(20, 61, 122, 0.08);
}

.profileIntroSectionLabel {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(29, 111, 232, 0.08);
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.profileIntroSectionTitle {
  margin-top: 10px;
  color: #143d7a;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
}

.profileIntroSectionText {
  margin-top: 8px;
  color: #475569;
  font-size: 13px;
  line-height: 1.55;
}

.profileIntroSectionItems {
  margin-top: 12px;
  display: grid;
  gap: 8px;
}

.profileIntroSectionItem {
  padding: 9px 12px;
  border-radius: 14px;
  background: rgba(29, 111, 232, 0.06);
  color: #334155;
  font-size: 12px;
  line-height: 1.45;
}

@media (max-width: 1180px) {
  .profileIntroRoot {
    grid-template-columns: minmax(260px, 0.88fr) minmax(0, 1.12fr);
  }

  .profileIntroName,
  .profileIntroSummaryTitle {
    font-size: 24px;
  }

  .profileIntroSectionTitle {
    font-size: 18px;
  }

  .profileIntroSummaryText,
  .profileIntroSectionText,
  .profileIntroRole {
    font-size: 13px;
  }
}
</style>
