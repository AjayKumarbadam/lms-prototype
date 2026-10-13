# Feature checklist — interactive vs simulated

This prototype is a frontend demonstration. Anything marked **interactive** updates shared mock state in the browser. Anything marked **simulated** is labelled in the UI and does not call a real engine, ERP, or file store.

## Interactive

- Sidebar, breadcrumbs, search, notifications, help, profile, role switcher
- Routing to all listed `/lms/...` screens, including deep links and refresh of in-memory/`localStorage` state
- 404 for unknown routes
- Course create/edit/clone/publish/archive with confirmation dialogs
- Course structure add/reorder/delete
- Participant add/remove and role filters
- Course CSV export from current state
- Content filters, upload metadata, publish/unpublish, page editor, reorder, reuse copy
- Assignment create with date validation
- Student draft/submit (local only)
- Faculty evaluate, save marks into gradebook, return for resubmission
- Question bank create, quiz builder, take quiz, auto-grade MCQ / multi / T-F / numerical
- Grade weights (must total 100%), mark edits, release/hide grades (students see released only)
- Report CSV downloads generated from frontend state
- Toast notifications, modals, tabs, empty states

## Simulated / labelled as demo

- No backend, database, or Kumuda ERP API
- File “uploads” are not stored on a server; binaries are not retained
- Import CSV reports a mock parse result
- SCORM runtime and LTI tools: **not configured**
- Peer assessment and advanced grading: prototype labels
- Learning outcome / competency attainment engine: sample table only
- PDF/Office previews: placeholder text unless sample `previewText` exists
- YouTube embed uses a sample URL for video type
- Activity completion percentages on the completion page are illustrative
- Authentication and authorization are demonstration switches only
