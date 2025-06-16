export interface ChartData {
  features: string[];
  records: (string | number)[][];
}

export interface GraphSettings {
  chartType: "bar" | "line" | "pie" | "scatter" | "area" | "boxplot";
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
