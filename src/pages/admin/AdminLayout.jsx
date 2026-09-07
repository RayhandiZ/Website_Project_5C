import { Outlet } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import SideMenu from '../../components/SideMenu'
import { useAuth } from '../../lib/auth'
import {
  IconBuilding,
  IconCertificate,
  IconGauge,
  IconList,
  IconTable,
  IconUpload,
  IconUsers,
} from '../../components/Icons'
import { PERIODE_AKTIF, PENGAJUAN_KOREKSI, labelPeriode } from '../../lib/mockData'
import { useStore } from '../../lib/store'

const NAV = [
  { to: '/admin', label: 'Ringkasan', end: true },
  { to: '/admin/mahasiswa', label: 'Mahasiswa' },
  { to: '/admin/nilai', label: 'Nilai' },
  { to: '/admin/angkatan', label: 'Angkatan' },
]

export default function AdminLayout() {
  // Ikut menghitung ulang begitu ada nilai yang masuk dari panel Kemahasiswaan.
  useStore()
  const { admin } = useAuth()
  const koreksi = PENGAJUAN_KOREKSI.filter((k) => k.status === 'menunggu').length

  const menu = [
    { to: '/admin', label: 'Ringkasan', icon: IconGauge, end: true },
    { to: '/admin/mahasiswa', label: 'Data Mahasiswa', icon: IconUsers },
    { to: '/admin/nilai', label: 'Input & Import Nilai', icon: IconUpload, badge: koreksi || undefined },
    { to: '/admin/kurikulum', label: 'Kurikulum CPMK', icon: IconTable },
    { to: '/admin/angkatan', label: 'Angkatan & Sertifikat', icon: IconCertificate },
    { to: '/admin/program-studi', label: 'Program Studi', icon: IconBuilding },
    { to: '/admin/log', label: 'Log Aktivitas', icon: IconList },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar links={NAV} notifications={koreksi} />

      <main className="mx-auto w-full max-w-shell flex-1 px-4 py-7 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-5 lg:sticky lg:top-[84px] lg:self-start print:hidden">
            <div className="card overflow-hidden">
              <div className="bg-[linear-gradient(100deg,var(--brand-deep),var(--brand))] px-5 py-5 text-white">
                <p className="text-[11px] font-bold uppercase tracking-[.1em] text-white/60">Unit pengelola</p>
                <h1 className="mt-1.5 text-[15px] font-extrabold leading-snug">{admin.name}</h1>
                <p className="mt-1 text-[12.5px] text-white/65">{admin.officer}</p>
                <p className="mt-3 text-[12px] text-white/55">Periode {labelPeriode(PERIODE_AKTIF)}</p>
              </div>
              {/* Angka ringkasan sengaja tidak diulang di sini — tempatnya di halaman
                  Ringkasan. Pekerjaan yang menunggu sudah ditandai lencana pada menu. */}
            </div>

            <SideMenu items={menu} />
          </aside>

          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
