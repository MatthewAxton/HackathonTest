# Deployment

## Build

```bash
# Type check first
npx tsc --noEmit

# Production build
npm run build
```

Output goes to `dist/`. The build produces a static SPA — HTML, JS, CSS, and WASM files.

---

## Requirements

- **HTTPS required** — `getUserMedia` (camera/mic) only works on HTTPS or `localhost`
- **No backend needed** — the app is 100% client-side
- **No environment variables** — no API keys or secrets
- **WASM files** — MediaPipe loads `.wasm` and `.task` model files from CDN at runtime

---

## Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or deploy to production
vercel --prod
```

Vercel auto-detects Vite projects. No config file needed.

**SPA fallback:** Vercel handles SPA routing automatically. If you need to configure it manually, create `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

## Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
netlify deploy --prod --dir=dist
```

Create `public/_redirects` for SPA routing:
```
/*    /index.html   200
```

---

## Deploy to GitHub Pages

1. Install the plugin:
   ```bash
   npm i -D vite-plugin-gh-pages
   ```

2. Set base path in `vite.config.ts`:
   ```ts
   export default defineConfig({
     base: '/your-repo-name/',
     plugins: [react(), tailwindcss()],
   })
   ```

3. Build and deploy:
   ```bash
   npm run build
   npx gh-pages -d dist
   ```

**Note:** GitHub Pages uses HTTP for custom domains by default. You must enable HTTPS in repo settings for camera/mic to work.

---

## Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm i -g firebase-tools

# Initialize (select Hosting, set public dir to "dist", configure as SPA)
firebase init

# Build and deploy
npm run build
firebase deploy
```

---

## Deploy via Docker

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

`nginx.conf` for SPA routing:
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
docker build -t speechmax .
docker run -p 8080:80 speechmax
```

---

## Post-Deploy Checklist

- [ ] Site loads on HTTPS
- [ ] Camera permission prompt appears
- [ ] Microphone permission prompt appears
- [ ] MediaPipe models load (check DevTools Network tab for `.task` files)
- [ ] Speech recognition works (or falls back to simulation)
- [ ] Radar scan completes and shows results
- [ ] Game screens load and track metrics
- [ ] localStorage persistence works across page refreshes
- [ ] No console errors in production

---

## Performance Notes

| Asset | Approx Size | Loaded |
|-------|-------------|--------|
| App JS bundle | ~200-300 KB (gzipped) | On page load |
| MediaPipe WASM | ~5 MB | On first camera use (from CDN) |
| Face model | ~2 MB | On scan start (from CDN) |
| Pose model | ~3 MB | On scan start (from CDN) |

First scan has a ~3-5 second model download. Subsequent scans use the browser cache.

**Optimization tips:**
- Enable gzip/brotli compression on your hosting provider
- Set long cache headers for static assets
- Consider pre-loading MediaPipe models on the homepage for faster scan start
