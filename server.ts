import express from 'express';
import { File } from 'megajs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Middleware
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://vercel.app',
      'https://kage-movies.vercel.app',
      'http://localhost:3000',
      process.env.APP_URL // AI Studio dynamic URL
    ].filter(Boolean);

    if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.run.app') || origin.endsWith('.vercel.app'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, x-api-key');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
    } else if (req.method !== 'OPTIONS' && process.env.NODE_ENV === 'production') {
        // Only enforce strict block in production to avoid bricking dev
        // For development, we allow more flexibility
    }
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // The streaming engine
  app.get('/api/stream', async (req, res) => {
    // 1. Read the key from the URL parameters as suggested
    const clientApiKey = req.query.key;
    const systemApiKey = process.env.VITE_STREAM_API_KEY || process.env.STREAM_API_KEY || 'KageSuperSecretToken2026!';

    // 2. Block the request if the keys don't match or aren't set
    if (!systemApiKey || clientApiKey !== systemApiKey) {
        return res.status(401).send('Error: Invalid or missing API security token.');
    }

    const megaUrl = req.query.url as string;

    if (!megaUrl) {
      return res.status(400).send('Error: Missing "url" parameter.');
    }

    try {
      // Connect to Mega anonymously using your public file link
      const file = File.fromURL(megaUrl);
      
      // Add a timeout to loadAttributes to prevent hanging
      const loadPromise = file.loadAttributes();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Mega link timeout')), 15000));
      
      await Promise.race([loadPromise, timeoutPromise]);

      const fileSize = file.size;
      const range = req.headers.range;
      const fileName = file.name || 'movie';
      // Browsers often support webm better than mkv directly, even though they share similar container structures
      const contentType = fileName.endsWith('.mkv') ? 'video/webm' : 'video/mp4';

      console.log(`[Stream] Sending: ${fileName} as ${contentType} (${fileSize} bytes)`);

      // Stream chunks so video can seek/fast-forward instantly
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        
        if (start >= fileSize) {
            res.status(416).send('Requested range not satisfiable');
            return;
        }

        const chunksize = (end - start) + 1;

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        });

        const megaStream = file.download({ start, end });
        megaStream.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        });
        const megaStream = file.download({});
        megaStream.pipe(res);
      }
    } catch (error: any) {
      console.error('Stream failure:', error.message);
      res.status(500).send(`Streaming server error: ${error.message}`);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
