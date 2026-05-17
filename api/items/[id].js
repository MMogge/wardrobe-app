// api/items/[id].js
// GET    /api/items/:id  → einzelnes Item inkl. Bilddaten
// PUT    /api/items/:id  → Item aktualisieren
// DELETE /api/items/:id  → Item löschen

import { connectToDatabase } from '../../lib/mongodb.js';
import { ObjectId } from 'mongodb';

function toObjectId(id) {
  try { return new ObjectId(id); }
  catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  const objectId = toObjectId(id);

  if (!objectId) {
    return res.status(400).json({ error: 'Ungültige ID.' });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('items');

    // ── GET: Einzelnes Item mit Bild ──
    if (req.method === 'GET') {
      const item = await collection.findOne({ _id: objectId });
      if (!item) return res.status(404).json({ error: 'Nicht gefunden.' });

      return res.status(200).json({
        ...item,
        id: item._id.toString(),
        _id: undefined,
      });
    }

    // ── PUT: Item aktualisieren ──
    if (req.method === 'PUT') {
      const body = req.body;
      if (!body) return res.status(400).json({ error: 'Kein Body.' });

      // Nur erlaubte Felder updaten
      const allowedFields = [
        'name', 'kategorie', 'farben', 'sitz', 'laenge',
        'material', 'textur', 'waerme', 'jahreszeiten',
        'styleMood', 'notizen', 'imageData', 'analyzing',
      ];
      const updates = { updatedAt: new Date().toISOString() };
      for (const field of allowedFields) {
        if (field in body) updates[field] = body[field];
      }

      const result = await collection.updateOne(
        { _id: objectId },
        { $set: updates }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Nicht gefunden.' });
      }

      return res.status(200).json({ success: true, updated: Object.keys(updates) });
    }

    // ── DELETE: Item löschen ──
    if (req.method === 'DELETE') {
      const result = await collection.deleteOne({ _id: objectId });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Nicht gefunden.' });
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Methode nicht erlaubt.' });

  } catch (err) {
    console.error(`[/api/items/${id}]`, err);
    return res.status(500).json({ error: 'Interner Serverfehler.', detail: err.message });
  }
}
