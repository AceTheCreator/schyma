import refRes from '@json-schema-tools/reference-resolver'
import { CompositionType } from '../types'

const memoizedNameFromRef: Record<string, string> = {}

export function getCompositionType(schema: any): CompositionType | null {
  if (schema.oneOf) return CompositionType.OneOf
  if (schema.anyOf) return CompositionType.AnyOf
  if (schema.allOf) return CompositionType.AllOf
  if (schema.not) return CompositionType.Not
  return null
}

export async function resolveRef(ref: string, schema: any) {
  const resolver = await refRes.resolve(ref, schema)
  return resolver
}

export function nameFromRef(ref: string): string {
  if (memoizedNameFromRef[ref]) {
    return memoizedNameFromRef[ref]
  }
  const match = ref.match(/[^/]+$/)
  const name = match ? match[0].split('.')[0] : ''
  memoizedNameFromRef[ref] = name
  return name
}

const handleCompostions = (schema: any, mergedProps: any, label: string) => {
  console.log(label)
  // Handle allOf - merge all properties since ALL must be satisfied
  if (schema.allOf) {
    let propObj: Record<string, unknown> = {}
    for (const item of schema.allOf) {
      if (item.type === 'object') {
        // Merge all property types from the object
        if (item.properties) {
          propObj = { ...propObj, ...item.properties }
        }
        if (item.patternProperties) {
          propObj = { ...propObj, ...item.patternProperties }
        }
        if (item.additionalProperties && typeof item.additionalProperties === 'object') {
          // additionalProperties can be a schema object or boolean
          if (item.additionalProperties.$ref) {
            const name = nameFromRef(item.additionalProperties.$ref)
            propObj[name] = item.additionalProperties
          }
        }
      } else if (item.if) {
        // Handle conditional schemas - call handleConditions for each
        handleConditions(item, propObj)
      } else if (item.$ref) {
        const name = nameFromRef(item.$ref)
        propObj[name] = item
      } else if (item.type) {
        propObj[item.type] = item
      }
    }
    Object.assign(mergedProps, propObj)
  }

  // Handle oneOf - flatten items since exactly ONE must match
  if (schema.oneOf) {
    const props = arrayToProps(schema.oneOf, label)
    Object.assign(mergedProps, props)
  }

  // Handle anyOf - flatten items since AT LEAST ONE must match
  if (schema.anyOf) {
    const props = arrayToProps(schema.anyOf, label)
    Object.assign(mergedProps, props)
  }

  // Handle not - single schema
  if (schema.not) {
    if (schema.not.$ref) {
      const name = nameFromRef(schema.not.$ref)
      mergedProps[name] = schema.not
    } else if (schema.not.type) {
      mergedProps[schema.not.type] = schema.not
    }
  }
}

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

const handleConditions = (schema: any, mergedProps: any) => {
  const { if: ifSchema, then: thenSchema, else: elseSchema } = schema

  if (!ifSchema) return

  const { label: conditionLabel, prop: conditionProp } = extractConditionLabel(ifSchema)

  // Build the display label
  const displayLabel = `if ${conditionLabel}`

  // Add then schema as the expandable content
  if (thenSchema) {
    mergedProps[displayLabel] = thenSchema
  }

  // If there's an else, add it too
  if (elseSchema) {
    const elseLabel = `else (${conditionProp})`
    mergedProps[elseLabel] = elseSchema
  }
}

export function propMerge(schema: any, label: string) {
  let mergedProps: Record<string, unknown> = {}
  const { properties, patternProperties, additionalProperties, items, oneOf, allOf, anyOf, not, if: ifSchema } = schema
  const compositions = oneOf || anyOf || not || allOf
  const conditions = ifSchema

  if (conditions) {
    handleConditions(schema, mergedProps)
  }

  if (patternProperties) {
    Object.assign(mergedProps, patternProperties)
  }
  if (properties) {
    Object.assign(mergedProps, properties)
  }
  if (additionalProperties || items) {
    const arrWithObject = additionalProperties || items
    if (arrWithObject.oneOf || arrWithObject.allOf || arrWithObject.anyOf) {
      const items = arrWithObject.oneOf || arrWithObject.anyOf || arrWithObject.not
      const props = arrayToProps(items, label)
      Object.assign(mergedProps, props)
    }
    if (arrWithObject.$ref) {
      const name = nameFromRef(arrWithObject.$ref)
      mergedProps[name] = arrWithObject
    }
  }
  if (compositions) {
    handleCompostions(schema, mergedProps, label)
  }
  return mergedProps
}

export function arrayToProps(props: any, label: string) {
  const propObj: any = {}
  for (let i = 0; i < props.length; i++) {
    if (props[i].$ref) {
      const name = nameFromRef(props[i].$ref)
      propObj[name] = props[i]
    } else {
      if (props[i].type === 'object') {
        const objectName = props[i].title || `${label}Object`
        propObj[objectName] = props[i]
      } else {
        propObj[props[i].type] = props[i]
      }
    }
  }
  return propObj
}

export function removeElementsByParent(nodes: any, id: any) {
  const result = nodes.filter((node: any) => {
    const relations = node.data.relations
    if (relations) {
      if (relations.hasOwnProperty(id)) {
        return
      } else {
        return node
      }
    }
    return node
  })

  return result
}

export function removeEdgesByParent(edges: any, id: any) {
  const result = edges.filter((edge: any) => {
    if (edge.source === id) {
      return false
    }
    return true
  })

  return result
}

export function retrieveObj(theObject: any, key: string | undefined) {
  var result: any = null
  if (theObject instanceof Array) {
    for (var i = 0; i < theObject.length; i++) {
      result = retrieveObj(theObject[i], key)
      if (result) {
        break
      }
    }
  } else {
    for (var prop in theObject) {
      if (prop == key) {
        return theObject[prop]
      }
      if (theObject[prop] instanceof Object || theObject[prop] instanceof Array) {
        result = retrieveObj(theObject[prop], key)
        if (result) {
          break
        }
      }
    }
  }
  return result
}
