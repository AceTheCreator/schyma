import Schyma from 'schyma'
import schema from './sample-schema.json'

export default function App() {
  return (
    <main className="app-shell">
      <section className="canvas">
        <Schyma
          title="Playground Schema"
          description="Workspace playground for local Schyma development"
          schema={schema}
        />
      </section>
    </main>
  )
}
