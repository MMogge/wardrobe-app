export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const { base64Image, mimeType } = req.body;
  if (!base64Image || !mimeType) {
    return res.status(400).json({ error: 'base64Image and mimeType required' });
  }

  const prompt = `Analysiere dieses Kleidungsstück und antworte NUR mit einem validen JSON-Objekt (kein Markdown, kein Text davor oder danach):

{
  "name": "kurzer beschreibender Name (z.B. 'Weißes Leinenhemd')",
  "farbe": "Hauptfarbe(n)",
  "kategorie": "Oberteil|Hose|Kleid|Rock|Jacke|Mantel|Schuhe|Accessoire|Unterwäsche|Sportkleidung|Sonstiges",
  "sitz": "Oversized|Regular|Slim|Fitted",
  "laenge": "Kurz|Midi|Lang|Normal (für Tops/Jacken)",
  "material": "erkennbares Material (z.B. Baumwolle, Wolle, Synthetik...)",
  "textur": "Glatt|Strukturiert|Gestrickt|Gewebt|Bedruckt|Sonstiges",
  "waerme": "Leicht|Mittel|Warm|Sehr warm",
  "saison": ["Frühling","Sommer","Herbst","Winter"] (nur passende),
  "stil": ["Casual","Business","Sportlich","Festlich","Boho","Minimalistisch","Streetwear"] (nur passende, max 3),
  "notizen": "kurze Stylinghinweise oder besondere Merkmale"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [{
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: base64Image },
          }, {
            type: 'text',
            text: prompt,
          }],
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // JSON aus der Antwort extrahieren
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return res.status(500).json({ error: 'Kein JSON in der Antwort', raw: text });
    }

    const metadata = JSON.parse(match[0]);
    return res.status(200).json(metadata);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
