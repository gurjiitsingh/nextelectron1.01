import { fetchCategories } from "@/app/(universal)/action/category/dbOperations";

export async function GET() {
  try {
    const categories = await fetchCategories();

    // sort safely
    categories.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    // clean undefined → null
    const cleaned = categories.map((c) =>
      JSON.parse(JSON.stringify(c))
    );

    const date = new Date().toISOString().split("T")[0];

    // ✅ ENV prefix
    const prefix = process.env.FILE_PREFIX;
    const safePrefix = prefix?.replace(/\s+/g, "-").toLowerCase();

    const fileName = safePrefix
      ? `${safePrefix}-categories-${date}.json`
      : `categories-${date}.json`;

    return new Response(JSON.stringify(cleaned, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename=${fileName}`,
      },
    });
  } catch (error) {
    console.error("API /categories backup error:", error);

    return new Response(
      JSON.stringify({ error: "Failed to download categories backup" }),
      { status: 500 }
    );
  }
}