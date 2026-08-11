"use server";

import { Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";


import { adminDb } from "@/lib/firebaseAdmin";
import { locationType } from "@/lib/types/locationType";
import { FieldValue } from "firebase-admin/firestore";
import { CreateMachineInput, Machine, MachineStatus } from "@/lib/maintenance/machineTypes";

 

/**
 * =========================================================
 * ADD MACHINE
 * =========================================================
 */

export async function addMachine(
  input: CreateMachineInput
): Promise<{
  success: boolean;
  message: string;
  machineId?: string;
}> {
  try {
    if (!input.machineCode?.trim()) {
      return {
        success: false,
        message: "Machine code is required.",
      };
    }

    if (!input.machineName?.trim()) {
      return {
        success: false,
        message: "Machine name is required.",
      };
    }

    if (!input.departmentId?.trim()) {
      return {
        success: false,
        message: "Department is required.",
      };
    }

    if (!input.location?.trim()) {
      return {
        success: false,
        message: "Location is required.",
      };
    }

    // Check duplicate machine code
    const existingSnapshot = await adminDb
      .collection("machines")
      .where("machineCode", "==", input.machineCode.trim())
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      return {
        success: false,
        message: "Machine code already exists.",
      };
    }

    const machineRef = adminDb.collection("machines").doc();

    const now = Timestamp.now();

    let installationDate: Timestamp | null = null;

    if (input.installationDate) {
      const date = new Date(input.installationDate);

      if (!Number.isNaN(date.getTime())) {
        installationDate = Timestamp.fromDate(date);
      }
    }

    await machineRef.set({
      machineCode: input.machineCode.trim(),
      machineName: input.machineName.trim(),

      departmentId: input.departmentId.trim(),
      departmentName: input.departmentName.trim(),

      location: input.location.trim(),

      manufacturer: input.manufacturer?.trim() || "",
      model: input.model?.trim() || "",
      serialNumber: input.serialNumber?.trim() || "",

      installationDate,

      status: input.status || "ACTIVE",

      createdAt: now,
      updatedAt: now,
    });

    revalidatePath("/admin/maintenance/machines");

    return {
      success: true,
      message: "Machine added successfully.",
      machineId: machineRef.id,
    };
  } catch (error) {
    console.error("addMachine error:", error);

    return {
      success: false,
      message: "Failed to add machine.",
    };
  }
}

/**
 * =========================================================
 * GET MACHINE BY ID
 * =========================================================
 */

export async function getMachineById(
  machineId: string
): Promise<Machine | null> {
  try {
    if (!machineId) {
      return null;
    }

    const snapshot = await adminDb
      .collection("machines")
      .doc(machineId)
      .get();

    if (!snapshot.exists) {
      return null;
    }

    const data = snapshot.data();

    if (!data) {
      return null;
    }

    return {
      id: snapshot.id,

      machineCode: data.machineCode || "",
      machineName: data.machineName || "",

      departmentId: data.departmentId || "",
      departmentName: data.departmentName || "",

      location: data.location || "",

      manufacturer: data.manufacturer || "",
      model: data.model || "",
      serialNumber: data.serialNumber || "",

      installationDate: data.installationDate
        ? data.installationDate.toDate().toISOString()
        : null,

      status: (data.status || "ACTIVE") as MachineStatus,

      createdAt: data.createdAt
        ? data.createdAt.toDate().toISOString()
        : null,

      updatedAt: data.updatedAt
        ? data.updatedAt.toDate().toISOString()
        : null,
    };
  } catch (error) {
    console.error("getMachineById error:", error);

    return null;
  }
}

/**
 * =========================================================
 * GET ALL MACHINES
 * =========================================================
 */

export async function getMachines(): Promise<Machine[]> {
  try {
    const snapshot = await adminDb
      .collection("machines")
      .orderBy("machineName", "asc")
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,

        machineCode: data.machineCode || "",
        machineName: data.machineName || "",

        departmentId: data.departmentId || "",
        departmentName: data.departmentName || "",

        location: data.location || "",

        manufacturer: data.manufacturer || "",
        model: data.model || "",
        serialNumber: data.serialNumber || "",

        installationDate: data.installationDate
          ? data.installationDate.toDate().toISOString()
          : null,

        status: (data.status || "ACTIVE") as MachineStatus,

        createdAt: data.createdAt
          ? data.createdAt.toDate().toISOString()
          : null,

        updatedAt: data.updatedAt
          ? data.updatedAt.toDate().toISOString()
          : null,
      };
    });
  } catch (error) {
    console.error("getMachines error:", error);

    return [];
  }
}

/**
 * =========================================================
 * UPDATE MACHINE STATUS
 * =========================================================
 */

export async function updateMachineStatus(
  machineId: string,
  status: MachineStatus
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!machineId) {
      return {
        success: false,
        message: "Machine ID is required.",
      };
    }

    await adminDb.collection("machines").doc(machineId).update({
      status,
      updatedAt: Timestamp.now(),
    });

    revalidatePath("/admin/maintenance/machines");

    return {
      success: true,
      message: "Machine status updated successfully.",
    };
  } catch (error) {
    console.error("updateMachineStatus error:", error);

    return {
      success: false,
      message: "Failed to update machine status.",
    };
  }
}

/**
 * =========================================================
 * DELETE MACHINE
 * =========================================================
 */

export async function deleteMachine(
  machineId: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!machineId) {
      return {
        success: false,
        message: "Machine ID is required.",
      };
    }

    await adminDb.collection("machines").doc(machineId).delete();

    revalidatePath("/admin/maintenance/machines");

    return {
      success: true,
      message: "Machine deleted successfully.",
    };
  } catch (error) {
    console.error("deleteMachine error:", error);

    return {
      success: false,
      message: "Failed to delete machine.",
    };
  }
}