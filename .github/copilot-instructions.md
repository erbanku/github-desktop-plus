# GitHub Desktop Plus - AI Coding Assistant Instructions

## Project Overview

GitHub Desktop Plus is an **Electron + React + TypeScript** application - a fork of GitHub Desktop with enhanced features. It's a desktop Git client with deep GitHub/GitLab/Bitbucket integration, built on Flux-like architecture with strict typing and immutability principles.

## Architecture & Data Flow

### Core Pattern: Unidirectional Data Flow
- **AppStore** ([app/src/lib/stores/app-store.ts](app/src/lib/stores/app-store.ts)): Single source of truth (8900+ lines), manages all application state
- **Dispatcher** ([app/src/ui/dispatcher/dispatcher.ts](app/src/ui/dispatcher/dispatcher.ts)): Action handler (4100+ lines), coordinates state updates
- **App Component** ([app/src/ui/app.tsx](app/src/ui/app.tsx)): Root React component (3700+ lines), renders UI based on `IAppState`
- UI components receive state as props and trigger actions via dispatcher - **never modify state directly**

### Process Separation (Electron)
- **Main process**: [app/src/main-process/main.ts](app/src/main-process/main.ts) - window management, IPC, system integration
- **Renderer process**: [app/src/ui/index.tsx](app/src/ui/index.tsx) - React app initialization, store setup
- Changes to main-process code require full rebuild (`yarn build:dev`), renderer changes hot-reload

### Key Directories
- `app/src/ui/` - React components organized by feature (70+ subdirectories)
- `app/src/lib/` - Business logic, Git operations, stores, utilities
- `app/src/models/` - TypeScript domain models (Repository, Branch, Commit, etc.)
- `app/src/main-process/` - Electron main process, IPC handlers, native integrations

## Critical Conventions

### 1. TypeScript Strictness
```typescript
// ✅ REQUIRED: Readonly props and state in React components
interface IMyComponentProps {
  readonly items: ReadonlyArray<Item>  // Not Item[]
  readonly title: string                // All properties readonly
}

// ✅ REQUIRED: Use const over let, prefer immutable patterns
const result = condition ? value : defaultValue  // Not: let result = ...; if (condition) { ... }

// ✅ REQUIRED: Exhaustive switches with assertNever
switch (type) {
  case 'foo': return handleFoo()
  case 'bar': return handleBar()
  default: return assertNever(type, 'Unexpected type')
}
```

### 2. React Component Patterns
- Props and state interfaces **must** use `readonly` modifiers (enforced by custom ESLint rule: `react-readonly-props-and-state`)
- Prefer functional patterns: components pass dispatcher and callbacks via props
- Large components (like App.tsx) are acceptable - this codebase favors colocated complexity over splitting

### 3. Git Operations
- All Git commands go through [dugite](https://github.com/desktop/dugite) wrapper in `app/src/lib/git/`
- Use `app/src/lib/stores/git-store.ts` for repository operations, not direct git calls
- Desktop-trampoline (`vendor/desktop-trampoline/`) handles askpass/credential-helper for authentication

### 4. Custom ESLint Rules
Located in `eslint-rules/` - enforce project-specific patterns:
- `react-readonly-props-and-state.js` - Immutable React interfaces
- `react-no-unbound-dispatcher-props.js` - Dispatcher methods must be bound
- `react-proper-lifecycle-methods.js` - Correct React lifecycle usage

## Development Workflow

### Building and Running
```bash
corepack enable          # Enable Yarn (if not already)
yarn                     # Install dependencies
yarn build:dev           # Compile TypeScript + Webpack (required initially and after main-process changes)
yarn start               # Start app in dev mode with hot reload
```

**In VS Code**: Press `F5` to build and debug (after initial `yarn`). Breakpoints work in DevTools, not VS Code editor.

### Hot Reload Patterns
- Renderer changes (UI, stores): **Ctrl/Cmd + Alt + R** to reload window
- Main-process changes: Stop app → `yarn build:dev` → `yarn start`
- Style changes (`.scss` files): Auto-reload via Webpack

### Linting
```bash
yarn lint              # Run ESLint + Prettier checks
yarn lint:fix          # Auto-fix issues
```

### Testing
```bash
yarn test              # Run all tests
yarn test:unit         # Unit tests only
```
See [docs/technical/adding-tests.md](docs/technical/adding-tests.md) for guidance.

## Key Technical Details

### Webpack Configuration
- **Development**: [app/webpack.development.ts](app/webpack.development.ts) - source maps, dev server
- **Production**: [app/webpack.production.ts](app/webpack.production.ts) - minification, optimizations
- **Common**: [app/webpack.common.ts](app/webpack.common.ts) - shared config, TypeScript loader

### Styling
- SCSS with BEM-like conventions in `app/styles/`
- Theme support via `app/src/ui/lib/application-theme.ts`
- Platform-specific styles in `app/static/{darwin,win32,linux}/`

### External Integrations
- **GitHub API**: [app/src/lib/api/api.ts](app/src/lib/api/api.ts)
- **GitLab/Bitbucket**: Extended in Desktop Plus (look for provider-agnostic patterns)
- **Notifications**: Custom `desktop-notifications` module in `vendor/`

### Database & Storage
- **Dexie** (IndexedDB) for local data: Issues, PRs, user data
- **localStorage** for preferences and account tokens
- See stores in `app/src/lib/stores/` for persistence patterns

## Common Patterns to Follow

### Adding a New Feature UI
1. Create component in `app/src/ui/[feature-name]/`
2. Add popup type to `app/src/models/popup.ts` if it's a dialog
3. Add dispatcher methods in `app/src/ui/dispatcher/dispatcher.ts`
4. Update AppStore in `app/src/lib/stores/app-store.ts` for state management
5. Wire up in `app/src/ui/app.tsx` (popup rendering or main UI integration)

### Working with Git Operations
1. Check if operation exists in `app/src/lib/git/` (Git command wrappers)
2. Use GitStore methods ([app/src/lib/stores/git-store.ts](app/src/lib/stores/git-store.ts)) for complex workflows
3. Update repository state via dispatcher, never directly mutate

### Accessing External Resources
- File path examples: `app/src/ui/octicons/` (icon generation from `octicons`)
- Gemoji integration: `gemoji/` directory for emoji support
- License data: Generated from `script/licenses/`

## Engineering Values

From [docs/contributing/engineering-values.md](docs/contributing/engineering-values.md):

1. **Types are good**: Leverage TypeScript's type system; write custom type definitions when needed
2. **Immutability is good**: Use `ReadonlyArray`, readonly properties; never mutate state
3. **Passing values to functions is good**: Explicit function parameters over implicit dependencies

## Important Notes

- This is a **fork** with additional features - respect upstream Desktop patterns when possible
- Focus areas for Plus: Stash management, commit search, remote indicators, GitLab/Bitbucket support
- Windows/Linux/macOS support required - test platform-specific code paths
- Large files (AppStore, Dispatcher, App component) are intentional design - don't prematurely split

## Related Documentation
- [Engineering values](docs/contributing/engineering-values.md) - Core development philosophy
- [Building setup](docs/contributing/setup.md) - Platform-specific build instructions
- [Linting](docs/contributing/linting.md) - Code quality tooling
- [Adding tests](docs/technical/adding-tests.md) - Testing strategies
- [Editor integration](docs/technical/editor-integration.md) - External editor support patterns
