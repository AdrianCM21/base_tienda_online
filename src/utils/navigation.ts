/** Navegación completa del navegador (recarga la app). Aislada para poder simularla en tests. */
export function hardNavigate(url: string): void {
  window.location.assign(url)
}
