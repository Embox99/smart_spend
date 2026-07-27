/**
 * Every chart in the app plots a labelled amount, whether the label is a
 * category, a source or a date. Keeping one shape means the recharts
 * wrappers need no per-caller key configuration.
 */
export interface ChartPoint {
  label: string;
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
