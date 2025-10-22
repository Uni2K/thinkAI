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
    brightnessCategory: string;
    brightnessScore: number; // 0-100
    confidence: number; // 0-1
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
    const prompt = `
Analysiere das Foto einer Wohnung für:
1. Bodenart (z.B. Parkett, Laminat, Fliesen, Teppich, Beton, Vinyl, Mischform).
2. Helligkeitseindruck (dunkel, mittel, hell, sehr hell) basierend auf wahrgenommener natürlichen + künstlichen Lichtquellen.
3. Skaliere Helligkeit 0-100 (0=sehr dunkel, 100=extrem hell).
4. Vertrauen 0-1.
Antworte NUR als kompaktes JSON:
{
 "floorType": "...",
 "brightnessCategory": "...",
 "brightnessScore": <number>,
 "confidence": <number>,
 "notes": "kurze optionale Bemerkung"
}
Wenn unsicher: floorType="unknown".
`;


    try {
        const res = await axios.post(
            OPENAI_API_URL,
            `{
  "messages": [
    {
      "role": "system",
      "content": [
        {
          "type": "text",
          "text": "Sie sind KI-Assistent und helfen Personen, Informationen zu finden."
        }
      ]
    }
  ],
  "temperature": 0.7,
  "top_p": 0.95,
  "max_tokens": 6553
}`,
            {
                headers: {
                    "api-key": process.env.OPENAI_API_KEY!,
                    "Content-Type": "application/json"
                },
                timeout: 20000
            }
        );
        const resp = res.data;
        const raw = resp.choices?.[0]?.message?.content || '{}';
        try {
            const parsed = JSON.parse(raw);
            return {
                floorType: parsed.floorType ?? 'unknown',
                brightnessCategory: parsed.brightnessCategory ?? 'unknown',
                brightnessScore: Number(parsed.brightnessScore) || 0,
                confidence: Number(parsed.confidence) || 0,
                notes: parsed.notes,
            };
        } catch (e) {
            console.error("Parse-Fehler:", e, "Antwort:", raw);
            return {
                floorType: 'unknown',
                brightnessCategory: 'unknown',
                brightnessScore: 0,
                confidence: 0,
                notes: 'ParseError',
            };
        }
    } catch (e: any) {
    }
    ;

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
                    brightnessCategory: 'unknown',
                    brightnessScore: 0,
                    confidence: 0,
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
    const dominantFloor =
        Object.entries(floorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
    const avgBrightness =
        results.reduce((sum, r) => sum + (r.brightnessScore || 0), 0) /
        (results.length || 1);

    return {
        ...listing,
        ai: {
            dominantFloor,
            avgBrightness: Math.round(avgBrightness),
            perImage: results,
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