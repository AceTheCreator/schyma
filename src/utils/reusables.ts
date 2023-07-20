
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

export function checkRefExists(obj: any, ref: any) {

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
