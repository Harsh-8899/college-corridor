import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { parseCsvFile } from "./utils";

const prisma = new PrismaClient();

const institutionCsvSchema = z.object({
  institution_id: z.string().optional(),
  aishe_code: z.string().nullable().optional(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  short_name: z.string().nullable().optional(),
  type: z.string().default("COLLEGE"),
  ownership: z.string().min(1, "Ownership is required"),
  approval: z.string().nullable().optional(),
  affiliation: z.string().nullable().optional(),
  established_year: z.preprocess((val) => {
    if (val === "N/A" || !val || String(val).trim() === "") return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  }, z.number().nullable().optional()),
  campus_size: z.string().nullable().optional(),
  gender_accepted: z.string().nullable().optional(),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  district: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  pincode: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  logo_url: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  brochure_url: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  verification_status: z.string().default("PENDING"),
  source_name: z.string().nullable().optional(),
  source_url: z.string().nullable().optional(),
  published: z.preprocess((val) => {
    return String(val).toLowerCase() === "true" || val === true;
  }, z.boolean().default(false))
});

async function makeUniqueSlug(slug: string, excludeId?: string): Promise<string> {
  let uniqueSlug = slug;
  let counter = 1;
  while (true) {
    const existing = await prisma.institution.findFirst({
      where: {
        slug: uniqueSlug,
        NOT: excludeId ? { id: excludeId } : undefined
      }
    });
    if (!existing) {
      break;
    }
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  return uniqueSlug;
}

async function main() {
  console.log("Starting institutions base import...");
  const csvPath = path.join(process.cwd(), "data", "institutions.csv");
  
  if (!fs.existsSync(csvPath)) {
    console.error(`Error: CSV file not found at ${csvPath}`);
    process.exit(1);
  }

  // Create batch record
  const batch = await prisma.institutionImportBatch.create({
    data: {
      fileName: "institutions.csv",
      sourceName: "Base Data CSV",
      status: "STARTED"
    }
  });

  const records = parseCsvFile(csvPath);
  console.log(`Parsed ${records.length} records from CSV.`);

  let createdCount = 0;
  let updatedCount = 0;
  let errorCount = 0;
  
  const errorRows: Array<string> = [];
  // Write header for errors csv
  errorRows.push("row_number,raw_data,error_message");

  for (let idx = 0; idx < records.length; idx++) {
    const rowNum = idx + 2; // 1-based index + header row offset
    const record = records[idx];
    const rawDataStr = JSON.stringify(record);

    try {
      const parsed = institutionCsvSchema.parse(record);
      
      // Look for existing institution
      let existingInstitution = null;

      // 1. Match by aishe_code if provided and not N/A/empty
      if (parsed.aishe_code && parsed.aishe_code !== "N/A" && parsed.aishe_code.trim() !== "") {
        existingInstitution = await prisma.institution.findUnique({
          where: { aisheCode: parsed.aishe_code }
        });
      }

      // 2. Match by name + city + state if not matched by aishe_code
      if (!existingInstitution) {
        existingInstitution = await prisma.institution.findFirst({
          where: {
            name: parsed.name,
            city: parsed.city,
            state: parsed.state
          }
        });
      }

      const cleanAisheCode = (parsed.aishe_code === "N/A" || !parsed.aishe_code) ? null : parsed.aishe_code;
      
      if (existingInstitution) {
        // Update existing record
        const finalSlug = await makeUniqueSlug(parsed.slug, existingInstitution.id);
        
        await prisma.institution.update({
          where: { id: existingInstitution.id },
          data: {
            aisheCode: cleanAisheCode,
            name: parsed.name,
            slug: finalSlug,
            shortName: parsed.short_name || "N/A",
            type: parsed.type || "COLLEGE",
            ownership: parsed.ownership || "N/A",
            approval: parsed.approval || "N/A",
            affiliation: parsed.affiliation || "N/A",
            establishedYear: parsed.established_year,
            campusSize: parsed.campus_size || "N/A",
            genderAccepted: parsed.gender_accepted || "N/A",
            state: parsed.state,
            city: parsed.city,
            district: parsed.district || "N/A",
            address: parsed.address || "N/A",
            pincode: parsed.pincode || "N/A",
            website: parsed.website || "N/A",
            email: parsed.email || "N/A",
            phone: parsed.phone || "N/A",
            logoUrl: parsed.logo_url || "N/A",
            imageUrl: parsed.image_url || "N/A",
            brochureUrl: parsed.brochure_url || "N/A",
            description: parsed.description || "N/A",
            verificationStatus: parsed.verification_status || "PENDING",
            sourceName: parsed.source_name || "N/A",
            sourceUrl: parsed.source_url || "N/A",
            published: parsed.published
          }
        });
        updatedCount++;
      } else {
        // Create new record
        const finalSlug = await makeUniqueSlug(parsed.slug);
        await prisma.institution.create({
          data: {
            institutionId: parsed.institution_id || finalSlug,
            aisheCode: cleanAisheCode,
            name: parsed.name,
            slug: finalSlug,
            shortName: parsed.short_name || "N/A",
            type: parsed.type || "COLLEGE",
            ownership: parsed.ownership || "N/A",
            approval: parsed.approval || "N/A",
            affiliation: parsed.affiliation || "N/A",
            establishedYear: parsed.established_year,
            campusSize: parsed.campus_size || "N/A",
            genderAccepted: parsed.gender_accepted || "N/A",
            state: parsed.state,
            city: parsed.city,
            district: parsed.district || "N/A",
            address: parsed.address || "N/A",
            pincode: parsed.pincode || "N/A",
            website: parsed.website || "N/A",
            email: parsed.email || "N/A",
            phone: parsed.phone || "N/A",
            logoUrl: parsed.logo_url || "N/A",
            imageUrl: parsed.image_url || "N/A",
            brochureUrl: parsed.brochure_url || "N/A",
            description: parsed.description || "N/A",
            verificationStatus: parsed.verification_status || "PENDING",
            sourceName: parsed.source_name || "N/A",
            sourceUrl: parsed.source_url || "N/A",
            published: parsed.published
          }
        });
        createdCount++;
      }
    } catch (err: any) {
      errorCount++;
      const errMsg = err instanceof z.ZodError 
        ? err.errors.map(e => `${e.path.join(".")}: ${e.message}`).join("; ") 
        : err.message || "Unknown error";
        
      console.error(`Row ${rowNum} Failed: ${errMsg}`);
      
      // Save error to DB
      await prisma.institutionImportError.create({
        data: {
          batchId: batch.id,
          rowNumber: rowNum,
          rawData: rawDataStr,
          errorMessage: errMsg
        }
      });

      // Format for CSV
      const escapedRawData = rawDataStr.replace(/"/g, '""');
      const escapedErrMsg = errMsg.replace(/"/g, '""');
      errorRows.push(`${rowNum},"${escapedRawData}","${escapedErrMsg}"`);
    }
  }

  // Update batch complete status
  await prisma.institutionImportBatch.update({
    where: { id: batch.id },
    data: {
      status: "COMPLETED",
      totalRows: records.length,
      createdRows: createdCount,
      updatedRows: updatedCount,
      errorRows: errorCount,
      completedAt: new Date()
    }
  });

  // Write error csv if errors exist
  if (errorCount > 0) {
    const errorCsvPath = path.join(process.cwd(), "data", "import-errors.csv");
    fs.writeFileSync(errorCsvPath, errorRows.join("\n"), "utf-8");
    console.log(`Errors written to ${errorCsvPath}`);
  }

  console.log(`Base import complete. Created: ${createdCount}, Updated: ${updatedCount}, Errored: ${errorCount}`);
}

main()
  .catch((e) => {
    console.error("Fatal error during import:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
