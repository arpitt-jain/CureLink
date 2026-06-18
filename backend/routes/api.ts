import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import Tesseract from 'tesseract.js';
const pdfParse = require('pdf-parse');
import db from '../db/setup';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 12 * 1024 * 1024,
  },
});

const MEDICINE_BRIEF_USES: Record<string, string> = {
  'dolo 650': 'Fever and mild to moderate body pain relief.',
  'crocin advance': 'Reduces fever, headache, and common cold pain.',
  'combiflam': 'Relieves pain, inflammation, and fever.',
  'calpol 650': 'Relieves fever and pain.',
  'brufen 400': 'Pain and inflammation relief.',
  'volini gel': 'Topical pain relief for muscle and joint pain.',
  'saridon': 'Quick relief from headache, body ache, and cold.',
  'flexon mr': 'Pain relief with muscle relaxant action.',
  'nise': 'Anti-inflammatory for pain and swelling.',
  'voveran sr 100': 'Sustained-release pain and inflammation relief.',
  'azithral 500': 'Antibiotic for bacterial throat, chest, and skin infections.',
  'mox 500': 'Antibiotic used for common bacterial infections.',
  'augmentin 625': 'Broad-spectrum antibiotic for bacterial infections.',
  'oflox oz': 'Used for gut infections and mixed bacterial-parasitic diarrhea.',
  'doxy 100': 'Antibiotic for skin, chest, and other bacterial infections.',
  'cefix 200': 'Antibiotic for bacterial respiratory and urinary infections.',
  'levoflox 500': 'Antibiotic for bacterial respiratory and urinary infections.',
  'azicip 500': 'Antibiotic for bacterial infections.',
  'ciplox 500': 'Antibiotic for urinary, respiratory, and GI infections.',
  'metrogyl 400': 'Treats anaerobic bacterial and protozoal infections.',
  'norflox tz': 'Antibiotic for diarrhea and dysentery.',
  'monocef 200': 'Cephalosporin antibiotic for various infections.',
  'dalacin c 300': 'Antibiotic for serious bacterial infections.',
  'pan d': 'Helps acidity, reflux, and bloating symptoms.',
  'omez 20': 'Reduces stomach acid and reflux symptoms.',
  'rantac 150': 'Used for acidity and heartburn relief.',
  'digene': 'Antacid for acidity and indigestion.',
  'eno fruit salt': 'Fast relief from acidity and gas.',
  'dulcoflex': 'Relief from constipation.',
  'gelusil mps': 'Antacid with anti-gas combination.',
  'mucaine gel': 'Relieves acidity with local anaesthetic effect.',
  'pantocid dsr': 'Sustained relief from acid reflux and bloating.',
  'rablet d': 'Acid reducer with anti-nausea support.',
  'cremaffin plus': 'Relieves constipation with gentle laxative action.',
  'econorm': 'Probiotic for diarrhea and gut health support.',
  'ors powder': 'Rehydration support during dehydration/loose motions.',
  'glycomet gp 2': 'Helps control blood sugar in type 2 diabetes.',
  'amaryl 2': 'Helps lower blood sugar in type 2 diabetes.',
  'januvia 100': 'Improves blood sugar control in type 2 diabetes.',
  'insulatard': 'Intermediate-acting insulin for blood sugar control.',
  'galvus met 50/500': 'Dual-action blood sugar control for type 2 diabetes.',
  'jardiance 25': 'Controls blood sugar and protects kidneys.',
  'trajenta 5': 'DPP-4 inhibitor for type 2 diabetes management.',
  'glucophage 500': 'First-line medicine for type 2 diabetes.',
  'telma 40': 'Controls high blood pressure and protects heart health.',
  'amlong 5': 'Helps lower blood pressure and reduce heart strain.',
  'losar 50': 'Treats high blood pressure and kidney protection in diabetes.',
  'cardace 5': 'ACE inhibitor for blood pressure and heart failure.',
  'envas 5': 'Controls blood pressure and heart failure management.',
  'met xl 50': 'Beta blocker for blood pressure and heart rate control.',
  'aten 50': 'Beta blocker for blood pressure management.',
  'prazopress xl 5': 'Alpha blocker for blood pressure control.',
  'ecosprin 75': 'Low-dose aspirin for heart and stroke prevention.',
  'clopitab a': 'Prevents clot-related heart and stroke events.',
  'atorva 10': 'Lowers cholesterol and reduces heart risk.',
  'rosuvas 20': 'Lowers cholesterol and supports cardiovascular protection.',
  'lasix 40': 'Removes excess fluid in swelling and heart conditions.',
  'sorbitrate 5': 'Prevents and relieves angina (chest pain).',
  'dilzem 30': 'Calcium channel blocker for angina and hypertension.',
  'allegra 120': 'Relieves allergy symptoms like sneezing and runny nose.',
  'montek lc': 'Used in allergic rhinitis and cough due to allergy.',
  'montair 10': 'Prevents allergy symptoms and supports asthma control.',
  'cetcip': 'Antihistamine for sneezing, itching, and watery eyes.',
  'levocet m': 'Allergy relief with anti-inflammatory action.',
  'avil 25': 'Quick relief from allergy symptoms.',
  'asthalin inhaler': 'Quick relief for wheeze and breathlessness in asthma.',
  'budecort 200': 'Controller inhaler to reduce airway inflammation in asthma.',
  'foracort 200': 'Combination inhaler for asthma and COPD management.',
  'seroflo 250': 'Long-acting controller inhaler for asthma.',
  'deriphyllin retard': 'Bronchodilator for asthma and breathing difficulty.',
  'ambrodil s': 'Expectorant with bronchodilator for cough and congestion.',
  'thyronorm 50': 'Thyroid hormone replacement for hypothyroidism.',
  'thyronorm 100': 'Thyroid hormone replacement for hypothyroidism.',
  'eltroxin 50': 'Thyroid hormone replacement therapy.',
  'shelcal 500': 'Calcium and vitamin D supplement for bone health.',
  'zincovit': 'Multivitamin support for nutrition and immunity.',
  'becosules': 'Vitamin B-complex supplementation.',
  'supradyn': 'Daily multivitamin support.',
  'evion 400': 'Vitamin E supplement and antioxidant support.',
  'limcee 500': 'Vitamin C supplement for immunity and deficiency.',
  'calcimax p': 'Calcium citrate with vitamin D3 for bones.',
  'revital h': 'Daily energy and wellness multivitamin.',
  'autrin': 'Iron and folic acid supplement for anemia.',
  'neurobion forte': 'Nerve health support in vitamin B deficiency.',
  'pregaba 75': 'Used for neuropathic pain and nerve-related discomfort.',
  'syndopa plus': 'Helps control symptoms of Parkinsonism.',
  'gabapin nt 100': 'Nerve pain relief with antidepressant support.',
  'ativan 1': 'Short-term relief of severe anxiety symptoms.',
  'nexito 10': 'Used for depression and anxiety disorders.',
  'flunil 20': 'Antidepressant for depression and OCD.',
  'oleanz 5': 'Atypical antipsychotic for schizophrenia and bipolar.',
  'liv 52': 'Supportive care for liver function.',
  'ursocol 300': 'Dissolves gallstones and protects liver.',
  'hepamerz': 'Liver detox support in liver disease.',
  'betnovate c': 'Steroid cream for skin infections and eczema.',
  'candid b cream': 'Anti-fungal cream with steroid for skin infections.',
  'tenovate cream': 'Potent steroid for severe skin inflammation.',
  'ketomac shampoo': 'Anti-dandruff shampoo with ketoconazole.',
  'momate cream': 'Mild steroid for dermatitis and eczema.',
  'soframycin': 'Antibiotic cream for cuts and wounds.',
  'panderm plus': 'Multi-action cream for skin infections.',
  'moxiflox eye drops': 'Antibiotic eye drops for bacterial conjunctivitis.',
  'i-tone eye drops': 'Herbal eye drops for eye strain and dryness.',
  'ciplox eye drops': 'Antibiotic eye drops for eye infections.',
  'refresh tears': 'Lubricant drops for dry eyes.',
  'meftal spas': 'Relieves menstrual cramps and abdominal pain.',
  'duphaston 10': 'Progesterone support in menstrual disorders.',
  'i-pill': 'Emergency contraceptive pill.',
  'urimax 0.4': 'Relieves urinary symptoms in prostate enlargement.',
  'silodal 8': 'Treats benign prostate hyperplasia symptoms.',
  'myospaz forte': 'Muscle relaxant with pain relief.',
  'myoril 4': 'Muscle relaxant for spasms and pain.',
  'forcan 150': 'Anti-fungal for vaginal and systemic fungal infections.',
  'terbicip 250': 'Anti-fungal for skin and nail infections.',
  'crocin syrup': 'Fever and pain relief syrup for children.',
  'augmentin duo syrup': 'Antibiotic syrup for children with infections.',
  'woodwards gripe water': 'Relief from colic and gas in infants.',
  'zinconia syrup': 'Zinc supplement syrup for diarrhea in children.',
};

const withBriefUse = <T extends { name?: string | null }>(medicine: T): T & { brief_use: string | null } => {
  const key = (medicine.name || '').toLowerCase();
  return {
    ...medicine,
    brief_use: MEDICINE_BRIEF_USES[key] || null,
  };
};

const buildOnlinePlatformLinks = (medicineName: string) => {
  const query = encodeURIComponent(medicineName);
  return [
    { name: 'Tata 1mg', url: `https://www.1mg.com/search/all?name=${query}` },
    { name: 'PharmEasy', url: `https://pharmeasy.in/search/all?name=${query}` },
    { name: 'Netmeds', url: `https://www.netmeds.com/catalogsearch/result/${query}/all` },
    { name: 'Apollo Pharmacy', url: `https://www.apollopharmacy.in/search-medicines/${query}` },
  ];
};

const rawTtl = Number(process.env.PRICE_COMPARISON_CACHE_TTL_MS);
const PRICE_COMPARISON_CACHE_TTL_MS = Number.isFinite(rawTtl) && rawTtl > 0
  ? rawTtl
  : 5 * 60 * 1000;

type PriceComparisonPayload = {
  medicine: {
    id: number;
    name: string;
    generic_name: string;
    manufacturer: string | null;
    category: string | null;
    side_effects: string | null;
    description: string | null;
  };
  localPrices: unknown[];
  onlinePlatforms: { name: string; url: string }[];
};

const priceComparisonCache = new Map<string, {
  expiresAt: number;
  payload: PriceComparisonPayload;
}>();

const getPriceComparisonCacheKey = (
  medicineId: number,
  lat: number | null,
  lng: number | null
) => {
  const latKey = lat === null ? 'na' : lat.toFixed(4);
  const lngKey = lng === null ? 'na' : lng.toFixed(4);
  return `${medicineId}:${latKey}:${lngKey}`;
};

const readFromPriceComparisonCache = (key: string): PriceComparisonPayload | null => {
  const cached = priceComparisonCache.get(key);
  if (!cached) {
    return null;
  }

  if (cached.expiresAt < Date.now()) {
    priceComparisonCache.delete(key);
    return null;
  }

  return cached.payload;
};

const writeToPriceComparisonCache = (key: string, payload: PriceComparisonPayload) => {
  priceComparisonCache.set(key, {
    expiresAt: Date.now() + PRICE_COMPARISON_CACHE_TTL_MS,
    payload,
  });

  // Keep the memory footprint bounded for this lightweight in-process cache.
  if (priceComparisonCache.size > 500) {
    const firstKey = priceComparisonCache.keys().next();
    if (!firstKey.done && firstKey.value) {
      priceComparisonCache.delete(firstKey.value);
    }
  }
};

const getNormalizedText = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const toTokenSet = (text: string) =>
  new Set(
    getNormalizedText(text)
      .split(' ')
      .filter((token) => token.length >= 2)
  );

const getEditDistance = (a: string, b: string) => {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const dp = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[a.length][b.length];
};

const hasCloseTokenMatch = (needle: string, haystackTokens: string[]) => {
  if (needle.length <= 2) {
    return haystackTokens.includes(needle);
  }

  for (const token of haystackTokens) {
    if (Math.abs(token.length - needle.length) > 2) continue;

    // Allow edit distance proportional to length for OCR typos
    const maxDist = needle.length <= 4 ? 1 : 2;
    if (getEditDistance(needle, token) <= maxDist) return true;

    // Substring containment for partial OCR reads
    if (needle.length >= 4 && token.length >= 4) {
      if (token.includes(needle) || needle.includes(token)) return true;
    }
  }
  return false;
};

// Common OCR misreads and medicine name aliases for better matching
const MEDICINE_ALIASES: Record<string, string[]> = {
  'dolo 650': ['dolo', 'dolo650', 'paracetamol 650', 'pcm 650'],
  'crocin advance': ['crocin', 'crocin advance', 'paracetamol 500'],
  'combiflam': ['combiflam', 'ibuprofen paracetamol'],
  'pan d': ['pan d', 'pand', 'pantoprazole domperidone', 'pantop d'],
  'glycomet gp 2': ['glycomet', 'glycomet gp', 'metformin glimepiride'],
  'azithral 500': ['azithral', 'azithromycin 500', 'azithromycin'],
  'montek lc': ['montek lc', 'monteklc', 'montelukast levocetirizine'],
  'augmentin 625': ['augmentin', 'amoxyclav', 'amoxicillin clavulanate', 'amoxicillin clavulanic'],
  'meftal spas': ['meftal', 'meftal spas', 'mefenamic dicyclomine'],
  'asthalin inhaler': ['asthalin', 'salbutamol inhaler', 'salbutamol'],
  'shelcal 500': ['shelcal', 'calcium d3', 'calcium vitamin d'],
  'ecosprin 75': ['ecosprin', 'aspirin 75', 'ecosprin75'],
  'thyronorm 50': ['thyronorm', 'levothyroxine 50', 'thyroxine'],
  'thyronorm 100': ['thyronorm 100', 'levothyroxine 100'],
  'allegra 120': ['allegra', 'fexofenadine', 'allegra120'],
  'calpol 650': ['calpol', 'calpol650'],
  'omez 20': ['omez', 'omeprazole'],
  'rantac 150': ['rantac', 'ranitidine'],
  'cefix 200': ['cefix', 'cefixime'],
  'brufen 400': ['brufen', 'ibuprofen 400'],
  'i-pill': ['ipill', 'i pill', 'i-pill', 'emergency contraceptive'],
  'duphaston 10': ['duphaston', 'dydrogesterone'],
  'foracort 200': ['foracort', 'formoterol budesonide'],
  'budecort 200': ['budecort', 'budesonide inhaler'],
  'metrogyl 400': ['metrogyl', 'metronidazole'],
  'oflox oz': ['oflox', 'ofloxacin ornidazole'],
  'norflox tz': ['norflox', 'norfloxacin tinidazole'],
  'betnovate c': ['betnovate', 'betamethasone cream'],
  'candid b cream': ['candid b', 'candid cream', 'clotrimazole cream'],
};

const medicineMatchesText = (
  medicine: { name: string; generic_name: string | null },
  normalizedText: string,
  textTokenSet: Set<string>
) => {
  const textTokens = Array.from(textTokenSet);
  const aliases = [medicine.name, medicine.generic_name || ''].filter(Boolean);

  // Add known aliases
  const medKey = medicine.name.toLowerCase();
  if (MEDICINE_ALIASES[medKey]) {
    aliases.push(...MEDICINE_ALIASES[medKey]);
  }

  for (const alias of aliases) {
    const normalizedAlias = getNormalizedText(alias);
    if (!normalizedAlias) continue;

    // Direct substring match
    if (normalizedText.includes(normalizedAlias)) {
      return true;
    }

    const aliasTokens = normalizedAlias.split(' ').filter((token) => token.length >= 2);
    if (aliasTokens.length === 0) continue;

    let matchedCount = 0;
    for (const token of aliasTokens) {
      if (textTokenSet.has(token) || hasCloseTokenMatch(token, textTokens)) {
        matchedCount += 1;
      }
    }

    // Lower threshold for single-word medicines (like "Dolo", "Crocin")
    const threshold = aliasTokens.length === 1 ? 1.0 : 0.6;
    const score = matchedCount / aliasTokens.length;
    if (score >= threshold) {
      return true;
    }
  }

  return false;
};

const extractTextFromPrescription = async (file: Express.Multer.File) => {
  const mimeType = file.mimetype?.toLowerCase() || '';
  const isPdf = mimeType.includes('pdf') || file.originalname.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    const pdfResult = await pdfParse(file.buffer);
    const normalizedPdfText = getNormalizedText(pdfResult.text || '');
    if (normalizedPdfText) {
      return normalizedPdfText;
    }

    // Fallback attempt for some PDF variants with embedded raster content.
    const ocrFallback = await Tesseract.recognize(file.buffer, 'eng');
    const normalizedFallbackText = getNormalizedText(ocrFallback.data.text || '');
    if (normalizedFallbackText) {
      return normalizedFallbackText;
    }

    throw new Error('No readable text found in the PDF. Try a clearer PDF or upload a JPG/PNG scan.');
  }

  if (mimeType.startsWith('image/')) {
    const result = await Tesseract.recognize(file.buffer, 'eng');
    return getNormalizedText(result.data.text || '');
  }

  throw new Error('Unsupported prescription file type. Use PDF, JPG, JPEG, PNG, or WEBP.');
};

// Haversine formula for distance in km — must be registered before
// preparing any statements that reference it.
db.function('haversine', (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
});

// ── Prepared Statements ──
// Pre-compile frequently used queries for better performance.

const searchMedicinesStmt = db.prepare(`
  SELECT m.id, m.name, m.generic_name, m.manufacturer, m.category,
         m.side_effects, m.description
  FROM medicines m
  WHERE m.name LIKE ? OR m.generic_name LIKE ?
`);

const priceInfoStmt = db.prepare(`
  SELECT
    MIN(price) as lowest_price,
    MAX(price) as highest_price,
    SUM(in_stock) as available_pharmacies,
    COUNT(*) as total_pharmacies
  FROM inventory
  WHERE medicine_id = ?
`);

const medicineByIdStmt = db.prepare(`
  SELECT id, name, generic_name, manufacturer, category, side_effects, description
  FROM medicines
  WHERE id = ?
`);

const localPricesWithGeoStmt = db.prepare(`
  SELECT
    p.id, p.name, p.address, p.lat, p.lng, p.phone, p.type,
    p.rating, p.open_hours,
    i.price, i.in_stock,
    haversine(?, ?, p.lat, p.lng) as distance
  FROM inventory i
  JOIN pharmacies p ON p.id = i.pharmacy_id
  WHERE i.medicine_id = ?
  ORDER BY i.in_stock DESC, i.price ASC, distance ASC
  LIMIT 25
`);

const localPricesNoGeoStmt = db.prepare(`
  SELECT
    p.id, p.name, p.address, p.lat, p.lng, p.phone, p.type,
    p.rating, p.open_hours,
    i.price, i.in_stock,
    0 as distance
  FROM inventory i
  JOIN pharmacies p ON p.id = i.pharmacy_id
  WHERE i.medicine_id = ?
  ORDER BY i.in_stock DESC, i.price ASC
  LIMIT 25
`);

const nearbyWithMedStmt = db.prepare(`
  SELECT
    p.id, p.name, p.address, p.lat, p.lng, p.phone, p.type,
    p.rating, p.open_hours,
    i.price, i.in_stock,
    haversine(?, ?, p.lat, p.lng) as distance
  FROM pharmacies p
  JOIN inventory i ON p.id = i.pharmacy_id
  WHERE i.medicine_id = ?
  ORDER BY distance ASC
  LIMIT 30
`);

const nearbyAllStmt = db.prepare(`
  SELECT
    p.id, p.name, p.address, p.lat, p.lng, p.phone, p.type,
    p.rating, p.open_hours,
    haversine(?, ?, p.lat, p.lng) as distance
  FROM pharmacies p
  ORDER BY distance ASC
  LIMIT 30
`);

const allMedicinesStmt = db.prepare(`
  SELECT id, name, generic_name, manufacturer, category, side_effects, description
  FROM medicines
`);

const ocrPriceInfoStmt = db.prepare(`
  SELECT MIN(price) as lowest_price, MAX(price) as highest_price
  FROM inventory
  WHERE medicine_id = ? AND in_stock = 1
`);



// ── Routes ──

// GET /api/medicines/search?q={query}
router.get('/medicines/search', (req: Request, res: Response) => {
  const query = req.query.q;
  if (!query) {
    res.status(400).json({ error: 'Missing query parameter q' });
    return;
  }

  const searchStr = `%${query}%`;
  const medicines = searchMedicinesStmt.all(searchStr, searchStr) as any[];

  for (const med of medicines) {
    const priceInfo: any = priceInfoStmt.get(med.id);
    med.lowest_price = priceInfo?.lowest_price ?? null;
    med.highest_price = priceInfo?.highest_price ?? null;
    med.available_pharmacies = priceInfo?.available_pharmacies ?? 0;
    med.total_pharmacies = priceInfo?.total_pharmacies ?? 0;

    // Calculate savings percentage
    if (med.highest_price && med.lowest_price) {
      med.savings_percent = Math.round(((med.highest_price - med.lowest_price) / med.highest_price) * 100);
    } else {
      med.savings_percent = 0;
    }
  }

  res.json({ results: medicines.map((med) => withBriefUse(med)) });
});

// GET /api/medicines/{id}/price-comparison?lat={lat}&lng={lng}
router.get('/medicines/:id/price-comparison', (req: Request, res: Response) => {
  const medicineId = Number(req.params.id);
  const lat = req.query.lat !== undefined ? Number(req.query.lat) : null;
  const lng = req.query.lng !== undefined ? Number(req.query.lng) : null;

  if (!Number.isFinite(medicineId)) {
    res.status(400).json({ error: 'Invalid medicine id' });
    return;
  }

  if ((lat !== null && !Number.isFinite(lat)) || (lng !== null && !Number.isFinite(lng))) {
    res.status(400).json({ error: 'Invalid lat/lng values' });
    return;
  }

  const cacheKey = getPriceComparisonCacheKey(medicineId, lat, lng);
  const cachedPayload = readFromPriceComparisonCache(cacheKey);
  if (cachedPayload) {
    res.setHeader('X-Price-Comparison-Cache', 'HIT');
    res.json(cachedPayload);
    return;
  }

  const medicine = medicineByIdStmt.get(medicineId) as any;

  if (!medicine) {
    res.status(404).json({ error: 'Medicine not found' });
    return;
  }

  const hasGeo = lat !== null && lng !== null;
  const localPrices = hasGeo
    ? localPricesWithGeoStmt.all(lat, lng, medicineId)
    : localPricesNoGeoStmt.all(medicineId);

  const payload: PriceComparisonPayload = {
    medicine: withBriefUse(medicine),
    localPrices,
    onlinePlatforms: buildOnlinePlatformLinks(medicine.name),
  };

  writeToPriceComparisonCache(cacheKey, payload);
  res.setHeader('X-Price-Comparison-Cache', 'MISS');
  res.json(payload);
});

// GET /api/pharmacies/nearby?lat={lat}&lng={lng}&medicine_id={id}
router.get('/pharmacies/nearby', (req: Request, res: Response) => {
  const { lat, lng, medicine_id } = req.query;

  if (!lat || !lng) {
    res.status(400).json({ error: 'Missing lat/lng parameters' });
    return;
  }

  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
    res.status(400).json({ error: 'Invalid lat/lng parameters' });
    return;
  }

  if (medicine_id) {
    const parsedMedicineId = Number(medicine_id);
    if (!Number.isFinite(parsedMedicineId)) {
      res.status(400).json({ error: 'Invalid medicine_id parameter' });
      return;
    }

    const pharmacies = nearbyWithMedStmt.all(parsedLat, parsedLng, parsedMedicineId);
    res.json({ results: pharmacies });
    return;
  }

  const pharmacies = nearbyAllStmt.all(parsedLat, parsedLng);
  res.json({ results: pharmacies });
});

// POST /api/prescriptions/upload
router.post('/prescriptions/upload', upload.single('prescription'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No prescription file uploaded' });
    return;
  }

  try {
    const text = await extractTextFromPrescription(req.file);
    const normalizedText = getNormalizedText(text);
    const textTokenSet = toTokenSet(text);
    console.log('Prescription text extracted:', normalizedText.slice(0, 200));

    const allMedicines = allMedicinesStmt.all() as any[];

    const matchedMedicines = [];

    for (const med of allMedicines) {
      if (medicineMatchesText(med, normalizedText, textTokenSet)) {
        const priceInfo: any = ocrPriceInfoStmt.get(med.id);

        matchedMedicines.push({
          id: med.id,
          name: med.name,
          generic_name: med.generic_name,
          manufacturer: med.manufacturer,
          category: med.category,
          side_effects: med.side_effects ?? null,
          description: med.description ?? null,
          lowest_price: priceInfo?.lowest_price ?? null,
          highest_price: priceInfo?.highest_price ?? null,
          available_pharmacies: 0,
          total_pharmacies: 0,
          brief_use: MEDICINE_BRIEF_USES[(med.name || '').toLowerCase()] || null,
        });
      }
    }

    res.json({
      extractedText: text,
      matchedMedicines,
    });
  } catch (error) {
    console.error('Prescription parsing error:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to process prescription file.' });
  }
});

export default router;
