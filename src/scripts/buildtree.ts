import { retrieveObj } from "../utils/reusables";


let schema: PropertiesInterface

type TreeInterface = {
  required: any;
  examples: any;
  id: number;
  name: string;
  parent: number;
  description: string;
  children: Array<TreeInterface>;
  $ref?: string;
  title: string;
};

type MyObject = { [x: string]: any };

interface PropertiesInterface extends TreeInterface {
  properties?: MyObject;
  additionalProperties?: AdditionalProperties | Boolean;
  patternProperties?: MyObject;
  $id?: string;
  allOf?: Array<PropertiesInterface>;
  anyOf?: Array<PropertiesInterface>;
  oneOf?: Array<PropertiesInterface>;
  items?: any;
  definitions?: any
}

interface AdditionalProperties extends TreeInterface {
  items?: Array<TreeInterface>;
  $ref?: string;
  allOf?: Array<TreeInterface>;
  anyOf?: Array<TreeInterface>;
  oneOf?: Array<TreeInterface>;
}


let tree: Array<TreeInterface> = [];


function fetchExamples(ref: string) {
  const data = retrieveObj(schema, ref);
  if (data) return data;
  return null;
}

function buildFromChildren(object: any) {
  const properties = buildProperties(object, object.id);
  buildRoot(object, object.id, "children", properties);
}


function extractProps(
  object: PropertiesInterface,
  newProperty: MyObject,
  parent: number
) {
  const obj = object.properties;
  for (const property in obj) {
    // TODO: Restructure for message properties
    // if (obj[property].oneOf) {
    //   // extractAdditionalProps(obj[property], newProperty, parent)
    //   obj[property].additionalProperties = {
    //     oneOf: obj[property].oneOf,
    //   };
    //   const newPatterns = obj[property];
    //   const props = buildProperties(newPatterns, newPatterns.id);
    //   buildRoot(newPatterns, newPatterns.id, "children", props);
    // }
    if (typeof obj[property] === "object") {
      newProperty[property] = obj[property];
      newProperty[property].parent = parent;
      newProperty[property].name = property;
      newProperty[property].id = String(Math.floor(Math.random() * 1000000));
      newProperty[property].children = [];
    //  if (obj[property].patternProperties) {
    //     const patterns = obj[property];
    //     const props = buildProperties(patterns, patterns.id);
    //     buildRoot(patterns, patterns.id, "children", props);
    //     newProperty[property] = patterns;
    //   }
    //  else {
    //    console.log(obj[property])
    //   newProperty[property] = obj[property];
    //   newProperty[property].parent = parent;
    //   newProperty[property].name = property;
    //   newProperty[property].id = String(Math.floor(Math.random() * 1000000));
    //   newProperty[property].children = [];
    //   }
    }
  }
}

function extractPatternProps(
  object: PropertiesInterface,
  newProperty: MyObject,
  parent: number
) {
  const obj: any = object.patternProperties;
  // if (obj[Object.keys(obj)[0]] && obj[Object.keys(obj)[0]].oneOf) {
  //   const arrayProps = obj[Object.keys(obj)[0]].oneOf;
  //   console.log(arrayProps)
  //   for (let i = 0; i < arrayProps.length; i++) {
  //     const newRef = arrayProps[i]["$ref"].split("/").slice(-1)[0];
  //     const title = newRef.split(".")[0];
  //     newProperty[title] = arrayProps[i];
  //   }
  //   delete obj[Object.keys(obj)[0]];
  // }
  for (const property in obj) {
    if (typeof obj[property] === "object") {
      newProperty[property] = obj[property];
      newProperty[property].parent = parent;
      newProperty[property].name = property;
      newProperty[property].id =  String( Math.floor(Math.random() * 1000000))
      newProperty[property].children = [];
    }
  }
}

function extractAdditionalProps(
  object: PropertiesInterface,
  newProperty: MyObject,
  parent: number
) {
  const obj: any = object.additionalProperties;
  const arrayProps = obj?.oneOf || obj?.anyOf;
  if (arrayProps) {
    extractArrayProps(obj, newProperty, parent)
  } else {
    extractProps(obj, newProperty, parent)
  }
}

function extractArrayProps(
  object: PropertiesInterface,
  newProperty: MyObject,
  parent: number
) {
  // if (object.items) {
  //   const items = object.items
  //   for (const item in items) {
  //     if (item === "$ref") {
  //       const newRef = items[item].split("/").slice(-1)[0];
  //       const title = newRef.split(".")[0];
  //       newProperty[title] =  {}
  //       newProperty[title].parent = parent;
  //       newProperty[title][item] = items[item]
  //       newProperty[title].name = title;
  //       newProperty[title].id = String(Math.floor(Math.random() * 1000000));
  //       newProperty[title].children = [];
  //     }
  //   }
  // }
  if (object.anyOf || object.allOf || object.oneOf) {
    const arrayOfProps:any = object.allOf || object.oneOf || object.anyOf;
    if (arrayOfProps) {
      for (let i = 0; i < arrayOfProps.length; i++) {
        const children = arrayOfProps[i];
          const patterns = children.patternProperties;
          const properties = children.properties;
          if (patterns) {
            for (const property in patterns) {
              newProperty[property] = patterns[property];
              newProperty[property].id = String(
                Math.floor(Math.random() * 1000000)
              );
              newProperty[property].name = property;
              newProperty[property].parent = object.id;
            }
          }
          if (properties) {
            for (const property in properties) {
              if (typeof properties[property] === 'object') {
                newProperty[property] = properties[property];
              newProperty[property].id = String(
                Math.floor(Math.random() * 1000000)
              );
              newProperty[property].name = property;
              newProperty[property].parent = object.id;
              }
            }
        }
        if (arrayOfProps[i].oneOf) {
            const title = object.name;
            const a = arrayOfProps[i].oneOf;
            for (let i = 0; i < a.length; i++) {
              newProperty[title] = children.oneOf && children.oneOf[i];
              newProperty[title].parent = parent;
              newProperty[title].name = title;
              newProperty[title].id = String(Math.floor(Math.random() * 1000000));
              newProperty[title].children = [];
            }
          }
      }
    }
  }
}

function buildProperties(object: PropertiesInterface, parent: number) {
  let newProperty: any = {};
  if (object.properties) {
    extractProps(object, newProperty, parent);

  }
  if (object.patternProperties) {
    extractPatternProps(object, newProperty, parent);

  }
  if (object.additionalProperties && object.additionalProperties !== false) {
    extractAdditionalProps(object, newProperty, parent);
  }
  if (
    !object.properties &&
    !object.patternProperties &&
    !object.additionalProperties
  ) {
    extractArrayProps(object, newProperty, parent);
  }
  return newProperty;
}

function buildRoot(
  object: TreeInterface,
  parentId: number,
  type: string,
  properties: MyObject
) {
  if (type === "initial") {
    const properties = buildProperties(schema, parentId);
    object.title = schema.title;
    object.required = schema.required;
    
    for (const property in properties) {
      if (properties[property].type === "array" && properties[property].items) {
        const items = properties[property].items;
        properties[property] = {
          ...properties[property],
          ...items
        }
        // properties[property][Object.keys(items)[0]] = Object.values(items)[0];
        delete properties[property].items;
      }
      object.children.push({
        ...properties[property],
        parent: parentId,
        name: property,
        id: String(Math.floor(Math.random() * 1000000)),
        children: [],
      });
    }
    const objChildren: any = object.children;
    for (let i = 0; i < objChildren.length; i++) {
      if (objChildren[i]["$ref"]) {
        const res = fetchExamples(objChildren[i]["$ref"]);
        if (res?.description) {
          objChildren[i].description = res.description;
        }
        if (res?.required) {
          objChildren[i].required = res.required;
        }
        if (res?.examples) {
          objChildren[i].examples = res.examples;
        }
      }
      // objChildren[i].description = "hello"
      buildFromChildren(objChildren[i]);
    }
  }
   else {
    if (!object.children) {
      object["children"] = [];
    }

    if (object.children.length <= 0) {
      for (const property in properties) {
        if (
          properties[property].type === "array" &&
          properties[property].items
        ) {
          const items = properties[property].items;
          properties[property] = {
          ...properties[property],
          ...items
          }
          properties[property][Object.keys(items)[0]] = Object.values(items)[0];
          delete properties[property].items;
        }
          object.children.push({
            ...properties[property],
            parent: parentId || object.id,
            name: properties[property].title || property,
            id:
              properties[property].id ||
             String(Math.floor(Math.random() * 1000000)),
            children: properties[property].children || [],
          });
      }
    }
    const objChildren: any = object.children;
    for (let i = 0; i < objChildren.length; i++) {
      if (objChildren[i]["$ref"]) {
        const res = fetchExamples(objChildren[i]["$ref"]);
        if (res?.description) {
          objChildren[i].description = res.description;
        }
        if (res?.required) {
          objChildren[i].required = res.required;
        }
        if (res?.examples) {
          objChildren[i].examples = res.examples;
        }
      }
      if (objChildren[i].children.length <= 0) {
        buildFromChildren(objChildren[i]);
      }
    }
  }
}

export default async function buildTree(schemaObject: PropertiesInterface) {
  const parentLeaf: TreeInterface = {
      id: 1,
      name: "",
      parent: 0,
      description: "",
      children: [],
      title: "",
      $ref: "",
      required: undefined,
      examples: undefined
  };
  schema = schemaObject
  tree[0] = parentLeaf
  buildRoot(tree[0], 1, "initial", {});
  return tree;
}
