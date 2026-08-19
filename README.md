# PDFCraft

[![License: PolyForm Noncommercial 1.0.0](https://img.shields.io/badge/License-PolyForm%20Noncommercial%201.0.0-orange.svg)](LICENSE.md)

A small suite of PDF tools — merge, organize, split, convert, compress, and sign — that run
entirely in your browser. Part of the [Aakasa Digital](https://aakasa.dev) product family.

> **⚠️ Non-Commercial Only:** This repository is source-available for personal, educational, research, and evaluation purposes. **Commercial use requires a paid license.** See [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md) or contact [licenses@aakasa.dev](mailto:licenses@aakasa.dev) for details.

## Overview

**Landing page** (`/`)
- A tool hub: hero, privacy line, and a responsive icon grid linking to all six tools (2 columns
  on mobile, 3 on desktop). Server Component — no client JS beyond the shared header/theme.
- Generic 3-step "How it works" + a Privacy section, distinct from each tool's own page, which
  keeps its own tool-specific "How it works."

**Merge PDF** (`/merge`)
- Upload two or more PDF files via drag-and-drop or a file picker
- Reorder files with an accessible, keyboard-friendly drag list
- Preview each PDF before merging
- Merge in the exact selected order, preserving page size, orientation, and content
- Download the merged PDF with a custom filename

**Organize PDF** (`/organize`)
- Upload one PDF; each page renders as a thumbnail (via `pdfjs-dist`)
- Drag pages to reorder, rotate individual pages, delete pages
- Optional diagonal watermark text and/or "Page X of Y" page numbers, stamped onto every page
  (`stamp-pdf.ts`) as part of the same save
- Save produces a new PDF with those changes applied
- Duplicating a page is supported at the library level (`buildOrganizedPdf`), not yet exposed in
  the UI

**Split PDF** (`/split`)
- **Select Pages** mode: check individual page thumbnails, extract them into one new PDF
- **Page Ranges** mode: enter ranges like `1-3, 4-6, 8` — each range becomes its own PDF; a
  single range downloads as a plain PDF, multiple ranges download as a zip (`fflate`)
- A "split every page into its own PDF" shortcut fills in one range per page

**Convert PDF** (`/convert`)
- **Images to PDF**: upload JPG/PNG images, reorder them, combine into one PDF — each page sized
  to its image's own aspect ratio (96 DPI assumption, see `images-to-pdf.ts`)
- **PDF to Images**: pick pages (all selected by default) and a format (PNG or JPEG); one page
  downloads directly, several are zipped

**Compress PDF** (`/compress`)
- Lossless optimization only: strips document metadata (title, author, subject, keywords,
  producer, creator) and re-serializes with compressed cross-reference object streams
  (`useObjectStreams: true`)
- Shows an honest before → after size comparison; already-optimized PDFs correctly show
  "no significant size reduction" rather than a misleading 0%
- `pdf-lib` has no API for recompressing embedded images or fonts, so this is not a substitute
  for a "real" image-recompression tool — see [Roadmap](#roadmap) for what that would take

**Sign PDF** (`/sign`)
- Draw a signature (canvas, mouse/touch) or type your name in a signature-style font
- Navigate pages, click the page preview to place the signature, drag the size slider to resize
- A visual stamp only — not a cryptographic digital signature (see [Roadmap](#roadmap))

All six tools share the same client-side-only architecture — no document storage, no database,
no cloud upload — and the underlying upload/validation/result-panel infrastructure is shared
across all of them.

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
read-only, purely to rasterize pages to thumbnails (Organize, Split, Convert's PDF→Images) — it
never touches the output file.

## Technology Stack

- [Next.js 15+](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [pdf-lib](https://pdf-lib.js.org/) for client-side PDF manipulation (merge, reorder, rotate, delete, split, embed images, compress, sign)
- [pdfjs-dist](https://mozilla.github.io/pdf.js/) for rendering page thumbnails and full-resolution page images (Organize, Split, Convert)
- [fflate](https://github.com/101arrowz/fflate) for client-side zip creation (Split and Convert's multi-file downloads)
- [react-dropzone](https://react-dropzone.js.org/) for drag-and-drop uploads
- [dnd-kit](https://dndkit.com/) for sortable drag-and-drop reordering (file lists, page grids)
- [next-themes](https://github.com/pacocoursey/next-themes) for light/dark mode
- [Vitest](https://vitest.dev/) for unit tests
- [Inter](https://fonts.google.com/specimen/Inter) (via `next/font/google`) — the typeface shared
  across the Aakasa Digital product family (aakasa.dev, BillCraft, TaskCraft, SupportCraft)

## Branding

PDFCraft's color tokens (`src/app/globals.css`) reuse the parent Aakasa Digital brand exactly —
Primary Blue `#1D8CFF` and Midnight Navy `#0F172A` / Deep Navy `#0A1C50` for dark mode — rather
than inventing a new accent hue the way sibling products (TaskCraft, SupportCraft) each do. The
footer credits "Built by Aakasa Digital" linking to [aakasa.dev](https://aakasa.dev), matching
the attribution pattern used across the other Craft apps.

## Project Structure

```text
src/
├── app/
│   ├── page.tsx                 # Landing page ("/") — tool hub, Server Component
│   ├── merge/
│   │   ├── page.tsx             # Merge tool ("/merge")
│   │   └── layout.tsx           # Route-level metadata (page.tsx is a client component)
│   ├── organize/
│   │   ├── page.tsx             # Organize tool ("/organize")
│   │   └── layout.tsx           # Route-level metadata (page.tsx is a client component)
│   ├── split/
│   │   ├── page.tsx             # Split tool ("/split")
│   │   └── layout.tsx           # Route-level metadata
│   ├── convert/
│   │   ├── page.tsx             # Convert tool ("/convert") — Images↔PDF, direction toggle
│   │   └── layout.tsx           # Route-level metadata
│   ├── compress/
│   │   ├── page.tsx             # Compress tool ("/compress")
│   │   └── layout.tsx           # Route-level metadata
│   ├── sign/
│   │   ├── page.tsx             # Sign tool ("/sign")
│   │   └── layout.tsx           # Route-level metadata
│   ├── layout.tsx               # Root layout, theming, metadata
│   ├── privacy/ terms/ about/   # Placeholder footer pages
│   └── globals.css
│
├── components/
│   ├── pdf-uploader.tsx         # Drag-and-drop upload area (single/multi-file, PDF or image accept)
│   ├── add-more-pdfs-button.tsx
│   ├── pdf-file-list.tsx / pdf-file-card.tsx              # Merge: dnd-kit sortable PDF file list
│   ├── image-file-list.tsx / image-file-card.tsx           # Convert: dnd-kit sortable image list
│   ├── pdf-page-grid.tsx / pdf-page-thumbnail.tsx           # Organize: dnd-kit sortable page grid
│   ├── pdf-page-select-grid.tsx / pdf-page-select-thumbnail.tsx  # Split, Convert: checkbox page grid
│   ├── signature-pad.tsx        # Sign: draw/type signature capture (canvas)
│   ├── signature-placement-preview.tsx  # Sign: click-to-place page preview + overlay
│   ├── pdf-summary.tsx          # Files / pages / size summary
│   ├── pdf-preview.tsx          # In-browser PDF preview dialog
│   ├── pdf-action-button.tsx    # Shared primary-CTA (icon + busy state) — every tool
│   ├── pdf-result-panel.tsx     # Shared success panel — every tool
│   ├── merge-button.tsx / merge-result.tsx        # Thin Merge-specific wrappers around the above
│   ├── site-header.tsx / site-footer.tsx          # Header's "PDF Tools" dropdown links tools together
│   ├── theme-toggle.tsx / theme-provider.tsx
│   └── ui/                      # shadcn/ui primitives
│
├── lib/
│   ├── pdf/
│   │   ├── merge-pdfs.ts        # Merge logic
│   │   ├── organize-pdf.ts      # Reorder/rotate/delete/duplicate logic (also powers Split's "Select Pages" mode)
│   │   ├── stamp-pdf.ts         # Diagonal watermark + "Page X of Y" numbering, drawn onto existing pages
│   │   ├── split-pdf.ts         # Page-range parsing + splitting into multiple PDFs
│   │   ├── images-to-pdf.ts     # Embeds JPG/PNG images as PDF pages (Convert)
│   │   ├── pdf-to-images.ts     # Renders selected PDF pages to image files (Convert)
│   │   ├── compress-pdf.ts      # Metadata stripping + object-stream re-save (Compress)
│   │   ├── sign-pdf.ts          # Embeds a signature image at a computed placement (Sign)
│   │   ├── render-page.ts       # pdfjs-dist page-to-thumbnail / page-to-image rendering
│   │   ├── pdf-metadata.ts      # Page count / load validation
│   │   └── validation.ts        # File type & size validation (PDF and image)
│   ├── zip-utils.ts             # fflate wrapper for zipping multiple outputs
│   ├── file-utils.ts            # Formatting, filename sanitization
│   └── constants.ts             # Configurable limits & site metadata
│
├── hooks/
│   ├── use-pdf-file-queue.ts    # Shared multi-file PDF upload queue (Merge)
│   ├── use-image-file-queue.ts  # Shared multi-file image upload queue (Convert's Images→PDF)
│   ├── use-single-pdf-file.ts   # Shared single-file upload slot (Organize, Split, Convert's PDF→Images, Compress)
│   ├── use-pdf-merger.ts        # Merge tool state, wraps use-pdf-file-queue
│   ├── use-organize-pdf.ts      # Organize tool state, wraps use-single-pdf-file + render-page
│   ├── use-split-pdf.ts         # Split tool state, wraps use-single-pdf-file + render-page + zip-utils
│   ├── use-images-to-pdf.ts     # Convert (Images→PDF) state, wraps use-image-file-queue
│   ├── use-pdf-to-images.ts     # Convert (PDF→Images) state, wraps use-single-pdf-file + render-page + zip-utils
│   ├── use-compress-pdf.ts      # Compress tool state, wraps use-single-pdf-file
│   └── use-sign-pdf.ts          # Sign tool state, wraps use-single-pdf-file + render-page
│
└── types/
    └── pdf.ts                   # PdfFileItem, ImageFileItem, PdfBuildResult, MultiFileResult, SelectablePageItem, OrganizePageItem
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

All five tools on the "PDF Tools" header menu are now live:

1. **Organize PDF** ✅ — reorder, rotate, delete pages; optional watermark and/or page numbers
2. **Split PDF** ✅ — extract selected pages, or split by page ranges (zipped when there's more
   than one output file)
3. **Convert PDF** ✅ — Images → PDF and PDF → Images, both directions in one tool with a
   direction toggle
4. **Compress PDF** ✅ — lossless-only "basic" pass (object-stream optimization, metadata
   stripping); real image recompression would need a WASM library (e.g. mupdf.wasm) and is a
   separate spike, not yet started
5. **Sign PDF** ✅ — draw or type a signature, click a page preview to place it, resize with a
   slider; a visual stamp, not a cryptographic digital signature (see below)

**Watermark PDF / Add page numbers** ✅ — folded into Organize rather than becoming a separate
tool: optional diagonal watermark text and/or "Page X of Y" numbering, applied as part of the
same save (`stamp-pdf.ts`).

### Not on the menu — blocked, not just unscheduled

- **Password protect / Unlock PDF** — `pdf-lib` (currently pinned at the latest available
  release, 1.17.1) has no encryption API at all — `PDFDocument.load`'s `ignoreEncryption` option
  only skips pdf-lib's own "this is encrypted" check on load, it does not decrypt content,
  confirmed by reading `EncryptedPDFError` in pdf-lib's source. Every tool's "could not be
  opened, may be corrupted or password protected" error on encrypted input is therefore correct,
  not a gap. Building this for real needs either a from-scratch implementation of the PDF
  standard security handler (RC4/MD5 — legacy-strength, not real confidentiality) or a WASM port
  of a library that supports it (qpdf, mupdf) — both are their own spikes, deliberately not
  started. Deferred by explicit decision rather than attempted.
- **True cryptographic PDF signing** (a `/Sig` dictionary backed by an X.509 certificate) is a
  different feature from the "Sign PDF" tool above, which is a visual stamp only. pdf-lib doesn't
  support real cryptographic signing either, and it's not what "Sign PDF" means on comparable
  consumer PDF tools — not pursued.
