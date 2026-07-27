import { beforeEach, describe, expect, it } from 'vitest'

import { localeStorage } from '@/services/locale-storage'

describe('locale-storage', () => {
  beforeEach(async () => {
    await localeStorage.clear()
  })

  it('falls back to the device locale when nothing is stored', async () => {
    expect(await localeStorage.resolveInitial()).toBe('pt-BR')
  })

  it('persists and returns the saved locale', async () => {
    await localeStorage.save('es-ES')
    expect(await localeStorage.get()).toBe('es-ES')
    expect(await localeStorage.resolveInitial()).toBe('es-ES')
  })
})
