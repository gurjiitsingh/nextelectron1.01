import { PaymentMethodType } from './PaymentMethodType';

export type TruckSaleItemType = {
  id: string;

  productId: string;
  productName: string;

  quantity: number;
  unitPrice: number;
  lineValue: number;

  createdAt?: any;
};

export type TruckSaleReportType = {
  saleId: string;

  vehicleId: string;
  vehicleName: string;
  locationCode: string;
  responsiblePerson: string;

  wholeSaleCutomerId: string;
  wholeSaleCutomerName: string;

  totalAmount: number;

  paymentStatus: 'PAID' | 'PARTIAL' | 'CREDIT';
  paymentMethod?: PaymentMethodType | null;

  paidAmount: number;
  dueAmount: number;

  remarks?: string;

  totalItems: number;
  totalQuantity: number;

  status: string;

  createdBy?: string;
  createdAt?: any;

  items: TruckSaleItemType[];
};