export interface IBaseExtension {
  name: string
}

export const EXTENSION_CONSTANTS = {
  MAX_CUSTOM_EXTENSIONS: 200,
  MAX_EXTENSION_LENGTH: 20,
} as const

export type ValidationResult = {
  isValid: boolean
  error?: string
}
