// api/items.js
// GET  /api/items  → alle Kleidungsstücke (ohne Bilddaten für Performance)
// POST /api/items  → neues Kleidungsstück anlegen

import { connectToDatabase } from '../lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // CORS-Header
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('items');

    // ── GET: Alle Items (ohne imageData für schnelle Listenansicht) ──
    if (req.method === 'GET') {
      const items = await collection
        .find({}, { projection: { imageData: 0 } })
        .sort({ addedAt: -1 })
        .toArray();

      return res.status(200).json(
        items.map(item => ({
          ...item,
          id: item._id.toString(),
          _id: undefined,
        }))
      );
    }

    // ── POST: Neues Item anlegen ──
    if (req.method === 'POST') {
      const body = req.body;

      if (!body) {
        return res.status(400).json({ error: 'Kein Body übermittelt.' });
      }

      // Bildgröße prüfen (Base64 ~= 4/3 * original size; max ~12MB Base64 → ~9MB Bild)
      if (body.imageData) {
        const sizeBytes = Buffer.byteLength(body.imageData, 'utf8');
        const sizeMB = sizeBytes / (1024 * 1024);
        if (sizeMB > 12) {
          return res.status(413).json({
            error: `Bild zu groß (${sizeMB.toFixed(1)} MB). Bitte Bild verkleinern (max. 12 MB).`
          });
        }
      }

      const now = new Date().toISOString();
      const doc = {
        name:         body.name || 'Neues Kleidungsstück',
        kategorie:    body.kategorie || '',
        farben:       body.farben || [],
        sitz:         body.sitz || '',
        laenge:       body.laenge || '',
        material:     body.material || '',
        textur:       body.textur || '',
        waerme:       body.waerme || '',
        jahreszeiten: body.jahreszeiten || [],
        styleMood:    body.styleMood || [],
        notizen:      body.notizen || '',
        imageData:    body.imageData || null,
        analyzing:    body.analyzing ?? false,
        addedAt:      body.addedAt || now,
        updatedAt:    now,
      };

      const result = await collection.insertOne(doc);
      return res.status(201).json({
        ...doc,
        id: result.insertedId.toString(),
        imageData: undefined, // nicht zurückschicken
      });
    }

    return res.status(405).json({ error: 'Methode nicht erlaubt.' });

  } catch (err) {
    console.error('[/api/items]', err);
    return res.status(500).json({ error: 'Interner Serverfehler.', detail: err.message });
  }
}
