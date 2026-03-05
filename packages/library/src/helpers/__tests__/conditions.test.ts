import { handleConditions } from '../conditions'

describe('handleConditions', () => {
  it('does nothing when no if schema is provided', () => {
    const mergedProps: Record<string, unknown> = { existing: { type: 'string' } }

    handleConditions({ then: { properties: { a: { type: 'string' } } } }, mergedProps)

    expect(mergedProps).toEqual({ existing: { type: 'string' } })
  })

  it('uses const-based labels and adds then/else entries', () => {
    const mergedProps: Record<string, unknown> = {}
    const thenSchema = { properties: { timeout: { type: 'number' } } }
    const elseSchema = { properties: { retries: { type: 'number' } } }

    handleConditions(
      {
        if: { properties: { mode: { const: 'async' } } },
        then: thenSchema,
        else: elseSchema,
      },
      mergedProps,
    )

    expect(mergedProps).toHaveProperty('if mode = async', thenSchema)
    expect(mergedProps).toHaveProperty('else (mode)', elseSchema)
  })

  it('supports enum (single value) labels', () => {
    const mergedProps: Record<string, unknown> = {}

    handleConditions(
      {
        if: { properties: { transport: { enum: ['http'] } } },
        then: { type: 'object' },
      },
      mergedProps,
    )

    expect(mergedProps).toHaveProperty('if transport = http')
  })

  it('supports property type-check labels', () => {
    const mergedProps: Record<string, unknown> = {}

    handleConditions(
      {
        if: { properties: { token: { type: 'string' } } },
        then: { type: 'object' },
      },
      mergedProps,
    )

    expect(mergedProps).toHaveProperty('if token is string')
  })

  it('falls back to property-name label when only property exists', () => {
    const mergedProps: Record<string, unknown> = {}

    handleConditions(
      {
        if: { properties: { enabled: {} } },
        then: { type: 'object' },
      },
      mergedProps,
    )

    expect(mergedProps).toHaveProperty('if enabled')
  })

  it('supports required-based labels', () => {
    const mergedProps: Record<string, unknown> = {}

    handleConditions(
      {
        if: { required: ['apiKey'] },
        then: { type: 'object' },
        else: { type: 'object' },
      },
      mergedProps,
    )

    expect(mergedProps).toHaveProperty('if apiKey exists')
    expect(mergedProps).toHaveProperty('else (apiKey)')
  })

  it('supports top-level type labels', () => {
    const mergedProps: Record<string, unknown> = {}

    handleConditions(
      {
        if: { type: 'array' },
        then: { type: 'object' },
      },
      mergedProps,
    )

    expect(mergedProps).toHaveProperty('if type is array')
  })

  it('supports negated conditions via not wrapper', () => {
    const mergedProps: Record<string, unknown> = {}

    handleConditions(
      {
        if: { not: { properties: { mode: { const: 'sync' } } } },
        then: { type: 'object' },
        else: { type: 'object' },
      },
      mergedProps,
    )

    expect(mergedProps).toHaveProperty('if no mode = sync')
    expect(mergedProps).toHaveProperty('else (mode)')
  })

  it('uses fallback label when no recognizable condition exists', () => {
    const mergedProps: Record<string, unknown> = {}

    handleConditions(
      {
        if: {},
        then: { type: 'object' },
        else: { type: 'object' },
      },
      mergedProps,
    )

    expect(mergedProps).toHaveProperty('if condition')
    expect(mergedProps).toHaveProperty('else (unknown)')
  })

  it('does not add if-entry when then is missing, but still adds else-entry', () => {
    const mergedProps: Record<string, unknown> = {}

    handleConditions(
      {
        if: { properties: { mode: { const: 'async' } } },
        else: { type: 'object' },
      },
      mergedProps,
    )

    expect(mergedProps).not.toHaveProperty('if mode = async')
    expect(mergedProps).toHaveProperty('else (mode)')
  })
})
