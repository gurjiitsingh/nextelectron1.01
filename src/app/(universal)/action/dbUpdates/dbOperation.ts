import { adminDb } from "@/lib/firebaseAdmin";
import { fetchCategories } from "@/app/(universal)/action/category/dbOperations";

export async function updateAllProductsWithCategoryName() {
  try {
    console.log("🔹 Fetching categories...");
    const categories = await fetchCategories();

    // Convert category list to a Map for faster lookup
    const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));

    console.log("🔹 Fetching all products...");
    const productsSnapshot = await adminDb.collection("products").get();

    if (productsSnapshot.empty) {
      console.log("⚠️ No products found in the database.");
      return { updated: 0, skipped: 0, message: "No products to update." };
    }

    let updatedCount = 0;
    let skippedCount = 0;

    const batch = adminDb.batch();

    productsSnapshot.forEach((doc) => {
      const data = doc.data();
      const categoryId = data.categoryId;

      if (!categoryId || !categoryMap.has(categoryId)) {
        skippedCount++;
        return;
      }

      const categoryName = categoryMap.get(categoryId);

      // Only update if different or missing
      if (data.productCat !== categoryName) {
        const productRef = adminDb.collection("products").doc(doc.id);
        batch.update(productRef, {
          productCat: categoryName,
          updatedAt: new Date().toISOString(),
        });
        updatedCount++;
      } else {
        skippedCount++;
      }
    });

    // Commit all batched updates
    if (updatedCount > 0) {
      await batch.commit();
    }

    console.log(` Updated ${updatedCount} products. Skipped ${skippedCount}.`);

    return {
      updated: updatedCount,
      skipped: skippedCount,
      message: `Updated ${updatedCount} products successfully.`,
    };
  } catch (error) {
    console.error("❌ Failed to update product categories:", error);
    return { updated: 0, skipped: 0, message: "Error updating products" };
  }
}
