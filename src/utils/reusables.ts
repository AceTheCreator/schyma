const position = { x: 0, y: 0 };

export function extractProps(schema:any, nodes:any, parent:any){
  if(typeof schema === 'object'){
    for (let property in schema){
      console.log(schema[property])
      const id = String(Math.floor(Math.random() * 1000000));
      schema[property].parent = parent
      schema[property].id = id 
      nodes.push({
        id: id,
        position,
        parent: parent,
        data: {
          label: property
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
    console.log(schema)
    // extractProps(schema, nodes, parent)
  }
}

export function extractArrayProps(props: any, nodes:any, parent:any){
  for (let i = 0; i < props.length; i++) {
    if (props[i].$ref) {
      const id = String(Math.floor(Math.random() * 1000000));
      props[i].id = id;
      props[i].parent = parent;
      const newRef = props[i]['$ref'].split('/').slice(-1)[0]
      const title = newRef.split('.')[0]
      nodes.push({
        id: id,
        position,
        parent: parent,
        data: {
          label: title
        }
      })
    }
  }
}

function removeByAttr(arr: any[], attr:string, value:string) {
  var i = arr.length;
  while (i--) {
    if (
      arr[i] &&
      arr[i].hasOwnProperty(attr) &&
      arguments.length > 2 &&
      arr[i][attr] === value
    ) {
      arr.splice(i, 1);
    }
  }
  return arr;
}

export function removeChildren(parentNode: any, nodes: any) {
  let newNodes = nodes;
  const children = parentNode.children;
  if (children.length > 0) {
    for (let i = 0; i < children.length; i++) {
      newNodes = removeByAttr(nodes, "id", children[i].id);
      if (children[i].children.length > 0) {
        removeChildren(children[i], newNodes);
      }
    }
  }
  return newNodes;
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

export function resolveRef(ref: string, rootSchema: any) {
  // Assuming the ref is a local reference within the same schema
  const refPath: string[] = ref.substring(1).split('/') // Remove the leading '#' and split the path
  let resolvedSchema = rootSchema
  let segmentHolder: any = {}
  segmentHolder = rootSchema[refPath[1]]
  // currently only looking into first depth definitions
  if (refPath.length > 3) {
    resolvedSchema = undefined
  } else {
    resolvedSchema = segmentHolder[refPath[2]]
  }
  for (let i = 0; i < refPath.length; i++) {
    if (refPath[i] === 'definitions') {
      segmentHolder = rootSchema[refPath[i]]
    }
  }
  checkRefExists(resolvedSchema, ref)
  return resolvedSchema
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
