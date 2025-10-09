import { ICustomIntegration } from '../lib/custom-integration'

export type EditorOverride = {
  selectedExternalEditor: string | null
  useCustomEditor: boolean
  customEditor: ICustomIntegration | null
}
