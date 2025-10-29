/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUNO_API_KEY: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_SUNO_MODEL_VERSION?: string
  readonly VITE_GPT_MODEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
