import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: Request, context: any) {
  console.log("---- API HIT ----");

  const params = await context.params;
  const clientId = params.clientId?.trim();

  console.log("CLIENT ID:", clientId);

  if (!clientId) {
    return Response.json(
      { error: "Missing clientId" },
      { status: 400 }
    );
  }

  try {
    // ✅ FETCH FROM FIRESTORE
    const docRef = adminDb.collection("clients").doc(clientId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return Response.json(
        { error: "Client not found", clientId },
        { status: 404 }
      );
    }

    const data = docSnap.data();

    // ✅ OPTIONAL: check active
    if (!data?.isActive) {
      return Response.json(
        { error: "Client inactive" },
        { status: 403 }
      );
    }

    // ✅ RETURN ONLY REQUIRED FIELDS
    return Response.json({
      success: true,
      data: {
        apiKey: data.apiKey,
        applicationId: data.applicationId,
        projectId: data.projectId,
      },
    });

  } catch (error) {
    console.error("API ERROR:", error);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}