import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_REFINED_PATH = path.join(process.cwd(), 'public', 'data_refined.json');

export async function GET() {
  if (!fs.existsSync(DATA_REFINED_PATH)) {
    return NextResponse.json({ error: 'data_refined.json nicht gefunden' }, { status: 404 });
  }
  const raw = await fs.promises.readFile(DATA_REFINED_PATH, 'utf-8');
  return NextResponse.json(JSON.parse(raw));
}

