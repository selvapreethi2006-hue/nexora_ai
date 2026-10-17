import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Helper to get initialized Gemini client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health and config endpoint
app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    brand: 'Nexora AI',
    tagline: 'Think Smarter. Create More.',
    model: DEFAULT_MODEL,
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    features: {
      webSearch: true,
      streaming: true,
      tts: true,
      fileUpload: true,
      multilingual: true,
    },
  });
});

// Build system instruction with persona, style, and multilingual capabilities
function buildSystemInstruction(preferredLanguage?: string, responseStyle?: string): string {
  let instruction = `You are Nexora AI, a world-class, highly capable AI assistant built with cutting-edge intelligence.
Your brand tagline is: "Think Smarter. Create More."
Your mission: Help users think, learn, create, code, analyze, and solve problems with speed, precision, and elegance.

Core Guidelines:
1. Natural Persona: Speak with clarity, intelligence, and helpfulness. Never use repetitive robotic disclaimers (e.g. "As an AI language model..."). Avoid repeatedly re-introducing yourself in ongoing conversations.
2. Coding & Technical Excellence:
   - Provide clean, robust, production-ready code with accurate syntax.
   - Support Python, JavaScript, TypeScript, React, Go, Rust, Java, C++, SQL, HTML/CSS, Shell, etc.
   - Always format code blocks with language identifiers (e.g. \`\`\`typescript ... \`\`\`).
   - Explain key architectural decisions, edge cases, and dependencies.
3. Multilingual & Tanglish Mastery:
   - You are fully fluent in English, Tamil (தமிழ்), and Tanglish (Tamil phonetically written in Latin/English letters, e.g., "Vanakkam! Ungalukku eppadi help panna mudiyum?").
   - Respond in the language used by the user. If the user asks in Tanglish, reply in warm, natural, colloquial Tanglish.
   - If the user switches languages, switch seamlessly with them.
4. Truthfulness & Objectivity:
   - Provide accurate, verifiable information. If you are uncertain about obscure facts, acknowledge uncertainty clearly instead of inventing details.
   - Distinguish confirmed facts, technical best practices, and subjective suggestions.
5. Rich Formatting:
   - Use Markdown headings, structured lists, tables, and bolding for readability.`;

  if (responseStyle === 'concise') {
    instruction += `\nResponse Style: Keep answers direct, concise, and focused on immediate solutions with minimal fluff.`;
  } else if (responseStyle === 'creative') {
    instruction += `\nResponse Style: Provide vivid, comprehensive, creative explanations with illustrative analogies and brainstorming angles.`;
  } else if (responseStyle === 'technical') {
    instruction += `\nResponse Style: Provide deeply technical, precise architectural breakdowns, strict type safety, algorithmic analysis, and edge cases.`;
  }

  if (preferredLanguage === 'ta') {
    instruction += `\nLanguage Directive: Always respond in natural, grammatically correct Tamil (தமிழ்) script unless requested otherwise.`;
  } else if (preferredLanguage === 'tanglish') {
    instruction += `\nLanguage Directive: Always respond in natural, friendly Tanglish (Tamil in English letters) unless requested otherwise.`;
  }

  return instruction;
}

interface MessageAttachment {
  name: string;
  type: string;
  data: string; // base64
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  attachments?: MessageAttachment[];
}

// Format message history for Gemini API
function formatContentsForGemini(messages: ChatMessage[]) {
  return messages.map((msg) => {
    const parts: any[] = [];

    // Add attachments if user message
    if (msg.attachments && msg.attachments.length > 0) {
      for (const att of msg.attachments) {
        if (att.data) {
          // If data is base64 with data URL prefix, strip prefix
          const base64Clean = att.data.includes(',') ? att.data.split(',')[1] : att.data;
          parts.push({
            inlineData: {
              mimeType: att.type || 'application/octet-stream',
              data: base64Clean,
            },
          });
        }
      }
    }

    if (msg.content) {
      parts.push({ text: msg.content });
    } else if (parts.length === 0) {
      parts.push({ text: ' ' });
    }

    return {
      role: msg.role === 'model' ? 'model' : 'user',
      parts,
    };
  });
}

// Streaming chat endpoint with SSE
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  const {
    messages,
    enableWebSearch,
    preferredLanguage,
    responseStyle,
    temperature = 0.7,
  } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required.' });
    return;
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const ai = getGeminiClient();
    const systemInstruction = buildSystemInstruction(preferredLanguage, responseStyle);
    const contents = formatContentsForGemini(messages);

    const tools: any[] = [];
    if (enableWebSearch) {
      tools.push({ googleSearch: {} });
    }

    const responseStream = await ai.models.generateContentStream({
      model: DEFAULT_MODEL,
      contents,
      config: {
        systemInstruction,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        tools: tools.length > 0 ? tools : undefined,
      },
    });

    let fullText = '';
    const collectedSources: { uri: string; title: string }[] = [];

    for await (const chunk of responseStream) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullText += chunkText;
        sendEvent('chunk', { text: chunkText });
      }

      // Check for grounding metadata
      const candidate = chunk.candidates?.[0];
      const groundingChunks = (candidate as any)?.groundingMetadata?.groundingChunks;
      if (Array.isArray(groundingChunks)) {
        for (const gc of groundingChunks) {
          if (gc.web?.uri) {
            collectedSources.push({
              uri: gc.web.uri,
              title: gc.web.title || gc.web.uri,
            });
          }
        }
      }
    }

    // Deduplicate sources
    const uniqueSources = Array.from(
      new Map(collectedSources.map((s) => [s.uri, s])).values()
    );

    sendEvent('done', {
      fullText,
      sources: uniqueSources,
    });
    res.end();
  } catch (error: any) {
    console.error('Gemini streaming error:', error);
    sendEvent('error', {
      message: error?.message || 'An error occurred while generating response with Gemini.',
      details: error?.status || 'API_ERROR',
    });
    res.end();
  }
});

// Non-streaming chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const {
    messages,
    enableWebSearch,
    preferredLanguage,
    responseStyle,
    temperature = 0.7,
  } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required.' });
    return;
  }

  try {
    const ai = getGeminiClient();
    const systemInstruction = buildSystemInstruction(preferredLanguage, responseStyle);
    const contents = formatContentsForGemini(messages);

    const tools: any[] = [];
    if (enableWebSearch) {
      tools.push({ googleSearch: {} });
    }

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents,
      config: {
        systemInstruction,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        tools: tools.length > 0 ? tools : undefined,
      },
    });

    const sources: { uri: string; title: string }[] = [];
    const groundingChunks = (response.candidates?.[0] as any)?.groundingMetadata?.groundingChunks;
    if (Array.isArray(groundingChunks)) {
      for (const gc of groundingChunks) {
        if (gc.web?.uri) {
          sources.push({
            uri: gc.web.uri,
            title: gc.web.title || gc.web.uri,
          });
        }
      }
    }

    res.json({
      text: response.text || '',
      sources: Array.from(new Map(sources.map((s) => [s.uri, s])).values()),
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate response.',
      status: error?.status || 'UNKNOWN',
    });
  }
});

// Text-to-speech endpoint using gemini-3.8-flash-lite-tts
app.post('/api/tts', async (req: Request, res: Response) => {
  const { text, voice = 'Kore' } = req.body;

  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'Text string is required.' });
    return;
  }

  try {
    const ai = getGeminiClient();
    // Truncate overly long text for TTS safety (max ~1200 chars for concise spoken speech)
    const cleanText = text.replace(/```[\s\S]*?```/g, 'Code snippet omitted for audio playback.').slice(0, 1500);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text: cleanText }],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].includes(voice) ? voice : 'Kore',
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      res.status(500).json({ error: 'No audio generated by model.' });
      return;
    }

    res.json({
      audio: `data:audio/wav;base64,${base64Audio}`,
    });
  } catch (error: any) {
    console.error('Gemini TTS error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to synthesize speech.',
    });
  }
});

// Start server and handle Vite integration
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexora AI server running on port ${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Nexora AI server:', err);
  process.exit(1);
});
