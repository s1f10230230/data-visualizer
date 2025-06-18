export interface ChartData {
  features: string[];
  records: (string | number)[][];
  isSample?: boolean;
}

export interface GraphSettings {
  chartType: "bar" | "line" | "scatter" | "area" | "boxplot";
  xAxisFeature: string;
  yAxisFeatures: string[];
  xAxisLabel: string;
  yAxisLabel: string;
  legendPosition: "top" | "right" | "bottom" | "left";
  colorPalette: string[];
  zoom: number;
  filterFeature: string;
  filterOperator: ">" | "<" | "=" | ">=" | "<=";
  filterValue: number | null;
  sortFeature: string;
  sortOrder: "asc" | "desc";
}

export interface SavedSettings extends GraphSettings {
  timestamp: string;
  name: string;
}

export type ChartType = "bar" | "line" | "scatter" | "area" | "boxplot";

export interface ChartTypeButton {
  type: ChartType;
  icon: React.ReactNode;
  label: string;
}
