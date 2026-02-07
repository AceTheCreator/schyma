import { getCompositionType, propMerge, arrayToProps, nameFromRef } from './reusables'
import { CompositionType } from '../types'

describe('getCompositionType', () => {
  it('returns OneOf for oneOf schemas', () => {
    expect(getCompositionType({ oneOf: [] })).toBe(CompositionType.OneOf)
  })

  it('returns AnyOf for anyOf schemas', () => {
    expect(getCompositionType({ anyOf: [] })).toBe(CompositionType.AnyOf)
  })

  it('returns AllOf for allOf schemas', () => {
    expect(getCompositionType({ allOf: [] })).toBe(CompositionType.AllOf)
  })

  it('returns Not for not schemas', () => {
    expect(getCompositionType({ not: {} })).toBe(CompositionType.Not)
  })

  it('returns null for regular schemas', () => {
    expect(getCompositionType({ type: 'object', properties: {} })).toBe(null)
  })
})

describe('getNameFromRef', () => {
  it('extracts name from definition ref', () => {
    expect(nameFromRef('#/definitions/Message')).toBe('Message')
  })

  it('extracts name from components ref', () => {
    expect(nameFromRef('#/components/schemas/User')).toBe('User')
  })

  // Coming back to this test... gave me an idea for external
  // referencing

  it('handles file refs', () => {
    expect(nameFromRef('./common/types.json')).toBe('types')
  })
})

describe('convertArrayToPropertyObject', () => {
  it('uses title for named schemas', () => {
    const schemas = [{ title: 'Queue', type: 'object' }]
    const result = arrayToProps(schemas, 'destination')
    expect(Object.keys(result)).toEqual(['Queue'])
  })

  it('uses $ref name for ref schemas', () => {
    const schemas = [{ $ref: '#/definitions/Message' }]
    const result = arrayToProps(schemas, 'item')
    expect(Object.keys(result)).toEqual(['Message'])
  })

  it('uses const discriminator for objects with const', () => {
    const schemas = [{ properties: { type: { const: 'queue' } } }, { properties: { type: { const: 'topic' } } }]
    const result = arrayToProps(schemas, 'destination')
    expect(Object.keys(result)).toEqual(['queue', 'topic'])
  })

  it('uses primitive type as name', () => {
    const schemas = [{ type: 'string' }, { type: 'number' }]
    const result = arrayToProps(schemas, 'value')
    expect(Object.keys(result)).toEqual(['string', 'number'])
  })

  it('falls back to indexed name for unnamed object schemas', () => {
    const schemas = [
      { type: 'object', properties: { foo: {} } },
      { type: 'object', properties: { bar: {} } },
    ]
    const result = arrayToProps(schemas, 'item')
    expect(Object.keys(result)).toEqual(['item 1', 'item 2'])
  })
})

describe('propertiesMerge', () => {
  it('merges patternProperties', () => {
    const schema = {
      patternProperties: {
        '^x-': { type: 'string' },
      },
    }
    const result = propMerge(schema, 'test')
    expect(Object.keys(result)).toEqual(['^x-'])
  })

  it('flattens oneOf into merged props', () => {
    const schema = {
      oneOf: [
        { title: 'CreditCard', type: 'object', properties: { cardNumber: { type: 'string' } } },
        { title: 'BankTransfer', type: 'object', properties: { accountNumber: { type: 'string' } } },
      ],
    }
    const result = propMerge(schema, 'paymentMethod')
    expect(Object.keys(result)).toContain('CreditCard')
    expect(Object.keys(result)).toContain('BankTransfer')
  })

  it('tags oneOf children with _compositionSource', () => {
    const schema = {
      oneOf: [{ title: 'Queue', type: 'object' }],
    }
    const result = propMerge(schema, 'test')
    expect(result.Queue).toHaveProperty('_compositionSource', CompositionType.OneOf)
  })

  it('tags anyOf children with _compositionSource', () => {
    const schema = {
      anyOf: [
        { title: 'Email', type: 'object', properties: { address: { type: 'string' } } },
        { title: 'SMS', type: 'object', properties: { phoneNumber: { type: 'string' } } },
      ],
    }
    const result = propMerge(schema, 'notification')
    expect(result.Email).toHaveProperty('_compositionSource', CompositionType.AnyOf)
    expect(result.SMS).toHaveProperty('_compositionSource', CompositionType.AnyOf)
  })

  it('recursively processes items schema', () => {
    const schema = {
      type: 'array',
      items: {
        properties: {
          name: { type: 'string' },
        },
      },
    }
    const result = propMerge(schema, 'test')
    expect(Object.keys(result)).toContain('name')
  })

  it('propagates _nestedComposition from items with composition', () => {
    const schema = {
      type: 'array',
      items: {
        oneOf: [
          { title: 'Rectangle', type: 'object', properties: { width: { type: 'number' } } },
          { title: 'Circle', type: 'object', properties: { radius: { type: 'number' } } },
        ],
      },
    }
    const result = propMerge(schema, 'shapes')
    expect(result._nestedComposition).toBe(CompositionType.OneOf)
  })

  it('handles if/then/else conditions', () => {
    const schema = {
      if: { properties: { type: { const: 'premium' } } },
      then: { properties: { discount: { type: 'number' } } },
      else: { properties: { standard: { type: 'boolean' } } },
    }
    const result = propMerge(schema, 'test')
    expect(Object.keys(result)).toContain('if type = premium')
    expect(Object.keys(result)).toContain('else (type)')
  })

  it('merges properties with oneOf (Solace-style schema)', () => {
    const schema = {
      type: 'array',
      items: {
        properties: {
          deliveryMode: { type: 'string' },
        },
        oneOf: [
          { properties: { destinationType: { const: 'queue' } } },
          { properties: { destinationType: { const: 'topic' } } },
        ],
      },
    }
    const result = propMerge(schema, 'destinations')

    // Should have deliveryMode from properties
    expect(Object.keys(result)).toContain('deliveryMode')
    // Should have queue and topic from oneOf
    expect(Object.keys(result)).toContain('queue')
    expect(Object.keys(result)).toContain('topic')
    // oneOf items should be tagged
    expect(result.queue).toHaveProperty('_compositionSource', CompositionType.OneOf)
    expect(result.topic).toHaveProperty('_compositionSource', CompositionType.OneOf)
    // deliveryMode should NOT be tagged
    expect(result.deliveryMode).not.toHaveProperty('_compositionSource')
    // Should propagate nested composition
    expect(result._nestedComposition).toBe(CompositionType.OneOf)
  })
})
