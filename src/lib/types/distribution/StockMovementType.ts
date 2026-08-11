export type StockMovementType = {
  id: string;

  movementType: "TRANSFER";
  customerId: string;
customerName: string;
  productId: string;
  productName: string;
  batchId?: string;
  productMode: "raw_stock" | "finished_stock" | "simple";
locationCode:string;
responsiblePerson:string;
  quantity: number;
name: string;
  fromLocationType: string;
  fromLocationRef: string;
  fromLocationName: string;

  toLocationType: string;
  toLocationRef: string;
  toLocationName: string;

  remarks: string;
movementDate:string;
  createdBy: string;

  createdAt: number;
};