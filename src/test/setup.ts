import '@testing-library/jest-dom/vitest'

afterEach(() => {
  window.localStorage.clear()
})

// jsdom no implementa scrollIntoView
Element.prototype.scrollIntoView = vi.fn()
