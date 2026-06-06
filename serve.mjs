import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".mjs":  "application/javascript; charset=utf-8",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".png":  "image/png",
  ".mp4":  "video/mp4",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".woff2": "font/woff2",
};

http.createServer((req, res) => {
  let urlPath = req.url.split("?")[0];
  if (urlPath === "/" || urlPath === "") urlPath = "/index.html";

  const filePath = path.join(__dirname, urlPath);

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404);
      res.end("Not found: " + urlPath);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";
    const size = stat.size;

    const range = req.headers.range;
    if (range && ext === ".mp4") {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
      const chunkSize = end - start + 1;
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": contentType,
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Length": size,
        "Cache-Control": (ext === ".jpg" || ext === ".jpeg") ? "public, max-age=86400" : "no-cache",
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
}).listen(PORT, () => {
  console.log(`🍌 Serving at http://localhost:${PORT}`);
});
