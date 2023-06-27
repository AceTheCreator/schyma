// import { writeFileSync } from "fs";
// import { resolve } from "path";
import buildTree from "./buildtree.js";

export const startBuild = async (schema: any) => {
    try {
        const tree: any = buildTree(schema);
        return tree
        // return writeFileSync(
        //     resolve(__dirname, `../configs`, `${version}.json`),
        //     JSON.stringify(trees)
        // );
    } catch (error) {
        console.log(error);
    }
}

