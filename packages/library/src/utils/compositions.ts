import { CompositionType } from '../types'
import { nameFromRef } from './reusables'
import { handleConditions } from './conditions'

export function getCompositionType(schema: any): CompositionType | null {
  if (schema.oneOf) return CompositionType.OneOf
  if (schema.anyOf) return CompositionType.AnyOf
  if (schema.allOf) return CompositionType.AllOf
  if (schema.not) return CompositionType.Not
  return null
}

function getSchemaName(schema: any, label: string, index: number): string {
  if (schema.title) {
    return schema.title
  }
  if (schema.$ref) {
    return nameFromRef(schema.$ref)
  }
  if (schema.properties) {
    for (const key of Object.keys(schema.properties)) {
      const prop = schema.properties[key]
      if (prop.const !== undefined) {
        return String(prop.const)
      }
    }
  }
  if (schema.type && schema.type !== 'object') {
    return `${schema.type}`
  }
  return `${label} ${index + 1}`
}

export function arrayToProps(props: any, label: string) {
  const propObj: any = {}
  for (let i = 0; i < props.length; i++) {
    const name = getSchemaName(props[i], label, i)
    propObj[name] = props[i]
  }
  return propObj
}

export const handleCompositions = (schema: any, mergedProps: any, label: string) => {
  if (schema.allOf) {
    let propObj: Record<string, unknown> = {}
    for (const item of schema.allOf) {
      if (item.if) {
        handleConditions(item, propObj)
      } else if (item.$ref) {
        const name = nameFromRef(item.$ref)
        propObj[name] = item
      } else {
        if (item.properties) {
          propObj = { ...propObj, ...item.properties }
        }
        if (item.patternProperties) {
          propObj = { ...propObj, ...item.patternProperties }
        }
        if (item.additionalProperties && typeof item.additionalProperties === 'object') {
          if (item.additionalProperties.$ref) {
            const name = nameFromRef(item.additionalProperties.$ref)
            propObj[name] = item.additionalProperties
          }
        }
        // Fallback for primitive types without properties
        if (item.type && !item.properties && !item.patternProperties) {
          propObj[item.type] = item
        }
      }
    }
    Object.assign(mergedProps, propObj)
  }

  if (schema.oneOf || schema.anyOf) {
    const items = schema.oneOf || schema.anyOf
    const compositionType = schema.oneOf ? CompositionType.OneOf : CompositionType.AnyOf
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      // Only flatten if item is ONLY a condition (no other schema content)
      const isOnlyCondition = item.if && !item.title && !item.properties && !item.$ref && !item.type
      if (isOnlyCondition) {
        handleConditions(item, mergedProps)
      } else {
        const name = getSchemaName(item, label, i)
        mergedProps[name] = { ...item, _compositionSource: compositionType }
      }
    }
  }

  if (schema.not) {
    if (schema.not.$ref) {
      const name = nameFromRef(schema.not.$ref)
      mergedProps[name] = { ...schema.not, _compositionSource: CompositionType.Not }
    } else if (schema.not.type) {
      mergedProps[schema.not.type] = { ...schema.not, _compositionSource: CompositionType.Not }
    }
  }
}
