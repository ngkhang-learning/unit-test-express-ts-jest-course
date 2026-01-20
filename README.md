# Unit Test in ExpressJs - TypeScript with Jest

A comprehensive repository for learning how to write effective unit tests in Express.js applications using TypeScript and Jest. This project created by TrungQuanDev.

**📚 Table of Contents**

- [Unit Test in ExpressJs - TypeScript with Jest](#unit-test-in-expressjs---typescript-with-jest)
  - [🎯 Overview](#-overview)
  - [⚙️ Tech Stack](#️-tech-stack)
    - [📁 Project Structure](#-project-structure)
    - [👥 Author(s)](#-authors)
  - [📚 References](#-references)
  - [Happy Testing! 🎉](#happy-testing-)

## 🎯 Overview

This repository serves as a complete guide to unit testing in modern Node.js applications. It covers:

- Testing Express.js middleware and error handlers
- Testing controllers, services, and repositories
- Mocking external dependencies (database, APIs)
- Validation testing with Zod
- Password hashing and authentication utilities
- CORS configuration testing

## ⚙️ Tech Stack

- **Core Dependencies**
  - Node.js: >=22.x
  - Express.js: ^5.1.0
  - TypeScript: ^5.9.3
  - MongoDB: ^6.20.0

- **Testing Tools**
  - Jest: ^29.7.0 - Testing framework
  - ts-jest: ^29.4.5 - TypeScript preprocessor for Jest
  - Supertest: ^7.2.2 - HTTP assertion library
  - @types/jest: ^30.0.0 - TypeScript definitions for Jest

- **Additional Tools**
  - Zod: ^4.1.12 - Schema validation
  - bcryptjs: ^3.0.2 - Password hashing
  - ESLint: ^9.37.0 - Code linting
  - Prettier: ^3.6.2 - Code formatting

### 📁 Project Structure

```md
.
├── src/
│   ├── config/           # Configuration files (DB, CORS, env, logger)
│   ├── core/             # Core utilities (asyncHandler, error handling, validation)
│   ├── modules/          # Feature modules (users, etc.)
│   │   └── users/
│   │       ├── user.controller.ts
│   │       ├── user.service.ts
│   │       ├── user.repo.ts
│   │       ├── user.routes.ts
│   │       ├── user.types.ts
│   │       └── user.validation.ts
│   ├── routes/           # API routes aggregation
│   ├── types/            # Global TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
│
├── tests/
│   ├── config/           # Configuration tests
│   ├── core/             # Core utilities tests
│   ├── modules/          # Feature module tests
│   ├── utils/            # Utility function tests
│   ├── app.test.ts       # Express app integration tests
│   └── jest.setup.ts     # Jest global setup
│
├── jest.config.cjs       # Jest configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

### 👥 Author(s)

- TrungQuanDev
- Khang Nguyen

## 📚 References

- **Official Documentation**
  - [Jest Documentation](https://jestjs.io/docs/getting-started)
  - [TypeScript Jest](https://kulshekhar.github.io/ts-jest/)
  - [Supertest](https://github.com/visionmedia/supertest)

- **Testing Guides**
  - [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
  - [Jest Cheat Sheet](https://github.com/sapegin/jest-cheat-sheet)

## Happy Testing! 🎉

If you found this helpful, consider:

⭐ Starring the repository
🐛 Reporting issues
🔀 Contributing improvements
📢 Sharing with others learning testing
