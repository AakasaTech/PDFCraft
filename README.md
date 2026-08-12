# PDF Merge

A small suite of PDF tools — merge and organize today, more on the way — that run entirely in
your browser.

## Overview

**Merge PDF** (`/`)
- Upload two or more PDF files via drag-and-drop or a file picker
- Reorder files with an accessible, keyboard-friendly drag list
- Preview each PDF before merging
- Merge in the exact selected order, preserving page size, orientation, and content
- Download the merged PDF with a custom filename

**Organize PDF** (`/organize`)
- Upload one PDF; each page renders as a thumbnail (via `pdfjs-dist`)
- Drag pages to reorder, rotate individual pages, delete pages
- Save produces a new PDF with those changes applied
- Duplicating a page is supported at the library level (`buildOrganizedPdf`), not yet exposed in
  the UI

Both tools share the same client-side-only architecture — no document storage, no database, no
cloud upload — and the underlying upload/validation/result-panel infrastructure is shared so
future tools (Split, Convert, Compress — see [Roadmap](#roadmap)) plug into the same pattern.

## Architecture

```text
Browser
   ↓
User selects PDF(s)
   ↓
JavaScript reads ArrayBuffers (File API)
   ↓
pdf-lib transforms the document(s)   (+ pdfjs-dist renders page thumbnails, Organize only)
   ↓
Output PDF Blob
   ↓
Browser download (object URL)
```

There is no backend file-processing API. The Next.js server only serves the static/SSR shell of
the application; all PDF manipulation happens in the client using `pdf-lib`. `pdfjs-dist` is used
read-only, purely to rasterize page thumbnails for the Organize tool's page grid — it never
touches the output file.

## Technology Stack

- [Next.js 15+](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [pdf-lib](https://pdf-lib.js.org/) for client-side PDF manipulation (merge, reorder, rotate, delete pages)
- [pdfjs-dist](https://mozilla.github.io/pdf.js/) for rendering page thumbnails (Organize)
- [react-dropzone](https://react-dropzone.js.org/) for drag-and-drop uploads
- [dnd-kit](https://dndkit.com/) for sortable drag-and-drop reordering (file list and page grid)
- [next-themes](https://github.com/pacocoursey/next-themes) for light/dark mode
- [Vitest](https://vitest.dev/) for unit tests

## Project Structure

```text
src/
├── app/
│   ├── page.tsx                 # Merge tool ("/")
│   ├── organize/
│   │   ├── page.tsx             # Organize tool ("/organize")
│   │   └── layout.tsx           # Route-level metadata (page.tsx is a client component)
│   ├── layout.tsx               # Root layout, theming, metadata
│   ├── privacy/ terms/ about/   # Placeholder footer pages
│   └── globals.css
│
├── components/
│   ├── pdf-uploader.tsx         # Drag-and-drop upload area (single- or multi-file)
│   ├── add-more-pdfs-button.tsx
│   ├── pdf-file-list.tsx / pdf-file-card.tsx     # Merge: dnd-kit sortable file list
│   ├── pdf-page-grid.tsx / pdf-page-thumbnail.tsx # Organize: dnd-kit sortable page grid
│   ├── pdf-summary.tsx          # Files / pages / size summary
│   ├── pdf-preview.tsx          # In-browser PDF preview dialog
│   ├── pdf-action-button.tsx    # Shared primary-CTA (icon + busy state) — Merge/Organize/...
│   ├── pdf-result-panel.tsx     # Shared success panel — Merge/Organize/...
│   ├── merge-button.tsx / merge-result.tsx        # Thin Merge-specific wrappers around the above
│   ├── site-header.tsx / site-footer.tsx          # Header's "PDF Tools" dropdown links tools together
│   ├── theme-toggle.tsx / theme-provider.tsx
│   └── ui/                      # shadcn/ui primitives
│
├── lib/
│   ├── pdf/
│   │   ├── merge-pdfs.ts        # Merge logic
│   │   ├── organize-pdf.ts      # Reorder/rotate/delete/duplicate logic
│   │   ├── render-page.ts       # pdfjs-dist page-to-thumbnail rendering
│   │   ├── pdf-metadata.ts      # Page count / load validation
│   │   └── validation.ts        # File type & size validation
│   ├── file-utils.ts            # Formatting, filename sanitization
│   └── constants.ts             # Configurable limits & site metadata
│
├── hooks/
│   ├── use-pdf-file-queue.ts    # Shared multi-file upload queue (Merge; future: Convert images→PDF)
│   ├── use-single-pdf-file.ts   # Shared single-file upload slot (Organize; future: Split, Compress)
│   ├── use-pdf-merger.ts        # Merge tool state, wraps use-pdf-file-queue
│   └── use-organize-pdf.ts      # Organize tool state, wraps use-single-pdf-file + render-page
│
└── types/
    └── pdf.ts                   # PdfFileItem, PdfBuildResult (shared), OrganizePageItem
```

## Installation

```bash
npm install
```

`npm install` runs a `postinstall` step (`scripts/copy-pdf-worker.mjs`) that copies the
`pdfjs-dist` worker script into `public/pdf.worker.min.mjs`. This keeps the worker version in
lockstep with the installed `pdfjs-dist` package — a mismatch throws `API version does not match
Worker version` at runtime. The copied file is gitignored and regenerated on every install; the
`Dockerfile` runs the same script explicitly in its build stage (see the Docker section below).

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

Unit tests cover the PDF merge/validation/metadata utilities (ordering, mixed page sizes,
duplicates, corrupted files, invalid types) using Vitest.

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

## Build

```bash
npm run build
npm run start
```

`next.config.ts` sets `output: "standalone"` so the production build can run without the full
`node_modules` tree (used by the Docker image below).

## Docker

Build and run the production image standalone:

```bash
docker build --build-arg NEXT_PUBLIC_APP_URL=https://pdfcraft.aakasa.dev -t pdfcraft .
docker run -p 3004:3004 pdfcraft
```

The `Dockerfile` uses a multi-stage build (`deps` → `builder` → `runner`), runs as a non-root
user, and serves the app under PM2 in cluster mode (`ecosystem.config.js`, 2 instances) for
crash recovery and better throughput under load. No filesystem or database dependency is
required — the app is stateless. The container listens on **port 3004** (chosen to avoid
colliding with the other Aakasa Digital apps — see below).

The `deps` stage runs `npm ci --ignore-scripts` (it only produces `node_modules` for the next
stage — running the pdfjs-worker postinstall there would be wasted work, since `builder`'s
`COPY . .` pulls `public/` fresh from the build context and would discard it anyway). The
`builder` stage runs `scripts/copy-pdf-worker.mjs` explicitly instead, after `COPY . .`.

## Deployment

The app is a standard Next.js application with no server-side file storage, so it deploys
cleanly to:

- **Vercel** — connect the repo, no extra configuration required
- **Cloudflare Pages** — use the Next.js on Cloudflare adapter
- **AWS Amplify** — use the built-in Next.js SSR support
- **Docker** — any container host, using the provided `Dockerfile`

### Aakasa Digital platform (docker-compose)

In production this app is deployed as the `pdfcraft` service in
`../AakasaDigital/docker-compose.yml`, alongside `aakasa-digital` (3001), `billcraft` (3000),
`supportcraft` (3002), and `taskcraft` (3003). It is assigned **port 3004** internally and is
reachable only through the shared nginx reverse proxy at `https://pdfcraft.aakasa.dev` — it is
not published directly to the host, matching how the other sibling apps are deployed.

```bash
cd ../AakasaDigital
docker compose build pdfcraft
docker compose up -d pdfcraft
```

## Privacy Model

- PDF files are read directly from the browser's File API (`ArrayBuffer`)
- Merging is performed by `pdf-lib` entirely in-memory in the browser
- No PDF content, filename, or metadata is sent to a server or third-party analytics service
- Generated object URLs are revoked (`URL.revokeObjectURL`) when files are removed, replaced,
  or the session is reset, to release memory promptly

## File Size Configuration

Limits are centralized in [`src/lib/constants.ts`](src/lib/constants.ts):

```ts
export const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // per file
export const MAX_COMBINED_SIZE_BYTES = 500 * 1024 * 1024; // combined
```

Adjust these values to change upload limits application-wide.

## Roadmap

The "PDF Tools" header menu lists four tools; Merge and Organize are live, the rest are planned
in this order:

1. **Organize PDF** ✅ — reorder, rotate, delete pages
2. **Split PDF** — split by page ranges or extract selected pages; reuses Organize's page grid,
   adds a zip-download step for multiple output files
3. **Convert PDF** — Images → PDF (reuses Merge's file-list UI) and PDF → Images (reuses
   Organize's thumbnail renderer + Split's zip download)
4. **Compress PDF** — a "basic" pass (object-stream optimization, metadata stripping) first;
   true image recompression needs a WASM library evaluation and is a separate spike

Watermark, page numbers, password-protect/unlock, and sign are not yet on the menu — the current
plan folds watermark/page-numbers into Organize, and treats protect/unlock/sign as a later 5th
menu entry, since they need materially different UI (password prompts, signature capture).
