/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Add your VITE_ env variables here
  // Example:
  // readonly VITE_API_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
