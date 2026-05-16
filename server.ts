import express from 'express';
import { File } from 'megajs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import mime from 'mime-types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global error handler for the process to prevent crashes on stream breaks
  process.on('uncaughtException', (err) => {
    console.error('🔥 Uncaught Exception:', err);
  });

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

    console.log(`🎬 Request for Mega file: ${megaUrl}`);

    try {
      // 2. Initialize Mega File Handler
      const file = File.fromURL(megaUrl);
      
      // Load attributes with a slightly longer timeout for reliability
      const loadPromise = file.loadAttributes();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Mega link handshake timed out')), 45000));
      
      await Promise.race([loadPromise, timeoutPromise]);

      const fileSize = file.size;
      const fileName = file.name || 'video.mp4';
      const range = req.headers.range;
      
      // Dynamic Mime Type detection based on file extension
      const contentType = mime.lookup(fileName) || 'video/mp4'; 

      console.log(`🎥 File: ${fileName}, Size: ${fileSize}, Mime: ${contentType}`);

      // Handle connection close to destroy the stream
      let megaStream: any = null;
      res.on('close', () => {
        if (megaStream && megaStream.destroy) {
          console.log(`🔌 Connection closed, destroying stream for ${fileName}`);
          megaStream.destroy();
        }
      });

      // 3. Handle Media Range Bytes (For Instant Loading and Seeking)
      if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          
          if (start >= fileSize) {
            return res.status(416).send('Requested range not satisfiable');
          }

          const chunksize = (end - start) + 1;
          console.log(`📦 Range: ${start}-${end}/${fileSize} (${chunksize} bytes)`);

          res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': contentType,
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive'
          });

          megaStream = file.download({ start, end });
          megaStream.on('error', (err: any) => {
            console.error("❌ Mega range stream error:", err);
            if (!res.headersSent) res.status(500).end();
          });
          megaStream.pipe(res);
      } else {
          console.log(`🚀 Full Stream Strategy: ${fileSize} bytes`);
          
          res.writeHead(200, {
              'Content-Length': fileSize,
              'Content-Type': contentType,
              'Accept-Ranges': 'bytes',
              'Connection': 'keep-alive',
              'Cache-Control': 'public, max-age=3600'
          });

          megaStream = file.download();
          megaStream.on('error', (err: any) => {
            console.error("❌ Mega full stream error:", err);
            if (!res.headersSent) res.status(500).end();
          });
          megaStream.pipe(res);
      }
    } catch (error: any) {
      console.error('💥 Backend Stream Crash:', error.message);
      if (!res.headersSent) {
        res.status(500).send(`Handshake failed: ${error.message}`);
      }
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
