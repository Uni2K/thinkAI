// app/api/ai-magic/route.ts
import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

type Listing = {
    id: string;
    title?: string;
    zip?: string;
    buyingPrice?: number;
    rooms?: number;
    squareMeter?: number;
    pricePerSqm?: number;
    rentPrice?: number;
    images?: { id: string; originalUrl: string; title?: string }[];
    ai_metadata?: any;
};

const MAX_IMAGES = 8;

function getSupabase() {
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(url, key, {
        auth: { persistSession: false },
    });
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
    try {
        const supabase = getSupabase();
        const { searchParams } = new URL(req.url);
        const limit = Number(searchParams.get('limit') ?? '3');

        // 1. Aus Supabase lesen (Inserate ohne ai_metadata)
        const { data: listings, error } = await supabase
            .from('listings')
            .select('*')
            .is('ai_metadata', null)
            .limit(limit);

        if (error) {
            return responseJson(500, { error: 'Supabase Select Fehler', details: error.message });
        }
        if (!listings || listings.length === 0) {
            return responseJson(200, { processed: [], message: 'Keine neuen Inserate' });
        }

        const processed: string[] = [];
        const failures: { id: string; error: string }[] = [];

        for (const listing of listings as Listing[]) {
            try {
                const images = (listing.images || []).slice(0, MAX_IMAGES);
                if (images.length === 0) {
                    failures.push({ id: listing.id, error: 'Keine Bilder' });
                    continue;
                }

                // 2. Bilder vorbereiten für Vision Prompt
                const imageParts = images.map(img => ({
                    type: 'image_url' as const,
                    image_url: { url: img.originalUrl }
                }));

                // 3. ChatGPT Vision Aufruf mit strukturiertem Schema
                const schema = {
                    name: 'ListingMetadata',
                    schema: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            summary: { type: 'string' },
                            quality_score: { type: 'number' },
                            condition_estimate: { type: 'string' },
                            notable_features: { type: 'array', items: { type: 'string' } },
                            potential_issues: { type: 'array', items: { type: 'string' } },
                            staging_quality: { type: 'integer' },
                            investment_angle: { type: 'string' },
                            recommended_actions: { type: 'array', items: { type: 'string' } },
                            detected_energy_efficiency_hints: { type: 'array', items: { type: 'string' } },
                        },
                        required: ['id','summary','quality_score','notable_features'],
                        additionalProperties: false
                    }
                };

                const userText =
                    `Analysiere die Bilder eines Immobilieninserats und gib strukturiertes JSON zurück.\n` +
                    `Basisdaten:\n` +
                    `Titel: ${listing.title ?? ''}\nPLZ: ${listing.zip ?? ''}\nKaufpreis: ${listing.buyingPrice ?? ''}\n` +
                    `Wohnfläche: ${listing.squareMeter ?? ''} / Zimmer: ${listing.rooms ?? ''}\nPreis/m²: ${listing.pricePerSqm ?? ''}\n` +
                    `Miete: ${listing.rentPrice ?? ''}\n` +
                    `Erstelle prägnante Zusammenfassung (max 40 Wörter).\nVermeide Halluzinationen, nutze "Unbekannt" falls nicht sicher.`;

                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    temperature: 0.2,
                    messages: [
                        {
                            role: 'system',
                            content:
                                'Du bist ein präziser Immobilien Vision Assistent. Antworte ausschließlich im gewünschten JSON Schema ohne zusätzliche Erklärungen.'
                        },
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: userText },
                                ...imageParts
                            ]
                        }
                    ],
                    response_format: { type: 'json_schema', json_schema: schema }
                });

                const raw = completion.choices[0]?.message?.content;
                if (!raw) throw new Error('Leere AI Antwort');

                const metadata = JSON.parse(raw);
                metadata.source_model = completion.model;
                metadata.created_at = new Date().toISOString();

                // 4. Speichern in Supabase
                const { error: upErr } = await supabase
                    .from('listings')
                    .update({
                        ai_metadata: metadata,
                        ai_processed_at: new Date().toISOString()
                    })
                    .eq('id', listing.id);

                if (upErr) throw new Error('Update Fehler: ' + upErr.message);

                processed.push(listing.id);
            } catch (e: any) {
                failures.push({ id: listing.id, error: e.message });
            }
        }

        return responseJson(200, { processed, failures });
    } catch (e: any) {
        return responseJson(500, { error: 'Unerwarteter Fehler', details: e.message });
    }
}

function responseJson(status: number, body: any) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}