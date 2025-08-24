export class dashboardAnalysis {
  salesTotal: number;
  salesTotalPercent: number;
  salesQuantity: number;
  salesQuantityPending: number;
  salesQuantityPercent: number;
  reservationsQuantity: number;
  salesQuantityYear: salesQuantityMonth[];
}

export class salesQuantityMonth {
  index: number;
  salesQuantity: number;
}

export class salesAnalysisResume {
  currentQuantity: number;
  currentTotal: number;
  currentDateStart: Date;
  currentDateEnd: Date;
  previousQuantity: number;
  previousTotal: number;
  previousDateStart: Date;
  previousDateEnd: Date;
  quantityPercentage: number;
  totalPercentage: number;
}
