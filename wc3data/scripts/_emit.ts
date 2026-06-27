import { writeFileSync } from 'node:fs'

/** Writes a consolidated record map as a typed TS module (prettier tidies it after). */
export function emitRecords(
  path: string,
  header: string,
  exportName: string,
  type: string,
  data: Record<string, unknown>,
): void {
  writeFileSync(
    path,
    `${header}export const ${exportName}: Record<string, ${type}> = ${JSON.stringify(data, null, 2)}\n`,
  )
}
