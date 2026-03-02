import Schyma from 'schyma'
import schema from './asyncapi.json'

export default function App() {
  return (
    <main className='h-full p-4'>
      <section className='h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
        <Schyma title='AsyncAPI 3.1' description='The AsyncAPI Specification JSON Schema file' schema={schema} />
      </section>
    </main>
  )
}
