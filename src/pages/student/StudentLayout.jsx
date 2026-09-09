import { Outlet, useOutletContext } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import SideMenu from '../../components/SideMenu'
import { Avatar, HurufBadge } from '../../components/Ui'
import { IconCertificate, IconGauge, IconList, IconRoute, IconTable } from '../../components/Icons'
import { getStudent, personaAktif, transkripOf } from '../../lib/mockData'
import { useStore } from '../../lib/store'
import { useAuth } from '../../lib/auth'

/* Pintasan footer menunjuk ke halaman yang memang ada, bukan tautan hiasan. */
const PINTASAN = [
  { ke: '/mahasiswa/transkrip', label: 'Transkrip', icon: IconTable },
  { ke: '/mahasiswa/peta', label: 'Peta Perjalanan', icon: IconRoute },
  { ke: '/mahasiswa/riwayat', label: 'Riwayat', icon: IconList },
  { ke: '/mahasiswa/sertifikat', label: 'Sertifikat', icon: IconCertificate },
]

const NAV = [
  { to: '/mahasiswa', label: 'Ringkasan', end: true },
  { to: '/mahasiswa/transkrip', label: 'Transkrip' },
  { to: '/mahasiswa/peta', label: 'Peta Perjalanan' },
]

export const useStudent = () => useOutletContext()

export default function StudentLayout() {
  // Ikut menghitung ulang begitu ada nilai yang masuk dari panel Kemahasiswaan.
  useStore()
  const { user } = useAuth()
  /* Yang tampil adalah mahasiswa yang sedang masuk. personaAktif() hanya
     jaring pengaman bila sesi lama belum menyimpan studentId. */
  const student = getStudent(user?.studentId) ?? personaAktif()
  const t = transkripOf(student)

  const menu = [
    { to: '/mahasiswa', label: 'Ringkasan', icon: IconGauge, end: true },
    { to: '/mahasiswa/transkrip', label: 'Transkrip Softskill', icon: IconTable },
    { to: '/mahasiswa/peta', label: 'Peta Perjalanan', icon: IconRoute },
    { to: '/mahasiswa/riwayat', label: 'Riwayat', icon: IconList },
    { to: '/mahasiswa/sertifikat', label: 'Sertifikat', icon: IconCertificate },
  ]

  const inisial = student.name.split(' ').map((w) => w[0]).join('').slice(0, 2)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar links={NAV} notifications={0} />

      <main className="mx-auto w-full max-w-shell flex-1 px-4 py-7 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Kartu identitas sengaja ringkas: siapa saya, dan satu angka.
              Perjalanan program serta penjelasan nilai tinggal di halaman
              Ringkasan — mengulanginya di sini hanya membuat sesak. */}
          <aside className="space-y-5 lg:sticky lg:top-[84px] lg:self-start print:hidden">
            <div className="card overflow-hidden">
              <div className="h-1 bg-brand" />
              <div className="px-5 py-5">
                <div className="flex items-center gap-3.5">
                  <Avatar initials={inisial} size={48} />
                  <div className="min-w-0">
                    <h1 className="truncate text-[15.5px] font-extrabold leading-tight text-ink">
                      {student.name}
                    </h1>
                    <p className="mt-0.5 truncate text-[12.5px] tabular-nums text-ink-2">{student.nim}</p>
                  </div>
                </div>

                <p className="mt-3.5 truncate text-[13px] text-ink-2" title={student.email}>
                  {student.email}
                </p>
                <p className="mt-1 text-[13px] font-semibold text-ink-2">
                  {student.program} · Angkatan {student.angkatanLabel}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                  <span className="text-[13px] text-ink-2">Nilai akhir</span>
                  <span className="flex items-center gap-2">
                    <span className="text-[19px] font-extrabold leading-none tabular-nums text-ink">
                      {t.akhir.nilai ?? '—'}
                    </span>
                    <HurufBadge nilai={t.akhir.nilai} sementara={t.akhir.status !== 'final'} />
                  </span>
                </div>
              </div>
            </div>

            <SideMenu items={menu} />
          </aside>

          <div className="min-w-0">
            <Outlet context={student} />
          </div>
        </div>
      </main>

      <Footer pintasan={PINTASAN} />
    </div>
  )
}
