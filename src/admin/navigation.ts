import {
  ChartColumn,
  ClipboardList,
  FolderTree,
  Image,
  Landmark,
  LayoutDashboard,
  Package,
  Palette,
  Settings,
  Ticket,
  Users,
  Warehouse,
} from 'lucide-react'
import { adminPaths, paths } from '@/config/routes'

/** Menú del panel agrupado por tarea. Lo usan la barra lateral y el buscador global. */
export const NAV_GROUPS = [
  {
    title: null,
    items: [
      {
        to: paths.admin,
        label: 'Inicio',
        icon: LayoutDashboard,
        end: true,
        keywords: 'resumen dashboard panel',
      },
    ],
  },
  {
    title: 'Ventas',
    items: [
      {
        to: adminPaths.orders,
        label: 'Pedidos',
        icon: ClipboardList,
        keywords: 'ventas órdenes compras',
      },
      {
        to: adminPaths.customers,
        label: 'Clientes',
        icon: Users,
        keywords: 'compradores contactos',
      },
    ],
  },
  {
    title: 'Catálogo',
    items: [
      {
        to: adminPaths.products,
        label: 'Productos',
        icon: Package,
        keywords: 'catálogo artículos importar exportar excel',
      },
      {
        to: adminPaths.categories,
        label: 'Categorías',
        icon: FolderTree,
        keywords: 'rubros subcategorías',
      },
      {
        to: adminPaths.inventory,
        label: 'Inventario',
        icon: Warehouse,
        keywords: 'stock existencias reponer',
      },
    ],
  },
  {
    title: 'Marketing',
    items: [
      {
        to: adminPaths.coupons,
        label: 'Cupones',
        icon: Ticket,
        keywords: 'descuentos promociones códigos',
      },
      {
        to: adminPaths.banks,
        label: 'Beneficios con bancos',
        icon: Landmark,
        keywords: 'cuotas tarjetas cooperativas',
      },
      {
        to: adminPaths.banners,
        label: 'Banners y destacados',
        icon: Image,
        keywords: 'portada hero inicio productos destacados',
      },
    ],
  },
  {
    title: 'Reportes',
    items: [
      {
        to: adminPaths.reports,
        label: 'Reportes',
        icon: ChartColumn,
        keywords: 'estadísticas ventas informes',
      },
    ],
  },
  {
    title: 'Tienda',
    items: [
      {
        to: adminPaths.appearance,
        label: 'Apariencia',
        icon: Palette,
        keywords: 'colores paleta logo marca',
      },
      {
        to: adminPaths.settings,
        label: 'Configuración',
        icon: Settings,
        keywords: 'envíos pagos impuestos usuarios horarios whatsapp',
      },
    ],
  },
] as const

export type NavItem = (typeof NAV_GROUPS)[number]['items'][number]

export const NAV_SECTIONS = NAV_GROUPS.flatMap((g) =>
  g.items.map((i) => ({ label: i.label, to: i.to as string, keywords: i.keywords })),
)
