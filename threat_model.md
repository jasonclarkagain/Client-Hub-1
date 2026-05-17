# Threat Model

## Project Overview

This repository is a pnpm monorepo for a design project portal. The production application consists of an Express 5 API server in `artifacts/api-server`, a React client portal in `artifacts/client-portal`, shared OpenAPI/Zod client libraries in `lib/api-spec`, `lib/api-zod`, and `lib/api-client-react`, and a PostgreSQL database accessed through Drizzle ORM in `lib/db`.

The portal stores project requests, client contact details, project status, file metadata, and project messages. Per the deployment assumptions for this scan, only production-reachable code is in scope. `artifacts/mockup-sandbox` is treated as dev-only unless future evidence shows it is deployed.

## Assets

- **Project records** — titles, descriptions, budgets, deadlines, and workflow status. Unauthorized access or modification would expose business-sensitive project information and allow sabotage.
- **Client contact data** — client names and email addresses stored in `projects`. This is personal data and can be used for phishing, spam, or data harvesting.
- **Project collaboration data** — message history, author labels, and file metadata/URLs tied to projects. Integrity matters because users may rely on these records for design decisions and communication.
- **Application secrets and infrastructure access** — `DATABASE_URL` and any future bearer tokens or session credentials. Compromise would expose the full dataset.

## Trust Boundaries

- **Browser to API boundary** — all client input reaches the API over `/api/*`. The browser is untrusted, so the server must enforce authentication, authorization, and input validation.
- **API to database boundary** — the API server has direct read/write access to PostgreSQL through Drizzle. Unsafe query construction or missing authorization at the API layer would expose or corrupt all stored records.
- **Public to authenticated/admin boundary** — project submission may be public, but viewing, editing, deleting, dashboard access, file management, and message posting involve sensitive project data and must not rely on the client for enforcement.
- **Production to dev-only boundary** — `artifacts/mockup-sandbox` is a development surface and should usually be ignored for production scans unless routing/build configuration proves it is deployed.

## Scan Anchors

- **Production entry points:** `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/client-portal/src/main.tsx`, `artifacts/client-portal/src/App.tsx`
- **Highest-risk code areas:** `artifacts/api-server/src/routes/*.ts`, `lib/db/src/schema/*.ts`, `lib/api-client-react/src/generated/api.ts`, `artifacts/client-portal/src/pages/*.tsx`
- **Public vs authenticated vs admin surfaces:** no authentication or role boundary is currently implemented in the API; all `/api/*` routes behave as public surfaces today
- **Dev-only areas:** `artifacts/mockup-sandbox/**`, local scripts under `scripts/**` unless production reachability is demonstrated

## Threat Categories

### Spoofing

The application currently models collaboration roles such as `client` and `designer`, and the shared API client supports bearer tokens, so the system is clearly intended to distinguish actors. The API must require a valid server-verified identity before allowing access to project data or accepting actions attributed to a user. Identity fields such as message author names and roles must be derived from authenticated context, not trusted from request bodies.

### Tampering

Project records, file metadata, and messages are writable through the API. The server must ensure that only authorized users can create, update, or delete resources for projects they are allowed to access. Client-supplied fields that imply identity or authority must not be accepted as authoritative business state.

### Information Disclosure

Project data includes client names, email addresses, budgets, deadlines, and message/file history. The system must prevent unauthenticated or cross-tenant access to these records, and dashboard endpoints must not expose aggregate or recent-activity data to the public internet. Error responses and logs must avoid leaking secrets, though the current logger does redact cookies and authorization headers.

### Denial of Service

Public write endpoints can be abused for spam or storage/database churn if left unauthenticated or unrestricted. Production endpoints that create projects, files, or messages must have appropriate abuse controls such as authentication and rate limits sized to the product’s usage model.

### Elevation of Privilege

Because project IDs and file IDs are simple numeric identifiers, authorization must be enforced server-side on every read and write. The API must not allow a user to enumerate, read, modify, or delete arbitrary projects, files, or messages by changing route parameters, and it must not allow an unauthenticated caller to perform designer-only actions.
