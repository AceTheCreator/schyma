

  // const nodeClick = async (_event: React.MouseEvent, node: MyObject) => {
  //   if(nodeState[node.id]){
  //     const res:any = removeElementsByParent(nodes, node.id);
  //     setNodes([...res])
  //     setNodeState({});
  //   }else{
  //     const data = node.data
  //     const label = data.label;
  //     let props = data.properties;
  //     const newLabel = `${label}${data.parentLabel}`
  //     const nodeProps:any = {};
  //     if(refStorage[newLabel]){
  //       props = refStorage[newLabel].properties
  //     }else{
  //       if(label && refStorage[label]){
  //         if(label === data.parentLabel && refStorage[`${label}child`]){
  //           props = refStorage[`${label}child`].properties
  //         }else{
  //           props = refStorage[label].properties
  //         }
  //       }
  //     }
  
  //     if(props){
  //       for(let prop in props){
  //         if(refStorage[prop]){
  //           nodeProps[prop] = refStorage[prop]
  //         }else{
  //           nodeProps[prop] = props[prop]
  //         }
  //       }
  //       props = nodeProps
  //     }
  //     const children: any = [];
  //     for (const prop in props){
  //       const id = String(Math.floor(Math.random() * 1000000));
  //       const newProp = {
  //         id: id,
  //         data: {
  //           ...props[prop],
  //           label: prop,
  //           parent: node.id,
  //           parentLabel: label,
  //           relations: {
  //             ...data.relations,
  //             [node.id]: 'node'
  //           }
  //         },
  //         type: "output",
  //       }
  //       const checkNodeType = typeCheck(newProp.data)
  //       if(checkNodeType){
  //         newProp.type = "default"
  //       }
  //       children.push(newProp)
  //     }
  //     if(children){
  //       const itemChildren = [
  //         ...children.map((item: MyObject) => {
  //          return {
  //             id: item.id,
  //             data: item.data,
  //             style: { padding: 10, background: '#1E293B', color: 'white' },
  //             sourcePosition: 'right',
  //             targetPosition: 'left',
  //             position,
  //             draggable: false,
  //           }
  //         }),
  //       ]
  //       const newEdges:any = [
  //         ...edges,
  //         ...itemChildren.map((item) => {
  //           return {
  //             id: String(Math.floor(Math.random() * 1000000)),
  //             source: item?.data.parent,
  //             target: item?.id,
  //             animated: true,
  //             // style: { stroke: required && required.includes(item.data.label) ? '#EB38AB' : 'gray' },
  //             markerEnd: {
  //               type: MarkerType.ArrowClosed,
  //             },
  //           }
  //         }),
  //       ]
  //       const newNodes: any = nodes.concat(children)
  //       const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges, 'LR')
  //       setNodes([...layoutedNodes])
  //       setEdges([...layoutedEdges])
  //       if (itemChildren.length > 3) {
  //         focusNode(itemChildren[3].position.x, itemChildren[3].position.y, 0.9)
  //       }
  //     }else{
  //       console.log('no children please')
  //     }
  //     setNodeState({...nodeState, [node.id]: 'node'})
  //   }
  // }