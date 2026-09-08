import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { contohEmailMahasiswa, getStudentByEmail } from './mockData.js'

/* Autentikasi tiruan untuk tahap UI/UX — peran ditentukan dari domain email.
   Nanti tinggal diganti pemanggilan API tanpa mengubah komponen halaman. */

const STORAGE_KEY = 'sk5c.session'

const ADMIN_PROFILE = {
  name: 'Biro Kemahasiswaan & Humaniora',
  unit: 'Student Development & Humanities',
  email: 'kemahasiswaan@umn.ac.id',
  officer: 'Andini Prameswari, M.Psi.',
}

const AuthContext = createContext(null)

export function roleFromEmail(email) {
  return /@student\.umn\.ac\.id$/i.test(email.trim()) ? 'student' : 'admin'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* localStorage bisa diblokir — abaikan, sesi cukup di memori */
    }
  }, [user])

  const login = useCallback(async ({ email, password }) => {
    if (!email.trim() || !password) throw new Error('Email dan kata sandi wajib diisi.')
    if (password.length < 6) throw new Error('Kata sandi minimal 6 karakter.')
    await new Promise((r) => setTimeout(r, 550))

    const role = roleFromEmail(email)

    if (role === 'admin') {
      const next = {
        role,
        email: ADMIN_PROFILE.email,
        name: ADMIN_PROFILE.name,
        initials: 'KH',
        subtitle: ADMIN_PROFILE.unit,
      }
      setUser(next)
      return next
    }

    /* Identitas mahasiswa ditentukan oleh alamat yang diketik, bukan persona
       bawaan. Alamat yang tidak terdaftar ditolak — masuk sebagai orang lain
       jauh lebih berbahaya daripada gagal masuk. */
    const mahasiswa = getStudentByEmail(email)
    if (!mahasiswa) {
      throw new Error(
        'Email ' + email.trim() + ' tidak terdaftar sebagai mahasiswa. Contoh yang terdaftar: ' +
          contohEmailMahasiswa(2).join(', ') + '.',
      )
    }

    const next = {
      role,
      studentId: mahasiswa.id,
      nim: mahasiswa.nim,
      email: mahasiswa.email,
      name: mahasiswa.name,
      initials: mahasiswa.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
      subtitle: mahasiswa.program,
      cohort: mahasiswa.angkatanId,
      semesterAktif: mahasiswa.semesterAktif,
    }
    setUser(next)
    return next
  }, [])

  const logout = useCallback(() => setUser(null), [])

  const value = useMemo(() => ({ user, login, logout, admin: ADMIN_PROFILE }), [user, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}

export function RequireRole({ role, children }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/masuk" state={{ from: location.pathname }} replace />
  if (user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/mahasiswa'} replace />
  return children
}
