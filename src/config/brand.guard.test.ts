import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const LEGACY = new RegExp(['vol', 'tia'].join(''), 'i')

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? files(p) : [p]
  })
}

describe('marca', () => {
  it('el código fuente no contiene el nombre de la marca anterior', () => {
    const offenders = [...files('src'), 'index.html', 'package.json']
      .filter((f) => !f.endsWith('brand.guard.test.ts'))
      .filter((f) => LEGACY.test(readFileSync(f, 'utf8')))
    expect(offenders).toEqual([])
  })
})
