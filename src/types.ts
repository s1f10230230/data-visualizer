import type { Color } from "antd/es/color-picker";
import type { RadioChangeEvent } from "antd/es/radio";
import type { ChangeEvent } from "react";

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
  name: string;
  timestamp: number;
}

export type ChartType = "bar" | "line" | "pie" | "scatter" | "area";

export interface ChartTypeButton {
  type: ChartType;
  icon: React.ReactNode;
  label: string;
}

export type ColorPickerChangeEvent = (color: Color) => void;
export type InputChangeEvent = ChangeEvent<HTMLInputElement>;
export type RadioGroupChangeEvent = RadioChangeEvent;
