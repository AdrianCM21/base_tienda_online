import type { ButtonHTMLAttributes } from 'react'
import { buttonClasses, type ButtonSize, type ButtonVariant } from './button-styles'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
}

export function Button({ variant, size, block, className = '', type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={`${buttonClasses(variant, size, block)} ${className}`}
      {...rest}
    />
  )
}
