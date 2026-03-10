import Ajv from 'ajv'
import Ajv2020 from 'ajv/dist/2020'
import AjvDraft04 from 'ajv-draft-04'

const normalizeSchemaId = (schemaId?: string) => schemaId?.trim().replace(/#$/, '').toLowerCase()

export const getValidator = (schemaId?: string) => {
  const normalizedSchemaId = normalizeSchemaId(schemaId)

  if (normalizedSchemaId?.includes('draft-04')) {
    return new AjvDraft04()
  }

  if (normalizedSchemaId?.includes('2020-12')) {
    return new Ajv2020()
  }

  return new Ajv()
}
