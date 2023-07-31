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

export function resolveRef(ref: any, rootSchema: any) {
  // Assuming the ref is a local reference within the same schema
  const refPath = ref.substring(1).split('/') // Remove the leading '#' and split the path
  let resolvedSchema = rootSchema
  let segmentHolder: any = {}
  segmentHolder = rootSchema[refPath[1]]
  // currently only looking into first depth definitions
  if (refPath.length > 3) {
    resolvedSchema = undefined
  } else {
    resolvedSchema = segmentHolder[refPath[2]]
  }
  for (let i = 0; i < refPath; i++) {
    if (refPath[i] === 'definitions') {
      segmentHolder = rootSchema[refPath[i]]
    }
  }
  checkRefExists(resolvedSchema, ref)
  return resolvedSchema
}

export function deepCopy(obj: any, copiesMap = new WeakMap()) {
  // If the object is null or not an object, return it as is
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // If the object has already been copied, return the copy
  if (copiesMap.has(obj)) {
    return copiesMap.get(obj)
  }

  // Create an empty object or array to hold the copied properties
  const newObj: any = Array.isArray(obj) ? [] : {}

  // Add the new object to the copiesMap before copying properties to handle circular references
  copiesMap.set(obj, newObj)

  // Copy each property from the original object to the new object
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = deepCopy(obj[key], copiesMap) // Recursively copy nested objects
    }
  }

  return newObj
}

export function checkRefExists(obj: any, ref: any) {
  if (obj && obj.$ref && obj.$ref === ref) {
    delete obj.$ref
    return obj
  }

  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      checkRefExists(obj[key], ref)
    }
  }

  return false
}
