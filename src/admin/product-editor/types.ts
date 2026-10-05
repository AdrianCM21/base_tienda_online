import type { ProductDraft } from '@/utils/productDraft'

export type SetDraft = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => void
export type TabProps = { draft: ProductDraft; set: SetDraft }
