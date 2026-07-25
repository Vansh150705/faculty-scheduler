# Contributing

Thanks for your interest in improving Faculty Scheduler! This is a small project,
but a little structure keeps it healthy.

## Getting set up

See the [README](README.md) for full setup. In short:

```bash
# backend
cd backend && npm install && cp .env.example .env && npm run dev

# frontend (in a second terminal)
cd frontend && npm install && cp .env.example .env && npm run dev
```

## Workflow

1. Create a branch off `main`: `git checkout -b feat/short-description`
2. Make focused commits with clear messages.
3. Before opening a PR, make sure things build and lint:
   ```bash
   cd frontend && npm run build && npm run lint
   ```
4. Open a pull request describing **what** changed and **why**.

## Conventions

- **Backend:** controllers stay thin and are wrapped in `asyncHandler`; throw
  `ApiError` for expected failures so the central handler formats them.
- **Frontend:** talk to the API through `src/api/client.js`; surface user-facing
  results with the toast system rather than `alert()`.
- Keep new code consistent with the surrounding style (2-space indent, no
  semicoloned surprises — match the file you're editing).

## Reporting bugs

Open an issue with steps to reproduce, what you expected, and what happened.
