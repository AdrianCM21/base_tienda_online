import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AdminHome, AdminLayout } from '@/admin/AdminLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { ThemeProvider } from '@/context/ThemeContext'
import Cart from '@/pages/Cart'
import Category from '@/pages/Category'
import Checkout from '@/pages/Checkout'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import OrderDone from '@/pages/OrderDone'
import Product from '@/pages/Product'
import Search from '@/pages/Search'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="categoria/:slug/:sub?" element={<Category />} />
        <Route path="buscar" element={<Search />} />
        <Route path="producto/:slug" element={<Product />} />
        <Route path="carrito" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="pedido/:id" element={<OrderDone />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  )
}
