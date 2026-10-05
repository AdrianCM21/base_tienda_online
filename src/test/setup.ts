import { configure } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

configure({ asyncUtilTimeout: 5_000 })

afterEach(() => {
  window.localStorage.clear()
})

// jsdom no implementa scrollIntoView
Element.prototype.scrollIntoView = vi.fn()
