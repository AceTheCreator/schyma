import { CompositionType } from '../../types'
import { getCompositionType, handleCompositions } from '../compositions'

describe('getCompositionType', () => {
  it('detects known composition keywords', () => {
    expect(getCompositionType({ oneOf: [] })).toBe(CompositionType.OneOf)
    expect(getCompositionType({ anyOf: [] })).toBe(CompositionType.AnyOf)
    expect(getCompositionType({ allOf: [] })).toBe(CompositionType.AllOf)
    expect(getCompositionType({ not: {} })).toBe(CompositionType.Not)
  })

  it('returns null when schema is not a composition', () => {
    expect(getCompositionType({ type: 'object', properties: {} })).toBe(null)
  })
})

// describe('arrayToProps', () => {
//   it('uses schema names derived from title, ref, const, type, and fallback label', () => {
//     const result = arrayToProps(
//       [
//         { title: 'Queue' },
//         { $ref: '#/components/schemas/User' },
//         { properties: { kind: { const: 'topic' } } },
//         { type: 'string' },
//         { type: 'object' },
//       ],
//       'newProps',
//     )

//     console.log(result)

//     expect(Object.keys(result)).toEqual(['Queue', 'User', 'topic', 'string', 'item 5'])
//   })
// })

describe('handleCompositions', () => {
  it('merges allOf properties, patternProperties, additionalProperties ref, and primitive fallback', () => {
    const mergedProps: Record<string, unknown> = {}
    const schema = {
      allOf: [
        { properties: { id: { type: 'string' } } },
        { patternProperties: { '^x-': { type: 'string' } } },
        { additionalProperties: { $ref: '#/definitions/Metadata' } },
        { type: 'number' },
      ],
    }

    handleCompositions(schema, mergedProps, 'value')

    expect(mergedProps).toHaveProperty('id')
    expect(mergedProps).toHaveProperty('^x-')
    expect(mergedProps).toHaveProperty('Metadata')
    expect(mergedProps).toHaveProperty('number')
  })

  it('flattens allOf conditional branches via handleConditions', () => {
    const mergedProps: Record<string, unknown> = {}
    const schema = {
      allOf: [
        {
          if: { properties: { mode: { const: 'async' } } },
          then: { properties: { timeout: { type: 'number' } } },
          else: { properties: { retries: { type: 'number' } } },
        },
      ],
    }

    handleCompositions(schema, mergedProps, 'mode')

    expect(mergedProps).toHaveProperty('if mode = async')
    expect(mergedProps).toHaveProperty('else (mode)')
  })

  it('adds oneOf entries with composition tags and flattens condition-only entries', () => {
    const mergedProps: Record<string, any> = {}
    //TODO: Rethink flatten approach for compositions with conditions
    const schema = {
      oneOf: [
        { title: 'Queue', type: 'object' },
        {
          if: { properties: { protocol: { const: 'http' } } },
          then: { properties: { keepAlive: { type: 'boolean' } } },
          else: { properties: { keepAlive: { type: 'number' } } },
        },
      ],
    }

    handleCompositions(schema, mergedProps, 'destination')

    expect(mergedProps).toHaveProperty('Queue')
    expect(mergedProps.Queue._compositionSource).toBe(CompositionType.OneOf)
    expect(mergedProps).toHaveProperty('if protocol = http')
    expect(mergedProps).toHaveProperty('else (protocol)')
  })

  it('adds anyOf and not entries with the correct composition tags', () => {
    const mergedProps: Record<string, any> = {}
    const schema = {
      anyOf: [{ $ref: '#/components/schemas/Email' }],
      not: { type: 'null' },
    }

    handleCompositions(schema, mergedProps, 'channel')
    expect(mergedProps).toHaveProperty('Email')
    expect(mergedProps.Email._compositionSource).toBe(CompositionType.AnyOf)
    expect(mergedProps).toHaveProperty('null')
    expect(mergedProps.null._compositionSource).toBe(CompositionType.Not)
  })

  it('uses ref name for not schemas that reference another schema', () => {
    const mergedProps: Record<string, any> = {}
    const schema = {
      not: { $ref: '#/definitions/DeprecatedPayload' },
    }

    handleCompositions(schema, mergedProps, 'payload')

    expect(mergedProps).toHaveProperty('DeprecatedPayload')
    expect(mergedProps.DeprecatedPayload._compositionSource).toBe(CompositionType.Not)
  })
})
