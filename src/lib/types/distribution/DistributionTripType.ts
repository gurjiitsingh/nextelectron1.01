export type DistributionTripStatus =
  | "OPEN"
  | "COMPLETED"
  | "CANCELLED";

export type DistributionTripType = {
  id: string;

  tripNo: string;

  vehicleId: string;
  vehicleName: string;

  responsiblePersonId: string;
  responsiblePersonName: string;

  helperId?: string;
  helperName?: string;

  routeId?: string;
  routeName?: string;

  remarks?: string;

  status: DistributionTripStatus;

  createdAt: number;
  updatedAt: number;
  createdBy: string;
};