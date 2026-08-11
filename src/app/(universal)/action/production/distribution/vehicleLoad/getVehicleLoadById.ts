'use server';

import { adminDb } from '@/lib/firebaseAdmin';

export type VehicleLoadItemType = {
  id: string;

  productId: string;
  productName: string;

  quantity: number;

  unitCost: number;
  lineValue: number;

  sellingPrice?: number;
  wholesalePrice?: number;
};

export type VehicleLoadType = {
  loadId: string;

  vehicleId: string;
  vehicleName: string;

  locationCode?: string;
  responsiblePerson?: string;

  remarks?: string;
  createdBy?: string;

  totalItems: number;
  totalQuantity: number;
  totalValue: number;

  status: 'LOADED';

  createdAt?: any;

  items: VehicleLoadItemType[];
};

export async function getVehicleLoadById(
  loadId: string
): Promise<VehicleLoadType | null> {

  const loadDoc = await adminDb
    .collection('vehicleLoads')
    .doc(loadId)
    .get();

  if (!loadDoc.exists) return null;

  const loadData = loadDoc.data()!;

  const itemsSnap = await adminDb
    .collection('vehicleLoads')
    .doc(loadId)
    .collection('items')
    .get();

  const items: VehicleLoadItemType[] =
    itemsSnap.docs.map((d) => {
      const item = d.data();

      return {
        id: d.id,

        productId: item.productId || '',
        productName: item.productName || '',

        quantity: Number(item.quantity || 0),

        unitCost: Number(item.unitCost || 0),
        lineValue: Number(item.lineValue || 0),

        sellingPrice:
          Number(item.sellingPrice || 0),

        wholesalePrice:
          Number(item.wholesalePrice || 0),
      };
    });

  return {
    loadId: loadData.loadId || loadDoc.id,

    vehicleId: loadData.vehicleId || '',
    vehicleName: loadData.vehicleName || '',

    locationCode:
      loadData.locationCode || '',

    responsiblePerson:
      loadData.responsiblePerson || '',

    remarks: loadData.remarks || '',
    createdBy: loadData.createdBy || '',

    totalItems: Number(loadData.totalItems || 0),

    totalQuantity:
      Number(loadData.totalQuantity || 0),

    totalValue:
      Number(loadData.totalValue || 0),

    status:
      (loadData.status as 'LOADED') ||
      'LOADED',

    createdAt: loadData.createdAt || null,

    items,
  };
}