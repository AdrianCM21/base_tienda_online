export const ROLES = ['Propietario', 'Administrador', 'Ventas', 'Inventario'] as const
export type Role = (typeof ROLES)[number]

/** Qué puede hacer cada rol (referencia de muestra). */
export const PERMISSIONS: { label: string; roles: Role[] }[] = [
  { label: 'Ver pedidos y clientes', roles: ['Propietario', 'Administrador', 'Ventas'] },
  { label: 'Gestionar pedidos', roles: ['Propietario', 'Administrador', 'Ventas'] },
  { label: 'Editar productos', roles: ['Propietario', 'Administrador', 'Inventario'] },
  { label: 'Ver y ajustar inventario', roles: ['Propietario', 'Administrador', 'Inventario'] },
  { label: 'Ver reportes', roles: ['Propietario', 'Administrador'] },
  { label: 'Marketing y cupones', roles: ['Propietario', 'Administrador'] },
  { label: 'Configuración de la tienda', roles: ['Propietario'] },
  { label: 'Usuarios y roles', roles: ['Propietario'] },
]
