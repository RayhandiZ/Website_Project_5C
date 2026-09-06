import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FilterBar, { DEFAULT_FILTER } from '../../components/FilterBar'
import { Card, CardHeader, CatatanKaki, HurufBadge, ScoreBar, StatTile } from '../../components/Ui'
import AspectBars from '../../components/charts/AspectBars'
import ChartFrame from '../../components/charts/ChartFrame'
import {
  IconAlert,
  IconBuilding,
  IconCertificate,
  IconChevronRight,
  IconDownload,
  IconGauge,
  IconUsers,
} from '../../components/Icons'
import { CATATAN_BOBOT_SEMENTARA, CONFIG } from '../../lib/config'
import { RUBRIK } from '../../lib/scoring'
import {
  byProgram,
  filterStudents,
  kelengkapanMatriks,
  rataArea,
  rataAspek,
  ringkas,
  transkripOf,
} from '../../lib/mockData'
import { useStore } from '../../lib/store'

const WARNA_HURUF = { A: 'var(--good)', B: 'var(--brand-ink)', C: 'var(--warning)', D: 'var(--serious)' }

export default function Overview() {
  // Ikut menghitung ulang begitu ada nilai yang masuk dari panel Kemahasiswaan.
  useStore()
  const [filter, setFilter] = useState(DEFAULT_FILTER)
  const rows = useMemo(() => filterStudents(filter), [filter])

  const r = useMemo(() => ringkas(rows), [rows])
  const area = useMemo(() => (rows.length ? rataArea(rows) : []), [rows])
  const aspek = useMemo(() => (rows.length ? rataAspek(rows) : []), [rows])
  const matriks = useMemo(() => kelengkapanMatriks(rows), [rows])
  const programs = useMemo(() => byProgram(rows), [rows])

  const berisiko = useMemo(
    () =>
      rows
        .filter((s) => s.semesterAktif >= CONFIG.TOTAL_SEMESTER_PROGRAM)
        .map((s) => ({ s, t: transkripOf(s) }))
        .filter((x) => x.t.akhir.nilai != null && x.t.akhir.nilai < CONFIG.AMBANG_SERTIFIKAT)
        .sort((a, b) => a.t.akhir.nilai - b.t.akhir.nilai)
        .slice(0, 6),
    [rows],
  )

  const cakupan =
    filter.program !== 'Semua'
      ? filter.program
      : filter.faculty !== 'Semua'
        ? 'Fakultas ' + filter.faculty
        : 'Seluruh universitas'

  // Bar aspek meminta bentuk { aspek, nilai, terkunci } — di tingkat agregat
  // tidak ada yang terkunci karena populasi mencakup banyak semester.
  const barisAspek = aspek.map((a) => ({ aspek: a, nilai: a.nilai, terkunci: false }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-ink">Ringkasan capaian CPMK</h1>
          <p className="mt-1.5 text-[14px] text-ink-2">
            {cakupan} — {r.total.toLocaleString('id-ID')} mahasiswa
          </p>
        </div>
        <button type="button" className="btn-ghost">
          <IconDownload size={17} />
          Unduh laporan
        </button>
      </div>

      <FilterBar value={filter} onChange={setFilter} withSearch={false} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Mahasiswa terpantau"
          value={r.total.toLocaleString('id-ID')}
          icon={IconUsers}
          hint={programs.length + ' program studi'}
        />
        <StatTile label="Rata-rata nilai" value={r.rata ?? '—'} unit="/ 100" icon={IconGauge} hint={CATATAN_BOBOT_SEMENTARA} />
        <StatTile
          label="Transkrip final"
          value={r.final.toLocaleString('id-ID')}
          icon={IconCertificate}
          tone="good"
          hint="Seluruh 10 aspek sudah dikunci"
        />
        <StatTile
          label="Di bawah ambang"
          value={(r.total - r.diAtasAmbang).toLocaleString('id-ID')}
          icon={IconAlert}
          tone="critical"
          hint={'Nilai di bawah ' + CONFIG.AMBANG_SERTIFIKAT}
        />
      </div>

      {/* kelengkapan data — kebutuhan utama unit pengelola */}
      <Card>
        <CardHeader
          title="Kelengkapan nilai"
          subtitle="Persentase komponen asesmen yang sudah masuk, per semester dan per sumber"
          icon={IconGauge}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr className="border-b border-line bg-surface-2">
                {['Semester', 'PDP', 'MK Humaniora', 'Kemahasiswaan'].map((h, i) => (
                  <th
                    key={h}
                    className={
                      'px-5 py-3 text-[11px] font-bold uppercase tracking-[.07em] text-ink-3 ' +
                      (i ? 'text-right' : 'text-left')
                    }
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matriks.map((b) => (
                <tr key={b.semester} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 text-[14px] font-bold text-ink">Semester {b.semester}</td>
                  {['PDP', 'MK', 'ENGAGEMENT'].map((s) => {
                    const d = b.sumber[s]
                    return (
                      <td key={s} className="px-5 py-3">
                        {d.persen == null ? (
                          <span className="block text-right text-[12.5px] text-ink-3">tidak ada komponen</span>
                        ) : (
                          <div className="flex items-center justify-end gap-2.5">
                            <span className="w-24">
                              <ScoreBar value={d.persen} color="var(--c1)" height={7} />
                            </span>
                            <span className="w-11 text-right text-[13.5px] font-bold tabular-nums text-ink">
                              {d.persen}%
                            </span>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 pb-4 sm:px-6">
          <CatatanKaki>
            Kolom bertanda “tidak ada komponen” berarti sumber itu memang belum punya komponen asesmen pada
            semester tersebut di dokumen kurikulum — bukan berarti nilainya nol.
          </CatatanKaki>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* sebaran huruf mutu */}
        <ChartFrame
          title="Sebaran huruf mutu"
          subtitle="Proporsi mahasiswa pada tiap huruf mutu resmi"
          height={150}
          legend={[...RUBRIK.map((x) => ({ label: x.huruf + ' · ' + x.label, color: WARNA_HURUF[x.huruf] })), { label: 'Belum Memenuhi', color: 'var(--critical)' }]}
          table={{
            head: ['Huruf', 'Mahasiswa', 'Proporsi'],
            rows: [...RUBRIK.map((x) => x.huruf), 'belum'].map((h) => [
              h === 'belum' ? 'Belum Memenuhi' : h,
              r.huruf[h],
              Math.round((r.huruf[h] / Math.max(1, r.total)) * 100) + '%',
            ]),
          }}
        >
          <div className="px-3 sm:px-4">
            <div className="flex h-11 w-full gap-[2px] overflow-hidden rounded-xl">
              {[...RUBRIK.map((x) => x.huruf), 'belum'].map((h) => {
                const pct = (r.huruf[h] / Math.max(1, r.total)) * 100
                if (pct <= 0) return null
                return (
                  <div
                    key={h}
                    className="grid place-items-center text-[12px] font-extrabold text-white"
                    style={{ background: WARNA_HURUF[h] ?? 'var(--critical)', flex: pct + ' 0 0' }}
                    title={h + ': ' + r.huruf[h] + ' mahasiswa'}
                  >
                    {pct >= 8 ? h === 'belum' ? '<60' : h : ''}
                  </div>
                )
              })}
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-5">
              {[...RUBRIK.map((x) => x.huruf), 'belum'].map((h) => (
                <li key={h} className="rounded-xl border border-line px-3 py-2.5">
                  <p className="flex items-center gap-2 text-[12px] font-bold text-ink-2">
                    <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: WARNA_HURUF[h] ?? 'var(--critical)' }} />
                    {h === 'belum' ? '<60' : h}
                  </p>
                  <p className="mt-1 text-[18px] font-extrabold tabular-nums text-ink">{r.huruf[h]}</p>
                </li>
              ))}
            </ul>
          </div>
        </ChartFrame>

        {/* rata-rata per area */}
        <Card>
          <CardHeader title="Rata-rata per area pengembangan" subtitle="Tiga area, diagregasi dari aspek CPMK" icon={IconBuilding} />
          <ul className="divide-y divide-line">
            {area.map((a) => (
              <li key={a.area.id} className="px-5 py-4 sm:px-6">
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <span className="flex items-center gap-2.5 text-[14px] font-bold text-ink">
                    <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: a.area.warna }} />
                    {a.area.id} · {a.area.nama}
                  </span>
                  <span className="flex items-baseline gap-2.5">
                    <span className="text-[15px] font-extrabold tabular-nums text-ink">{a.nilai ?? '—'}</span>
                    <HurufBadge nilai={a.nilai} />
                  </span>
                </div>
                {a.nilai == null ? (
                  <div className="h-[10px] rounded-full border border-dashed border-line" />
                ) : (
                  <ScoreBar value={a.nilai} color={a.area.warna} />
                )}
                <p className="mt-1.5 text-[12px] text-ink-3">{a.area.ringkas}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <AspectBars
        rows={barisAspek}
        title="Rata-rata per aspek CPMK"
        subtitle="Sepuluh aspek pada filter yang aktif"
        catatan={'Hanya mahasiswa yang semesternya sudah membuka aspek terkait yang ikut dihitung. ' + CATATAN_BOBOT_SEMENTARA}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Capaian per program studi"
            subtitle="Lima teratas berdasarkan rata-rata nilai"
            icon={IconBuilding}
            action={
              <Link to="/admin/program-studi" className="btn-ghost !px-3 !py-2 text-[13px]">
                Semua
                <IconChevronRight size={15} />
              </Link>
            }
          />
          <ul className="divide-y divide-line">
            {programs.slice(0, 5).map((p) => (
              <li key={p.program} className="flex items-center gap-4 px-5 py-3.5 sm:px-6">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-ink">{p.program}</p>
                  <p className="mt-0.5 text-[12.5px] text-ink-3">
                    {p.total} mahasiswa · {p.final} transkrip final
                  </p>
                </div>
                <span className="w-24 shrink-0">
                  <ScoreBar value={p.rata ?? 0} color="var(--c1)" height={8} />
                </span>
                <span className="w-8 shrink-0 text-right text-[14.5px] font-extrabold tabular-nums text-ink">
                  {p.rata ?? '—'}
                </span>
              </li>
            ))}
          </ul>
          <div className="px-5 pb-4 sm:px-6">
            <CatatanKaki>
              Bukan peringkat: komposisi mata kuliah, jadwal asesmen, dan program kemahasiswaan tiap program studi
              berbeda, sehingga angkanya tidak sebanding satu sama lain.
            </CatatanKaki>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Berisiko tidak memenuhi syarat sertifikat"
            subtitle={'Mahasiswa semester ' + CONFIG.TOTAL_SEMESTER_PROGRAM + ' dengan nilai di bawah ambang'}
            icon={IconAlert}
          />
          {berisiko.length ? (
            <ul className="divide-y divide-line">
              {berisiko.map(({ s, t }) => (
                <li key={s.id}>
                  <Link
                    to={'/admin/mahasiswa/' + s.id}
                    className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-surface-2 sm:px-6"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-bold text-ink">{s.name}</p>
                      <p className="mt-0.5 truncate text-[12.5px] text-ink-3">
                        {s.nim} · {s.program} · {s.angkatanLabel}
                      </p>
                    </div>
                    <HurufBadge nilai={t.akhir.nilai} />
                    <span className="w-8 shrink-0 text-right text-[14.5px] font-extrabold tabular-nums text-ink">
                      {t.akhir.nilai}
                    </span>
                    <IconChevronRight size={16} className="shrink-0 text-ink-3" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="card-pad text-[13.5px] text-ink-2">
              Tidak ada mahasiswa semester {CONFIG.TOTAL_SEMESTER_PROGRAM} di bawah ambang pada filter ini.
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
