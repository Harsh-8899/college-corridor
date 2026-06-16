import fs from "fs";
import path from "path";
import { prisma } from "@/lib/db/prisma";
import { CollegeOwnership } from "@prisma/client";

export type College = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  ownership: "Government" | "Private" | "Deemed";
  ranking: number;
  rating: number;
  courses: string[];
  modes: Array<"Online" | "Offline" | "Distance">;
  fees: string;
  averageSalary: string;
  highestSalary: string;
  placementRate: string;
  seats: number;
  hostel: string;
  scholarships: string;
  eligibility: string;
  admission: string;
  description: string;
};

const dataFilePath = path.join(process.cwd(), "src", "lib", "data", "colleges.json");

function readCollegesFromFile(): College[] {
  try {
    const raw = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(raw) as College[];
  } catch {
    return [];
  }
}

function writeCollegesToFile(data: College[]): void {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
}

export function getColleges(): College[] {
  return readCollegesFromFile();
}

export function getCollege(slug: string): College | undefined {
  const colleges = readCollegesFromFile();
  return colleges.find((college) => college.slug === slug);
}

export function getCollegeById(id: string): College | undefined {
  const colleges = readCollegesFromFile();
  return colleges.find((college) => college.id === id);
}

export async function addCollege(college: College): Promise<College> {
  const colleges = readCollegesFromFile();
  colleges.push(college);
  writeCollegesToFile(colleges);

  // Sync to PostgreSQL database
  try {
    const normalizedOwnership = college.ownership.toUpperCase();
    const dbOwnership = ["GOVERNMENT", "PRIVATE", "DEEMED"].includes(normalizedOwnership)
      ? normalizedOwnership
      : "OTHER";

    await prisma.college.upsert({
      where: { id: college.id },
      update: {
        name: college.name,
        slug: college.slug,
        description: college.description,
        ownership: dbOwnership as CollegeOwnership,
        status: "PUBLISHED"
      },
      create: {
        id: college.id,
        name: college.name,
        slug: college.slug,
        description: college.description,
        ownership: dbOwnership as CollegeOwnership,
        status: "PUBLISHED"
      }
    });

    // Sync Campus
    await prisma.campus.upsert({
      where: { id: `camp_${college.id}` },
      update: {
        name: "Main Campus",
        city: college.city,
        state: college.state
      },
      create: {
        id: `camp_${college.id}`,
        collegeId: college.id,
        name: "Main Campus",
        city: college.city,
        state: college.state
      }
    });
  } catch (error) {
    console.error("Prisma sync failed during addCollege:", error);
  }

  return college;
}

export async function updateCollege(id: string, updates: Partial<College>): Promise<College | null> {
  const colleges = readCollegesFromFile();
  const index = colleges.findIndex((college) => college.id === id);
  if (index === -1) return null;
  colleges[index] = { ...colleges[index], ...updates };
  writeCollegesToFile(colleges);

  // Sync to PostgreSQL database
  try {
    const updated = colleges[index];
    const normalizedOwnership = updated.ownership ? updated.ownership.toUpperCase() : undefined;
    const dbOwnership = normalizedOwnership && ["GOVERNMENT", "PRIVATE", "DEEMED"].includes(normalizedOwnership)
      ? normalizedOwnership
      : undefined;

    await prisma.college.update({
      where: { id },
      data: {
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        ownership: dbOwnership as CollegeOwnership
      }
    });

    // Update Campus if city or state changed
    if (updates.city || updates.state) {
      await prisma.campus.updateMany({
        where: { collegeId: id },
        data: {
          city: updated.city,
          state: updated.state
        }
      });
    }
  } catch (error) {
    console.error("Prisma sync failed during updateCollege:", error);
  }

  return colleges[index];
}

export async function deleteCollege(id: string): Promise<boolean> {
  const colleges = readCollegesFromFile();
  const filtered = colleges.filter((college) => college.id !== id);
  if (filtered.length === colleges.length) return false;
  writeCollegesToFile(filtered);

  // Sync to PostgreSQL database
  try {
    // Delete campuses first to satisfy cascade constraints if any
    await prisma.campus.deleteMany({
      where: { collegeId: id }
    });
    await prisma.college.delete({
      where: { id }
    });
  } catch (error) {
    console.error("Prisma sync failed during deleteCollege:", error);
  }

  return true;
}

export const colleges: College[] = readCollegesFromFile();
