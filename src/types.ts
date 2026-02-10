import { JSONSchema7Object } from 'json-schema'
import { Node } from 'reactflow'

export enum CompositionType {
  OneOf = 'oneOf',
  AnyOf = 'anyOf',
  AllOf = 'allOf',
  Not = 'not',
}

export interface ISchyma {
  title: string
  description: string
  schema: JSONSchema7Object
}

export interface IObject {
  [x: string]: any
}

export interface NodeData {
  label: string
  id: string
  children: Node[] // children is an array of Node elements, or it can be any specific type you want
  description?: string
  properties?: any
  relations: any
  examples?: any
  required?: string[] // Array of required property names
  parent: string
  compositionType?: CompositionType | null
  compositionSource?: CompositionType // Tags children that came from a composition (oneOf/anyOf/not)
  isRoot?: boolean // True for the root/initial node (no left handle)
}

// export interface INode extends Node {
//   data: NodeData
// }
