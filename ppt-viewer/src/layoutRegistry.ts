import Agenda from "./components/layouts/Agenda.vue";
import Cover from "./components/layouts/Cover.vue";
import TitleBullets from "./components/layouts/TitleBullets.vue";
import Roadmap from "./components/layouts/Roadmap.vue";
import Centered from "./components/layouts/Centered.vue";
import ProblemStatement from "./components/layouts/ProblemStatement.vue";
import Matrix2x2 from "./components/layouts/Matrix2x2.vue";
import TableLayout from "./components/layouts/TableLayout.vue";
import GenericLayout from "./components/layouts/GenericLayout.vue";
import PieChart from "./components/layouts/PieChart.vue";
import Gauge from "./components/layouts/Gauge.vue";
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
import ProcessFlow from "./components/layouts/ProcessFlow.vue";
import SwimlaneProcess from "./components/layouts/SwimlaneProcess.vue";
import SwimlaneBoard from "./components/layouts/SwimlaneBoard.vue";
import BeforeAfter from "./components/layouts/BeforeAfter.vue";
import ImpactEffort from "./components/layouts/ImpactEffort.vue";
import Raci from "./components/layouts/Raci.vue";
import QuadrantAxes from "./components/layouts/QuadrantAxes.vue";
import CoordinateAxis from "./components/layouts/CoordinateAxis.vue";
import Fishbone from "./components/layouts/Fishbone.vue";
import KpiCards from "./components/layouts/KpiCards.vue";
import FunnelChart from "./components/layouts/FunnelChart.vue";
import TargetMap from "./components/layouts/TargetMap.vue";
import KanbanBoard from "./components/layouts/KanbanBoard.vue";
import SectorExplainer from "./components/layouts/SectorExplainer.vue";
import CaseStudy from "./components/layouts/CaseStudy.vue";
import SectionDivider from "./components/layouts/SectionDivider.vue";
import ThankYou from "./components/layouts/ThankYou.vue";
import SvgCanvas from "./components/layouts/SvgCanvas.vue";
import MetroLoop from "./components/layouts/MetroLoop.vue";
import DoubleLoop from "./components/layouts/DoubleLoop.vue";
import IcebergLayout from "./components/layouts/IcebergLayout.vue";
import HouseLayout from "./components/layouts/HouseLayout.vue";
import RadialExplainer from "./components/layouts/RadialExplainer.vue";
import BrainExplainer from "./components/layouts/BrainExplainer.vue";
import ProfileIntro from "./components/layouts/ProfileIntro.vue";
import ChipExplainer from "./components/layouts/ChipExplainer.vue";
import DevelopmentRoute from "./components/layouts/DevelopmentRoute.vue";
import CycleExplainer from "./components/layouts/CycleExplainer.vue";
import MonthCalendar from "./components/layouts/MonthCalendar.vue";
import SymmetricSplit from "./components/layouts/SymmetricSplit.vue";
import PetalExplainer from "./components/layouts/PetalExplainer.vue";
import FanExplainer from "./components/layouts/FanExplainer.vue";
import UpwardArrows from "./components/layouts/UpwardArrows.vue";
import ScreenExplainer from "./components/layouts/ScreenExplainer.vue";
import StageChevrons from "./components/layouts/StageChevrons.vue";
import StageStaircase from "./components/layouts/StageStaircase.vue";
import StageZigzag from "./components/layouts/StageZigzag.vue";
import TripleMetrics from "./components/layouts/TripleMetrics.vue";
import StaffList from "./components/layouts/StaffList.vue";

export const layoutComponentMap: Record<string, any> = {
  cover: Cover,
  agenda: Agenda,
  title_bullets: TitleBullets,
  summary: TitleBullets,
  roadmap: Roadmap,
  timeline: Roadmap,
  section_divider: SectionDivider,
  thank_you: ThankYou,
  appendix: Centered,
  problem_statement: ProblemStatement,
  matrix_2x2: Matrix2x2,
  swot: Matrix2x2,
  quadrant_axes: QuadrantAxes,
  pie_chart: PieChart,
  donut_chart: PieChart,
  gauge: Gauge,
  funnel_chart: FunnelChart,
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
  process_flow: ProcessFlow,
  journey_map: JourneyMap,
  swimlane_process: SwimlaneProcess,
  swimlane_board: SwimlaneBoard,
  fishbone: Fishbone,
  target_map: TargetMap,
  sector_explainer: SectorExplainer,
  kpi_cards: KpiCards,
  kanban_board: KanbanBoard,
  house: HouseLayout,
  radial_explainer: RadialExplainer,
  brain_explainer: BrainExplainer,
  profile_intro: ProfileIntro,
  chip_explainer: ChipExplainer,
  development_route: DevelopmentRoute,
  cycle_explainer: CycleExplainer,
  month_calendar: MonthCalendar,
  symmetric_split: SymmetricSplit,
  petal_explainer: PetalExplainer,
  fan_explainer: FanExplainer,
  upward_arrows: UpwardArrows,
  screen_explainer: ScreenExplainer,
  stage_chevrons: StageChevrons,
  stage_staircase: StageStaircase,
  stage_zigzag: StageZigzag,
  triple_metrics: TripleMetrics,
  staff_list: StaffList,
  case_study: CaseStudy,
  impact_effort: ImpactEffort,
  comparison_table: TableLayout,
  plan_table: TableLayout,
  risk_register: TableLayout,
  milestones: TableLayout,
  cost_benefit: TableLayout,
  raci: Raci,
  svg_full: SvgCanvas,
  metro_loop: MetroLoop,
  double_loop: DoubleLoop,
  iceberg: IcebergLayout
};

export function pickLayout(layoutType: unknown): any {
  const key = typeof layoutType === "string" ? layoutType : "title_bullets";
  if (layoutComponentMap[key]) return layoutComponentMap[key];
  if (key.endsWith("_table")) return TableLayout;
  return GenericLayout;
}
