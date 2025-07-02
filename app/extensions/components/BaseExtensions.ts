export interface IBaseExtension {
  id: number
  name: string
  readonly: boolean
}

export const EXTENSION_CONSTANTS = {
  MAX_EXTENSIONS: 10,
  MAX_CUSTOM_EXTENSIONS: 200,
  MAX_EXTENSION_LENGTH: 20,
}
