import { JSONSchema7Object } from "json-schema";
import { Node } from "@xyflow/react";

export interface ISchyma {
  title: string;
  description: string;
  schema: JSONSchema7Object
}

export interface IObject {
  [x: string]: any
}

export interface NodeData {
  label: string;
  id: string;
  children: Node[];  // children is an array of Node elements, or it can be any specific type you want
  description?: string;
  properties?: any;
  relations: any;
  examples?: any;
  parent: string;
}

// export interface INode extends Node {
//   data: NodeData
// }
