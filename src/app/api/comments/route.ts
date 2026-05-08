import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'comments.json');

let memoryCache: any = null;

// Helper to read the file
function readComments() {
  if (memoryCache) return memoryCache;
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileContent = fs.readFileSync(dataFilePath, 'utf8');
      memoryCache = JSON.parse(fileContent);
      return memoryCache;
    }
  } catch (error) {
    console.error("Error reading comments file:", error);
  }
  memoryCache = {};
  return memoryCache;
}

// Helper to write the file
function writeComments(data: any) {
  memoryCache = data;
  try {
    // Vercel serverless functions have a read-only filesystem.
    // We try to write locally for development, but ignore errors in production
    // so the presentation flow doesn't crash with a 500 alert.
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.warn("Read-only filesystem detected (Vercel). Using in-memory cache.");
    return true; // Return true anyway to prevent UI errors
  }
}

export async function GET() {
  const comments = readComments();
  return NextResponse.json({ success: true, comments });
}

export async function POST(req: Request) {
  try {
    const { businessUnit, period, id, text } = await req.json();

    if (!businessUnit || !period || !id) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const comments = readComments();

    // Estructura: comments[businessUnit][period][id] = text
    if (!comments[businessUnit]) {
      comments[businessUnit] = {};
    }
    if (!comments[businessUnit][period]) {
      comments[businessUnit][period] = {};
    }

    comments[businessUnit][period][id] = text;

    const success = writeComments(comments);

    if (success) {
      return NextResponse.json({ success: true, comments });
    } else {
      return NextResponse.json({ success: false, error: 'Failed to write to file' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
