import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';
import { setupDB } from './db/setup';
import { importCSVMedicines } from './db/importCSV';
import dotenv from 'dotenv';

dotenv.config();

// Tables are automatically initialized when db/setup.ts is imported

// Enrich medicines with CSV data (descriptions, side effects)
try {
  importCSVMedicines();
} catch (e) {
  console.warn('CSV import skipped:', (e as Error).message);
}

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`CureLink Backend server running on http://localhost:${port}`);
});
