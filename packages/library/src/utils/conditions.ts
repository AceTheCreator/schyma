// Extract a readable condition label from an if schema
function extractConditionLabel(ifSchema: any): { label: string; prop: string } {
  // Case 1: not wrapper - negation
  if (ifSchema.not) {
    const inner = extractConditionLabel(ifSchema.not)
    return {
      label: `no ${inner.label}`,
      prop: inner.prop,
    }
  }

  // Case 2: properties with value checks (const, enum, type)
  if (ifSchema.properties) {
    const propKeys = Object.keys(ifSchema.properties)
    if (propKeys.length > 0) {
      const mainProp = propKeys[0]
      const propSchema = ifSchema.properties[mainProp]

      // const value check
      if (propSchema.const !== undefined) {
        return {
          label: `${mainProp} = ${propSchema.const}`,
          prop: mainProp,
        }
      }

      // enum with single value
      if (propSchema.enum && propSchema.enum.length === 1) {
        return {
          label: `${mainProp} = ${propSchema.enum[0]}`,
          prop: mainProp,
        }
      }

      // type check
      if (propSchema.type) {
        return {
          label: `${mainProp} is ${propSchema.type}`,
          prop: mainProp,
        }
      }

      // Just property existence via properties (rare but possible)
      return {
        label: mainProp,
        prop: mainProp,
      }
    }
  }

  // Case 3: required - checking property existence
  if (ifSchema.required && ifSchema.required.length > 0) {
    const prop = ifSchema.required[0]
    return {
      label: `${prop} exists`,
      prop,
    }
  }

  // Case 4: type check on the schema itself
  if (ifSchema.type) {
    return {
      label: `type is ${ifSchema.type}`,
      prop: 'type',
    }
  }

  // Fallback
  return {
    label: 'condition',
    prop: 'unknown',
  }
}

export const handleConditions = (schema: any, mergedProps: any) => {
  const { if: ifSchema, then: thenSchema, else: elseSchema } = schema

  if (!ifSchema) return

  const { label: conditionLabel, prop: conditionProp } = extractConditionLabel(ifSchema)

  // Build the display label
  const displayLabel = `if ${conditionLabel}`

  // Add then schema as the expandable content
  if (thenSchema) {
    mergedProps[displayLabel] = thenSchema

    //TODO: Come back to this and support missing properties
    // if (thenSchema.required) {
    //   mergedProps[displayLabel].description = JSON.stringify(thenSchema.required)
    // }
  }

  // If there's an else, add it too
  if (elseSchema) {
    const elseLabel = `else (${conditionProp})`
    mergedProps[elseLabel] = elseSchema
  }
}
