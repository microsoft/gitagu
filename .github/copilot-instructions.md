# Copilot Instructions for agunblock Repository

## General Guidelines
- Follow the repository's existing coding style and conventions.
- Prefer TypeScript or JavaScript for new code unless otherwise specified.
- Use Node.js 20 features where appropriate.
- Always use `npm ci` for installing dependencies in CI environments.
- Ensure compatibility with GitHub Actions workflows as defined in `.github/workflows/`.

## GitHub Actions
- Use `actions/checkout@v4` for checking out code.
- Use `actions/setup-node@v4` with `node-version: "20"` and `cache: "npm"` for Node.js setup.
- Keep workflow permissions minimal, e.g., `contents: read` unless more is required.
- Name setup jobs as `copilot-setup-steps` for Copilot compatibility.

## Code Quality
- Write modular, reusable functions.
- Add comments for complex logic.
- Prefer async/await for asynchronous code.
- Use environment variables for secrets and configuration.

## Pull Requests & Commits
- Reference related issues in commit messages and PR descriptions.
- Ensure all workflows pass before merging.

## Dependency Management
- Use `npm ci` for clean, reproducible installs.
- Do not commit `node_modules` or other generated files.

## Security
- Do not hardcode secrets or credentials.
- Use GitHub Actions secrets for sensitive data.

## Documentation
- Update relevant documentation for any new features or changes.
- Use Markdown for documentation files.
