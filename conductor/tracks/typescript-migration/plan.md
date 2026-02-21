# Implementation Plan: TypeScript Migration

- [x] **Step 4.1: Node & Build Setup**
  - Initialize `package.json`.
  - Install `typescript`, `esbuild`, and `@types/chrome`.
  - Configure `tsconfig.json`.
- [x] **Step 4.2: Refactor to TypeScript**
  - Rename `.js` to `.ts`.
  - Add proper types and interfaces.
- [x] **Step 4.3: Build Pipeline & Manifest Update**
  - Create build script in `package.json`.
  - Update `manifest.json` and `offscreen.html` to point to `dist/`.
- [x] **Step 4.4: Validation**
  - Run build and verify extension loads correctly from `dist/`.
