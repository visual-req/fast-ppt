import Cover from "./components/layouts/Cover.vue";
import TitleBullets from "./components/layouts/TitleBullets.vue";
import Centered from "./components/layouts/Centered.vue";
import ProblemStatement from "./components/layouts/ProblemStatement.vue";
import Matrix2x2 from "./components/layouts/Matrix2x2.vue";
import TableLayout from "./components/layouts/TableLayout.vue";
import GenericLayout from "./components/layouts/GenericLayout.vue";
import PieChart from "./components/layouts/PieChart.vue";
import BarChart from "./components/layouts/BarChart.vue";
import LineChart from "./components/layouts/LineChart.vue";
import RadarChart from "./components/layouts/RadarChart.vue";
import GanttChart from "./components/layouts/GanttChart.vue";
import MindMap from "./components/layouts/MindMap.vue";
import TopBottom from "./components/layouts/TopBottom.vue";
import Steps from "./components/layouts/Steps.vue";
import Phases from "./components/layouts/Phases.vue";
import FourGrid from "./components/layouts/FourGrid.vue";
import NineGrid from "./components/layouts/NineGrid.vue";
import TwoColumn from "./components/layouts/TwoColumn.vue";
import ThreeColumn from "./components/layouts/ThreeColumn.vue";
import Pyramid from "./components/layouts/Pyramid.vue";
import LogicTree from "./components/layouts/LogicTree.vue";
import IcicleTree from "./components/layouts/IcicleTree.vue";
import ArchitectureLayered from "./components/layouts/ArchitectureLayered.vue";
import DependencyGraph from "./components/layouts/DependencyGraph.vue";
import JourneyMap from "./components/layouts/JourneyMap.vue";
import SwimlaneProcess from "./components/layouts/SwimlaneProcess.vue";
import BeforeAfter from "./components/layouts/BeforeAfter.vue";
import ImpactEffort from "./components/layouts/ImpactEffort.vue";
import Raci from "./components/layouts/Raci.vue";
import QuadrantAxes from "./components/layouts/QuadrantAxes.vue";
import CoordinateAxis from "./components/layouts/CoordinateAxis.vue";
import Fishbone from "./components/layouts/Fishbone.vue";
import KpiCards from "./components/layouts/KpiCards.vue";
import CaseStudy from "./components/layouts/CaseStudy.vue";
import SvgCanvas from "./components/layouts/SvgCanvas.vue";

export const layoutComponentMap: Record<string, any> = {
  cover: Cover,
  agenda: TitleBullets,
  title_bullets: TitleBullets,
  summary: TitleBullets,
  roadmap: TitleBullets,
  timeline: TitleBullets,
  section_divider: Centered,
  thank_you: Centered,
  appendix: Centered,
  problem_statement: ProblemStatement,
  matrix_2x2: Matrix2x2,
  swot: Matrix2x2,
  quadrant_axes: QuadrantAxes,
  pie_chart: PieChart,
  donut_chart: PieChart,
  bar_chart: BarChart,
  line_chart: LineChart,
  area_chart: LineChart,
  radar_chart: RadarChart,
  gantt_chart: GanttChart,
  coordinate_axis: CoordinateAxis,
  scatter_plot: CoordinateAxis,
  bubble_chart: CoordinateAxis,
  mind_map: MindMap,
  top_bottom: TopBottom,
  steps: Steps,
  phases: Phases,
  four_grid: FourGrid,
  nine_grid: NineGrid,
  two_column: TwoColumn,
  three_column: ThreeColumn,
  before_after: BeforeAfter,
  pyramid: Pyramid,
  logic_tree: LogicTree,
  icicle_tree: IcicleTree,
  architecture_layered: ArchitectureLayered,
  dependency_graph: DependencyGraph,
  journey_map: JourneyMap,
  swimlane_process: SwimlaneProcess,
  fishbone: Fishbone,
  kpi_cards: KpiCards,
  case_study: CaseStudy,
  impact_effort: ImpactEffort,
  comparison_table: TableLayout,
  plan_table: TableLayout,
  risk_register: TableLayout,
  milestones: TableLayout,
  cost_benefit: TableLayout,
  raci: Raci,
  svg_full: SvgCanvas
};

export function pickLayout(layoutType: unknown): any {
  const key = typeof layoutType === "string" ? layoutType : "title_bullets";
  if (layoutComponentMap[key]) return layoutComponentMap[key];
  if (key.endsWith("_table")) return TableLayout;
  return GenericLayout;
}
