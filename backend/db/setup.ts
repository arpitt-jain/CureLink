import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, 'pharmacy.db');
const db = new Database(dbPath);

export const setupDB = () => {
  // Drop and recreate all tables to ensure schema is up-to-date
  // (data is re-seeded each startup anyway)
  db.exec(`DROP TABLE IF EXISTS inventory`);
  db.exec(`DROP TABLE IF EXISTS pharmacies`);
  db.exec(`DROP TABLE IF EXISTS medicines`);

  db.exec(`
    CREATE TABLE medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      generic_name TEXT,
      manufacturer TEXT,
      category TEXT,
      side_effects TEXT,
      description TEXT
    );

    CREATE TABLE pharmacies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      phone TEXT,
      type TEXT DEFAULT 'retail',
      rating REAL DEFAULT 4.0,
      open_hours TEXT DEFAULT '8:00 AM - 10:00 PM'
    );

    CREATE TABLE inventory (
      pharmacy_id INTEGER,
      medicine_id INTEGER,
      price REAL NOT NULL,
      in_stock BOOLEAN NOT NULL DEFAULT 1,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(pharmacy_id) REFERENCES pharmacies(id),
      FOREIGN KEY(medicine_id) REFERENCES medicines(id),
      PRIMARY KEY (pharmacy_id, medicine_id)
    );
  `);

  console.log("Tables created successfully.");

  // ── Indian Medicines — Comprehensive Dataset ──
  const insertMed = db.prepare('INSERT INTO medicines (name, generic_name, manufacturer, category) VALUES (?, ?, ?, ?)');

  // Pain Relief & Fever
  const dolo   = insertMed.run('Dolo 650',       'Paracetamol 650mg',         'Micro Labs',       'Pain Relief').lastInsertRowid;
  const crocin = insertMed.run('Crocin Advance', 'Paracetamol 500mg',         'GSK',              'Pain Relief').lastInsertRowid;
  const combi  = insertMed.run('Combiflam',      'Ibuprofen + Paracetamol',   'Sanofi',           'Pain Relief').lastInsertRowid;
  const calpol = insertMed.run('Calpol 650',     'Paracetamol 650mg',         'GSK',              'Pain Relief').lastInsertRowid;
  const brufen = insertMed.run('Brufen 400',     'Ibuprofen 400mg',           'Abbott',           'Pain Relief').lastInsertRowid;
  const volini = insertMed.run('Volini Gel',     'Diclofenac Topical Gel',    'Sun Pharma',       'Pain Relief').lastInsertRowid;
  const saridon = insertMed.run('Saridon',       'Paracetamol + Propyphenazone + Caffeine', 'Bayer', 'Pain Relief').lastInsertRowid;
  const flexon = insertMed.run('Flexon MR',      'Ibuprofen + Paracetamol + Chlorzoxazone', 'Aristo Pharma', 'Pain Relief').lastInsertRowid;
  const nise   = insertMed.run('Nise',           'Nimesulide 100mg',          'Dr Reddys',        'Pain Relief').lastInsertRowid;
  const voveran = insertMed.run('Voveran SR 100','Diclofenac Sodium 100mg',   'Novartis',         'Pain Relief').lastInsertRowid;

  // Antibiotics
  const azith  = insertMed.run('Azithral 500',   'Azithromycin 500mg',        'Alembic Pharma',   'Antibiotic').lastInsertRowid;
  const amox   = insertMed.run('Mox 500',        'Amoxicillin 500mg',         'Zydus Cadila',     'Antibiotic').lastInsertRowid;
  const augmentin = insertMed.run('Augmentin 625','Amoxicillin + Clavulanate', 'GSK',             'Antibiotic').lastInsertRowid;
  const oflox  = insertMed.run('Oflox OZ',       'Ofloxacin + Ornidazole',    'Sun Pharma',       'Antibiotic').lastInsertRowid;
  const doxy   = insertMed.run('Doxy 100',       'Doxycycline 100mg',         'USV Pharma',       'Antibiotic').lastInsertRowid;
  const cefx   = insertMed.run('Cefix 200',      'Cefixime 200mg',            'Mankind Pharma',   'Antibiotic').lastInsertRowid;
  const levoflox = insertMed.run('Levoflox 500', 'Levofloxacin 500mg',        'Cipla',            'Antibiotic').lastInsertRowid;
  const azicip = insertMed.run('Azicip 500',     'Azithromycin 500mg',        'Cipla',            'Antibiotic').lastInsertRowid;
  const cipro  = insertMed.run('Ciplox 500',     'Ciprofloxacin 500mg',       'Cipla',            'Antibiotic').lastInsertRowid;
  const metro  = insertMed.run('Metrogyl 400',   'Metronidazole 400mg',       'JB Chemicals',     'Antibiotic').lastInsertRowid;
  const norflox = insertMed.run('Norflox TZ',    'Norfloxacin + Tinidazole',  'Cipla',            'Antibiotic').lastInsertRowid;
  const monocef = insertMed.run('Monocef 200',   'Cefpodoxime 200mg',         'Aristo Pharma',    'Antibiotic').lastInsertRowid;
  const clindamycin = insertMed.run('Dalacin C 300', 'Clindamycin 300mg',     'Pfizer',           'Antibiotic').lastInsertRowid;

  // Gastro / Digestive
  const pan    = insertMed.run('Pan D',          'Pantoprazole + Domperidone','Alkem Labs',       'Gastro').lastInsertRowid;
  const omez   = insertMed.run('Omez 20',        'Omeprazole 20mg',           'Dr Reddys',        'Gastro').lastInsertRowid;
  const rantac = insertMed.run('Rantac 150',     'Ranitidine 150mg',          'JB Chemicals',     'Gastro').lastInsertRowid;
  const digene = insertMed.run('Digene',         'Antacid Tablet',            'Abbott',           'Gastro').lastInsertRowid;
  const eno    = insertMed.run('ENO Fruit Salt', 'Antacid Powder',            'GSK',              'Gastro').lastInsertRowid;
  const dulcoflex = insertMed.run('Dulcoflex',   'Bisacodyl 5mg',             'Sanofi',           'Gastro').lastInsertRowid;
  const gelusil = insertMed.run('Gelusil MPS',   'Magaldrate + Simethicone',  'Pfizer',           'Gastro').lastInsertRowid;
  const mucaine = insertMed.run('Mucaine Gel',   'Aluminium Hydroxide + Oxethazaine', 'Pfizer',   'Gastro').lastInsertRowid;
  const pantocid = insertMed.run('Pantocid DSR', 'Pantoprazole + Domperidone SR', 'Sun Pharma',   'Gastro').lastInsertRowid;
  const rablet = insertMed.run('Rablet D',       'Rabeprazole + Domperidone', 'Lupin',            'Gastro').lastInsertRowid;
  const cremaffin = insertMed.run('Cremaffin Plus', 'Liquid Paraffin + Milk of Magnesia', 'Abbott','Gastro').lastInsertRowid;
  const econorm = insertMed.run('Econorm',       'Saccharomyces Boulardii',   'Dr Reddys',        'Gastro').lastInsertRowid;
  const ors    = insertMed.run('ORS Powder',     'Oral Rehydration Salts',    'FDC',              'Hydration').lastInsertRowid;

  // Diabetes
  const metf   = insertMed.run('Glycomet GP 2',  'Metformin + Glimepiride',   'USV Pharma',       'Diabetes').lastInsertRowid;
  const amaryl = insertMed.run('Amaryl 2',       'Glimepiride 2mg',           'Sanofi',           'Diabetes').lastInsertRowid;
  const januvia = insertMed.run('Januvia 100',   'Sitagliptin 100mg',         'MSD',              'Diabetes').lastInsertRowid;
  const insulin = insertMed.run('Insulatard',    'Human Insulin',             'Novo Nordisk',     'Diabetes').lastInsertRowid;
  const galvus = insertMed.run('Galvus Met 50/500', 'Vildagliptin + Metformin', 'Novartis',       'Diabetes').lastInsertRowid;
  const jardiance = insertMed.run('Jardiance 25','Empagliflozin 25mg',        'Boehringer',       'Diabetes').lastInsertRowid;
  const trajenta = insertMed.run('Trajenta 5',   'Linagliptin 5mg',           'Boehringer',       'Diabetes').lastInsertRowid;
  const gluformin = insertMed.run('Glucophage 500','Metformin 500mg',          'Merck',            'Diabetes').lastInsertRowid;

  // Blood Pressure
  const telma  = insertMed.run('Telma 40',       'Telmisartan 40mg',          'Glenmark',         'Blood Pressure').lastInsertRowid;
  const amlong = insertMed.run('Amlong 5',       'Amlodipine 5mg',            'Micro Labs',       'Blood Pressure').lastInsertRowid;
  const losar  = insertMed.run('Losar 50',       'Losartan 50mg',             'Torrent Pharma',   'Blood Pressure').lastInsertRowid;
  const ramipril = insertMed.run('Cardace 5',    'Ramipril 5mg',              'Sanofi',           'Blood Pressure').lastInsertRowid;
  const envas  = insertMed.run('Envas 5',        'Enalapril 5mg',             'Cadila',           'Blood Pressure').lastInsertRowid;
  const metxl  = insertMed.run('Met XL 50',      'Metoprolol 50mg',           'Sun Pharma',       'Blood Pressure').lastInsertRowid;
  const aten   = insertMed.run('Aten 50',        'Atenolol 50mg',             'Zydus Cadila',     'Blood Pressure').lastInsertRowid;
  const prazopress = insertMed.run('Prazopress XL 5', 'Prazosin 5mg',         'Sun Pharma',       'Blood Pressure').lastInsertRowid;

  // Heart
  const ecosprin = insertMed.run('Ecosprin 75',  'Aspirin 75mg',              'USV Pharma',       'Heart').lastInsertRowid;
  const clopitab = insertMed.run('Clopitab A',   'Clopidogrel + Aspirin',     'Lupin',            'Heart').lastInsertRowid;
  const atorva = insertMed.run('Atorva 10',      'Atorvastatin 10mg',         'Zydus Cadila',     'Heart').lastInsertRowid;
  const rosuvas = insertMed.run('Rosuvas 20',    'Rosuvastatin 20mg',         'Sun Pharma',       'Heart').lastInsertRowid;
  const lasix  = insertMed.run('Lasix 40',       'Furosemide 40mg',           'Sanofi',           'Heart').lastInsertRowid;
  const sorbitrate = insertMed.run('Sorbitrate 5', 'Isosorbide Dinitrate 5mg', 'Sun Pharma',      'Heart').lastInsertRowid;
  const dilzem = insertMed.run('Dilzem 30',      'Diltiazem 30mg',            'Sun Pharma',       'Heart').lastInsertRowid;

  // Allergy
  const allegra= insertMed.run('Allegra 120',    'Fexofenadine 120mg',        'Sanofi',           'Allergy').lastInsertRowid;
  const montek = insertMed.run('Montek LC',      'Montelukast + Levocetirizine', 'Sun Pharma',    'Allergy').lastInsertRowid;
  const montair = insertMed.run('Montair 10',    'Montelukast 10mg',          'Cipla',            'Allergy').lastInsertRowid;
  const cetcip = insertMed.run('Cetcip',         'Cetirizine 10mg',           'Cipla',            'Allergy').lastInsertRowid;
  const levocet = insertMed.run('Levocet M',     'Levocetirizine + Montelukast', 'Sun Pharma',    'Allergy').lastInsertRowid;
  const avil   = insertMed.run('Avil 25',        'Pheniramine 25mg',          'Sanofi',           'Allergy').lastInsertRowid;

  // Respiratory
  const asthalin = insertMed.run('Asthalin Inhaler', 'Salbutamol Inhaler',    'Cipla',            'Respiratory').lastInsertRowid;
  const budecort = insertMed.run('Budecort 200', 'Budesonide Inhaler 200mcg', 'Cipla',            'Respiratory').lastInsertRowid;
  const foracort = insertMed.run('Foracort 200', 'Formoterol + Budesonide',   'Cipla',            'Respiratory').lastInsertRowid;
  const seroflo = insertMed.run('Seroflo 250',   'Salmeterol + Fluticasone',  'Cipla',            'Respiratory').lastInsertRowid;
  const deriphyllin = insertMed.run('Deriphyllin Retard', 'Theophylline + Etofylline', 'Zydus Cadila', 'Respiratory').lastInsertRowid;
  const ambrodil = insertMed.run('Ambrodil S',   'Ambroxol + Salbutamol',     'Aristo Pharma',    'Respiratory').lastInsertRowid;

  // Thyroid
  const thyro  = insertMed.run('Thyronorm 50',   'Levothyroxine 50mcg',       'Abbott',           'Thyroid').lastInsertRowid;
  const thyro100 = insertMed.run('Thyronorm 100','Levothyroxine 100mcg',      'Abbott',           'Thyroid').lastInsertRowid;
  const eltroxin = insertMed.run('Eltroxin 50',  'Levothyroxine 50mcg',       'GSK',              'Thyroid').lastInsertRowid;

  // Supplements
  const shelcal= insertMed.run('Shelcal 500',    'Calcium + Vitamin D3',      'Torrent Pharma',   'Supplement').lastInsertRowid;
  const zincov = insertMed.run('Zincovit',       'Multivitamin + Zinc',       'Apex Labs',        'Supplement').lastInsertRowid;
  const becosules = insertMed.run('Becosules',   'Vitamin B Complex',         'Pfizer',           'Supplement').lastInsertRowid;
  const supradyn = insertMed.run('Supradyn',     'Multivitamin',              'Bayer',            'Supplement').lastInsertRowid;
  const evion  = insertMed.run('Evion 400',      'Vitamin E 400 IU',          'Merck',            'Supplement').lastInsertRowid;
  const limcee = insertMed.run('Limcee 500',     'Vitamin C 500mg',           'Abbott',           'Supplement').lastInsertRowid;
  const calcimax = insertMed.run('Calcimax P',   'Calcium Citrate + Vitamin D3', 'Mayer & Baker','Supplement').lastInsertRowid;
  const revital = insertMed.run('Revital H',     'Multivitamin + Ginseng',    'Sun Pharma',       'Supplement').lastInsertRowid;
  const feronia = insertMed.run('Autrin',        'Iron + Folic Acid + B12',   'Glaxo',            'Supplement').lastInsertRowid;

  // Neuro Care
  const neurobion = insertMed.run('Neurobion Forte', 'B1 + B6 + B12',         'P&G Health',       'Neuro Care').lastInsertRowid;
  const pregaba = insertMed.run('Pregaba 75',    'Pregabalin 75mg',           'Torrent Pharma',   'Neuro Care').lastInsertRowid;
  const syndopa = insertMed.run('Syndopa Plus',  'Levodopa + Carbidopa',      'Sun Pharma',       'Neuro Care').lastInsertRowid;
  const gabapin = insertMed.run('Gabapin NT 100','Gabapentin + Nortriptyline', 'Intas Pharma',    'Neuro Care').lastInsertRowid;

  // Mental Health
  const ativan = insertMed.run('Ativan 1',       'Lorazepam 1mg',             'Pfizer',           'Mental Health').lastInsertRowid;
  const nexito = insertMed.run('Nexito 10',      'Escitalopram 10mg',         'Sun Pharma',       'Mental Health').lastInsertRowid;
  const flunil = insertMed.run('Flunil 20',      'Fluoxetine 20mg',           'Intas Pharma',     'Mental Health').lastInsertRowid;
  const oleanz = insertMed.run('Oleanz 5',       'Olanzapine 5mg',            'Sun Pharma',       'Mental Health').lastInsertRowid;

  // Liver Care
  const liv52  = insertMed.run('Liv 52',         'Herbal Hepatoprotective',   'Himalaya',         'Liver Care').lastInsertRowid;
  const ursocol = insertMed.run('Ursocol 300',   'Ursodeoxycholic Acid 300mg','Sun Pharma',       'Liver Care').lastInsertRowid;
  const hepamerz = insertMed.run('Hepamerz',     'L-Ornithine L-Aspartate',   'Merz Pharma',      'Liver Care').lastInsertRowid;

  // Dermatology / Skin
  const betnovate = insertMed.run('Betnovate C',  'Betamethasone + Clioquinol', 'GSK',            'Dermatology').lastInsertRowid;
  const candid = insertMed.run('Candid B Cream',  'Clotrimazole + Beclometasone', 'Glenmark',     'Dermatology').lastInsertRowid;
  const clobetasol = insertMed.run('Tenovate Cream', 'Clobetasol Propionate', 'GSK',              'Dermatology').lastInsertRowid;
  const keto   = insertMed.run('Ketomac Shampoo', 'Ketoconazole 2%',           'Torrent Pharma',   'Dermatology').lastInsertRowid;
  const momate = insertMed.run('Momate Cream',    'Mometasone Furoate',        'Glenmark',         'Dermatology').lastInsertRowid;
  const soframycin = insertMed.run('Soframycin',  'Framycetin Skin Cream',     'Sanofi',           'Dermatology').lastInsertRowid;
  const panderm = insertMed.run('Panderm Plus',   'Clobetasol + Ofloxacin',    'Macleods',         'Dermatology').lastInsertRowid;

  // Eye Care
  const moxiflox = insertMed.run('Moxiflox Eye Drops', 'Moxifloxacin 0.5%',   'Cipla',            'Eye Care').lastInsertRowid;
  const itone  = insertMed.run('I-Tone Eye Drops','Herbal Eye Drops',          'Dey\'s Medical',   'Eye Care').lastInsertRowid;
  const ciplox_eye = insertMed.run('Ciplox Eye Drops', 'Ciprofloxacin 0.3%',  'Cipla',            'Eye Care').lastInsertRowid;
  const refresh = insertMed.run('Refresh Tears', 'Carboxymethylcellulose',     'Allergan',         'Eye Care').lastInsertRowid;

  // Women's Health
  const meftal = insertMed.run('Meftal Spas',    'Mefenamic + Dicyclomine',   'Blue Cross',       'Women\'s Health').lastInsertRowid;
  const duphaston = insertMed.run('Duphaston 10','Dydrogesterone 10mg',        'Abbott',           'Women\'s Health').lastInsertRowid;
  const ipill  = insertMed.run('i-pill',         'Levonorgestrel 1.5mg',       'Piramal Healthcare','Women\'s Health').lastInsertRowid;

  // Urology
  const urimax = insertMed.run('Urimax 0.4',    'Tamsulosin 0.4mg',           'Cipla',            'Urology').lastInsertRowid;
  const silodal = insertMed.run('Silodal 8',     'Silodosin 8mg',              'Sun Pharma',       'Urology').lastInsertRowid;

  // Muscle Relaxant
  const myospaz = insertMed.run('Myospaz Forte',  'Chlorzoxazone + Diclofenac', 'Win-Medicare',   'Muscle Relaxant').lastInsertRowid;
  const thiocolchicoside = insertMed.run('Myoril 4', 'Thiocolchicoside 4mg',   'Sanofi',           'Muscle Relaxant').lastInsertRowid;

  // Anti-fungal
  const fluconazole = insertMed.run('Forcan 150','Fluconazole 150mg',          'Cipla',            'Anti-fungal').lastInsertRowid;
  const terbinafine = insertMed.run('Terbicip 250','Terbinafine 250mg',        'Cipla',            'Anti-fungal').lastInsertRowid;

  // Pediatric
  const syp_crocin = insertMed.run('Crocin Syrup','Paracetamol Suspension',   'GSK',              'Pediatric').lastInsertRowid;
  const syp_augmentin = insertMed.run('Augmentin Duo Syrup','Amoxicillin + Clavulanate Syrup', 'GSK', 'Pediatric').lastInsertRowid;
  const gripe  = insertMed.run('Woodwards Gripe Water','Dill Oil + Sodium Bicarbonate','Woodwards', 'Pediatric').lastInsertRowid;
  const zinconia = insertMed.run('Zinconia Syrup','Zinc Acetate Syrup',        'FDC',              'Pediatric').lastInsertRowid;

  // ── Indian Pharmacies — Expanded Delhi NCR Coverage ──
  const insertPharm = db.prepare('INSERT INTO pharmacies (name, address, lat, lng, phone, type, rating, open_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

  const p1  = insertPharm.run('Apollo Pharmacy',         'Connaught Place, New Delhi',          28.6315, 77.2167, '+91-11-40001234', 'chain', 4.5, '8:00 AM - 11:00 PM').lastInsertRowid;
  const p2  = insertPharm.run('MedPlus',                 'Lajpat Nagar, New Delhi',             28.5694, 77.2433, '+91-11-40005678', 'chain', 4.2, '8:00 AM - 10:30 PM').lastInsertRowid;
  const p3  = insertPharm.run('Netmeds Store',           'Karol Bagh, New Delhi',               28.6521, 77.1909, '+91-11-40009012', 'online', 4.4, '9:00 AM - 9:00 PM').lastInsertRowid;
  const p4  = insertPharm.run('PharmEasy Pickup',        'Dwarka Sector 21, New Delhi',         28.5571, 77.0723, '+91-11-40003456', 'online', 4.3, '9:00 AM - 8:00 PM').lastInsertRowid;
  const p5  = insertPharm.run('Jan Aushadhi Kendra',     'Sarojini Nagar, New Delhi',           28.5765, 77.2002, '+91-11-40007890', 'govt', 4.0, '9:00 AM - 6:00 PM').lastInsertRowid;
  const p6  = insertPharm.run('1mg Store',               'Rajouri Garden, New Delhi',           28.6491, 77.1234, '+91-11-40002345', 'online', 4.6, '24 Hours').lastInsertRowid;
  const p7  = insertPharm.run('Fortis HealthWorld',      'Vasant Kunj, New Delhi',              28.5218, 77.1567, '+91-11-40006789', 'chain', 4.5, '8:00 AM - 10:00 PM').lastInsertRowid;
  const p8  = insertPharm.run('Guardian Pharmacy',       'Defence Colony, New Delhi',           28.5716, 77.2323, '+91-11-40004567', 'chain', 4.3, '8:30 AM - 10:00 PM').lastInsertRowid;
  const p9  = insertPharm.run('Wellness Forever',        'Greater Kailash, New Delhi',          28.5469, 77.2348, '+91-11-40008901', 'chain', 4.1, '8:00 AM - 10:30 PM').lastInsertRowid;
  const p10 = insertPharm.run('Davai Dost',              'Rohini Sector 7, New Delhi',          28.7147, 77.1101, '+91-11-40001357', 'retail', 3.9, '9:00 AM - 9:00 PM').lastInsertRowid;
  const p11 = insertPharm.run('Jan Aushadhi Bhawan',     'AIIMS Campus, New Delhi',             28.5683, 77.2105, '+91-11-40002468', 'govt', 4.2, '8:00 AM - 5:00 PM').lastInsertRowid;
  const p12 = insertPharm.run('Max Pharmacy',            'Saket, New Delhi',                    28.5240, 77.2148, '+91-11-40003579', 'chain', 4.4, '24 Hours').lastInsertRowid;
  const p13 = insertPharm.run('Sagar Medical Store',     'Old Delhi, Chandni Chowk',            28.6562, 77.2308, '+91-11-40004680', 'retail', 3.8, '8:00 AM - 9:30 PM').lastInsertRowid;
  const p14 = insertPharm.run('Medkart Pharmacy',        'Noida Sector 18',                     28.5689, 77.3214, '+91-120-4005791', 'chain', 4.3, '8:00 AM - 10:00 PM').lastInsertRowid;
  const p15 = insertPharm.run('True Chemists',           'Gurgaon, Sector 29',                  28.4595, 77.0622, '+91-124-4006802', 'retail', 4.0, '8:30 AM - 10:30 PM').lastInsertRowid;
  const p16 = insertPharm.run('Apollo Pharmacy GGN',     'Gurgaon, DLF Cyber City',             28.4949, 77.0862, '+91-124-4007913', 'chain', 4.5, '8:00 AM - 11:00 PM').lastInsertRowid;
  const p17 = insertPharm.run('Jan Aushadhi Express',    'Pitampura, New Delhi',                28.6946, 77.1310, '+91-11-40009024', 'govt', 4.1, '9:00 AM - 5:30 PM').lastInsertRowid;
  const p18 = insertPharm.run('Wellness Pharmacy',       'Indirapuram, Ghaziabad',              28.6314, 77.3571, '+91-120-4008135', 'retail', 3.7, '8:00 AM - 9:30 PM').lastInsertRowid;

  // ── Inventory (Indian pricing in ₹) ──
  const insertInv = db.prepare('INSERT INTO inventory (pharmacy_id, medicine_id, price, in_stock) VALUES (?, ?, ?, ?)');

  const pharmacies = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18];
  const pharmacyPriceFactors  = [1.05, 1.0, 0.96, 1.08, 0.65, 0.98, 1.03, 1.02, 0.99, 0.94, 0.62, 1.06, 0.88, 0.97, 0.92, 1.05, 0.60, 0.90];

  // Core medicines with hand-crafted base prices
  const coreMeds: [number | bigint, number][] = [
    [dolo, 30], [crocin, 25], [combi, 40], [calpol, 32], [brufen, 55],
    [volini, 120], [saridon, 25], [flexon, 75], [nise, 45], [voveran, 65],
    [azith, 110], [amox, 68], [augmentin, 235], [oflox, 95], [doxy, 55],
    [cefx, 155], [levoflox, 125], [azicip, 105], [cipro, 60], [metro, 28],
    [norflox, 78], [monocef, 160], [clindamycin, 180],
    [pan, 135], [omez, 85], [rantac, 35], [digene, 45], [eno, 20],
    [dulcoflex, 32], [gelusil, 52], [mucaine, 95], [pantocid, 148],
    [rablet, 125], [cremaffin, 155], [econorm, 180], [ors, 22],
    [metf, 175], [amaryl, 138], [januvia, 520], [insulin, 380],
    [galvus, 295], [jardiance, 480], [trajenta, 450], [gluformin, 45],
    [telma, 195], [amlong, 42], [losar, 95], [ramipril, 85],
    [envas, 52], [metxl, 65], [aten, 38], [prazopress, 75],
    [ecosprin, 32], [clopitab, 145], [atorva, 125], [rosuvas, 215],
    [lasix, 18], [sorbitrate, 22], [dilzem, 45],
    [allegra, 160], [montek, 185], [montair, 145], [cetcip, 35],
    [levocet, 190], [avil, 15],
    [asthalin, 135], [budecort, 280], [foracort, 420], [seroflo, 550],
    [deriphyllin, 45], [ambrodil, 72],
    [thyro, 115], [thyro100, 135], [eltroxin, 108],
    [shelcal, 265], [zincov, 120], [becosules, 32], [supradyn, 25],
    [evion, 35], [limcee, 28], [calcimax, 195], [revital, 210], [feronia, 75],
    [neurobion, 45], [pregaba, 175], [syndopa, 85], [gabapin, 195],
    [ativan, 28], [nexito, 135], [flunil, 48], [oleanz, 72],
    [liv52, 105], [ursocol, 245], [hepamerz, 285],
    [betnovate, 48], [candid, 65], [clobetasol, 55], [keto, 185],
    [momate, 115], [soframycin, 65], [panderm, 95],
    [moxiflox, 85], [itone, 65], [ciplox_eye, 28], [refresh, 175],
    [meftal, 55], [duphaston, 345], [ipill, 125],
    [urimax, 185], [silodal, 220],
    [myospaz, 72], [thiocolchicoside, 95],
    [fluconazole, 65], [terbinafine, 195],
    [syp_crocin, 58], [syp_augmentin, 85], [gripe, 55], [zinconia, 42],
  ];

  for (const [medId, basePrice] of coreMeds) {
    // Each medicine is available in 10-18 pharmacies
    const availableCount = 10 + Math.abs(Number(medId) % 9);
    const shuffled = [...pharmacies].sort(() => Math.random() - 0.5).slice(0, availableCount);

    for (const pharmacyId of shuffled) {
      const pIdx = pharmacies.indexOf(pharmacyId);
      const factor = pharmacyPriceFactors[pIdx];
      const jitter = 1 + (Math.random() * 0.08 - 0.04); // ±4% randomness
      const price = Math.max(5, Math.round(basePrice * factor * jitter));
      const inStock = Math.random() > 0.08 ? 1 : 0; // 92% in stock
      insertInv.run(pharmacyId, medId, price, inStock);
    }
  }

  console.log("Comprehensive Indian medicine data inserted successfully.");
};

// Initialize the database unconditionally at module load so that when `api.ts` evaluates
// its statically prepared statements, the tables guarantee to exist on fresh deployments.
try {
  setupDB();
} catch (error) {
  console.error("Failed to initialize database tables:", error);
}

export default db;
