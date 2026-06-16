import * as fs from "fs";

export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseCsvFile(filePath: string): Array<Record<string, string>> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const rawLines = content.split(/\r?\n/);
  const lines = rawLines.map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length === 0) {
    return [];
  }
  
  const headers = parseCsvLine(lines[0]);
  const records: Array<Record<string, string>> = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      // Handle missing trailing values or mismatched lengths safely
      const rawVal = values[index] !== undefined ? values[index] : "";
      record[header] = rawVal;
    });
    records.push(record);
  }
  
  return records;
}
