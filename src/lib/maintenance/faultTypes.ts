/**
 * =========================================================
 * FAULT PRIORITY
 * =========================================================
 */

export type FaultPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

/**
 * =========================================================
 * FAULT STATUS
 * =========================================================
 */

export type FaultStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "CANCELLED";

/**
 * =========================================================
 * FAULT PHOTO
 * =========================================================
 */

export type FaultPhoto = {
  id: string;

  url: string;

  fileName: string;

  storagePath: string;

  uploadedBy: string;

  uploadedByName?: string;

  uploadedAt: string | null;
};

/**
 * =========================================================
 * CREATE FAULT INPUT
 * =========================================================
 */

export type CreateFaultInput = {
  machineId: string;

  machineName: string;

  machineCode?: string;

  departmentId?: string;

  departmentName?: string;

  location?: string;

  /**
   * Fault information
   */

  faultTitle: string;

  faultDescription: string;

  priority: FaultPriority;

  /**
   * Person reporting the fault
   */

  reportedBy: string;

  reportedByName?: string;

  /**
   * Technician assignment
   */

  assignedTo?: string;

  assignedToName?: string;
};

/**
 * =========================================================
 * MAINTENANCE FAULT
 * =========================================================
 */

export type MaintenanceFault = {
  id: string;

  /**
   * Ticket
   */

  ticketNumber: string;

  /**
   * Machine
   */

  machineId: string;

  machineName: string;

  machineCode: string;

  departmentId: string;

  departmentName: string;

  location: string;

  /**
   * Fault
   */

  faultTitle: string;

  faultDescription: string;

  priority: FaultPriority;

  status: FaultStatus;

  /**
   * Reporter
   */

  reportedBy: string;

  reportedByName: string;

  reportedAt: string | null;

  /**
   * Assignment
   */

  assignedTo: string | null;

  assignedToName: string | null;

  assignedAt: string | null;

  /**
   * Maintenance timeline
   */

  startedAt: string | null;

  resolvedAt: string | null;

  closedAt: string | null;

  /**
   * Repair information
   */

  diagnosis: string;

  repairDescription: string;

  downtimeMinutes: number;

  remarks: string;

  /**
   * Photos
   */

  photos: FaultPhoto[];

  /**
   * Audit
   */

  createdAt: string | null;

  updatedAt: string | null;
};