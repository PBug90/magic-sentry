/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EXTENSION_URL?: string
  readonly VITE_DOWNLOAD_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
