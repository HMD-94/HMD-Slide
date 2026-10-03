import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Increase payload limit to 50MB to easily accommodate presentations with embedded images/slides
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Persistent storage directory for Cloud Presentations
  const DATA_DIR = path.resolve(__dirname, 'data');
  const CLOUD_FILE = path.resolve(DATA_DIR, 'cloud_presentations.json');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  function readCloudPresentations(): Record<string, any> {
    try {
      if (fs.existsSync(CLOUD_FILE)) {
        const raw = fs.readFileSync(CLOUD_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Erreur lecture cloud_presentations.json:', e);
    }
    return {};
  }

  function writeCloudPresentations(data: Record<string, any>) {
    try {
      fs.writeFileSync(CLOUD_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Erreur écriture cloud_presentations.json:', e);
    }
  }

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: Date.now() });
  });

  // GET all presentations stored in Cloud
  app.get('/api/cloud/presentations', (_req, res) => {
    try {
      const all = readCloudPresentations();
      const list = Object.values(all).sort(
        (a: any, b: any) => (b.updatedAt || 0) - (a.updatedAt || 0)
      );
      res.json({ success: true, presentations: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET single presentation by ID
  app.get('/api/cloud/presentations/:id', (req, res) => {
    try {
      const all = readCloudPresentations();
      const pres = all[req.params.id];
      if (!pres) {
        return res.status(404).json({ success: false, error: 'Diaporama introuvable' });
      }
      res.json({ success: true, presentation: pres });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST save / update presentation
  app.post('/api/cloud/presentations', (req, res) => {
    try {
      const presentation = req.body;
      if (!presentation || !presentation.id) {
        return res
          .status(400)
          .json({ success: false, error: 'Identifiant du diaporama manquant' });
      }

      const all = readCloudPresentations();
      const updated = {
        ...presentation,
        updatedAt: Date.now(),
      };
      all[presentation.id] = updated;
      writeCloudPresentations(all);

      res.json({ success: true, presentation: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // DELETE presentation from cloud
  app.delete('/api/cloud/presentations/:id', (req, res) => {
    try {
      const all = readCloudPresentations();
      delete all[req.params.id];
      writeCloudPresentations(all);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // In dev: attach Vite dev server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In prod: serve built static files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
