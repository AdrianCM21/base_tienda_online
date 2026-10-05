import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
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
        <Route
          index
          element={
            <Suspense fallback={<AdminFallback />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="productos"
          element={
            <Suspense fallback={<AdminFallback />}>
              <ProductsPage />
            </Suspense>
          }
        />
        <Route
          path="importar"
          element={
            <Suspense fallback={<AdminFallback />}>
              <ImportPage />
            </Suspense>
          }
        />
        <Route
          path="pedidos"
          element={
            <Suspense fallback={<AdminFallback />}>
              <OrdersPage />
            </Suspense>
          }
        />
        <Route
          path="categorias"
          element={
            <Suspense fallback={<AdminFallback />}>
              <CategoriesPage />
            </Suspense>
          }
        />
        <Route
          path="apariencia"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AppearancePage />
            </Suspense>
          }
        />
        <Route
          path="configuracion"
          element={
            <Suspense fallback={<AdminFallback />}>
              <SettingsPage />
            </Suspense>
          }
        />
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
