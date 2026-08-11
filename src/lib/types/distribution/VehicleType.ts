import { StorageType } from "./StorageType";


export type VehicleType = {
  id: string;

  locationCode: string;      // PB10AB1234
  name: string;           // Pickup, Tata Ace, Bolero
  capacity?: number;
  type: StorageType;
wholeSalePrice?: number;
  responsiblePersonId: string;      // Employee ID
  responsiblePersonName: string;    // Snapshot

  active: boolean;

  remarks?: string;

  createdAt?: number;
  updatedAt: number;
};