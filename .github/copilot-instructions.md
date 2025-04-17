# GitHub Copilot Instructions for subs-convert typescript library

## Project Overview
This project houses a library for converting between various common subtitles formats.
Use these instructions to help guide your code suggestions.

## Project Technologies

- typescript
- asdf
- pnpm
- vite
- vitest

## Coding Standards

### TypeScript
- Use TypeScript's strict mode
- Prefer explicit types over `any` or implicit types
- Use interface for object shapes and type for unions, primitives, and tuples
- Leverage TypeScript utility types (Pick, Omit, Partial, etc.) when appropriate
- Use type guards for runtime type checking

## Formatting
- respect the `.prettierrc` conventions

### File Structure
- Group files by feature/module rather than by file type
- Keep related files close together
- Use index files to simplify imports

### Testing
- Write unit tests for utility functions
- Write component tests focusing on behavior, not implementation
- Test custom hooks independently
- Mock external dependencies in tests

### Performance
- Lazy load routes and large components
- Implement proper error boundaries
- Use windowing for long lists
- Optimize images and assets

### Security
- Sanitize user inputs
- Don't store sensitive information in client-side storage

## Commit Message Format
- Use conventional commits (feat, fix, docs, style, refactor, test, chore)
- Include a scope when applicable
- Write clear, concise descriptions

## Build and Deployment
- Use Vite for development and building
- Follow the established CI/CD pipeline
- Test thoroughly before merging to main branch
