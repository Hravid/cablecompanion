import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Store cable bundles in memory (in a real app, use a database)
const cableBundles = {
  default: {
    num_holes: 10,
    num_cables: 5,
    cable_diameter: 2,
    hole_diameter: 3
  }
};

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('/api/bundle', (req, res) => {
  res.json(cableBundles.default);
});

app.put('/api/bundle', (req, res) => {
  cableBundles.default = { ...cableBundles.default, ...req.body };
  res.json(cableBundles.default);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});