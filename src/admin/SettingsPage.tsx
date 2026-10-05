import { Tabs } from '@/components/ui/Tabs'
import { useVisitedPage } from '@/hooks/useVisitedPage'
import { AdminPageHeader } from './AdminPageHeader'
import { GeneralTab } from './settings/GeneralTab'
import { PaymentsTab } from './settings/PaymentsTab'
import { ShippingTab } from './settings/ShippingTab'
import { TaxesTab } from './settings/TaxesTab'
import { UsersTab } from './settings/UsersTab'

/** Configuración de la tienda. Todo se puede editar en pantalla, pero "Guardar" avisa que es una demo. */
export default function SettingsPage() {
  useVisitedPage('configuracion')
  return (
    <>
      <AdminPageHeader
        title="Configuración"
        description="Datos de la tienda, envíos, medios de pago, impuestos y usuarios."
      />
      <Tabs
        tabs={[
          { id: 'general', label: 'General', content: <GeneralTab /> },
          { id: 'envios', label: 'Envíos', content: <ShippingTab /> },
          { id: 'pagos', label: 'Pagos', content: <PaymentsTab /> },
          { id: 'impuestos', label: 'Impuestos', content: <TaxesTab /> },
          { id: 'usuarios', label: 'Usuarios y roles', content: <UsersTab /> },
        ]}
      />
    </>
  )
}
