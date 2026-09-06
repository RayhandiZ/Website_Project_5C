import { Outlet, useOutletContext } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import SideMenu from '../../components/SideMenu'
import { Avatar, Badge, HurufBadge, ScoreBar } from '../../components/Ui'
import { IconCertificate, IconGauge, IconList, IconLock, IconRoute, IconTable } from '../../components/Icons'
import { CONFIG } from '../../lib/config'
import { PEMBIMBING, getStudent, personaAktif, transkripOf } from '../../lib/mockData'
import { kelayakanSertifikat } from '../../lib/rules'
import { useStore } from '../../lib/store'
import { useAuth } from '../../lib/auth'

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
  const layak = kelayakanSertifikat(student).layak

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
          <aside className="space-y-5 lg:sticky lg:top-[84px] lg:self-start print:hidden">
            <div className="card overflow-hidden">
              <div className="h-16 bg-[linear-gradient(100deg,var(--brand-deep),var(--brand))]" />
              <div className="-mt-8 px-5 pb-5">
                <span className="inline-block rounded-full border-4 border-surface">
                  <Avatar initials={inisial} size={58} />
                </span>
                <h1 className="mt-3 text-[16px] font-extrabold leading-tight text-ink">{student.name}</h1>
                <p className="mt-0.5 text-[12.5px] text-ink-2">{student.nim}</p>
                <p className="mt-2 text-[13px] font-semibold text-ink-2">
                  {student.program} · Angkatan {student.angkatanLabel}
                </p>

                <div className="mt-4 border-t border-line pt-4">
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-[12px] font-semibold text-ink-3">Nilai akhir</span>
                    <span className="text-[15px] font-extrabold tabular-nums text-ink">
                      {t.akhir.nilai ?? '—'}
                    </span>
                  </div>
                  <ScoreBar value={t.akhir.nilai ?? 0} color="var(--brand-ink)" />
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <HurufBadge nilai={t.akhir.nilai} />
                    <Badge tone={t.akhir.status === 'final' ? 'good' : 'warning'}>
                      {t.akhir.status === 'final' ? 'Final' : 'Sementara'}
                    </Badge>
                  </div>
                  <p className="mt-2.5 text-[12px] leading-snug text-ink-3">
                    {t.akhir.basis}. Nilai final terbit setelah Semester {CONFIG.TOTAL_SEMESTER_PROGRAM}.
                  </p>
                </div>

                <div className="mt-4 border-t border-line pt-4">
                  <p className="mb-2 text-[12px] font-semibold text-ink-3">Perjalanan program</p>
                  <ol className="space-y-1.5">
                    {Object.values(t.semester).map((s) => {
                      const keadaan = s.terkunci
                        ? 'terkunci'
                        : s.ditutup
                          ? 'selesai'
                          : 'berjalan'
                      return (
                        <li key={s.semester} className="flex items-center gap-2 text-[12.5px]">
                          <span
                            className={
                              'grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-bold text-white ' +
                              (keadaan === 'selesai' ? 'bg-[var(--good)]' : keadaan === 'berjalan' ? 'bg-brand-ink' : 'bg-[var(--border-strong)]')
                            }
                          >
                            {keadaan === 'selesai' ? '✓' : keadaan === 'berjalan' ? '●' : ''}
                          </span>
                          <span className={keadaan === 'terkunci' ? 'text-ink-3' : 'font-semibold text-ink-2'}>
                            Semester {s.semester}
                          </span>
                          <span className="ml-auto text-ink-3">
                            {keadaan === 'terkunci' ? <IconLock size={13} /> : (s.nilai ?? '—')}
                          </span>
                        </li>
                      )
                    })}
                  </ol>
                </div>

                <p className="mt-4 text-[12px] leading-snug text-ink-3">
                  Pembimbing akademik: {PEMBIMBING}
                </p>
              </div>
            </div>

            <SideMenu items={menu} />

            {layak ? null : (
              <p className="px-1 text-[12px] leading-snug text-ink-3">
                Sertifikat terbit setelah seluruh aspek dinilai dan angkatan dikunci Kemahasiswaan.
              </p>
            )}
          </aside>

          <div className="min-w-0">
            <Outlet context={student} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
