export function formatRulesSentence(data: any): string {
  const parts: string[] = []

  if (!data) return ''

  // String length rules - combine if both present
  if (data.minLength !== undefined && data.maxLength !== undefined) {
    parts.push(`must be between ${data.minLength} and ${data.maxLength} characters`)
  } else if (data.minLength !== undefined) {
    parts.push(`minimum ${data.minLength} characters`)
  } else if (data.maxLength !== undefined) {
    parts.push(`maximum ${data.maxLength} characters`)
  }

  // Pattern
  if (data.pattern) {
    parts.push(`must match pattern "${data.pattern}"`)
  }

  // Format
  if (data.format) {
    parts.push(`format: ${data.format}`)
  }

  // Number range rules - combine if both present
  if (data.minimum !== undefined && data.maximum !== undefined) {
    parts.push(`must be between ${data.minimum} and ${data.maximum}`)
  } else if (data.minimum !== undefined) {
    parts.push(`minimum value: ${data.minimum}`)
  } else if (data.maximum !== undefined) {
    parts.push(`maximum value: ${data.maximum}`)
  }

  // Exclusive ranges
  if (data.exclusiveMinimum !== undefined) {
    parts.push(`must be greater than ${data.exclusiveMinimum}`)
  }
  if (data.exclusiveMaximum !== undefined) {
    parts.push(`must be less than ${data.exclusiveMaximum}`)
  }

  // Multiple of
  if (data.multipleOf !== undefined) {
    parts.push(`must be a multiple of ${data.multipleOf}`)
  }

  // Array items rules - combine if both present
  if (data.minItems !== undefined && data.maxItems !== undefined) {
    parts.push(`must have between ${data.minItems} and ${data.maxItems} items`)
  } else if (data.minItems !== undefined) {
    parts.push(`minimum ${data.minItems} items`)
  } else if (data.maxItems !== undefined) {
    parts.push(`maximum ${data.maxItems} items`)
  }

  // Unique items
  if (data.uniqueItems === true) {
    parts.push(`items must be unique`)
  }

  // Object properties rules - combine if both present
  if (data.minProperties !== undefined && data.maxProperties !== undefined) {
    parts.push(`must have between ${data.minProperties} and ${data.maxProperties} properties`)
  } else if (data.minProperties !== undefined) {
    parts.push(`minimum ${data.minProperties} properties`)
  } else if (data.maxProperties !== undefined) {
    parts.push(`maximum ${data.maxProperties} properties`)
  }

  // Enum
  if (data.enum) {
    const enumValues = data.enum.slice(0, 4).map((v: any) => `"${v}"`).join(', ')
    const suffix = data.enum.length > 4 ? ', ...' : ''
    parts.push(`allowed values: ${enumValues}${suffix}`)
  }

  // Const
  if (data.const !== undefined) {
    parts.push(`must be "${data.const}"`)
  }

  // Default
  if (data.default !== undefined) {
    const defaultVal = typeof data.default === 'object'
      ? JSON.stringify(data.default)
      : String(data.default)
    parts.push(`defaults to "${defaultVal}"`)
  }

  if (parts.length === 0) return ''

  // Join parts with commas and add period at end
  return parts.join(', ') + '.'
}
