import { vi } from 'vitest'

globalThis.chrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  runtime: { onInstalled: { addListener: vi.fn() } },
  action: { onClicked: { addListener: vi.fn() } },
  tabs: { create: vi.fn() },
} as any
