import { JSONSchema4Object, JSONSchema7Object } from 'json-schema'
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
  schema: JSONSchema4Object | JSONSchema7Object
  defaultCollapsed?: boolean
}

export interface IObject {
  [x: string]: any
}

export interface NodeData {
  label: string
  id: string
  children: Node[]
  description?: string
  properties?: any
  relations: any
  examples?: any
  required?: string[]
  parent: string
  compositionType?: CompositionType | null
  compositionSource?: CompositionType
  isRoot?: boolean
}

// export interface INode extends Node {
//   data: NodeData
// }
