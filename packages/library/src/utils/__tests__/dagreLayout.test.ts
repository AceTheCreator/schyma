import { Edge, Node, Position } from 'reactflow'
import { getLayoutedElements } from '../dagreLayout'

const createNode = (id: string): Node => ({
  id,
  data: { label: id },
  position: { x: 0, y: 0 },
})

const createEdge = (id: string, source: string, target: string): Edge => ({
  id,
  source,
  target,
})

describe('getLayoutedElements', () => {
  it('applies horizontal layout and sets node handle positions', () => {
    const nodes = [createNode('A'), createNode('B')]
    const edges = [createEdge('A-B', 'A', 'B')]

    const result = getLayoutedElements(nodes, edges)

    expect(result.nodes).toHaveLength(2)
    expect(result.edges).toEqual(edges)

    const nodeA = result.nodes.find((node) => node.id === 'A')
    const nodeB = result.nodes.find((node) => node.id === 'B')

    expect(nodeA).toBeDefined()
    expect(nodeB).toBeDefined()
    expect(nodeA?.sourcePosition).toBe(Position.Right)
    expect(nodeA?.targetPosition).toBe(Position.Left)
    expect(nodeB?.sourcePosition).toBe(Position.Right)
    expect(nodeB?.targetPosition).toBe(Position.Left)

    expect(nodeB!.position.x).toBeGreaterThan(nodeA!.position.x)
    expect(Number.isFinite(nodeA!.position.x)).toBe(true)
    expect(Number.isFinite(nodeA!.position.y)).toBe(true)
    expect(Number.isFinite(nodeB!.position.x)).toBe(true)
    expect(Number.isFinite(nodeB!.position.y)).toBe(true)
  })

  it('mutates and returns the same node and edge arrays', () => {
    const nodes = [createNode('A'), createNode('B')]
    const edges = [createEdge('A-B', 'A', 'B')]

    const result = getLayoutedElements(nodes, edges)

    expect(result.nodes).toBe(nodes)
    expect(result.edges).toBe(edges)
  })
})
