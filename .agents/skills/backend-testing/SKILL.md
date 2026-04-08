---
name: backend-testing
description: Write comprehensive backend tests for APIs, services, and database layers. Use when the user asks to write tests, add test coverage, set up testing infrastructure, debug failing tests, or mentions unit tests, integration tests, e2e tests, Jest, Vitest, Supertest, or test coverage.
metadata:
  version: "1.0.0"
---

# Backend Testing Skill

Comprehensive testing strategies for Node.js backends.

## Testing Pyramid

```
        /\
       /e2e\        (few, slow, high confidence)
      /------\
     /integr- \     (moderate, test real interactions)
    /  ation   \
   /------------\
  /  unit tests  \  (many, fast, isolated)
 /______________\
```

**Unit Tests**: Test individual functions/classes in isolation with mocked dependencies.
**Integration Tests**: Test interactions between components (service + DB, route + middleware).
**E2E Tests**: Test the full request/response cycle through a running server.

## Setup (Jest + TypeScript)

```bash
npm install -D jest @types/jest ts-jest supertest @types/supertest
```

```js
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterFramework: ['./src/tests/setup.ts'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  coverageThreshold: { global: { lines: 80, functions: 80 } },
};
```

## Unit Testing Patterns

### Testing Services (with mocked repos)
```typescript
// services/user.service.test.ts
import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';

jest.mock('../repositories/user.repository');

describe('UserService', () => {
  let service: UserService;
  let mockRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepo = new UserRepository() as jest.Mocked<UserRepository>;
    service = new UserService(mockRepo);
  });

  describe('getUserById', () => {
    it('returns user when found', async () => {
      const user = { id: '1', name: 'Test', email: 'test@test.com' };
      mockRepo.findById.mockResolvedValue(user);
      
      const result = await service.getUserById('1');
      expect(result).toEqual(user);
      expect(mockRepo.findById).toHaveBeenCalledWith('1');
    });

    it('throws NotFoundError when user does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.getUserById('999')).rejects.toThrow('not found');
    });
  });
});
```

## Integration Testing Patterns

### API Route Testing (Supertest)
```typescript
// routes/users.test.ts
import request from 'supertest';
import app from '../app';
import { db } from '../config/database';

describe('POST /api/users', () => {
  beforeEach(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterEach(async () => {
    await db.migrate.rollback();
  });

  it('creates user with valid payload', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'new@test.com', name: 'New User', password: 'password123' })
      .expect(201);

    expect(res.body.data).toMatchObject({
      email: 'new@test.com',
      name: 'New User',
    });
    expect(res.body.data.password).toBeUndefined(); // never returned
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'not-an-email', name: 'User' })
      .expect(400);
    
    expect(res.body.status).toBe('error');
  });

  it('requires authentication for protected routes', async () => {
    await request(app).get('/api/users/me').expect(401);
  });
});
```

### Authenticated Requests
```typescript
// tests/helpers.ts
export const getAuthToken = async (app: Express, credentials = {
  email: 'admin@test.com',
  password: 'password123'
}) => {
  const res = await request(app).post('/api/auth/login').send(credentials);
  return res.body.token;
};

// In tests:
const token = await getAuthToken(app);
const res = await request(app)
  .get('/api/profile')
  .set('Authorization', `Bearer ${token}`)
  .expect(200);
```

## Test Data Management

### Factory Pattern
```typescript
// tests/factories/user.factory.ts
import { faker } from '@faker-js/faker';

export const createUserDto = (overrides = {}) => ({
  email: faker.internet.email(),
  name: faker.person.fullName(),
  password: 'ValidPass123!',
  ...overrides,
});

export const createUser = async (db: Database, overrides = {}) => {
  const dto = createUserDto(overrides);
  return db('users').insert(dto).returning('*')[0];
};
```

## Common Test Scenarios Checklist

### Auth Endpoints
- [ ] Valid credentials return token
- [ ] Invalid password returns 401
- [ ] Missing fields return 400 with validation errors
- [ ] Expired tokens return 401
- [ ] Rate limiting kicks in after N attempts

### CRUD Endpoints
- [ ] Create with valid data → 201 + created resource
- [ ] Create with invalid data → 400 + error details
- [ ] Read existing resource → 200 + resource
- [ ] Read non-existent resource → 404
- [ ] Update own resource → 200 + updated resource
- [ ] Update another user's resource → 403
- [ ] Delete own resource → 204
- [ ] Unauthenticated access to protected routes → 401

### Edge Cases
- [ ] Duplicate email/unique constraint → 409
- [ ] SQL injection attempts handled safely
- [ ] Very long strings handled gracefully
- [ ] Empty arrays/objects handled
- [ ] Concurrent requests don't cause race conditions

## Coverage Goals

```bash
# Run tests with coverage
npx jest --coverage

# Watch mode during development
npx jest --watch
```

Target minimums:
- **Lines**: 80%+
- **Functions**: 80%+  
- **Branches**: 70%+
- **Critical paths** (auth, payments, data mutations): 95%+
