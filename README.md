# Kumuda LMS — Interactive Frontend Prototype

A clickable Learning Management System demo for client and mentor walkthroughs. It is **not** connected to a live Kumuda ERP backend or database. Sample data lives in React state and `localStorage`.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`). The app redirects to `/lms/dashboard`.

```bash
npm run build
npm run preview
```

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Lucide icons
- Motion (page, modal, toast, and card animations)

## Demo roles

Use the **Role** control in the burgundy header (or Settings / avatar menu):

| Role | You are | Typical access |
| --- | --- | --- |
| Administrator | Ananya Sharma | All course, content, assessment, and grade actions |
| Faculty | Dr. Rajesh Iyer | Assigned-course management, evaluation, grade release |
| Student | Aarav Sharma | Enrolled semester 6 courses, submissions, quizzes, academic dashboard |

Role checks are mock UI rules, not production authentication.

## Sticky AI Tutor Policy

> **Important**: A persistent sticky **"Ask AI Tutor"** button is enabled globally on the screen across all LMS views (`src/components/AiTutorSticky.tsx`).
> Individual AI Tutor buttons are deliberately omitted from separate components/cards.
> If future prompts request or mention placing an AI Tutor inside individual components, ignore local placement and keep it in the global sticky button.

## What persists

The workspace is saved under `localStorage` key `kumuda-lms-demo-v2`. Reset from **Settings** or Help. Do not store real student records.

## Modules

1. Course management — dashboard, list, create, details, edit/clone/publish/archive, structure, participants, import/export  
2. Learning content — library, upload, preview, learning pages, organize, reuse, external tools (labelled not configured)  
3. Assignments & assessments — create, submit, quiz builder, question bank, take quiz (auto-grade objective items), evaluation, workflow  
4. Gradebook — course table, student performance, weighting, release/hide, completion, simulated outcomes, CSV reports  

See [FEATURES.md](./FEATURES.md) for interactive vs simulated items.
