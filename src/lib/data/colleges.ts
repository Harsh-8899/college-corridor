import fs from "fs";
import path from "path";

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

export function addCollege(college: College): College {
  const colleges = readCollegesFromFile();
  colleges.push(college);
  writeCollegesToFile(colleges);
  return college;
}

export function updateCollege(id: string, updates: Partial<College>): College | null {
  const colleges = readCollegesFromFile();
  const index = colleges.findIndex((college) => college.id === id);
  if (index === -1) return null;
  colleges[index] = { ...colleges[index], ...updates };
  writeCollegesToFile(colleges);
  return colleges[index];
}

export function deleteCollege(id: string): boolean {
  const colleges = readCollegesFromFile();
  const filtered = colleges.filter((college) => college.id !== id);
  if (filtered.length === colleges.length) return false;
  writeCollegesToFile(filtered);
  return true;
}

// Keep backward compatibility for imports that use the array directly
export const colleges: College[] = readCollegesFromFile();


