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