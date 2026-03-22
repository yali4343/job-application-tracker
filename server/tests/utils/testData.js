/**
 * Test data builders - reusable fixtures for consistent test data
 * Reduces duplication and makes tests more readable
 */

export const applicationBuilder = (overrides = {}) => ({
  company: "TestCorp",
  position: "Test Engineer",
  status: "APPLIED",
  appliedDate: "2026-03-22",
  notes: "Test notes",
  ...overrides,
});

export const applicationDataVariations = {
  // Minimal valid application
  minimal: {
    company: "Company",
    position: "Role",
    appliedDate: "2026-03-22",
  },

  // Full application with all fields
  full: {
    company: "Google",
    position: "Backend Developer",
    status: "APPLIED",
    appliedDate: "2026-03-22",
    notes: "First application",
  },

  // Application with different status
  interview: {
    company: "Microsoft",
    position: "Senior Engineer",
    status: "INTERVIEW",
    appliedDate: "2026-03-21",
  },

  offer: {
    company: "Meta",
    position: "Software Engineer",
    status: "OFFER",
    appliedDate: "2026-03-20",
  },

  rejected: {
    company: "Amazon",
    position: "DevOps Engineer",
    status: "REJECTED",
    appliedDate: "2026-02-15",
  },

  // For list endpoint test setup
  listSetup: [
    {
      company: "Google",
      position: "Backend Developer",
      status: "APPLIED",
      appliedDate: new Date("2026-03-01"),
      notes: "Large tech company",
    },
    {
      company: "Microsoft",
      position: "Frontend Engineer",
      status: "INTERVIEW",
      appliedDate: new Date("2026-03-05"),
      notes: "Cloud-focused company",
    },
    {
      company: "Google Cloud",
      position: "DevOps Engineer",
      status: "OFFER",
      appliedDate: new Date("2026-03-10"),
      notes: "Infrastructure role",
    },
    {
      company: "Amazon",
      position: "Full-stack Developer",
      status: "REJECTED",
      appliedDate: new Date("2026-02-15"),
      notes: "AWS platform experience required",
    },
  ],
};

/**
 * Invalid test data for validation tests
 */
export const invalidData = {
  company: {
    empty: "   ",
    missing: undefined,
  },
  position: {
    empty: "   ",
    missing: undefined,
  },
  status: {
    invalid: "INVALID_STATUS",
    wrongCase: "applied",
  },
  appliedDate: {
    invalid: "not-a-date",
    empty: "   ",
  },
};
