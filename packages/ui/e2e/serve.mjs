// Minimal static server for the built Storybook (used by the screenshot tests).
import { createReadStream, existsSync, statSync } from "node:fs"
import { createServer } from "node:http"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../storybook-static")
const port = Number(process.env.PORT ?? 6008)
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
}

createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? "/").split("?")[0])
  let file = path.join(root, url)
  if (!file.startsWith(root)) return res.writeHead(403).end()
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, "index.html")
  if (!existsSync(file)) return res.writeHead(404).end("not found")
  res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" })
  createReadStream(file).pipe(res)
}).listen(port, () => console.log(`storybook-static on http://localhost:${port}`))
