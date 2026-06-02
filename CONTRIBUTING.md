# Contributing to Learn Anything

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/). Every commit message must match this format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Type (required)

| Type       | Usage                                     |
| ---------- | ----------------------------------------- |
| `feat`     | A new feature                             |
| `fix`      | A bug fix                                 |
| `docs`     | Documentation changes (README, comments)  |
| `style`    | Code style (formatting, semicolons, etc.) |
| `refactor` | Code refactoring (no new feature, no fix) |
| `perf`     | Performance improvement                   |
| `test`     | Adding or modifying tests                 |
| `chore`    | Build, dependencies, tooling, etc.        |
| `ci`       | CI/CD configuration changes               |

### Scope (optional)

Add an optional scope in parentheses to indicate the affected area:

- `feat(cli): add --verbose flag`
- `fix(template): correct review workflow`
- `refactor(i18n): extract shared messages`

### Examples

```bash
# ✅ Valid
feat: add CI workflow
feat(cli): add --output flag for custom path
fix: correct session save timing
docs: update README install instructions
refactor: extract adapter registry
chore: bump version to 0.3.0
ci: add GitHub Actions

# ❌ Invalid
update code           # missing type
fix bug               # missing colon and description
WIP                   # non-standard message
feat:add CI           # missing space after colon
```

### Enforcement

commitlint runs automatically on every `git commit`. If the message does not follow the convention, the commit will be rejected.

## Pre-Commit Checks

Every `git commit` triggers these automatic checks:

| Hook         | What it does                           |
| ------------ | -------------------------------------- |
| `pre-commit` | ESLint + Prettier on staged files only |
| `commit-msg` | commitlint format validation           |

You can also run them manually:

```bash
pnpm lint          # ESLint
pnpm format:check  # Prettier check
pnpm format        # Prettier auto-fix
pnpm test          # Run tests
pnpm build         # Compile TypeScript
```

## CI Pipeline

Every push to `main` and every pull request triggers GitHub Actions:

1. **Lint** — ESLint code quality check
2. **Type Check** — TypeScript type checking
3. **Test** — Vitest on Node 20 and 22
4. **Build** — Compile check

All jobs must pass before a PR can be merged.

## Development Workflow

```bash
# 1. Create a feature branch from main
git checkout -b feat/my-feature

# 2. Write code and commit (follow Conventional Commits)
git add .
git commit -m "feat: add something"

# 3. Push and open a PR
git push origin feat/my-feature
# Then create a Pull Request on GitHub targeting main
```

Never push directly to `main`.
