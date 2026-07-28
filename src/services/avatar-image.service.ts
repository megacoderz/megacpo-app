import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'

export type AvatarFile = {
  name: string
  type: string
  uri: string
}

const AVATAR_TARGET_SIZE = 512

export const pickAndCropAvatar = async (): Promise<AvatarFile | null> => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!permission.granted) {
    return null
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [1, 1],
    mediaTypes: ['images'],
    quality: 1,
  })
  const asset = result.assets?.[0]
  if (result.canceled || !asset) {
    return null
  }

  const cropped = await ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize: { height: AVATAR_TARGET_SIZE, width: AVATAR_TARGET_SIZE } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
  )

  return {
    name: 'avatar.jpg',
    type: 'image/jpeg',
    uri: cropped.uri,
  }
}
