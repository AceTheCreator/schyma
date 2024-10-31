import refRes from "@json-schema-tools/reference-resolver";


export async function resolveRef(ref: string, schema: any) {
  const resolver = await refRes.resolve(ref, schema)
  return resolver
}

export function nameFromRef(string: string){
  const newRef =  string.split('/').slice(-1)[0]
  return  newRef.split('.')[0]
}

export function propMerge(schema: any, label: string){
  let mergedProps = {};
  const {properties, patternProperties, additionalProperties, items, oneOf, allOf, anyOf, not} = schema;
  const arrWithObject = additionalProperties || items
  const arrExtractor = (items:any) => {
    const props = arrayToProps(items, label)
    mergedProps = {...mergedProps, ...props}
  }
  if(schema.patternProperties){
    mergedProps = {...mergedProps,...patternProperties}
  }
  if(schema.properties){
    mergedProps = {...mergedProps, ...properties}
  }
  if(arrWithObject){
    const {oneOf, allOf, anyOf} = arrWithObject
    if(oneOf || allOf || anyOf){
      const items = oneOf || anyOf || not;
      arrExtractor(items)
    }
    if(arrWithObject.$ref) {
      const name = nameFromRef(arrWithObject.$ref)
      mergedProps = {...mergedProps, [name]: arrWithObject}
    }
  }
  // handling allOf case seperatly
  if(allOf){
    let propObj:any = {};
    for(let i = 0; i < allOf.length; i++){
      if(allOf[i].type === 'object'){
        if(allOf[i].properties){
          propObj = allOf[i].properties
        }else{
          propObj[allOf[i].type] = allOf[i]
        }
      }else if(allOf[i].$ref){
        const name = nameFromRef(allOf[i].$ref)
        propObj[name] = allOf[i];
      }else{
        propObj[allOf[i].type] = allOf[i]
      }
    }
    mergedProps = {...mergedProps, ...propObj}
  }
  if(oneOf || anyOf || not){
    const items = oneOf || anyOf || not;
    arrExtractor(items)
  }
  return mergedProps
}

export function arrayToProps (props: any, label: string) {
  const propObj:any = {};
  for(let i = 0; i < props.length; i++){
    if(props[i].$ref){
      const name = nameFromRef(props[i].$ref)
      propObj[name] = props[i];
    }else{
      if(props[i].type === 'object'){
          const objectName = props[i].title || `${label}Object`;
          propObj[objectName] = props[i]
      }else{
        propObj[props[i].type] = props[i]
      }
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

export function removeEdgesByParent(edges: any, id: any) {
  const result = edges.filter((edge: any) => {
    if (edge.source === id) {
      return false;
    }
    return true;
  });

  return result;
}

export function retrieveObj(theObject: any, key: string | undefined) {
  var result:any = null;
  if (theObject instanceof Array) {
    for (var i = 0; i < theObject.length; i++) {
      result = retrieveObj(theObject[i], key);
      if (result) {
        break;
      }
    }
  } else {
    for (var prop in theObject) {
      if (prop == key) {
        return theObject[prop];
      }
      if (
        theObject[prop] instanceof Object ||
        theObject[prop] instanceof Array
      ) {
        result = retrieveObj(theObject[prop], key);
        if (result) {
          break;
        }
      }
    }
  }
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