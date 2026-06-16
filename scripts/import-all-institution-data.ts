import { execSync } from "child_process";
import * as path from "path";

async function run() {
  console.log("=========================================");
  console.log("STARTING FULL COLLEGE DATA IMPORT PIPELINE");
  console.log("=========================================");

  try {
    console.log("\n--- Step 1: Importing Base Institutions ---");
    execSync("npx tsx scripts/import-institutions.ts", { stdio: "inherit" });

    console.log("\n--- Step 2: Importing Related Data (Courses, Placement, SEO, etc.) ---");
    execSync("npx tsx scripts/import-institution-related-data.ts", { stdio: "inherit" });

    console.log("\n=========================================");
    console.log("FULL IMPORT PIPELINE COMPLETED SUCCESSFULLY!");
    console.log("=========================================");
  } catch (error) {
    console.error("\n=========================================");
    console.error("IMPORT PIPELINE FAILED!");
    console.error(error);
    console.error("=========================================");
    process.exit(1);
  }
}

run();
