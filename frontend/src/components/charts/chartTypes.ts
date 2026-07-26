/** Shapes the recharts wrappers agree on. */
export interface ChartPoint {
  month?: string;
  category?: string;
  name?: string;
  amount: number;
}

export interface TooltipEntry {
  name?: string | number;
  value?: string | number;
  payload?: ChartPoint;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
}

export interface LegendEntry {
  color?: string;
  value?: string | number;
}

export interface ChartLegendProps {
  payload?: LegendEntry[];
}
