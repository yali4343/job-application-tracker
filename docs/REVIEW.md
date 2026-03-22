# Code Review: Test File Refactoring

## 📋 TL;DR

**Strengths:**

- ✅ Comprehensive test coverage (66 tests total)
- ✅ Good security practices (cross-user isolation tests)
- ✅ Proper use of supertest for integration testing

**What to fix first:**

1. **BLOCKER** — Monolithic test file (1044 lines) violates SRP
2. **HIGH** — Duplicate setup/teardown logic across test suites
3. **MEDIUM** — User creation logic should be extracted to test utilities
4. **MEDIUM** — Test data builders would reduce repetition

---

## 🔴 Prioritized Issues

### BLOCKER: Single Responsibility Principle Violation

**Why:** The test file mixes concerns for 4 different endpoints (POST, GET list, GET/:id, PUT) in one 1044-line file. According to SOLID:

- Each test suite should test ONE feature/endpoint
- Shared setup logic should be extracted to utilities
- Tests are harder to maintain, run selectively, and reason about

**Issue:** All tests share one global beforeAll/afterAll, making it impossible to:

- Run tests for specific endpoints
- Understand which tests are related
- Change one endpoint's test setup without affecting others

**Fix:**

```
server/tests/
├── utils/
│   ├── testSetup.js        # Shared user creation & auth
│   └── testData.js         # Reusable test fixtures
├── applications.create.test.js   # POST /applications
├── applications.list.test.js     # GET /applications
├── applications.read.test.js     # GET /applications/:id
├── applications.update.test.js   # PUT /applications/:id
└── auth.middleware.test.js       # (existing)
```

Each file handles ONE endpoint's tests with its own setup/teardown.

---

### HIGH: Duplicate Setup/Teardown Logic

**Why:** Code repetition is a maintenance nightmare (DRY principle).

**Issue:** User creation and auth token retrieval is repeated across multiple test suites:

- Main beforeAll (lines 20-50)
- Multiple inner test blocks (e.g., lines 620-700, 780-850)

**Example duplication:**

```js
// Appears 3+ times in different test blocks
const otherUser = {
  name: "Other User",
  email: `otheruser-${Date.now()}@test.com`,
  password: "password123",
};
const registerRes = await request(app)
  .post("/api/auth/register")
  .send(otherUser);
```

**Fix:** Create `testSetup.js` utility:

```js
export async function createAndAuthenticateUser(app, userOverrides = {}) {
  const user = {
    name: "Test User",
    email: `testuser-${Date.now()}@test.com`,
    password: "testpass123",
    ...userOverrides,
  };

  const registerRes = await request(app).post("/api/auth/register").send(user);

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: user.email, password: user.password });

  return {
    userId: registerRes.body.user.id,
    token: loginRes.body.token,
  };
}
```

---

### MEDIUM: Test Data Builders Are Missing

**Why:** Scattered test data makes tests brittle and hard to read.

**Issue:** Application data is hardcoded in 30+ places:

```js
// Appears many times
{
  company: "Google",
  position: "Backend Developer",
  status: "APPLIED",
  appliedDate: "2026-03-22",
  notes: "...",
}
```

**Fix:** Create `testData.js` with builders:

```js
export const applicationBuilder = (overrides = {}) => ({
  company: "TestCorp",
  position: "Engineer",
  status: "APPLIED",
  appliedDate: "2026-03-22",
  notes: "Test notes",
  ...overrides,
});
```

Usage:

```js
const response = await request(app)
  .post("/api/applications")
  .set("Authorization", `Bearer ${authToken}`)
  .send(applicationBuilder({ company: "Google" }));
```

---

### MEDIUM: Global State Coupling

**Why:** Shared `authToken` and `testUserId` variables make test order-dependent.

**Issue:** All tests depend on beforeAll completing successfully. If one test modifies shared state, others fail silently.

**Fix:** Each test file manages its own user/token:

```js
// applications.create.test.js
let user;

beforeAll(async () => {
  user = await createAndAuthenticateUser(app);
});

afterAll(async () => {
  await cleanupUser(user.userId);
});

it("should create application", async () => {
  const response = await request(app)
    .post("/api/applications")
    .set("Authorization", `Bearer ${user.token}`)
    .send(applicationBuilder());
  // ...
});
```

---

## ✅ README Audit

**Current README status:** Need to verify and update if necessary.

**Missing sections to check:**

- ✓ Test structure documentation
- ? How to run specific test suites
- ? Test file organization
- ? How to add new tests

---

## 📝 Implementation Plan

### Phase 1: Create Test Utilities (30 mins)

1. Create `tests/utils/testSetup.js` — user creation & auth
2. Create `tests/utils/testData.js` — test data builders
3. Create `tests/utils/testCleanup.js` — database cleanup helpers

### Phase 2: Extract Individual Test Files (2 hours)

1. Extract POST tests → `applications.create.test.js`
2. Extract GET list tests → `applications.list.test.js`
3. Extract GET/:id tests → `applications.read.test.js`
4. Extract PUT tests → `applications.update.test.js`
5. Keep original file for reference, then delete

### Phase 3: Verify & Run Tests (20 mins)

1. Run full test suite: `npm test`
2. Run individual test file: `npm test -- applications.create.test.js`
3. Verify all 66 tests pass
4. Update any relevant documentation

---

## 🎯 Benefits After Refactoring

| Metric                 | Before      | After            |
| ---------------------- | ----------- | ---------------- |
| Test file size         | 1044 lines  | 200-250 each     |
| Setup code duplication | 7 instances | 1 shared utility |
| Run time per file      | N/A         | ~0.3-0.5s        |
| Cognitive load         | HIGH        | LOW              |
| Test isolation         | POOR        | EXCELLENT        |
| Maintainability        | HARD        | EASY             |

---

## ✨ SOLID Principles Mapping

| Principle                 | Issue                            | Fix                                 |
| ------------------------- | -------------------------------- | ----------------------------------- |
| **S**ingle Responsibility | 4 endpoints in 1 file            | 1 endpoint per file                 |
| **O**pen/Closed           | Hard to add new endpoint tests   | Easy: add new test file             |
| **L**iskov Substitution   | N/A                              | N/A                                 |
| **I**nterface Segregation | Shared setup for unrelated tests | Each test manages own fixtures      |
| **D**ependency Inversion  | Hardcoded test data              | Use builder functions (testData.js) |

---

## Next Steps

Ready to proceed with refactoring. Confirm:

1. ✓ Split tests into 4 endpoint files
2. ✓ Extract shared utilities
3. ✓ Verify all tests pass
4. ✓ Update documentation if needed
