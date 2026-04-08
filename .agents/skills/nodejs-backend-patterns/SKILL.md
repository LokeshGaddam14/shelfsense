---
name: nodejs-backend-patterns
description: Apply proven Node.js backend patterns for scalable, maintainable server-side code. Use when building APIs, services, middleware, database layers, or when the user asks about backend architecture, Express/Fastify patterns, error handling, authentication, or Node.js best practices.
metadata:
  version: "1.0.0"
---

# Node.js Backend Patterns Skill

Production-grade patterns for Node.js backend development.

## Project Structure

```
src/
├── controllers/     # Route handlers (thin layer, delegates to services)
├── services/        # Business logic
├── repositories/    # Data access layer
├── middleware/      # Express middleware (auth, validation, error handling)
├── routes/          # Route definitions
├── models/          # Data models / schemas
├── utils/           # Shared utilities
├── config/          # Configuration (env vars, constants)
└── types/           # TypeScript types/interfaces
```

## Core Patterns

### Repository Pattern
Separate data access from business logic. Services never query the DB directly.

```typescript
// repositories/user.repository.ts
export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return db.query('SELECT * FROM users WHERE id = $1', [id]);
  }
  async create(data: CreateUserDto): Promise<User> {
    return db.query('INSERT INTO users ...', [...]);
  }
}

// services/user.service.ts
export class UserService {
  constructor(private userRepo: UserRepository) {}
  
  async getUserById(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError(`User ${id} not found`);
    return user;
  }
}
```

### Controller Pattern (thin controllers)
```typescript
// controllers/user.controller.ts
export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({ data: user });
  } catch (error) {
    next(error); // delegate to error middleware
  }
};
```

### Centralized Error Handling
```typescript
// middleware/error.middleware.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }
  // Unexpected errors
  console.error('Unexpected error:', err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
};
```

### Input Validation (Zod)
```typescript
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8),
});

export const validateBody = (schema: z.ZodSchema) => 
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten() });
    }
    req.body = result.data;
    next();
  };
```

### Authentication Middleware (JWT)
```typescript
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw new AppError(401, 'Authentication required');
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = payload as JwtPayload;
    next();
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
};
```

### Async Handler Wrapper
```typescript
// Eliminate try/catch boilerplate in route handlers
export const asyncHandler = (fn: RequestHandler): RequestHandler =>
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
```

### Environment Configuration
```typescript
// config/env.ts - validate env vars at startup
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);
```

## API Response Standards

```typescript
// Consistent response format
const success = <T>(data: T, meta?: object) => ({ status: 'success', data, meta });
const error = (message: string, code?: string) => ({ status: 'error', message, code });

// Pagination
const paginated = <T>(items: T[], total: number, page: number, limit: number) => ({
  status: 'success',
  data: items,
  meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
});
```

## Security Checklist

- [ ] Helmet.js for HTTP headers
- [ ] CORS configured with allowed origins whitelist
- [ ] Rate limiting on auth endpoints (`express-rate-limit`)
- [ ] SQL queries parameterized (never string concatenation)
- [ ] Passwords hashed with bcrypt (cost factor 12+)
- [ ] JWT secrets are strong (32+ chars), stored in env vars
- [ ] Input sanitization before DB operations
- [ ] `.env` in `.gitignore`, never committed

## Performance Patterns

- Use connection pooling for databases
- Cache frequent reads (Redis or in-memory)
- Use `Promise.all()` for parallel async operations — never sequential when independent
- Stream large responses instead of buffering
- Compress responses with `compression` middleware
- Use `cluster` module or PM2 for multi-core utilization
