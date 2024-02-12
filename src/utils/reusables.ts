import refRes from "@json-schema-tools/reference-resolver";


export async function resolveRef(ref: string, schema: any) {
  const resolver = await refRes.resolve(ref, schema)
  return resolver
}

export function nameFromRef(string: string){
  const newRef =  string.split('/').slice(-1)[0]
  return  newRef.split('.')[0]
}

export function propMerge(schema: any){
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
  console.log(mergedProps)
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
    if(node.relations){
      const rel = node.relations;
      if(rel.hasOwnProperty(id)){
        return;
      }else{
        return node;
      }
    }
    return node
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

export function checkRefExists(obj: any, ref: string) {

  if (obj && obj.$ref && obj.$ref === ref) {
    delete obj.$ref;
    return obj;
  }

  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
       checkRefExists(obj[key], ref) 
    }
  }

  return false;
}
