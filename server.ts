import express from 'express';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY || '';

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Health check endpoint for client heartbeat & auto-reconnect pinging
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    timestamp: Date.now(),
    owner: 'Rk Hacker',
    app: 'Maya AI Companion',
    hasApiKey: !!apiKey,
  });
});

// Gemini generation API endpoint
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!ai) {
      return res.status(503).json({ 
        error: 'Gemini API key not configured',
        offlineFallback: true 
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini Generate Error:', error?.message || error);
    res.status(500).json({ 
      error: 'Failed to generate content from AI model',
      offlineFallback: true 
    });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Maya AI Express + Vite Server running on port ${PORT}`);
  });
}

startServer();
