"use server";

import { CreateFaultInput } from "@/lib/maintenance/faultTypes";
import { Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
 


import { adminDb } from "@/lib/firebaseAdmin";


/**
 * =========================================================
 * ADD FAULT / CREATE MAINTENANCE TICKET
 * =========================================================
 */

export async function addFault(
  input: CreateFaultInput
): Promise<{
  success: boolean;
  message: string;
  faultId?: string;
  ticketNumber?: string;
}> {
  try {
    /**
     * =======================================================
     * VALIDATION
     * =======================================================
     */

    if (!input.machineId?.trim()) {
      return {
        success: false,
        message: "Machine is required.",
      };
    }

    if (!input.machineName?.trim()) {
      return {
        success: false,
        message: "Machine name is required.",
      };
    }

    if (!input.faultTitle?.trim()) {
      return {
        success: false,
        message: "Fault title is required.",
      };
    }

    if (!input.faultDescription?.trim()) {
      return {
        success: false,
        message: "Fault description is required.",
      };
    }

    if (!input.reportedBy?.trim()) {
      return {
        success: false,
        message: "Reporter is required.",
      };
    }

    /**
     * =======================================================
     * VERIFY MACHINE EXISTS
     * =======================================================
     */

    const machineSnapshot = await adminDb
      .collection("machines")
      .doc(input.machineId.trim())
      .get();

    if (!machineSnapshot.exists) {
      return {
        success: false,
        message: "Selected machine was not found.",
      };
    }

    /**
     * =======================================================
     * GENERATE TICKET NUMBER
     * =======================================================
     *
     * Example:
     *
     * MNT-2026-00001
     *
     */

    const counterRef = adminDb
      .collection("counters")
      .doc("maintenanceFaults");

    const now = Timestamp.now();

    const ticketNumber =
      await adminDb.runTransaction(
        async (transaction) => {
          const counterSnapshot =
            await transaction.get(
              counterRef
            );

          let nextNumber = 1;

          if (counterSnapshot.exists) {
            const counterData =
              counterSnapshot.data();

            nextNumber =
              Number(
                counterData?.value || 0
              ) + 1;
          }

          transaction.set(
            counterRef,
            {
              value: nextNumber,
              updatedAt: now,
            },
            {
              merge: true,
            }
          );

          const year =
            new Date().getFullYear();

          return `MNT-${year}-${String(
            nextNumber
          ).padStart(5, "0")}`;
        }
      );

    /**
     * =======================================================
     * CREATE FAULT DOCUMENT
     * =======================================================
     */

    const faultRef = adminDb
      .collection("maintenanceFaults")
      .doc();

    await faultRef.set({
      ticketNumber,

      machineId:
        input.machineId.trim(),

      machineName:
        input.machineName.trim(),

      machineCode:
        input.machineCode?.trim() || "",

      departmentId:
        input.departmentId?.trim() || "",

      departmentName:
        input.departmentName?.trim() || "",

      location:
        input.location?.trim() || "",

      faultTitle:
        input.faultTitle.trim(),

      faultDescription:
        input.faultDescription.trim(),

      priority:
        input.priority || "MEDIUM",

      status: "OPEN",

      reportedBy:
        input.reportedBy.trim(),

      reportedByName:
        input.reportedByName?.trim() || "",

      reportedAt: now,

      assignedTo:
        input.assignedTo?.trim() || null,

      assignedToName:
        input.assignedToName?.trim() || null,

      assignedAt: null,

      startedAt: null,

      resolvedAt: null,

      closedAt: null,

      diagnosis: "",

      repairDescription: "",

      downtimeMinutes: 0,

      remarks: "",

      /**
       * Photos will be added later
       * through Firebase Storage.
       */

      photos: [],

      createdAt: now,

      updatedAt: now,
    });

    /**
     * =======================================================
     * UPDATE MACHINE STATUS
     * =======================================================
     *
     * A reported breakdown puts the machine into
     * BREAKDOWN status.
     *
     */

    await adminDb
      .collection("machines")
      .doc(input.machineId.trim())
      .update({
        status: "BREAKDOWN",
        updatedAt: now,
      });

    /**
     * =======================================================
     * REVALIDATE
     * =======================================================
     */

    revalidatePath(
      "/admin/maintenance/faults"
    );

    revalidatePath(
      "/admin/maintenance/machines"
    );

    /**
     * =======================================================
     * SUCCESS
     * =======================================================
     */

    return {
      success: true,
      message:
        "Machine fault reported successfully.",
      faultId: faultRef.id,
      ticketNumber,
    };
  } catch (error) {
    console.error(
      "addFault error:",
      error
    );

    return {
      success: false,
      message:
        "Failed to report machine fault.",
    };
  }
}

/**
 * =========================================================
 * GET FAULT BY ID
 * =========================================================
 */

export async function getFaultById(
  faultId: string
): Promise<MaintenanceFault | null> {
  try {
    if (!faultId) {
      return null;
    }

    const snapshot = await adminDb
      .collection("maintenanceFaults")
      .doc(faultId)
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

      ticketNumber:
        data.ticketNumber || "",

      machineId:
        data.machineId || "",

      machineName:
        data.machineName || "",

      machineCode:
        data.machineCode || "",

      departmentId:
        data.departmentId || "",

      departmentName:
        data.departmentName || "",

      location:
        data.location || "",

      faultTitle:
        data.faultTitle || "",

      faultDescription:
        data.faultDescription || "",

      priority:
        (data.priority ||
          "MEDIUM") as FaultPriority,

      status:
        (data.status ||
          "OPEN") as FaultStatus,

      reportedBy:
        data.reportedBy || "",

      reportedByName:
        data.reportedByName || "",

      reportedAt:
        data.reportedAt
          ? data.reportedAt
              .toDate()
              .toISOString()
          : null,

      assignedTo:
        data.assignedTo || null,

      assignedToName:
        data.assignedToName || null,

      assignedAt:
        data.assignedAt
          ? data.assignedAt
              .toDate()
              .toISOString()
          : null,

      startedAt:
        data.startedAt
          ? data.startedAt
              .toDate()
              .toISOString()
          : null,

      resolvedAt:
        data.resolvedAt
          ? data.resolvedAt
              .toDate()
              .toISOString()
          : null,

      closedAt:
        data.closedAt
          ? data.closedAt
              .toDate()
              .toISOString()
          : null,

      diagnosis:
        data.diagnosis || "",

      repairDescription:
        data.repairDescription || "",

      downtimeMinutes:
        Number(
          data.downtimeMinutes || 0
        ),

      remarks:
        data.remarks || "",

      photos:
        Array.isArray(data.photos)
          ? data.photos
          : [],

      createdAt:
        data.createdAt
          ? data.createdAt
              .toDate()
              .toISOString()
          : null,

      updatedAt:
        data.updatedAt
          ? data.updatedAt
              .toDate()
              .toISOString()
          : null,
    };
  } catch (error) {
    console.error(
      "getFaultById error:",
      error
    );

    return null;
  }
}

/**
 * =========================================================
 * GET ALL FAULTS
 * =========================================================
 */

export async function getFaults(): Promise<
  MaintenanceFault[]
> {
  try {
    const snapshot = await adminDb
      .collection("maintenanceFaults")
      .orderBy(
        "reportedAt",
        "desc"
      )
      .get();

    return snapshot.docs.map(
      (doc) => {
        const data = doc.data();

        return {
          id: doc.id,

          ticketNumber:
            data.ticketNumber || "",

          machineId:
            data.machineId || "",

          machineName:
            data.machineName || "",

          machineCode:
            data.machineCode || "",

          departmentId:
            data.departmentId || "",

          departmentName:
            data.departmentName || "",

          location:
            data.location || "",

          faultTitle:
            data.faultTitle || "",

          faultDescription:
            data.faultDescription || "",

          priority:
            (data.priority ||
              "MEDIUM") as FaultPriority,

          status:
            (data.status ||
              "OPEN") as FaultStatus,

          reportedBy:
            data.reportedBy || "",

          reportedByName:
            data.reportedByName || "",

          reportedAt:
            data.reportedAt
              ? data.reportedAt
                  .toDate()
                  .toISOString()
              : null,

          assignedTo:
            data.assignedTo || null,

          assignedToName:
            data.assignedToName || null,

          assignedAt:
            data.assignedAt
              ? data.assignedAt
                  .toDate()
                  .toISOString()
              : null,

          startedAt:
            data.startedAt
              ? data.startedAt
                  .toDate()
                  .toISOString()
              : null,

          resolvedAt:
            data.resolvedAt
              ? data.resolvedAt
                  .toDate()
                  .toISOString()
              : null,

          closedAt:
            data.closedAt
              ? data.closedAt
                  .toDate()
                  .toISOString()
              : null,

          diagnosis:
            data.diagnosis || "",

          repairDescription:
            data.repairDescription || "",

          downtimeMinutes:
            Number(
              data.downtimeMinutes || 0
            ),

          remarks:
            data.remarks || "",

          photos:
            Array.isArray(data.photos)
              ? data.photos
              : [],

          createdAt:
            data.createdAt
              ? data.createdAt
                  .toDate()
                  .toISOString()
              : null,

          updatedAt:
            data.updatedAt
              ? data.updatedAt
                  .toDate()
                  .toISOString()
              : null,
        };
      }
    );
  } catch (error) {
    console.error(
      "getFaults error:",
      error
    );

    return [];
  }
}

/**
 * =========================================================
 * UPDATE FAULT STATUS
 * =========================================================
 */

export async function updateFaultStatus(
  faultId: string,
  status: FaultStatus
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!faultId) {
      return {
        success: false,
        message: "Fault ID is required.",
      };
    }

    const faultRef = adminDb
      .collection("maintenanceFaults")
      .doc(faultId);

    const faultSnapshot =
      await faultRef.get();

    if (!faultSnapshot.exists) {
      return {
        success: false,
        message: "Fault ticket not found.",
      };
    }

    const now = Timestamp.now();

    const updateData: Record<
      string,
      unknown
    > = {
      status,
      updatedAt: now,
    };

    /**
     * =======================================================
     * STATUS TIMESTAMPS
     * =======================================================
     */

    if (status === "IN_PROGRESS") {
      updateData.startedAt = now;
    }

    if (status === "RESOLVED") {
      updateData.resolvedAt = now;
    }

    if (status === "CLOSED") {
      updateData.closedAt = now;
    }

    await faultRef.update(
      updateData
    );

    /**
     * =======================================================
     * IF CLOSED / RESOLVED, CHECK MACHINE
     * =======================================================
     */

    if (
      status === "RESOLVED" ||
      status === "CLOSED"
    ) {
      const faultData =
        faultSnapshot.data();

      const machineId =
        faultData?.machineId;

      if (machineId) {
        await adminDb
          .collection("machines")
          .doc(machineId)
          .update({
            status: "ACTIVE",
            updatedAt: now,
          });

        revalidatePath(
          "/admin/maintenance/machines"
        );
      }
    }

    revalidatePath(
      "/admin/maintenance/faults"
    );

    return {
      success: true,
      message:
        "Fault status updated successfully.",
    };
  } catch (error) {
    console.error(
      "updateFaultStatus error:",
      error
    );

    return {
      success: false,
      message:
        "Failed to update fault status.",
    };
  }
}

/**
 * =========================================================
 * ASSIGN FAULT TO TECHNICIAN
 * =========================================================
 */

export async function assignFault(
  faultId: string,
  assignedTo: string,
  assignedToName: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!faultId) {
      return {
        success: false,
        message: "Fault ID is required.",
      };
    }

    if (!assignedTo?.trim()) {
      return {
        success: false,
        message:
          "Technician is required.",
      };
    }

    const faultRef = adminDb
      .collection("maintenanceFaults")
      .doc(faultId);

    const snapshot =
      await faultRef.get();

    if (!snapshot.exists) {
      return {
        success: false,
        message: "Fault ticket not found.",
      };
    }

    const now = Timestamp.now();

    await faultRef.update({
      assignedTo:
        assignedTo.trim(),

      assignedToName:
        assignedToName?.trim() || "",

      assignedAt: now,

      status: "ASSIGNED",

      updatedAt: now,
    });

    revalidatePath(
      "/admin/maintenance/faults"
    );

    return {
      success: true,
      message:
        "Fault assigned successfully.",
    };
  } catch (error) {
    console.error(
      "assignFault error:",
      error
    );

    return {
      success: false,
      message:
        "Failed to assign fault.",
    };
  }
}

/**
 * =========================================================
 * UPDATE REPAIR INFORMATION
 * =========================================================
 */

export async function updateFaultRepair(
  faultId: string,
  input: {
    diagnosis: string;
    repairDescription: string;
    downtimeMinutes: number;
    remarks?: string;
  }
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!faultId) {
      return {
        success: false,
        message: "Fault ID is required.",
      };
    }

    const faultRef = adminDb
      .collection("maintenanceFaults")
      .doc(faultId);

    const snapshot =
      await faultRef.get();

    if (!snapshot.exists) {
      return {
        success: false,
        message: "Fault ticket not found.",
      };
    }

    await faultRef.update({
      diagnosis:
        input.diagnosis?.trim() || "",

      repairDescription:
        input.repairDescription?.trim() ||
        "",

      downtimeMinutes:
        Number(
          input.downtimeMinutes || 0
        ),

      remarks:
        input.remarks?.trim() || "",

      updatedAt:
        Timestamp.now(),
    });

    revalidatePath(
      "/admin/maintenance/faults"
    );

    return {
      success: true,
      message:
        "Repair information updated successfully.",
    };
  } catch (error) {
    console.error(
      "updateFaultRepair error:",
      error
    );

    return {
      success: false,
      message:
        "Failed to update repair information.",
    };
  }
}

/**
 * =========================================================
 * DELETE FAULT
 * =========================================================
 */

export async function deleteFault(
  faultId: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!faultId) {
      return {
        success: false,
        message: "Fault ID is required.",
      };
    }

    const faultRef = adminDb
      .collection("maintenanceFaults")
      .doc(faultId);

    const snapshot =
      await faultRef.get();

    if (!snapshot.exists) {
      return {
        success: false,
        message: "Fault ticket not found.",
      };
    }

    await faultRef.delete();

    revalidatePath(
      "/admin/maintenance/faults"
    );

    return {
      success: true,
      message:
        "Fault ticket deleted successfully.",
    };
  } catch (error) {
    console.error(
      "deleteFault error:",
      error
    );

    return {
      success: false,
      message:
        "Failed to delete fault ticket.",
    };
  }
}