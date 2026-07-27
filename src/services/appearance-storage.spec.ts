import { beforeEach, describe, expect, it } from 'vitest'

import { appearanceStorage } from '@/services/appearance-storage'

describe('appearanceStorage', () => {
  beforeEach(async () => {
    await appearanceStorage.clear()
  })

  it('defaults to system when empty', async () => {
    expect(await appearanceStorage.resolveInitial()).toBe('system')
  })

  it('persists preference', async () => {
    await appearanceStorage.save('dark')
    expect(await appearanceStorage.get()).toBe('dark')
    expect(await appearanceStorage.resolveInitial()).toBe('dark')
  })
})
