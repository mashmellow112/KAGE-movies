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
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, x-api-key');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
  });

  // The streaming engine
  app.get('/api/stream', async (req, res) => {
    const clientApiKey = req.query.key;
    const systemApiKey = process.env.VITE_STREAM_API_KEY || process.env.STREAM_API_KEY || 'KageSuperSecretToken2026!';

    // 1. Security Token Check
    if (clientApiKey !== systemApiKey) {
        console.error("⛔ Security Block: Invalid API Key provided.");
        return res.status(401).send('Error: Invalid API token.');
    }

    const megaUrl = req.query.url as string;
    if (!megaUrl) {
        return res.status(400).send('Error: Missing video URL.');
    }

    console.log(`🎬 Attempting to stream Mega file: ${megaUrl}`);

    try {
      // 2. Initialize Mega File Handler
      const file = File.fromURL(megaUrl);
      
      // Load attributes with a fast timeout safety trigger
      const loadPromise = file.loadAttributes();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Mega link timeout')), 30000));
      
      await Promise.race([loadPromise, timeoutPromise]);

      const fileSize = file.size;
      const range = req.headers.range;
      const contentType = 'video/mp4'; // Standard high-compatibility container

      // 3. Handle Media Range Bytes (For Instant Loading and Seeking)
      if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunksize = (end - start) + 1;

          console.log(`📦 Streaming partial range chunk: ${start}-${end}/${fileSize}`);

          res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': contentType,
              'Cache-Control': 'no-cache'
          });

          const megaStream = file.download({ start, end });
          megaStream.on('error', (err) => console.error("❌ Mega download stream error:", err));
          megaStream.pipe(res);
      } else {
          console.log(`🚀 Streaming complete file layout size: ${fileSize}`);
          
          res.writeHead(200, {
              'Content-Length': fileSize,
              'Content-Type': contentType,
              'Accept-Ranges': 'bytes'
          });

          const megaStream = file.download({});
          megaStream.on('error', (err) => console.error("❌ Mega download stream error:", err));
          megaStream.pipe(res);
      }
    } catch (error: any) {
      console.error('💥 Backend Stream Crash Error:', error);
      res.status(500).send(`Streaming handshake failed: ${error.message}`);
    }
  });

  // Ping keep-awake route
  app.get('/api/ping', (req, res) => {
    res.status(200).send('Server is active');
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
