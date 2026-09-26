export interface Product {
  id: number;
  partNumber: string;
  description: string;
  price: number;
  priceText: string;
  status: 'Open for quoting' | 'Closed';
}

export interface LoadSummary {
  loadRunId: number;
  fileName: string;
  runBy: string;
  runAt: string;
  rowsInErp: number;
  rowsLoaded: number;
  rowsNotLoaded: number;
  complete: boolean;
  statusText: string;
  notLoaded: { rowNumber: number; partNumber: string | null; price: string | null; reason: string }[];
}
