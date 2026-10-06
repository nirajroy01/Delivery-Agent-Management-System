## Why Next.js?

Next.js provides a production-friendly React framework with server-side rendering support, route-based structure, and a clean developer experience for dashboards and authenticated interfaces.

## Why Express.js?

Express is a lightweight and familiar backend framework for a REST API, keeping the service/controller architecture simple and easy to test.

## Why MongoDB?

MongoDB matches the assessment requirement and fits the agent records naturally as document-based data. It also supports indexes and flexible filtering for search and pagination.

## Why Mongoose?

Mongoose adds schema validation, model organization, and a reliable MongoDB object model with strong TypeScript support.

## Why Redis?

Redis provides fast read-through caching for list and detail endpoints and reduces repetitive database queries under load. It is used alongside MongoDB for read optimization.

## Why JWT?

JWT is a standard way to issue bearer tokens for authenticated API requests while keeping authentication stateless and easy to verify.

## Why bcrypt?

bcrypt is the standard password hashing approach for secure credential storage and keeps password hashes out of plain text in the database.

## Why Zod?

Zod gives a strong validation layer with clear schemas for request bodies and query parameters, preventing invalid data before it reaches business logic.

## Why cache-aside?

Cache-aside is simple and reliable: the app checks Redis first, falls back to MongoDB on a miss, and stores the result with a TTL for subsequent reads.

## Why Redis SCAN instead of KEYS?

Using SCAN avoids blocking Redis while enumerating keys, which is safer for production workloads than KEYS when the data set becomes large.

## Why pagination?

Pagination keeps list responses efficient and predictable for large datasets, especially when search and filtering are enabled.

## Why service/controller separation?

Keeping the service layer responsible for business logic and the controller layer focused on HTTP concerns makes the system easier to test, maintain, and evolve.
