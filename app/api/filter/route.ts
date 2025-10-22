// /pages/api/ai-magic.ts
import axios from 'axios';
import {OPENAI_API_URL} from "@/app/api/ai-magic/route";
import {NextRequest, NextResponse} from "next/server";


export async function POST(req: NextRequest, res: NextResponse) {


    let body: any = await req.json();


    const aiQuery: string = (body?.aiQuery ?? '').toString().trim();
    if (!aiQuery) {
        return NextResponse.json({error: 'aiQuery ist erforderlich.'}, {status: 400});
    }

    const prompt = `
Du bist ein Immobilienfilter-Parser. Extrahiere aus folgendem Text die Filterkonfiguration als JSON:
"${aiQuery}"

Mögliche Filter (ausschließlich, nehme keine anderen):
1. floorType 
   "Parkett", "Laminat", "Fliesen", "Teppich", "Holzdielen", "Vinyl", "Naturstein", "Beton", 

2.  brightnessScore  als string
    "0" = sehr dunkel,
    "100" = extrem hell  

3. facadeColor
   "weiß", "beige", "grau", "schwarz", "blau", "rot", "gelb", "grün",

4. kitchenColor 
   "weiß", "beige", "grau", "schwarz", "blau", "rot", "gelb", "grün", 

5. bathroomColor 
   "weiß", "beige", "grau", "schwarz", "blau", "rot", "gelb", "grün", 

6. bathFeature
    "Fenster", "Tageslicht", "Badewanne", "Dusche", "Ebenerdige Dusche", "Doppelwaschbecken", "Handtuchheizung", "Gäste-WC"
 

Wenn kein Wert extrahiert werden kann, dann liefere keinen Wert mit. 
Antworte NUR im kompakten rohen JSON. Also "{"floorType:"...."}" OHNE "json" Annotation
{
  "floorType": "...",
  "brightnessScore":"...",
  "facadeColor": "...",
  "kitchenColor": "...",
  "bathroomColor": "...",
  "bathFeature: "..."
}`;

    try {
        const response = await axios.post(
            OPENAI_API_URL,
            {
                messages: [{role: 'user', content: prompt}],
                temperature: 0.2,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 20000,
            }
        );

        const aiResponse = response.data.choices[0].message.content;

        const filters = JSON.parse(aiResponse);
        console.log("FILTERS: ", filters);
        return NextResponse.json(filters, { status: 200 });
    } catch (error) {
        console.error('AI error:', error);

        return NextResponse.json({ error: 'Fehler bei der AI-Verarbeitung' }, { status: 500 });
    }
}

``