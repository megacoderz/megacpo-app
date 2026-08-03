import { File } from 'expo-file-system'

export type LocalUploadFile = {
  name: string
  type: string
  uri: string
}

/**
 * Append a local device file for Expo fetch multipart uploads.
 * React Native `{ uri, name, type }` parts throw
 * "Unsupported FormDataPart implementation" under Expo's FormData converter.
 */
export const appendLocalFile = (
  formData: FormData,
  fieldName: string,
  file: LocalUploadFile,
) => {
  formData.append(fieldName, new File(file.uri))
}
