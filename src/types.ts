export interface DailyEntry {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  productName: string;
  sellQuantity: number;
  unitSellingPrice: number;
  unitCostPrice: number;
  discount: number;
  deliveryCost: number;
  
  // Calculated fields (handled by backend now)
  revenue?: number;
  costs?: {
    productCost: number;
    deliveryCost: number;
  };
  totalCosts?: number;
  netProfit?: number;
  notes?: string;
}
