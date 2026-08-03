import { describe, expect, it, vi } from 'vitest'

import { appendLocalFile } from '@/utils/form-data-file'

vi.mock('expo-file-system', () => ({
  File: class MockFile {
    uri: string
    constructor(uri: string) {
      this.uri = uri
    }
  },
}))

describe('appendLocalFile', () => {
  it('appends an expo File instance instead of a RN uri object', () => {
    const formData = new FormData()
    const appendSpy = vi.spyOn(formData, 'append')

    appendLocalFile(formData, 'avatar', {
      name: 'avatar.jpg',
      type: 'image/jpeg',
      uri: 'file:///tmp/avatar.jpg',
    })

    expect(appendSpy).toHaveBeenCalledWith(
      'avatar',
      expect.objectContaining({ uri: 'file:///tmp/avatar.jpg' }),
    )
  })
})
