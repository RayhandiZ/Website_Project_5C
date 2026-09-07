const { JSDOM } = require('jsdom')
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/', pretendToBeVisual: true })
const w = dom.window
w.matchMedia = (q) => ({ matches: false, media: q, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} })
w.scrollTo = () => {}
for (const k of ['document','navigator','localStorage','HTMLElement','Element','Node','MutationObserver','requestAnimationFrame','cancelAnimationFrame','SVGElement','ResizeObserver']) global[k] = w[k]
global.window = w
global.IS_REACT_ACT_ENVIRONMENT = true
w.IS_REACT_ACT_ENVIRONMENT = true
global.ResizeObserver = w.ResizeObserver || class { observe(){} unobserve(){} disconnect(){} }
w.ResizeObserver = global.ResizeObserver

const SESI = { student: JSON.stringify({ role:'student', email:'a@student.umn.ac.id', name:'X', initials:'RZ' }),
               admin:   JSON.stringify({ role:'admin',   email:'a@umn.ac.id', name:'Y', initials:'KH' }) }

const ISI = {
  '/admin': [
    [/Perlu dikerjakan/, 'ada daftar pekerjaan yang menunggu'],
    [/(Lihat selengkapnya[\s\S]*){6}/, 'enam tautan Lihat selengkapnya ke halaman lain'],
    [/Mahasiswa terpantau[\s\S]{0,400}Rata-rata nilai softskill[\s\S]{0,400}Nilai sudah final/, 'hanya tiga angka utama'],
    [/bobot sementara/, 'peringatan bobot sementara tetap ada'],
    [/Sebaran huruf mutu/, 'ada satu grafik: sebaran huruf mutu'],
    [/Nilai yang sudah masuk[\s\S]{0,40}%/, 'persentase nilai yang sudah masuk'],
    [/Di atas batas 70[\s\S]{0,40}%/, 'persentase di atas batas kelulusan'],
    [/Sudah dikunci[\s\S]{0,40}%/, 'persentase nilai yang sudah final'],
    [/Huruf A[\s\S]{0,200}Huruf B[\s\S]{0,200}Huruf C/, 'tiap irisan diberi label huruf, bukan warna saja'],
    [/sudah dinilai/, 'pusat donat menyebut dasar penghitungannya'],
    [/Kelengkapan nilai/, 'tidak ada lagi tabel kelengkapan padat', false],
    [/Rata-rata per aspek CPMK/, 'tidak ada lagi bar sepuluh aspek', false],
    [/Fakultas[\s\S]{0,60}Program studi[\s\S]{0,60}Angkatan[\s\S]{0,60}Semester/, 'tidak ada filter bertingkat', false],
  ],
  '/admin/nilai': [
    [/Pilih semester terlebih dahulu/, 'gerbang semester menutup area kerja'],
    [/Semester wajib dipilih sebelum data bisa dimasukkan/, 'dropdown semester ditandai wajib'],
    [/Semester 1 .*3 aspek/, 'tiap pilihan semester menyebut jumlah aspeknya'],
  ],
}

const RUTE = [
  ['student', '/mahasiswa', 'Ringkasan mahasiswa'],
  ['student', '/mahasiswa/transkrip', 'Transkrip'],
  ['student', '/mahasiswa/peta', 'Peta Perjalanan'],
  ['student', '/mahasiswa/sertifikat', 'Sertifikat'],
  ['admin', '/admin', 'Ringkasan admin'],
  ['admin', '/admin/mahasiswa', 'Data mahasiswa'],
  ['admin', '/admin/mahasiswa/DEMO-3', 'Detail mahasiswa'],
  ['admin', '/admin/program-studi', 'Program studi'],
  ['admin', '/admin/nilai', 'Input nilai'],
]

;(async () => {
  const bundle = require('./bundle.cjs')
  const mod = require(bundle('smoke.jsx', '.smoke.cjs', { platform: 'browser', format: 'cjs', loader: { '.jsx': 'jsx' }, jsx: 'automatic' }))
  const { render, daftarUji } = mod
  let gagal = 0
  for (const [peran, rute, nama] of RUTE) {
    w.localStorage.setItem('sk5c.session', SESI[peran])
    try {
      const html = await render(rute)
      const err = html.includes('Aplikasi gagal dimuat')
      if (err) { gagal++; console.log('GAGAL  ' + rute + '  ' + html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,180)) }
      else {
        console.log('OK     ' + rute.padEnd(30) + String(html.length).padStart(7) + ' char   ' + nama)
        const teks = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
        for (const [pola, keterangan, harusAda = true] of (ISI[rute] || [])) {
          const ada = pola.test(teks)
          const ok = harusAda ? ada : !ada
          if (!ok) gagal++
          console.log('       ' + (ok ? 'v ' : 'x ') + keterangan)
        }
      }
    } catch (e) { gagal++; console.log('CRASH  ' + rute + '  ' + e.message) }
  }
  /* Identitas panel mahasiswa harus mengikuti sesi, bukan persona bawaan. */
  console.log('')
  for (const m of daftarUji()) {
    w.localStorage.setItem(
      'sk5c.session',
      JSON.stringify({ role: 'student', studentId: m.id, nim: m.nim, email: m.email, name: m.name, initials: 'XX' }),
    )
    const html = await render('/mahasiswa')
    const teks = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
    const namaTampil = teks.includes(m.name)
    const nimTampil = teks.includes(m.nim)
    const bukanPersona = m.id === 'DEMO-2' || !teks.includes('Rayhandi Zulmi')
    const ok = namaTampil && nimTampil && bukanPersona
    if (!ok) gagal++
    console.log(
      (ok ? 'OK     ' : 'GAGAL  ') + 'sesi ' + m.email.padEnd(36) +
        'menampilkan ' + m.name + ' (' + m.nim + ')' + (bukanPersona ? '' : ' TAPI MASIH ADA NAMA PERSONA'),
    )
  }

  console.log(gagal ? '\n' + gagal + ' rute bermasalah' : '\nSeluruh rute merender tanpa galat')
  process.exit(0)
})()
