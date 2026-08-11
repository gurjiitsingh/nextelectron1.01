// app/actions/createTempDir.ts
"use server";

import fs from "fs";
import path from "path";

export async function createTempDir() {
  try {
    const rootDir = process.cwd(); // Root of your Next.js project
    const tempDir = path.join(rootDir, "temp");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
      return { success: true, message: " temp folder created successfully." };
    } else {
      return { success: false, message: "⚠️ temp folder already exists." };
    }
  } catch (err) {
    console.error("Error creating temp directory:", err);
    return { success: false, message: "❌ Failed to create temp folder." };
  }
}
