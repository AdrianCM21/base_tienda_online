import { pageWindow } from '@/utils/paginate'

type Props = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

const box =
  'flex h-[34px] w-[34px] items-center justify-center rounded-control border border-light text-[13.5px]'

export function Pagination({ page, pageCount, onPageChange }: Props) {
  if (pageCount <= 1) return null
  return (
    <nav aria-label="Paginación" className="mt-[34px] flex justify-center gap-2">
      <button
        type="button"
        aria-label="Página anterior"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={`${box} bg-white text-dark disabled:text-subtle`}
      >
        ‹
      </button>
      {pageWindow(page, pageCount).map((n, i) =>
        n === '…' ? (
          <span
            key={`gap-${i}`}
            aria-hidden="true"
            className={`${box} border-transparent text-subtle`}
          >
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            aria-label={`Página ${n}`}
            aria-current={n === page ? 'page' : undefined}
            onClick={() => onPageChange(n)}
            className={`${box} ${n === page ? 'border-primary bg-primary font-bold text-white' : 'bg-white text-dark hover:bg-light'}`}
          >
            {n}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Página siguiente"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        className={`${box} bg-white text-dark disabled:text-subtle`}
      >
        ›
      </button>
    </nav>
  )
}
