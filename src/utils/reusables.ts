import refRes from "@json-schema-tools/reference-resolver";


export async function resolveRef(ref: string, schema: any) {
  const resolver = await refRes.resolve(ref, schema)
  return resolver
}

export function nameFromRef(string: string){
  const newRef =  string.split('/').slice(-1)[0]
  return  newRef.split('.')[0]
}

export function propMerge(schema: { [x: string]: any } ){
  let mergedProps = {};
  const {properties, patternProperties, additionalProperties, items, oneOf} = schema;
  const arrWithObject = additionalProperties || items

  const arrExtractor = (items:any) => {
    const props = arrayToProps(items)
    mergedProps = {...mergedProps, ...props}
  }
  if(schema.patternProperties){
    mergedProps = {...mergedProps,...patternProperties}
  }
  if(schema.properties){
    mergedProps = {...mergedProps, ...properties}
  }
  if(arrWithObject){
    if(arrWithObject.oneOf){
      arrExtractor(arrWithObject.oneOf)
    }
  }
  if(oneOf){
    arrExtractor(oneOf)
  }
  return mergedProps
}

export function arrayToProps (props: any) {
  const propObj:any = {};
  for(let i = 0; i < props.length; i++){
    if(props[i].$ref){
      const name = nameFromRef(props[i].$ref)
      propObj[name] = props[i];
    }
  }
  return propObj;
}

export function removeElementsByParent(nodes: any, id: any) {
  const result = nodes.filter((node: any) => {
    const relations = node.data.relations;
    if(relations){
      if(relations.hasOwnProperty(id)){
        return;
      }else{
        return node;
      }
    }
    return node
  });

  return result;
}


// export function typeCheck(data: any): boolean {
//   switch (true) {
//     case !!data.oneOf:
//     case !!data.anyOf:
//     case !!data.allOf:
//     case !!data.items:
//     case !! data.patternProperties:
//     case data.additionalProperties !== undefined && data.additionalProperties !== true:
//     case data.additionalItems !== undefined && data.additionalItems !== true:
//       return true;
//     default:
//       return false;
//   }
// }
