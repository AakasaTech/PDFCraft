# Claude Code Prompt – PDF Merge Web Application

Build a production-ready web application called **PDF Merge** that allows users to upload multiple PDF files, rearrange their order, merge them into a single PDF, and download the merged document.

The application should be modern, fast, responsive, privacy-focused, and simple enough for non-technical users.

## 1. Technology Stack

Use the following stack:

* Next.js 15+ with App Router
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide Icons
* `pdf-lib` for PDF processing
* React Dropzone or equivalent for drag-and-drop uploads
* dnd-kit for drag-and-drop PDF reordering

Prefer client-side PDF processing whenever technically practical so uploaded documents do not need to leave the user's browser.

Avoid unnecessary backend infrastructure.

Do not use a database unless one becomes necessary for an optional future feature.

---

# 2. Core Workflow

The primary workflow should be:

1. User opens the application.
2. User uploads two or more PDF files.
3. Files appear in an ordered list.
4. User can drag and drop files to rearrange the merge order.
5. User can add more PDF files.
6. User can remove individual files.
7. User clicks **Merge PDFs**.
8. The PDFs are merged in the exact order shown.
9. A success state appears.
10. User can download the merged PDF.
11. User can click **Start Over** to clear the session.

The workflow should feel extremely simple and require as few clicks as possible.

---

# 3. Homepage Design

Create a polished SaaS-style interface.

## Header

Display:

**PDF Merge**

Tagline:

**Merge PDF files quickly and securely**

Add a small privacy-focused message such as:

**Your files are processed securely in your browser and are not permanently stored.**

If all PDF processing is client-side, change this to:

**Your files never leave your browser.**

---

# 4. Upload Area

Create a large drag-and-drop upload area.

Suggested design:

---

Drop PDF files here

or

[ Select PDF Files ]

Supports multiple PDF files

---

Requirements:

* Allow multiple PDFs to be uploaded at once.
* Accept `.pdf` files only.
* Clearly reject unsupported file types.
* Allow users to click the drop zone to browse files.
* Highlight the drop area when files are dragged over it.
* Show upload/file processing status when necessary.

---

# 5. Uploaded PDF List

After uploading files, display them as cards or rows.

Each file should show:

* PDF icon
* File name
* File size
* Number of pages
* Drag handle
* Remove button

Example:

☰ 📄 Invoice-January.pdf
12 pages
2.4 MB
🗑

☰ 📄 Invoice-February.pdf
8 pages
1.7 MB
🗑

Users must be able to drag files vertically to change their merge order.

Display a small instruction:

**Drag files to arrange the order in which they will appear in the merged PDF.**

---

# 6. Add More PDFs

After the first PDFs are uploaded, provide:

**+ Add More PDFs**

Clicking the button should open the file picker.

Files selected later should be appended to the existing list.

---

# 7. Merge Summary

Display useful information above the merge button.

Example:

Files: 4

Total pages: 27

Total size: 8.5 MB

---

# 8. Merge Button

Create a prominent primary CTA:

**Merge PDFs**

Disable the button when:

* fewer than two PDFs are selected
* PDFs are still being processed
* a merge operation is already running

While merging, display:

**Merging PDFs...**

with an animated progress/loading indicator.

---

# 9. PDF Merge Logic

Use `pdf-lib`.

For each uploaded PDF:

1. Load the PDF from the browser's File/ArrayBuffer.
2. Copy all pages from the source document.
3. Append those pages to the output PDF in the order selected by the user.
4. Save the final PDF.
5. Generate a Blob.
6. Create a browser-downloadable URL.

The final PDF must preserve:

* page dimensions
* page orientation
* page contents
* mixed page sizes

Do not rasterize pages.

Do not unnecessarily reduce PDF quality.

---

# 10. Download Experience

After successful merging, display a success panel.

Example:

✓ Your PDF is ready

24 pages merged successfully.

[ Download Merged PDF ]

[ Start Over ]

Default filename:

`merged-document.pdf`

Optionally allow the user to edit the filename before downloading.

Automatically append `.pdf` if it is missing.

---

# 11. PDF Filename Field

Before merging, optionally allow:

**Output filename**

Input:

`merged-document`

The application should generate:

`merged-document.pdf`

Sanitize invalid filename characters.

---

# 12. PDF Preview

Add an optional preview experience.

For each uploaded document, provide:

**Preview**

When clicked, show the PDF in a modal or drawer.

At minimum display:

* file name
* page count
* browser PDF preview where supported

Do not make preview functionality interfere with the primary merge workflow.

---

# 13. File Validation

Validate uploaded files.

Reject files that:

* are not PDFs
* cannot be parsed
* are corrupted
* are password protected and cannot be loaded

Show clear messages.

Examples:

**Only PDF files are supported.**

**This PDF could not be opened. It may be corrupted or password protected.**

Do not let one invalid file crash the application.

---

# 14. Duplicate Files

Allow duplicate PDFs because a user may intentionally want the same document included multiple times.

Do not automatically deduplicate files.

Each uploaded PDF should receive its own internal unique ID.

---

# 15. File Size Handling

Provide sensible browser protection.

For example:

Maximum individual file size:

200 MB

Maximum combined size:

500 MB

Make these limits configurable in a constants/config file rather than hard-coding them throughout the application.

If a file exceeds the configured limit, display a clear error message.

---

# 16. Privacy and Security

The application should prioritize document privacy.

Whenever possible:

* process PDFs locally in the browser
* do not upload PDFs to a server
* do not store PDFs
* do not log file contents
* do not transmit document names to analytics services

Add a small privacy note:

**Private by design — your documents are processed locally and are not uploaded to our servers.**

Only show this statement if the implementation is genuinely client-side.

---

# 17. Error Handling

Implement a reusable error notification/toast system.

Handle errors such as:

* invalid file
* corrupted PDF
* encrypted/password-protected PDF
* browser memory limitations
* merge failure
* download failure

Messages should be understandable to regular users.

Avoid exposing raw JavaScript stack traces.

---

# 18. Responsive Design

The application must work properly on:

* Desktop
* Laptop
* Tablet
* Mobile

On mobile:

* upload area should remain large and touch friendly
* file cards should stack appropriately
* drag handles should be easy to use
* buttons should have appropriate touch sizes

---

# 19. Accessibility

Implement:

* semantic HTML
* keyboard-accessible controls
* proper labels
* ARIA labels when necessary
* visible focus states
* sufficient color contrast

Do not rely exclusively on icons for destructive actions.

For example, give the delete icon:

`aria-label="Remove filename.pdf"`

---

# 20. UI Design Direction

Use a modern, minimal SaaS interface.

Visual direction:

* white/light neutral background
* centered application container
* subtle shadows
* soft rounded corners
* generous whitespace
* professional typography
* clean PDF/document icons
* restrained accent color

Avoid excessive gradients.

Avoid excessive animations.

The tool should feel trustworthy and professional.

---

# 21. Suggested Page Structure

Create:

```text
src/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── pdf-uploader.tsx
│   ├── pdf-file-list.tsx
│   ├── pdf-file-card.tsx
│   ├── pdf-summary.tsx
│   ├── pdf-preview.tsx
│   ├── merge-button.tsx
│   └── merge-result.tsx
│
├── lib/
│   ├── pdf/
│   │   ├── merge-pdfs.ts
│   │   ├── pdf-metadata.ts
│   │   └── validation.ts
│   │
│   ├── file-utils.ts
│   └── constants.ts
│
├── hooks/
│   └── use-pdf-merger.ts
│
└── types/
    └── pdf.ts
```

Adjust the structure when justified, but keep PDF manipulation logic separate from UI components.

---

# 22. PDF Object Model

Use a type similar to:

```typescript
interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  status: "processing" | "ready" | "error";
  error?: string;
}
```

Use the ID for sortable list behavior.

---

# 23. Drag-and-Drop Reordering

Use `dnd-kit`.

Requirements:

* vertical sortable list
* mouse support
* touch support
* keyboard accessibility
* smooth but minimal animation

The rendered list order must always represent the actual final PDF page order.

---

# 24. Browser Memory Management

PDFs may consume considerable memory.

Implement responsible cleanup.

When replacing or clearing the merged file:

```javascript
URL.revokeObjectURL(...)
```

Release unnecessary references when files are removed or the session is reset.

Avoid creating redundant copies of large ArrayBuffers.

---

# 25. Start Over

The **Start Over** button should:

* remove all selected PDFs
* release generated object URLs
* clear errors
* clear the merged PDF
* reset the output filename
* return the application to its initial upload state

Do not reload the entire browser page unless absolutely necessary.

---

# 26. SEO

Add appropriate metadata.

Title:

**Merge PDF Files Online | PDF Merge**

Description:

**Combine multiple PDF files into one document quickly and securely. Rearrange PDFs, merge them instantly, and download the combined PDF.**

Add Open Graph metadata.

Create a favicon.

---

# 27. Landing Page Content

Below the application interface add a small informational area.

## How it works

### 1. Upload PDFs

Select the PDF files you want to combine.

### 2. Arrange them

Drag your documents into the correct order.

### 3. Merge and download

Create one combined PDF and download it instantly.

---

## Privacy

Add:

**Your documents stay private. PDF processing happens directly inside your browser whenever possible, meaning your files are never uploaded or stored on our servers.**

---

# 28. Optional Footer

Create a simple footer such as:

**PDF Merge**

Merge PDF documents quickly, privately, and securely.

Links:

* Privacy
* Terms
* About

The pages can initially be simple placeholders if no company details are provided.

---

# 29. Dark Mode

Implement light and dark mode.

Default to the user's operating-system preference.

Provide a small theme switcher in the header.

Ensure the upload interface and PDF cards remain clear in both modes.

---

# 30. Testing

Add tests for the PDF merging utilities.

Test scenarios:

* merging two one-page PDFs
* merging documents with multiple pages
* correct document ordering
* mixed page dimensions
* duplicate PDFs
* corrupt PDF handling
* invalid file type
* clearing/resetting state

Use Vitest or an equivalent lightweight test framework.

---

# 31. Code Quality

Follow these requirements:

* TypeScript strict mode
* reusable components
* no unnecessary `any`
* no duplicated PDF processing logic
* clear function names
* proper async error handling
* loading and error states
* clean separation between presentation and business logic

Do not leave placeholder TODO comments for core functionality.

---

# 32. Performance

Optimize for large PDF files where possible.

Use asynchronous processing.

Avoid unnecessary component re-renders.

Do not convert PDF pages to images unless preview functionality explicitly requires it.

The primary merge operation must work entirely with PDF binary data.

---

# 33. Future Architecture

Structure the application so the following features can be added later without a major rewrite:

* Split PDF
* Compress PDF
* Rotate PDF
* Delete PDF pages
* Rearrange individual PDF pages
* Extract pages
* Images to PDF
* PDF to images
* Add page numbers
* Watermark PDF
* Password protect PDF
* Unlock PDF
* Sign PDF

Do not implement these features now.

---

# 34. Homepage Future Tool Navigation

Design the header so a future tools menu could contain:

```text
PDF Tools

Merge PDF
Split PDF
Compress PDF
Organize PDF
Convert PDF
```

For this phase, only **Merge PDF** should be functional.

---

# 35. Deployment

Ensure the project can be deployed easily to:

* Vercel
* Cloudflare Pages
* AWS Amplify
* Docker

If the application remains entirely client-side, ensure no server-side filesystem dependency exists.

Create a production-ready Dockerfile as well.

Use a multi-stage build where appropriate.

---

# 36. Documentation

Create a comprehensive `README.md` containing:

* application overview
* architecture
* technology stack
* installation instructions
* development commands
* build instructions
* Docker instructions
* deployment instructions
* privacy model
* file-size configuration
* project structure

---

# 37. Implementation Process

Implement the application in logical stages.

### Phase 1

Initialize Next.js, TypeScript, Tailwind and shadcn/ui.

### Phase 2

Create the overall design system and homepage.

### Phase 3

Implement PDF drag-and-drop upload.

### Phase 4

Read PDF metadata and page counts.

### Phase 5

Implement sortable PDF list.

### Phase 6

Implement client-side PDF merging with `pdf-lib`.

### Phase 7

Implement download and output filename functionality.

### Phase 8

Add validation and error handling.

### Phase 9

Add responsive design and accessibility.

### Phase 10

Add dark mode, SEO, tests and documentation.

### Phase 11

Run production build and resolve all TypeScript, linting and build errors.

---

# 38. Acceptance Criteria

The project is complete only when:

* multiple PDFs can be uploaded
* PDFs can be reordered
* PDFs can be removed
* additional PDFs can be added
* page counts are displayed
* total page count is displayed
* total file size is displayed
* PDFs merge in exactly the selected order
* merged PDF downloads successfully
* different PDF page dimensions are preserved
* duplicate PDFs work correctly
* corrupt files are handled gracefully
* the user can reset the tool
* processing remains private/client-side
* application works on desktop and mobile
* production build succeeds
* TypeScript reports no errors
* README documentation is complete

---

# Important Implementation Rule

Prioritize **client-side PDF processing**.

Do not build a server-side file-upload API unless a technical limitation makes it absolutely necessary.

The preferred architecture is:

```text
Browser
   ↓
User selects PDFs
   ↓
JavaScript reads ArrayBuffers
   ↓
pdf-lib combines documents
   ↓
Merged PDF Blob
   ↓
Browser download
```

No document storage.

No database.

No cloud upload.

This privacy-focused architecture should be treated as a core feature of the product.
