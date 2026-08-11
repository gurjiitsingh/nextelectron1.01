export type MachineStatus =
  | "ACTIVE"
  | "UNDER_MAINTENANCE"
  | "BREAKDOWN"
  | "INACTIVE";

export type Machine = {
  id: string;

  machineCode: string;
  machineName: string;

  departmentId: string;
  departmentName: string;

  location: string;

  manufacturer: string;
  model: string;
  serialNumber: string;

  installationDate: string | null;

  status: MachineStatus;

  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreateMachineInput = {
  machineCode: string;
  machineName: string;

  departmentId: string;
  departmentName: string;

  location: string;

  manufacturer: string;
  model: string;
  serialNumber: string;

  installationDate?: string;

  status: MachineStatus;
};