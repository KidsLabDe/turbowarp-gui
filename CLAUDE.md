# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TurboWarp GUI is a fork of scratch-gui that provides the user interface for TurboWarp (https://turbowarp.org/). It's built with React 16 and Redux, using TurboWarp's forks of Scratch VM, Scratch Render, and Scratch Blocks.

## Development Commands

```bash
# Start dev server (http://localhost:8601/)
npm start

# Build for production
npm run build

# Run all tests (lint + unit + build + integration)
npm test

# Run specific test types
npm run test:lint      # ESLint only
npm run test:unit      # Unit tests
npm run test:unit -- --watch  # Unit tests in watch mode

# Run a single test file
npx jest --runInBand test/unit/components/button.test.jsx

# Integration tests (requires build first)
npm run build
npm run test:integration

# Run integration tests with visible browser
USE_HEADLESS=no npx jest --runInBand test/integration/backpack.test.js

# Build as library for linking
BUILD_MODE=dist npm run build
```

Node version: v16 (see .nvmrc)

## Architecture

### State Management
- Redux store created in `src/lib/app-state-hoc.jsx`
- Reducers in `/src/reducers/` - each feature has its own reducer
- Project lifecycle uses a finite state machine in `src/reducers/project-state.js` (see `docs/project_state_diagram.svg`)

### HOC Composition Pattern
The app uses extensive higher-order component composition. Components are wrapped in this order (inner to outer):
`GUIComponent` → `TWThemeManagerHOC` → `cloudManagerHOC` → `vmManagerHOC` → `vmListenerHOC` → `ProjectSaverHOC` → `ProjectFetcherHOC` → `SBFileUploaderHOC` → `LocalizationHOC` → `FontLoaderHOC` → `ErrorBoundaryHOC`

Key HOCs in `src/lib/`:
- `vm-manager-hoc.jsx` - Scratch VM lifecycle
- `vm-listener-hoc.jsx` - VM event subscriptions
- `project-fetcher-hoc.jsx` / `project-saver-hoc.jsx` - Project I/O
- `tw-theme-manager-hoc.jsx` - Theme switching

### Directory Structure
- `/src/components/` - Presentational React components
- `/src/containers/` - Redux-connected components using `connect()`
- `/src/reducers/` - Redux reducers and action creators
- `/src/lib/` - HOCs and utilities
- `/src/playground/` - Entry points (editor.jsx, player.jsx, fullscreen.jsx)
- `/src/addons/` - Scratch Addons integration (pulled from upstream)
- `/src/css/` - Global styles (colors, units, z-index)

### TurboWarp Conventions
All TurboWarp-specific code is prefixed with `tw-`:
- Files: `tw-*.js`, `tw-*.jsx`
- Components: `tw-settings-modal/`, `tw-custom-extension-modal/`
- HOCs: `tw-fullscreen-resizer-hoc.jsx`

This makes it easy to distinguish TurboWarp additions from upstream Scratch code.

### Styling
CSS modules with PostCSS. Styles are co-located with components as `.css` files. Class names are converted to camelCase in JavaScript.

### Internationalization
Uses react-intl with `defineMessages()`, `FormattedMessage`, and `injectIntl`. Translations sourced from `@turbowarp/scratch-l10n`.

## Key Environment Variables

- `NODE_ENV` - development/production
- `PORT` - dev server port (default 8601)
- `STATIC_PATH` - static asset path (default /static)
- `BUILD_MODE` - set to `dist` for library export
- `USE_HEADLESS` - set to `no` for visible browser tests

## Testing

- **Unit tests**: Jest with Enzyme in `/test/unit/`
- **Integration tests**: Selenium with Chromedriver in `/test/integration/`
- **Mocks**: `/test/__mocks__/` for files, styles, messages

## License

TurboWarp modifications are GPLv3. Original Scratch code has BSD 3-Clause license (see README.md).
