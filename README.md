# PDF Merge

Merge PDF files quickly and securely — entirely in your browser.

PDF Merge lets you upload multiple PDF files, drag them into the order you want, and combine
them into a single downloadable PDF. All PDF processing happens client-side; your documents are
never uploaded to a server.

## Overview

- Upload two or more PDF files via drag-and-drop or a file picker
- Reorder files with an accessible, keyboard-friendly drag list
- Preview each PDF before merging
- Merge in the exact selected order, preserving page size, orientation, and content
- Download the merged PDF with a custom filename
- Works fully offline once loaded — no document storage, no database, no cloud upload

## Architecture

```text
Browser
   ↓
User selects PDFs
   ↓
JavaScript reads ArrayBuffers (File API)
   ↓
pdf-lib combines documents
   ↓
Merged PDF Blob
   ↓
Browser download (object URL)
```

There is no backend file-processing API. The Next.js server only serves the static/SSR shell of
the application; all PDF manipulation happens in the client using `pdf-lib`.

## Technology Stack

- [Next.js 15+](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [pdf-lib](https://pdf-lib.js.org/) for client-side PDF merging
- [react-dropzone](https://react-dropzone.js.org/) for drag-and-drop uploads
- [dnd-kit](https://dndkit.com/) for sortable drag-and-drop reordering
- [next-themes](https://github.com/pacocoursey/next-themes) for light/dark mode
- [Vitest](https://vitest.dev/) for unit tests

## Project Structure

```text
src/
├── app/
│   ├── page.tsx            # Main merge workflow
│   ├── layout.tsx          # Root layout, theming, metadata
│   ├── privacy/ terms/ about/  # Placeholder footer pages
│   └── globals.css
│
├── components/
│   ├── pdf-uploader.tsx        # Initial drag-and-drop upload area
│   ├── add-more-pdfs-button.tsx
│   ├── pdf-file-list.tsx       # dnd-kit sortable list
│   ├── pdf-file-card.tsx       # Single file row
│   ├── pdf-summary.tsx         # Files / pages / size summary
│   ├── pdf-preview.tsx         # In-browser PDF preview dialog
│   ├── merge-button.tsx
│   ├── merge-result.tsx        # Success panel + download/start over
│   ├── site-header.tsx / site-footer.tsx
│   ├── theme-toggle.tsx / theme-provider.tsx
│   └── ui/                     # shadcn/ui primitives
│
├── lib/
│   ├── pdf/
│   │   ├── merge-pdfs.ts       # Core merge logic
│   │   ├── pdf-metadata.ts     # Page count / load validation
│   │   └── validation.ts       # File type & size validation
│   ├── file-utils.ts           # Formatting, filename sanitization
│   └── constants.ts            # Configurable limits & site metadata
│
├── hooks/
│   └── use-pdf-merger.ts       # Central state management for the workflow
│
└── types/
    └── pdf.ts
```

## Installation

```bash
npm install
```

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
