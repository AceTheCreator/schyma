export function formatRequiredSentence(fields: string[]): string {
  if (!fields || fields.length === 0) return ''

  if (fields.length === 1) {
    return `The ${fields[0]} is required for this property`
  }

  if (fields.length === 2) {
    return `The ${fields[0]} and ${fields[1]} are required for this property`
  }

  const allButLast = fields.slice(0, -1).join(', ')
  const last = fields[fields.length - 1]
  return `The ${allButLast}, and ${last} are required for this property`
}
