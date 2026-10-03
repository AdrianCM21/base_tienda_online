import { Check, ShoppingBag } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { PaymentForm } from '@/components/checkout/PaymentForm'
import { ShippingForm } from '@/components/checkout/ShippingForm'
import { Stepper } from '@/components/checkout/Stepper'
import { Button } from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/button-styles'
import { EmptyState } from '@/components/ui/EmptyState'
import { paths } from '@/config/routes'
import { useCart } from '@/hooks/useCart'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getCategory } from '@/services/catalogService'
import { getBranch } from '@/services/storeService'
import type { CardData, PaymentMethod, ShippingData } from '@/types/checkout'
import type { Order } from '@/types/order'
import {
  emptyCard,
  emptyShipping,
  installmentOptions,
  shippingCost,
  validateCard,
  validateShipping,
  type FieldErrors,
} from '@/utils/checkout'
import { createOrderId, saveOrder, toOrderLines } from '@/utils/orders'

export default function Checkout() {
  useDocumentTitle('Checkout')
  const navigate = useNavigate()
  const { lines, subtotal, clear } = useCart()

  const [step, setStep] = useState<1 | 2>(1)
  const [shipping, setShipping] = useState<ShippingData>(emptyShipping)
  const [shipErrors, setShipErrors] = useState<FieldErrors<ShippingData>>({})
  const [method, setMethod] = useState<PaymentMethod>('tarjeta')
  const [card, setCard] = useState<CardData>(emptyCard)
  const [cardErrors, setCardErrors] = useState<FieldErrors<CardData>>({})
  const [count, setCount] = useState<number | null>(null)
  const [payBranch, setPayBranch] = useState('')
  const [branchError, setBranchError] = useState<string>()
  const [accepted, setAccepted] = useState(false)
  const [termsError, setTermsError] = useState<string>()
  const [finished, setFinished] = useState(false)
  const paymentRef = useRef<HTMLDivElement>(null)

  // Al pasar al paso 2 se lleva el foco a la sección de pago.
  useEffect(() => {
    if (step === 2) paymentRef.current?.focus()
  }, [step])

  if (lines.length === 0 && !finished) {
    return (
      <div className="mx-auto max-w-[640px] px-6 py-16">
        <h1 className="sr-only">Checkout</h1>
        <EmptyState
          icon={<ShoppingBag size={26} aria-hidden="true" />}
          title="Tu carrito está vacío"
          action={
            <Link to={paths.search()} className={buttonClasses('primary')}>
              Explorar productos
            </Link>
          }
        >
          Agregá productos para poder finalizar la compra.
        </EmptyState>
      </div>
    )
  }

  const shippingFee = shippingCost(subtotal, shipping.method)
  const total = subtotal + shippingFee
  const maxInstallments = Math.min(...lines.map((l) => l.product.installments?.count ?? 1))
  const choices = installmentOptions(total, maxInstallments)
  const chosen = choices.find((c) => c.count === count) ?? choices[0]
  const branch = getBranch(shipping.branchId)

  const continueToPayment = () => {
    const errors = validateShipping(shipping)
    setShipErrors(errors)
    if (Object.keys(errors).length) return
    if (shipping.method === 'retiro' && !payBranch) setPayBranch(shipping.branchId)
    setStep(2)
  }

  const confirm = () => {
    const cErrors = method === 'tarjeta' ? validateCard(card) : {}
    const bError =
      method === 'efectivo' && !payBranch ? 'Elegí la sucursal donde vas a pagar' : undefined
    setCardErrors(cErrors)
    setBranchError(bError)
    setTermsError(accepted ? undefined : 'Tenés que aceptar los términos para continuar')
    if (Object.keys(cErrors).length || bError || !accepted) return

    const order: Order = {
      id: createOrderId(),
      createdAt: new Date().toISOString(),
      lines: toOrderLines(lines),
      subtotal,
      shipping: shippingFee,
      total,
      shippingData:
        shipping.method === 'retiro'
          ? { ...shipping, address: '', city: '', department: '', postalCode: '' }
          : { ...shipping, branchId: '' },
      payment: {
        method,
        cardLast4: method === 'tarjeta' ? card.number.replace(/\D/g, '').slice(-4) : undefined,
        installments: method === 'tarjeta' ? chosen.count : 1,
        installmentAmount: method === 'tarjeta' ? chosen.amount : total,
        branchId: method === 'efectivo' ? payBranch : undefined,
      },
      status: 'confirmado',
    }
    saveOrder(order)
    setFinished(true)
    clear()
    navigate(paths.order(order.id), { replace: true })
  }

  const summaryLines = toOrderLines(lines).map((l, i) => ({
    ...l,
    icon: getCategory(lines[i].product.categoryId)?.icon,
    hex: lines[i].color?.hex,
  }))
  const ready = step === 2 && accepted

  return (
    <>
      <Stepper step={step} />
      <div className="mx-auto grid max-w-[1100px] gap-7 px-6 pt-9 pb-14 min-[900px]:grid-cols-[minmax(280px,1fr)_minmax(300px,380px)]">
        <div className="flex min-w-0 flex-col gap-5">
          {step === 1 ? (
            <ShippingForm
              value={shipping}
              errors={shipErrors}
              onChange={(v) => {
                setShipping(v)
                if (Object.keys(shipErrors).length) setShipErrors({})
              }}
              onSubmit={continueToPayment}
            />
          ) : (
            <>
              <section
                aria-label="Datos de envío"
                className="rounded-card border border-light bg-white px-[22px] py-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                      <Check size={13} strokeWidth={3} aria-hidden="true" />
                    </span>
                    <h2 className="m-0 font-sans text-[15px] font-bold">1. Datos de envío</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[13px] font-semibold text-primary hover:text-dark"
                  >
                    Editar
                  </button>
                </div>
                <p className="mt-3.5 mb-0 pl-[34px] text-[13.5px] leading-relaxed text-muted">
                  {shipping.method === 'retiro' && branch ? (
                    <>
                      {shipping.fullName} — Retiro en sucursal {branch.name}
                      <br />
                      {branch.address} · Tel. {shipping.phone}
                    </>
                  ) : (
                    <>
                      {shipping.fullName} — {shipping.address}, {shipping.city}
                      <br />
                      {shipping.department} · CP {shipping.postalCode} · Tel. {shipping.phone}
                    </>
                  )}
                </p>
              </section>
              <div ref={paymentRef} tabIndex={-1} className="outline-none">
                <PaymentForm
                  method={method}
                  onMethodChange={setMethod}
                  card={card}
                  cardErrors={cardErrors}
                  onCardChange={(c) => {
                    setCard(c)
                    if (Object.keys(cardErrors).length) setCardErrors({})
                  }}
                  installments={chosen.count}
                  installmentChoices={choices}
                  onInstallmentsChange={setCount}
                  branchId={payBranch}
                  branchError={branchError}
                  onBranchChange={(id) => {
                    setPayBranch(id)
                    setBranchError(undefined)
                  }}
                  accepted={accepted}
                  onAcceptedChange={(v) => {
                    setAccepted(v)
                    if (v) setTermsError(undefined)
                  }}
                  termsError={termsError}
                />
              </div>
            </>
          )}
        </div>

        <OrderSummary
          lines={summaryLines}
          subtotal={subtotal}
          shipping={shippingFee}
          total={total}
          maxInstallments={maxInstallments}
          footer={
            <>
              <Button
                block
                size="md"
                className="py-3.5 text-[14.5px]"
                disabled={!ready}
                onClick={confirm}
              >
                Confirmar pedido
              </Button>
              {!ready && (
                <p className="mt-2 mb-0 text-center text-xs text-subtle">
                  {step === 1
                    ? 'Completá los datos de envío para continuar.'
                    : 'Aceptá los términos para confirmar el pedido.'}
                </p>
              )}
            </>
          }
        />
      </div>
    </>
  )
}
