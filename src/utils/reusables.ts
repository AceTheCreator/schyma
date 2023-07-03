
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
