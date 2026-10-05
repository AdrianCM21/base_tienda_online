import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { CheckoutLayout } from '@/components/layout/CheckoutLayout'
import { AppProviders } from '@/context/AppProviders'
import ComponentsPreview from '@/pages/ComponentsPreview'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'

// Las pantallas (salvo Home) y el panel admin se cargan bajo demanda: el primer pintado pesa menos.
const Cart = lazy(() => import('@/pages/Cart'))
const Category = lazy(() => import('@/pages/Category'))
const Checkout = lazy(() => import('@/pages/Checkout'))
const OrderDone = lazy(() => import('@/pages/OrderDone'))
const Product = lazy(() => import('@/pages/Product'))
const Search = lazy(() => import('@/pages/Search'))
const AdminLayout = lazy(() =>
  import('@/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const LoginPage = lazy(() => import('@/admin/LoginPage'))
const DashboardPage = lazy(() => import('@/admin/DashboardPage'))
const ProductsPage = lazy(() => import('@/admin/ProductsPage'))
const ImportPage = lazy(() => import('@/admin/ImportPage'))
const ProductEditorPage = lazy(() => import('@/admin/ProductEditorPage'))
const CustomersPage = lazy(() => import('@/admin/CustomersPage'))
const InventoryPage = lazy(() => import('@/admin/InventoryPage'))
const ReportsPage = lazy(() => import('@/admin/ReportsPage'))
const CouponsPage = lazy(() => import('@/admin/CouponsPage'))
const BanksPage = lazy(() => import('@/admin/BanksPage'))
const BannersPage = lazy(() => import('@/admin/BannersPage'))
const OrdersPage = lazy(() => import('@/admin/OrdersPage'))
const CategoriesPage = lazy(() => import('@/admin/CategoriesPage'))
const AppearancePage = lazy(() => import('@/admin/AppearancePage'))
const SettingsPage = lazy(() => import('@/admin/SettingsPage'))

function AdminFallback() {
  return (
    <p role="status" className="p-10 text-center text-sm text-muted">
      Cargando panel…
    </p>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="categoria/:slug/:sub?" element={<Category />} />
        <Route path="buscar" element={<Search />} />
        <Route path="producto/:slug" element={<Product />} />
        <Route path="carrito" element={<Cart />} />
        <Route path="pedido/:id" element={<OrderDone />} />
        {import.meta.env.DEV && <Route path="componentes" element={<ComponentsPreview />} />}
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<CheckoutLayout />}>
        <Route path="checkout" element={<Checkout />} />
      </Route>
      <Route
        path="admin/login"
        element={
          <Suspense fallback={<AdminFallback />}>
            <LoginPage />
          </Suspense>
        }
      />
      <Route
        path="admin"
        element={
          <Suspense fallback={<AdminFallback />}>
            <AdminLayout />
          </Suspense>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="productos" element={<ProductsPage />} />
        <Route path="productos/nuevo" element={<ProductEditorPage />} />
        <Route path="productos/importar" element={<ImportPage />} />
        <Route path="productos/:id" element={<ProductEditorPage />} />
        <Route path="importar" element={<Navigate to="/admin/productos/importar" replace />} />
        <Route path="pedidos" element={<OrdersPage />} />
        <Route path="clientes" element={<CustomersPage />} />
        <Route path="inventario" element={<InventoryPage />} />
        <Route path="reportes" element={<ReportsPage />} />
        <Route path="marketing/cupones" element={<CouponsPage />} />
        <Route path="marketing/bancos" element={<BanksPage />} />
        <Route path="marketing/banners" element={<BannersPage />} />
        <Route path="categorias" element={<CategoriesPage />} />
        <Route path="apariencia" element={<AppearancePage />} />
        <Route path="configuracion" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  )
}
