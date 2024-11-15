import refRes from '@json-schema-tools/reference-resolver'

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
  const { properties, patternProperties, additionalProperties, items, oneOf, allOf, anyOf, not } = schema
  const combinedOf = oneOf || anyOf || not
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
  // handling allOf case seperatly
  if (allOf) {
    let propObj: Record<string, unknown> = {}
    for (let i = 0; i < allOf.length; i++) {
      if (allOf[i].type === 'object') {
        if (allOf[i].properties) {
          propObj = { ...propObj, ...allOf[i].properties }
        } else {
          propObj[allOf[i].type] = allOf[i]
        }
      } else if (allOf[i].$ref) {
        const name = nameFromRef(allOf[i].$ref)
        propObj[name] = allOf[i]
      } else {
        propObj[allOf[i].type] = allOf[i]
      }
    }
    Object.assign(mergedProps, propObj);
  }
  if (combinedOf) {
    const props = arrayToProps(combinedOf, label);
    Object.assign(mergedProps, props)
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
