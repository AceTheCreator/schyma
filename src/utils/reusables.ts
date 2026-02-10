import refRes from '@json-schema-tools/reference-resolver'
import { handleConditions } from './conditions'
import { getCompositionType, handleCompositions } from './compositions'

// Re-export for backwards compatibility
export { getCompositionType, arrayToProps } from './compositions'

const memoizedNameFromRef: Record<string, string> = {}

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
  if (items) {
    const itemsComposition = getCompositionType(items)
    const itemsProps = propMerge(items, label)
    Object.assign(mergedProps, itemsProps)
    // Propagate composition type from items to parent
    if (itemsComposition) {
      mergedProps._nestedComposition = itemsComposition
    }
  }
  if (additionalProperties && typeof additionalProperties === 'object') {
    const additionalComposition = getCompositionType(additionalProperties)
    const additionalProps = propMerge(additionalProperties, label)
    Object.assign(mergedProps, additionalProps)
    // Propagate composition type from additionalProperties to parent
    if (additionalComposition && !mergedProps._nestedComposition) {
      mergedProps._nestedComposition = additionalComposition
    }
  }
  if (compositions) {
    handleCompositions(schema, mergedProps, label)
  }
  return mergedProps
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
