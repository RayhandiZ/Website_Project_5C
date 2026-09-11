import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { RequireRole, useAuth } from './lib/auth'

import Login from './pages/Login'
import Profil from './pages/Profil'

import StudentLayout from './pages/student/StudentLayout'
import Ringkasan from './pages/student/Dashboard'
import TranskripPage from './pages/student/TranskripPage'
import Peta from './pages/student/Peta'
import Riwayat from './pages/student/Riwayat'
import Sertifikat from './pages/student/Sertifikat'

import AdminLayout from './pages/admin/AdminLayout'
import Overview from './pages/admin/Overview'
import Students from './pages/admin/Students'
import StudentDetail from './pages/admin/StudentDetail'
import Programs from './pages/admin/Programs'
import Nilai from './pages/admin/Nilai'
import Kurikulum from './pages/admin/Kurikulum'
import Angkatan from './pages/admin/Angkatan'
import Log from './pages/admin/Log'

function ScrollToTop() {
  const { pathname } = useLocation()
  // Badan blok, bukan ekspresi: apa pun yang dikembalikan panah akan dianggap
  // React sebagai fungsi cleanup dan dipanggil saat unmount.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

function Landing() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/masuk" replace />
  return <Navigate to={user.role === 'admin' ? '/admin' : '/mahasiswa'} replace />
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/masuk" element={<Login />} />

        <Route
          path="/mahasiswa"
          element={
            <RequireRole role="student">
              <StudentLayout />
            </RequireRole>
          }
        >
          <Route index element={<Ringkasan />} />
          <Route path="transkrip" element={<TranskripPage />} />
          <Route path="peta" element={<Peta />} />
          <Route path="riwayat" element={<Riwayat />} />
          <Route path="sertifikat" element={<Sertifikat />} />
          <Route path="profil" element={<Profil />} />
        </Route>

        <Route
          path="/admin"
          element={
            <RequireRole role="admin">
              <AdminLayout />
            </RequireRole>
          }
        >
          <Route index element={<Overview />} />
          <Route path="mahasiswa" element={<Students />} />
          <Route path="mahasiswa/:id" element={<StudentDetail />} />
          <Route path="nilai" element={<Nilai />} />
          <Route path="kurikulum" element={<Kurikulum />} />
          <Route path="angkatan" element={<Angkatan />} />
          <Route path="program-studi" element={<Programs />} />
          <Route path="log" element={<Log />} />
          <Route path="profil" element={<Profil />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
