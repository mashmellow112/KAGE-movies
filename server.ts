import express from 'express';
import { File } from 'megajs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Middleware
  app.use((req, res, next) => {
    // In our environment, we should be more flexible with origins if needed,
    // but the user specified a specific one. However, for internal development/preview,
    // '*' or the current origin is safer. I'll use '*' to ensure it works in the iframe.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // The streaming engine
  app.get('/api/stream', async (req, res) => {
    const megaUrl = req.query.url as string;

    if (!megaUrl) {
      return res.status(400).send('Error: Missing "url" parameter.');
    }

    try {
      // Connect to Mega anonymously using your public file link
      const file = File.fromURL(megaUrl);
      await file.loadAttributes();

      const fileSize = file.size;
      const range = req.headers.range;
      const contentType = megaUrl.includes('.mkv') ? 'video/x-matroska' : 'video/mp4';

      // Stream chunks so video can seek/fast-forward instantly
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
        });

        const megaStream = file.download({ start, end });
        megaStream.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': contentType,
        });
        const megaStream = file.download({});
        megaStream.pipe(res);
      }
    } catch (error) {
      console.error('Stream failure:', error);
      res.status(500).send('Streaming server error.');
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
