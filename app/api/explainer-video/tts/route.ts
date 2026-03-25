import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Google Translate TTS hack - limit is ~200 chars per chunk
    // We split by sentences or fragments
    const sentences = text.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [text];
    const chunks: string[] = [];
    
    let currentChunk = "";
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length < 200) {
        currentChunk += sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      }
    }
    if (currentChunk) chunks.push(currentChunk.trim());

    // Fetch all chunks and combine into one Buffer
    const audioChunks: Buffer[] = [];
    
    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=en&client=tw-ob`;
      const response = await fetch(url, {
        headers: {
          "Referer": "http://translate.google.com/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      });
      
      if (!response.ok) {
        throw new Error(`TTS Fetch failed for chunk: ${chunk.substring(0, 20)}...`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      audioChunks.push(Buffer.from(arrayBuffer));
    }

    const finalBuffer = Buffer.concat(audioChunks);

    return new NextResponse(finalBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": finalBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[TTS API Error]:", error);
    return NextResponse.json({ error: "TTS Generation failed" }, { status: 500 });
  }
}
