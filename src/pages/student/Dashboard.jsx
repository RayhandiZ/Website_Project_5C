import { Link } from 'react-router-dom'
import {
  Badge,
  Card,
  CardHeader,
  CatatanKaki,
  HurufBadge,
  ScoreBar,
  ScoreRing,
  StatTile,
  Terkunci,
} from '../../components/Ui'
import {
  IconAlert,
  IconCertificate,
  IconChevronRight,
  IconClock,
  IconGauge,
  IconLock,
  IconTable,
  IconTarget,
} from '../../components/Icons'
import { CONFIG } from '../../lib/config'
import { getArea } from '../../lib/curriculum'
import { kelayakanSertifikat, labelNilaiAkhir } from '../../lib/rules'
import { transkripOf } from '../../lib/mockData'
import { useStudent } from './StudentLayout'
import { useStore } from '../../lib/store'

export default function Dashboard() {
  // Ikut menghitung ulang begitu ada nilai yang masuk dari panel Kemahasiswaan.
  useStore()
  const student = useStudent()
  const t = transkripOf(student)
  const label = labelNilaiAkhir(t.akhir)
  const sertifikat = kelayakanSertifikat(student)

  const dinilai = t.aspek.filter((a) => a.nilai != null)
  const terlemah = [...dinilai].sort((a, b) => a.nilai - b.nilai)[0]
  const menunggu = t.aspek.filter((a) => !a.terkunci && a.komponenKosong.length > 0)

  return (
    <div className="space-y-6">
      {/* sapaan + nilai sementara */}
      <Card className="card-pad">
        <div className="flex flex-wrap items-center gap-8">
          <ScoreRing value={t.akhir.nilai ?? 0} />
          <div className="min-w-[260px] flex-1">
            <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-ink">
              Halo, {student.name.split(' ')[0]}
            </h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <HurufBadge nilai={t.akhir.nilai} panjang />
              <Badge tone={t.akhir.status === 'final' ? 'good' : 'warning'}>{label.teks}</Badge>
            </div>
            <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-ink-2">{label.rinci}</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link to="/mahasiswa/transkrip" className="btn-primary">
                <IconTable size={17} />
                Buka transkrip
              </Link>
              <Link to="/mahasiswa/peta" className="btn-ghost">
                Lihat peta perjalanan
                <IconChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* perjalanan program */}
      <Card className="card-pad">
        <h2 className="text-[15px] font-bold text-ink">Perjalanan program</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {Object.values(t.semester).map((s) => {
            const keadaan = s.terkunci ? 'terkunci' : s.ditutup ? 'selesai' : 'berjalan'
            return (
              <li
                key={s.semester}
                className={
                  'rounded-xl border px-4 py-3.5 ' +
                  (keadaan === 'berjalan' ? 'border-brand-ink bg-brand-soft' : 'border-line')
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-extrabold text-ink">Semester {s.semester}</span>
                  {keadaan === 'terkunci' ? (
                    <IconLock size={15} className="text-ink-3" />
                  ) : (
                    <span className="text-[15px] font-extrabold tabular-nums text-ink">{s.nilai ?? '—'}</span>
                  )}
                </div>
                <p className="mt-1 text-[12.5px] text-ink-2">
                  {keadaan === 'selesai'
                    ? 'Selesai · ' + s.total + ' aspek'
                    : keadaan === 'berjalan'
                      ? 'Berjalan · ' + s.dinilai + ' dari ' + s.total + ' aspek dinilai'
                      : 'Belum dibuka · ' + s.total + ' aspek'}
                </p>
              </li>
            )
          })}
        </ol>
      </Card>

      {/* ringkasan angka */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Nilai sementara"
          value={t.akhir.nilai ?? '—'}
          unit="/ 100"
          icon={IconGauge}
          hint={t.akhir.basis}
        />
        <StatTile
          label="Aspek dinilai"
          value={t.akhir.aspekDinilai}
          unit={'/ ' + t.akhir.aspekTotal}
          icon={IconTarget}
          hint={t.aspek.filter((a) => a.terkunci).length + ' aspek belum dibuka'}
        />
        <StatTile
          label="Semester aktif"
          value={student.semesterAktif}
          unit={'dari ' + CONFIG.TOTAL_SEMESTER_PROGRAM}
          icon={IconClock}
          hint={'Angkatan ' + student.angkatanLabel}
        />
        <StatTile
          label="Status sertifikat"
          value={sertifikat.layak ? 'Tersedia' : 'Belum'}
          icon={IconCertificate}
          tone={sertifikat.layak ? 'good' : 'warning'}
          hint={sertifikat.layak ? 'Siap diunduh' : sertifikat.gagal.length + ' syarat belum terpenuhi'}
        />
      </div>

      {/* cluster */}
      <Card>
        <CardHeader
          title="Capaian per cluster"
          subtitle="Cluster yang belum dibuka ditandai gembok, bukan angka nol"
          icon={IconTarget}
        />
        <ul className="grid gap-px bg-line sm:grid-cols-2">
          {Object.values(t.cluster).map((c) => {
            const warna = getArea(c.cluster.area)?.warna
            const terkunci = c.nilai == null
            return (
              <li key={c.cluster.id} className="bg-surface px-5 py-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-[13px] font-bold text-ink">
                      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: warna }} />
                      {c.cluster.id}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-ink-2">{c.cluster.nama}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    {terkunci ? (
                      <IconLock size={16} className="ml-auto text-ink-3" />
                    ) : (
                      <span className="text-[18px] font-extrabold tabular-nums text-ink">{c.nilai}</span>
                    )}
                  </span>
                </div>
                {terkunci ? (
                  <Terkunci semester={Math.min(...c.aspek.map((a) => a.aspek.semester))} />
                ) : (
                  <>
                    <ScoreBar value={c.nilai} color={warna} />
                    <p className="mt-1.5 text-[12px] text-ink-3">
                      {c.dinilai} dari {c.total} aspek dinilai
                    </p>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      </Card>

      {/* yang perlu diperhatikan */}
      <Card>
        <CardHeader title="Yang perlu diperhatikan" subtitle="Titik lemah dan nilai yang belum masuk" icon={IconAlert} />
        <div className="card-pad space-y-4">
          {terlemah ? (
            <div className="rounded-xl border border-line px-4 py-3.5">
              <p className="text-[13px] font-bold text-ink">
                Nilai terendah: {terlemah.aspek.kode} {terlemah.aspek.nama}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
                {terlemah.nilai} — {terlemah.aspek.deskripsi}
              </p>
            </div>
          ) : null}

          {menunggu.length ? (
            <div>
              <p className="mb-2 text-[13px] font-bold text-ink">Komponen yang belum masuk dari penilai</p>
              <ul className="space-y-1.5">
                {menunggu.slice(0, 4).map((a) => (
                  <li key={a.aspek.id} className="text-[13px] leading-relaxed text-ink-2">
                    <span className="font-semibold text-ink">{a.aspek.kode}</span> —{' '}
                    {a.komponenKosong.map((x) => x.label).join(', ')}
                  </li>
                ))}
              </ul>
              <CatatanKaki>
                Nilai biasanya diunggah dosen pengampu atau unit kemahasiswaan pada akhir periode ujian.
              </CatatanKaki>
            </div>
          ) : (
            <p className="text-[13px] text-ink-2">
              Semua komponen pada semester yang sudah dibuka telah dinilai.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
