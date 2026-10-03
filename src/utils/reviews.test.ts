import { makeProduct as mk } from './testProducts'
import { formatDate, generateReviews, ratingDistribution } from './reviews'

describe('reviews', () => {
  const p = mk({ id: 'p001', rating: 4.6, reviewCount: 128 })
  it('son deterministas y limitadas por reviewCount', () => {
    expect(generateReviews(p)).toEqual(generateReviews(p))
    expect(generateReviews(p)).toHaveLength(6)
    expect(generateReviews(mk({ reviewCount: 2 }))).toHaveLength(2)
    expect(generateReviews(mk({ reviewCount: 0 }))).toEqual([])
  })
  it('ratings válidos, fechas ordenadas y no futuras', () => {
    const r = generateReviews(p)
    for (const x of r) {
      expect(x.rating).toBeGreaterThanOrEqual(1)
      expect(x.rating).toBeLessThanOrEqual(5)
      expect(x.date <= '2026-09-30').toBe(true)
    }
    expect(r.map((x) => x.date)).toEqual([...r.map((x) => x.date)].sort().reverse())
  })
  it('distribución suma exactamente el total y pesa hacia el promedio', () => {
    const d = ratingDistribution(4.6, 128)
    expect(d.reduce((a, b) => a + b, 0)).toBe(128)
    expect(d[0]).toBeGreaterThan(d[4])
    expect(ratingDistribution(3.2, 50).reduce((a, b) => a + b, 0)).toBe(50)
    expect(ratingDistribution(4, 0)).toEqual([0, 0, 0, 0, 0])
  })
  it('formatDate', () => {
    expect(formatDate('2026-08-02')).toBe('02/08/2026')
  })
})
