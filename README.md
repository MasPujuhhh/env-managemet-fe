# WG Vault Frontend

Vue 3/Vite frontend for the Env Management API. It includes login, dashboard statistics, repository CRUD, encrypted-secret management, API-key generation/revocation, responsive layouts, reusable UI primitives, and normalized API errors.

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

Set `VITE_API_URL` to the backend `/api/v1` URL. Production output is generated with `npm run build` and served from `dist/`.

## Architecture

- `views/` orchestrate pages.
- `components/` contains generic UI and layout presentation.
- `services/api/` owns HTTP communication and `services/storage/` owns only the JWT token.
- `stores/` contains global auth state; repository and secret data stays page-local.
- `composables/` contains reusable toast and error behavior.
- `types/` contains API contracts matching `{ success, message, errors, metadata, data }`.

Raw secrets and generated API keys are never persisted in local/session storage or logged. API keys remain in component memory only while the reveal modal is open.
