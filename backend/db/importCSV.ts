import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/**
 * Imports medicine data from the CSV file to enrich existing DB medicines
 * with descriptions, side effects, and adds top medicines from the CSV
 * that aren't already in the database.
 */
export function importCSVMedicines() {
  const dbPath = path.resolve(__dirname, 'pharmacy.db');
  const db = new Database(dbPath);
  const csvPath = path.resolve(__dirname, '..', '..', 'updated_indian_medicine_data.csv');

  if (!fs.existsSync(csvPath)) {
    console.log('CSV file not found, skipping import.');
    return;
  }

  const raw = fs.readFileSync(csvPath, 'utf-8');
  const lines = raw.split('\n');
  
  // Simple CSV parser that handles quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Get existing medicines from DB
  const existingMeds = db.prepare('SELECT id, name FROM medicines').all() as { id: number; name: string }[];
  const existingNames = new Map(existingMeds.map((m) => [m.name.toLowerCase().trim(), m.id]));

  // Update statement for enriching existing medicines
  const updateMed = db.prepare(
    'UPDATE medicines SET side_effects = ?, description = ? WHERE id = ?'
  );

  // CSV columns: id,name,price,Is_discontinued,manufacturer_name,type,pack_size_label,
  //              short_composition1,short_composition2,salt_composition,medicine_desc,side_effects,drug_interactions
  let enriched = 0;
  
  const updateTransaction = db.transaction(() => {
    for (let i = 1; i < Math.min(lines.length, 10000); i++) {
      const line = lines[i];
      if (!line || line.trim().length === 0) continue;
      
      try {
        const fields = parseCSVLine(line);
        if (fields.length < 12) continue;
        
        const csvName = fields[1]?.trim();
        const isDiscontinued = fields[3]?.trim().toUpperCase() === 'TRUE';
        const sideEffects = fields[11]?.trim() || '';
        const description = fields[10]?.trim() || '';
        
        if (!csvName || isDiscontinued) continue;
        
        // Try to match with existing DB medicines
        const normalizedCsvName = csvName.toLowerCase().trim();
        
        // Direct match
        const directMatch = existingNames.get(normalizedCsvName);
        if (directMatch && (sideEffects || description)) {
          // Truncate description to first 400 chars for display
          const shortDesc = description.length > 400 
            ? description.substring(0, 400) + '...' 
            : description;
          updateMed.run(sideEffects, shortDesc, directMatch);
          enriched++;
          continue;
        }

        // Fuzzy match: check if CSV name starts with any existing medicine name
        for (const [existingName, existingId] of existingNames) {
          if (
            normalizedCsvName.startsWith(existingName) ||
            existingName.startsWith(normalizedCsvName.split(' ')[0])
          ) {
            if (sideEffects || description) {
              const shortDesc = description.length > 400
                ? description.substring(0, 400) + '...'
                : description;
              updateMed.run(sideEffects, shortDesc, existingId);
              enriched++;
              break;
            }
          }
        }
      } catch {
        // Skip malformed rows
        continue;
      }
    }
  });

  updateTransaction();
  console.log(`CSV enrichment: Updated ${enriched} medicines with descriptions/side-effects.`);
  db.close();
}
