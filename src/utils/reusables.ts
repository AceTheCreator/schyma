import refRes from "@json-schema-tools/reference-resolver";


export async function resolveRef(ref: string, schema: any) {
  const resolver = await refRes.resolve(ref, schema)
  return resolver
  // // Assuming the ref is a local reference within the same schema
  // const refPath: string[] = ref.substring(1).split('/') // Remove the leading '#' and split the path
  // let resolvedSchema = rootSchema
  // let segmentHolder: any = {}
  // segmentHolder = rootSchema[refPath[1]]
  // // currently only looking into first depth definitions
  // if (refPath.length > 3) {
  //   resolvedSchema = undefined
  // } else {
  //   resolvedSchema = segmentHolder[refPath[2]]
  // }
  // for (let i = 0; i < refPath.length; i++) {
  //   if (refPath[i] === 'definitions') {
  //     segmentHolder = rootSchema[refPath[i]]
  //   }
  // }
  // checkRefExists(resolvedSchema, ref)
  // return resolvedSchema
}

export function deepCopy(obj:any, copiesMap = new WeakMap()) {
  // If the object is null or not an object, return it as is
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // If the object has already been copied, return the copy
  if (copiesMap.has(obj)) {
    return copiesMap.get(obj);
  }

  // Create an empty object or array to hold the copied properties
  const newObj:any = Array.isArray(obj) ? [] : {};

  // Add the new object to the copiesMap before copying properties to handle circular references
  copiesMap.set(obj, newObj);

  // Copy each property from the original object to the new object
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = deepCopy(obj[key], copiesMap); // Recursively copy nested objects
    }
  }

  return newObj;
}

const position = { x: 0, y: 0 };

export function extractProps(schema:any, nodes:any, parent:any){
  if(typeof schema === 'object'){
    for (let property in schema){
      if(typeof schema[property] === 'string' || typeof schema[property] === 'boolean'){
        schema[property] = {}
      }
      const id = String(Math.floor(Math.random() * 1000000));
      schema[property].parent = parent.id
      schema[property].id = id 
      let relations = {};
      if(parent.relations){
        relations = {
          ...parent.relations,
          [parent.id]: 'node'
        }
      }else{
        relations = {
          [parent.id] :'node'
        }
      }
      schema[property].relations = relations
      nodes.push({
        id: id,
        position,
        parent: parent.id,
        relations,
        data: {
          label: property,
          schema: schema[property]
        }
      })
    }
  }
}

export function extractAdditionalProps(schema:any, nodes:any, parent:any){
  const arrayOfProps = schema?.oneOf || schema?.anyOf
  if(arrayOfProps){
    extractArrayProps(arrayOfProps, nodes, parent)
  }else{
    if(typeof schema === 'object' && schema.type !== 'string' && schema.type !== 'array'){
      let title = '';
      if(schema.$ref){
        title = nameFromRef(schema.$ref)
      }
      const id = String(Math.floor(Math.random() * 1000000));
      schema.parent = parent.id;
      schema.id = id
      let relations = {};
      if(parent.relations){
        relations = {
          ...parent.relations,
          [parent.id]: 'node'
        }
      }else{
        relations = {
          [parent.id] :'node'
        }
      }
      schema.relations = relations
      nodes.push({
        id: id,
        position,
        type: schema.properties || schema.additionalProperties && 'output',
        parent: parent.id,
        relations,
        data: {
          label: title,
          schema: schema
        }
      })
    }
  }
}

function nameFromRef(string: string){
  const newRef =  string.split('/').slice(-1)[0]
  return  newRef.split('.')[0]
}

export function extractArrayProps(props: any, nodes:any, parent:any){
  for (let i = 0; i < props.length; i++) {
    if (props[i].$ref) {
      const id = String(Math.floor(Math.random() * 1000000));
      props[i].id = id;
      props[i].parent = parent.id;
      const title = nameFromRef(props[i].$ref);
      let relations = {};
      if(parent.relations){
        relations = {
          ...parent.relations,
          [parent.id]: 'node'
        }
      }else{
        relations = {
          [parent.id] :'node'
        }
      }
      props[i].relations = relations
      nodes.push({
        id: id,
        position,
        relations,
        parent: parent.id,
        data: {
          label: title,
          schema: props[i]
        }
      })
    }else{
      const children = props[i]
      const patterns = children?.patternProperties
      const properties = children?.properties
      if(patterns){
        extractProps(patterns, nodes, parent)
      }
      if(properties){
        extractProps(properties, nodes, parent)
      }
      if(props[i].oneOf){
        // create title from parent ref
        const title = nameFromRef(parent.$ref);
        const id = String(Math.floor(Math.random() * 1000000));
        props[i].id = id;
        props[i].parent = parent.id;
        let relations = {};
        if(parent.relations){
          relations = {
            ...parent.relations,
            [parent.id]: 'node'
          }
        }else{
          relations = {
            [parent.id] :'node'
          }
        }
        props[i].relations = relations
        nodes.push({
          id: id,
          position,
          relations,
          parent: parent.id,
          data: {
            label: `${title}Object`,
            schema: props[i]
          }
        });
        // extractArrayProps(props[i].oneOf, nodes, {id: id})
      }
    }
  }
}

// export function removeElementsByParent(array: any, parent:any) {
//   const filteredArray = array.filter((item: any) => {
//     if(item?.relations){
//       const items = item.relations;
//       if(items.hasOwnProperty(parent)){
//         return;
//       }else{
//         return item
//       }
//     }
//   });
//   return filteredArray;
// }

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
