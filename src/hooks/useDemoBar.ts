import { useContext } from 'react'
import { DemoBarContext } from '@/context/demo-bar-context'

export function useDemoBar() {
  const ctx = useContext(DemoBarContext)
  if (!ctx) throw new Error('useDemoBar debe usarse dentro de <DemoBarProvider>')
  return ctx
}
