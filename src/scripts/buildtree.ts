import { retrieveObj } from '../utils/reusables'

let schema: PropertiesInterface

type TreeInterface = {
  required: any
  examples: any
  id: number
  name: string
  parent: number
  description: string
  children: Array<TreeInterface>
  $ref?: string
  title: string
}

type MyObject = { [x: string]: any }

interface PropertiesInterface extends TreeInterface {
  properties?: MyObject
  additionalProperties?: AdditionalProperties | Boolean
  patternProperties?: MyObject
  $id?: string
  allOf?: Array<PropertiesInterface>
  anyOf?: Array<PropertiesInterface>
  oneOf?: Array<PropertiesInterface>
  items?: any
  definitions?: any
}

interface AdditionalProperties extends TreeInterface {
  items?: Array<TreeInterface>
  $ref?: string
  allOf?: Array<TreeInterface>
  anyOf?: Array<TreeInterface>
  oneOf?: Array<TreeInterface>
}

let tree: Array<TreeInterface> = []

function fetchExamples(ref: string) {
  const data = retrieveObj(schema, ref)
  if (data) return data
  return null
}

function buildFromChildren(object: any) {
  const properties = buildProperties(object, object.id)
  buildRoot(object, object.id, 'children', properties)
}

function extractProps(object: PropertiesInterface, newProperty: MyObject, parent: number) {
  const obj = object.properties
  for (const property in obj) {
    if (typeof obj[property] === 'object') {
      newProperty[property] = obj[property]
      newProperty[property].parent = parent
      newProperty[property].name = property
      newProperty[property].id = String(Math.floor(Math.random() * 1000000))
      newProperty[property].children = []
    }
  }
}

function extractPatternProps(object: PropertiesInterface, newProperty: MyObject, parent: number) {
  const obj: any = object.patternProperties
  for (const property in obj) {
    if (typeof obj[property] === 'object') {
      newProperty[property] = obj[property]
      newProperty[property].parent = parent
      newProperty[property].name = property
      newProperty[property].id = String(Math.floor(Math.random() * 1000000))
      newProperty[property].children = []
    }
  }
}

function extractAdditionalProps(object: PropertiesInterface, newProperty: MyObject, parent: number) {
  const obj: any = object.additionalProperties
  const arrayProps = obj?.oneOf || obj?.anyOf
  if (arrayProps) {
    extractArrayProps(obj, newProperty, parent)
  } else {
    extractProps(obj, newProperty, parent)
  }
}

function extractArrayProps(object: PropertiesInterface, newProperty: MyObject, parent: number) {
  if (object.anyOf || object.allOf || object.oneOf) {
    const arrayOfProps: any = object.allOf || object.oneOf || object.anyOf
    if (arrayOfProps) {
      for (let i = 0; i < arrayOfProps.length; i++) {
        if (arrayOfProps[i].$ref) {
          const newRef = arrayOfProps[i]['$ref'].split('/').slice(-1)[0]
          const title = newRef.split('.')[0]
          newProperty[title] = arrayOfProps[i]
          newProperty[title].parent = parent
        } else {
          const children = arrayOfProps[i]
          const patterns = children?.patternProperties
          const properties = children?.properties
          if (patterns) {
            extractPatternProps(patterns, newProperty, parent)
          }
          if (properties) {
            extractProps(children, newProperty, parent)
          }
          if (arrayOfProps[i]?.oneOf) {
            const title = object.name
            const a = arrayOfProps[i].oneOf
            for (let i = 0; i < a.length; i++) {
              newProperty[title] = children.oneOf && children.oneOf[i]
              newProperty[title].parent = parent
              newProperty[title].name = title
              newProperty[title].id = String(Math.floor(Math.random() * 1000000))
              newProperty[title].children = []
            }
          }
        }
      }
    }
  }
}

function extractItems(object: PropertiesInterface, newProperty: MyObject, parent: number) {
  const items = object.items
  const arrayItems = items.oneOf || items.allOf || items.anyOf
  if (items.properties) {
    extractProps(items, newProperty, parent)
  }
  if (arrayItems) {
    extractArrayProps(items, newProperty, parent)
  }
}

function buildProperties(object: PropertiesInterface, parent: number) {
  let newProperty: any = {}
  if (object.properties) {
    extractProps(object, newProperty, parent)
  }
  if (object.patternProperties) {
    extractPatternProps(object, newProperty, parent)
  }
  if (object.additionalProperties && object.additionalProperties !== false) {
    extractAdditionalProps(object, newProperty, parent)
  }
  if (object.items) {
    extractItems(object, newProperty, parent)
  }
  if (!object.properties && !object.patternProperties && !object.additionalProperties) {
    extractArrayProps(object, newProperty, parent)
  }
  return newProperty
}

function buildRoot(object: TreeInterface, parentId: number, type: string, properties: MyObject) {
  if (type === 'initial') {
    const properties = buildProperties(schema, parentId)
    object.title = schema.title
    object.required = schema.required

    for (const property in properties) {
      object.children.push({
        ...properties[property],
        parent: parentId,
        name: property,
        id: String(Math.floor(Math.random() * 1000000)),
        children: [],
      })
    }
    const objChildren: any = object.children
    for (let i = 0; i < objChildren.length; i++) {
      if (objChildren[i]['$ref']) {
        const res = fetchExamples(objChildren[i]['$ref'])
        if (res?.description) {
          objChildren[i].description = res.description
        }
        if (res?.required) {
          objChildren[i].required = res.required
        }
        if (res?.examples) {
          objChildren[i].examples = res.examples
        }
      }
      buildFromChildren(objChildren[i])
    }
  } else {
    if (!object.children) {
      object['children'] = []
    }

    if (object.children.length <= 0) {
      for (const property in properties) {
        object.children.push({
          ...properties[property],
          parent: parentId || object.id,
          name: properties[property].title || property,
          id: properties[property].id || String(Math.floor(Math.random() * 1000000)),
          children: properties[property].children || [],
        })
      }
    }
    const objChildren: any = object.children
    for (let i = 0; i < objChildren.length; i++) {
      if (objChildren[i]['$ref']) {
        const res = fetchExamples(objChildren[i]['$ref'])
        if (res?.description) {
          objChildren[i].description = res.description
        }
        if (res?.required) {
          objChildren[i].required = res.required
        }
        if (res?.examples) {
          objChildren[i].examples = res.examples
        }
      }
      if (objChildren[i].children.length <= 0) {
        buildFromChildren(objChildren[i])
      }
    }
  }
}

export default async function buildTree(schemaObject: PropertiesInterface) {
  const parentLeaf: TreeInterface = {
    id: 1,
    name: '',
    parent: 0,
    description: '',
    children: [],
    title: '',
    $ref: '',
    required: undefined,
    examples: undefined,
  }
  schema = schemaObject
  tree[0] = parentLeaf
  buildRoot(tree[0], 1, 'initial', {})
  return tree
}
