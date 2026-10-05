import { useCallback } from 'react'
import { useToast } from './useToast'

/** Devuelve una función que avisa que la acción no existe en la demo (para botones sin efecto real). */
export function useDemoNotice(message = 'Esta acción no está disponible en la demo') {
  const { toast } = useToast()
  return useCallback(() => toast(message), [toast, message])
}
