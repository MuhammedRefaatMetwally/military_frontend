export interface MarketEntry {
    name: string;
    value: number;
    transactionsPrev: number;
    transactionsCurr: number;
    changePct: number;
  }
  
  export interface BarDataItem {
    value: number | null;
    itemStyle?: { color: string; borderRadius?: number[] };
    label?: {
      show: boolean;
      position: string;
      formatter: string;
      color: string;
      fontSize: number;
      fontWeight: number;
    };
  }
  
  export interface MarkLineItem {
    xAxis: number;
    yAxis: number;
  }
  
  export interface SeriesData {
    xLabels: string[];
    helperData: (number | null)[];
    incData: (BarDataItem | null)[];
    decData: (BarDataItem | null)[];
    totalData: (BarDataItem | null)[];
    connectorPoints: { index: number; value: number }[];
  }
  
  export type PeriodMode = "سنوي" | "ربعي";