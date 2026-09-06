import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { act } from 'react'
import App from '../src/App'
import ErrorBoundary from '../src/components/ErrorBoundary'
import { AuthProvider } from '../src/lib/auth'
import { ThemeProvider } from '../src/lib/theme'
import { STUDENTS } from '../src/lib/mockData'

export async function render(rute) {
  const el = document.createElement('div')
  document.body.appendChild(el)
  const root = createRoot(el)
  await act(async () => {
    root.render(
      <ErrorBoundary>
        <ThemeProvider>
          <MemoryRouter initialEntries={[rute]}>
            <AuthProvider>
              <App />
            </AuthProvider>
          </MemoryRouter>
        </ThemeProvider>
      </ErrorBoundary>,
    )
  })
  await act(async () => { await new Promise((r) => setTimeout(r, 30)) })
  const html = el.innerHTML
  root.unmount()
  el.remove()
  return html
}

/* Beberapa mahasiswa nyata untuk menguji identitas sesi. */
export function daftarUji() {
  const pilih = (f) => STUDENTS.find(f)
  return [
    pilih((m) => m.id === 'DEMO-2'),
    pilih((m) => m.program === 'Perhotelan'),
    pilih((m) => m.program === 'Jurnalistik'),
  ].filter(Boolean)
}
