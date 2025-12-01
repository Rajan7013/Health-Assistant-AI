import { NextRequest, NextResponse } from 'next/server';
import * as googleTTS from 'google-tts-api';

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        // Clean up the text for speech (remove markdown symbols)
        // 1. Remove bold/italic markers (* and _)
        // 2. Remove heading markers (#)
        // 3. Remove code block markers (`)
        // 4. Simplify links [text](url) -> text
        const cleanText = text
            .replace(/[*#`]/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .trim();

        if (!cleanText) {
            return NextResponse.json(
                { error: 'No speakable text found' },
                { status: 400 }
            );
        }

        // 1. Get audio URLs for long text (splits into chunks)
        const results = googleTTS.getAllAudioUrls(cleanText, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
        });

        // 2. Fetch all audio chunks in parallel
        const audioBuffers = await Promise.all(
            results.map(async (item) => {
                const response = await fetch(item.url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch audio chunk: ${response.statusText}`);
                }
                return await response.arrayBuffer();
            })
        );

        // 3. Concatenate all audio buffers
        const totalLength = audioBuffers.reduce((acc, buffer) => acc + buffer.byteLength, 0);
        const combinedBuffer = new Uint8Array(totalLength);
        let offset = 0;

        for (const buffer of audioBuffers) {
            combinedBuffer.set(new Uint8Array(buffer), offset);
            offset += buffer.byteLength;
        }

        // 4. Return the combined audio
        return new NextResponse(combinedBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': totalLength.toString(),
            },
        });

    } catch (error) {
        console.error('Error in TTS API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
