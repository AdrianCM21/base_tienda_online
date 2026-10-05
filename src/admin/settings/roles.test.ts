import { PERMISSIONS, ROLES } from './roles'

describe('roles y permisos', () => {
  it('el propietario puede todo y el resto tiene menos permisos', () => {
    expect(PERMISSIONS.every((p) => p.roles.includes('Propietario'))).toBe(true)
    for (const r of ROLES.filter((x) => x !== 'Propietario'))
      expect(PERMISSIONS.filter((p) => p.roles.includes(r)).length).toBeLessThan(PERMISSIONS.length)
  })
  it('solo el propietario administra usuarios y configuración', () => {
    for (const label of ['Usuarios y roles', 'Configuración de la tienda'])
      expect(PERMISSIONS.find((p) => p.label === label)!.roles).toEqual(['Propietario'])
  })
})
