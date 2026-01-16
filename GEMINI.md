# AFFiNE Project Context

## Project Overview
**AFFiNE** is a privacy-focused, local-first, open-source knowledge base that combines the features of Notion (docs) and Miro (whiteboards). It allows users to write, draw, and plan on a unified canvas.

- **Website**: [affine.pro](https://affine.pro)
- **Type**: Monorepo (Yarn Workspaces)
- **Primary Languages**: TypeScript, Rust
- **Core Technologies**:
    - **Frontend**: React, Vite, [BlockSuite](https://github.com/toeverything/BlockSuite) (Editor), Jōtai (State).
    - **Backend/Native**: Rust (OctoBase, Napi-rs for Node bindings), SQLite.
    - **Desktop**: Electron.
    - **Sync**: Yjs (CRDTs).

## Repository Structure
The project is organized as a monorepo.

### Key Directories
- **`packages/frontend/apps/`**: Application entry points.
    - `web`: The main web application.
    - `electron`: Electron main process.
    - `mobile`: Mobile application code.
- **`packages/frontend/core/`**: Core frontend application logic and state management.
- **`packages/frontend/native/`**: Rust native modules for the frontend (database, heavy logic).
- **`packages/backend/`**: Backend services and server implementation.
- **`packages/common/`**: Shared utilities and libraries.
- **`blocksuite/`**: The block-based editor engine (often a submodule or workspace).
- **`docs/`**: Project documentation (Building, Contributing, etc.).
- **`tools/`**: Internal CLI tools and scripts (`@affine-tools/cli`).

## Building and Running

### Prerequisites
- **Node.js**: LTS version (v20.x recommended).
- **Rust**: Latest stable toolchain (`rustup update`).
- **Yarn**: Version 4.x (managed via Corepack).
- **Build Tools**: C++ compiler (for native node modules).

### Setup
1.  **Enable Corepack and Install Dependencies**:
    ```bash
    corepack enable
    yarn install
    ```
2.  **Build Native Bindings** (Crucial Step):
    Before starting the app, you must build the Rust native modules.
    ```bash
    yarn affine @affine/native build
    yarn affine @affine/server-native build
    ```

### Development Commands
- **Start All Services (Dev Mode)**:
    ```bash
    yarn dev
    ```
    This command typically starts the web frontend and necessary backend services.

- **Run Specific Apps**:
    Check `packages/frontend/apps/*/package.json` for specific start scripts if `yarn dev` is too broad.

### Testing
- **Unit Tests** (Vitest):
    ```bash
    yarn test
    ```
- **E2E Tests** (Playwright):
    ```bash
    yarn workspace @affine-test/affine-local e2e
    ```

## Development Conventions

- **Code Style**:
    - **TypeScript**: Prettier & ESLint.
    - **Rust**: `cargo fmt` (Rustfmt).
- **Linting**:
    ```bash
    yarn lint
    ```
- **State Management**: Jōtai is used extensively for React state.
- **Data Persistence**: Local-first architecture using SQLite (via Rust bindings) and CRDTs (Yjs) for synchronization.
- **Commits**: Follow conventional commits (implied by `husky` and `commitlint` config).
