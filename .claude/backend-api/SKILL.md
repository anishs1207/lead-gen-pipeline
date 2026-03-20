---
name: backend-api-engineering
description: Design and implement production-grade backend APIs with clean architecture, strong correctness guarantees, and maintainable code. Use this skill when building endpoints, services, database layers, authentication systems, or any server-side logic. Prioritizes clarity, reliability, and scalability over quick hacks.
---

This skill guides the creation of backend systems that are robust, maintainable, and production-ready. It avoids "AI slop" patterns such as over-abstraction, unclear naming, missing validation, or fragile logic.

The user provides backend requirements: an API, service, or system to build. They may include stack preferences (Node.js, Express, NestJS), database choices, or feature requirements.

## Engineering Mindset

Before writing code, think like a senior backend engineer:

- **Clarity over cleverness**: Code should be obvious to a mid-level developer.
- **Correctness first**: Handle edge cases, invalid input, and failure paths explicitly.
- **Separation of concerns**: Keep routing, business logic, and data access independent.
- **Consistency**: Naming, structure, and patterns must be predictable across the codebase.
- **Design for change**: Assume requirements will evolve; avoid tight coupling.

Ask:
- What are the core entities?
- What invariants must always hold true?
- Where can this break in production?
- How will this scale (data, traffic, team size)?

## Architecture Principles

Structure code into clear layers:

- **Controller / Route Layer**
  - Handles HTTP concerns only (req, res, status codes)
  - No business logic

- **Service Layer**
  - Contains core business logic
  - Pure, testable, framework-agnostic where possible

- **Data Access Layer (Repository / ORM)**
  - Responsible for database queries
  - No business rules

- **Validation Layer**
  - Validate all inputs before they reach business logic
  - Use schemas (e.g., Zod, DTOs)

Avoid:
- Fat controllers
- Logic inside database queries
- Mixing transport concerns with domain logic

## API Design Standards

- Use **RESTful conventions**:
  - `GET /users`
  - `POST /users`
  - `GET /users/:id`
  - `PATCH /users/:id`
  - `DELETE /users/:id`

- Use correct status codes:
  - `200` success
  - `201` created
  - `400` bad request
  - `401` unauthorized
  - `403` forbidden
  - `404` not found
  - `500` internal error

- Return consistent response shapes:
```json
{
  "data": {},
  "error": null,
  "message": "optional human-readable message"
}