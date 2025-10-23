// app/api/ai-magic/route.ts
import {NextRequest, NextResponse} from 'next/server';
import fs from 'fs';
import path from 'path';
import {mkdir, writeFile} from 'fs/promises';
import axios from 'axios'; // <--- NEU

export const dynamic = 'force-dynamic';

const DATA_PATH = path.join(process.cwd(), 'public', 'data.json');
const OUT_PATH = path.join(process.cwd(), 'public', 'data_refined.json');
const CACHE_DIR = path.join(process.cwd(), '.cache', 'images');
const CONCURRENCY = 3;

// Modell und API-URL für Azure OpenAI
const OPENAI_MODEL = "gpt-4o"; // oder z.B. "gpt-4o-mini"
const OPENAI_API_URL = `https://customer-growth-hackathon-eh-dwe.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview`;

type Listing = {
    id: string | number;
    title?: string;
    images?: string[];
    [k: string]: any;
};

type ImageAnalysis = {
    floorType: string;
    brightnessScore: number,
    facadeColor: string,
    kitchenColor: string,
    bathroomColor: string,
    saunaType: string,
    notes?: string;
};

async function ensureCacheDir() {
    if (!fs.existsSync(CACHE_DIR)) {
        await mkdir(CACHE_DIR, {recursive: true});
    }
}

function safeFileName(url: string, idx: number) {
    const u = new URL(url);
    const base = path.basename(u.pathname).split('?')[0] || `img_${idx}.jpg`;
    return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function downloadImage(url: string, idx: number): Promise<string> {
    const fname = safeFileName(url, idx);
    const full = path.join(CACHE_DIR, fname);
    if (fs.existsSync(full) && fs.statSync(full).size > 100) {
        return full;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Bild Download fehlgeschlagen: ${url}`);
    const arrayBuf = await res.arrayBuffer();
    await writeFile(full, Buffer.from(arrayBuf));
    return full;
}

// Azure OpenAI REST API Call
async function analyzeImage(imageUrl: string): Promise<ImageAnalysis> {
    const prompt= `
Analysiere das Bild eines Immobilieninserats und gib die Ergebnisse als kompaktes, strukturiertes JSON zurück.

Bildkontext:
Das Bild wird innerhalb dieses Prompts übermittelt. Es zeigt entweder das Innere, das Äußere oder den Grundriss eines Immobilieninserats.

Analysiere folgende visuelle Merkmale (sofern erkennbar):

1. **Bodenart** 
   Wähle ausschließlich eine der folgenden Optionen: 
   "Parkett", "Laminat", "Fliesen", "Teppich", "Holzdielen", "Vinyl", "Naturstein", "Beton", "unknown"

2. **Helligkeit** 
     Bestimme die Helligkeit abhängig vom Bildtyp:
   - Bei Innenaufnahmen: Schätze die wahrgenommene Helligkeit der Wohnung basierend auf Lichtverhältnissen im Innenraum.
   - Bei Außenaufnahmen: Beurteile die Helligkeit anhand der Anzahl, Größe und Position der Fenster.
   - Bei Grundrissen: Setze den Wert auf -1.
   Skaliere die Helligkeit auf einer Skala von 0 bis 100. 
   (0 = sehr dunkel, 100 = extrem hell)

3. **Farbe der Außenfassade** 
   Falls die Außenfassede sichtbar und erkennbar ist, wähle eine der folgenden Farben **ausschließlich auf Deutsch**: 
   "weiß", "beige", "grau", "schwarz", "blau", "rot", "gelb", "grün", "unknown"

4. **Küchenfarbe** 
   Dominante Farbe der Küchenwände (falls sichtbar) **ausschließlich auf Deutsch**: 
   "weiß", "beige", "grau", "schwarz", "blau", "rot", "gelb", "grün", "unknown"

5. **Badfliesenfarbe** 
   Dominante Farbe der Fliesen im Badezimmer (falls sichtbar) **ausschließlich auf Deutsch**: 
   "weiß", "beige", "grau", "schwarz", "blau", "rot", "gelb", "grün", "unknown"

6. **Sauna** 
   Falls erkennbar, wähle eine der folgenden Optionen: 
   "Finnische Sauna", "Bio-Sauna", "Infrarot-Sauna", "Dampfsauna", "Sanarium", "Textilsauna", "unknown"

Gib die Antwort ausschließlich im folgenden kompakten JSON-Format zurück:

{
  "floorType": "...",
  "brightnessScore": <number>,
  "facadeColor": "...",
  "kitchenColor": "...",
  "bathroomColor": "...",
  "saunaType": "..."
}

Hinweise:
- Verwende "unknown", wenn ein Merkmal nicht erkennbar oder nicht relevant ist.
- Beschreibe ausschließlich visuell wahrnehmbare Eigenschaften – keine technischen oder textbasierten Angaben.
- Gib keine zusätzlichen Erklärungen, Kommentare oder Formatierungen zurück – nur das JSON-Objekt.
`;

    const body = {
        messages: [
            {
                role: "system",
                content: [
                    {
                        type: "text",
                        text: "Du bist ein präzises Vision-Analyse-Modul."
                    }
                ]
            },
            {
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: imageUrl } }
                ]
            }
        ],
        temperature: 0.2,
        top_p: 0.95,
        max_tokens: 512,
       // response_format: { type: "json_object" }
    };

    try {
        const res = await axios.post(
            OPENAI_API_URL,
            body,
            {
                headers: {
                    "api-key": process.env.OPENAI_API_KEY!,
                    "Content-Type": "application/json"
                },
                timeout: 20000
            }
        );
        const resp = res.data;
        // Die API liefert bei response_format: {type: "json_object"} das JSON direkt in choices[0].message.content als Objekt
        const content = resp.choices?.[0]?.message?.content;
        if (typeof content === "object" && content !== null) {
            // content ist bereits ein Objekt
            return {
                floorType: content.floorType ?? 'unknown',
                brightnessScore: Number(content.brightnessScore) || 0,
                facadeColor: content.facadeColor ?? 'unknown',
                kitchenColor: content.kitchenColor ?? 'unknown',
                bathroomColor: content.bathroomColor ?? 'unknown',
                saunaType: content.saunaType ?? 'unknown',
                notes: content.notes
            };
        } else if (typeof content === "string") {
            // Fallback: content ist ein JSON-String
            try {
                const cleaned = content
                    .replace(/^```json/, '')
                    .replace(/^```/, '')
                    .replace(/```$/, '')
                    .trim();

                const parsed = JSON.parse(cleaned);
                return {
                    floorType: parsed.floorType ?? 'unknown',
                    brightnessScore: Number(parsed.brightnessScore) || 0,
                    facadeColor: parsed.facadeColor ?? 'unknown',
                    kitchenColor: parsed.kitchenColor ?? 'unknown',
                    bathroomColor: parsed.bathroomColor ?? 'unknown',
                    saunaType: parsed.saunaType ?? 'unknown',
                    notes: parsed.notes
                };
            } catch (e) {
                console.error("Parse-Fehler:", e, "Antwort:", content);
                return {
                    floorType: 'unknown',
                    brightnessScore: 0,
                    facadeColor: 'unknown',
                    kitchenColor:  'unknown',
                    bathroomColor: 'unknown',
                    saunaType:  'unknown',
                    notes: 'ParseError',
                };
            }
        } else {
            return {
                floorType: 'unknown',
                brightnessScore: 0,
                facadeColor: 'unknown',
                kitchenColor:  'unknown',
                bathroomColor: 'unknown',
                saunaType:  'unknown',
                notes: 'NoContent',
            };
        }
    } catch (e: any) {
        console.error("Axios-Fehler beim Aufruf der OpenAI-API:", e?.message, e?.code, e?.response?.data);
        return {
            floorType: 'unknown',
            brightnessScore: 0,
            facadeColor: 'unknown',
            kitchenColor:  'unknown',
            bathroomColor: 'unknown',
            saunaType:  'unknown',
            notes: 'Error: ' + (e?.message || 'axios error'),
        };
    }

}

type RawImage = { id: string; originalUrl: string; title?: string };

async function loadListings(): Promise<Listing[]> {
    if (!fs.existsSync(DATA_PATH)) throw new Error('data.json fehlt');
    const raw = await fs.promises.readFile(DATA_PATH, 'utf-8');
    const json = JSON.parse(raw);
    if (Array.isArray(json)) return json.map(normalizeListing);
    if (Array.isArray(json.results)) return json.results.map(normalizeListing);
    throw new Error('Unbekanntes Format: erwartet Array oder Objekt mit results[]');
}

function normalizeListing(l: any): Listing {
    const rawImages: RawImage[] = Array.isArray(l.images) ? l.images : [];
    const imageUrls = rawImages
        .map(img => img?.originalUrl)
        .filter((u: any) => typeof u === 'string' && u.startsWith('http'));
    return {
        ...l,
        _rawImages: rawImages,
        images: imageUrls
    };
}

function pLimit<T>(concurrency: number) {
    let active = 0;
    const queue: (() => void)[] = [];
    const next = () => {
        active--;
        if (queue.length) {
            const fn = queue.shift();
            fn && fn();
        }
    };
    return <U>(fn: () => Promise<U>): Promise<U> =>
        new Promise((resolve, reject) => {
            const run = () => {
                active++;
                fn()
                    .then((v) => {
                        next();
                        resolve(v);
                    })
                    .catch((e) => {
                        next();
                        reject(e);
                    });
            };
            if (active < concurrency) run();
            else queue.push(run);
        });
}

async function analyzeListing(listing: Listing): Promise<Listing> {
    const images = listing.images || [];
    if (!images.length) return {...listing, _analysis: []};
    const results: ImageAnalysis[] = [];

    for (let i = 0; i < Math.min(20, images.length); i++) {
        const imgUrl = images[i];
        const attempt = async (): Promise<ImageAnalysis> => {
            try {
                // Optional: lokales Caching erzwingen (auskommentiert, falls nicht notwendig)
                //await downloadImage(imgUrl, i);
                return await analyzeImage(imgUrl);
            } catch (e) {
                console.log(e)
                return {
                    floorType: 'unknown',
                    brightnessScore: 0,
                    facadeColor: 'unknown',
                    kitchenColor:  'unknown',
                    bathroomColor: 'unknown',
                    saunaType:  'unknown',
                    notes: 'Error: ' + (e as Error).message,
                };
            }
        };
        results.push(await attempt());
    }

    // Aggregation (einfacher Majority / Mittelwert)
    const floorCounts: Record<string, number> = {};
    results.forEach((r) => {
        if (r.floorType !== 'unknown') {
            floorCounts[r.floorType] = (floorCounts[r.floorType] || 0) + 1;
        }
    });
    const avgBrightness =
        results.reduce((sum, r) => sum + (r.brightnessScore || 0), 0) /
        (results.length || 1);

    // Helper function to find dominant value for a given key
    function getDominantValue(key: keyof typeof results[0]): string {
        const counts = results
            .map(r => r[key])
            .filter(v => v !== 'unknown' && v !== undefined)
            .reduce((acc: Record<string, number>, val) => {
                acc[val] = (acc[val] || 0) + 1;
                return acc;
            }, {});

        if (Object.keys(counts).length === 0) {
            return 'unknown';
        }

        return Object.entries(counts).reduce((a, b) => b[1] > a[1] ? b : a)[0];
    }

    return {
        ...listing,
        ai: {
            floorType: getDominantValue('floorType'),
            brightness: Math.round(avgBrightness),
            exteriorColor: getDominantValue('facadeColor'),
            kitchenColor: getDominantValue('kitchenColor'),
            bathroomTiles: getDominantValue('bathroomColor'),
            saunaType: getDominantValue('saunaType'),
            analyzedAt: new Date().toISOString(),
        },
    };
}

async function refineAll() {
    const listings = await loadListings();
    await ensureCacheDir();

    const out: Listing[] = [];
    for (const l of listings.slice(0, 2)) {
        const refined = await analyzeListing(l);
        out.push(refined);
    }
    await fs.promises.writeFile(OUT_PATH, JSON.stringify(out, null, 2), 'utf-8');
    return out;
}

export async function POST(_req: NextRequest) {
    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
            {error: 'OPENAI_API_KEY fehlt'},
            {status: 500}
        );
    }
    try {
        const started = Date.now();
        const data = await refineAll();
        return NextResponse.json({
            status: 'ok',
            count: data.length,
            durationMs: Date.now() - started,
            output: 'public/data_refined.json',
        });
    } catch (e: any) {
        return NextResponse.json(
            {error: e.message || 'Fehler'},
            {status: 500}
        );
    }
}

export async function GET() {
    if (fs.existsSync(OUT_PATH)) {
        const raw = await fs.promises.readFile(OUT_PATH, 'utf-8');
        return NextResponse.json({ready: true, data: JSON.parse(raw)});
    }
    return NextResponse.json({ready: false});
}