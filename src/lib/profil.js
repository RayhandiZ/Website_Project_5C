import { useSyncExternalStore } from 'react'

/* --------------------------------------------------------------------------
   Data profil yang dimiliki penggunanya sendiri.

   Dipisah dari store.js dengan sengaja. store.js menyimpan DAFTAR PERUBAHAN
   NILAI — data akademik milik institusi yang harus bisa di-rollback dan masuk
   audit log. Yang di sini sifatnya lain sama sekali: nomor telepon, alamat, dan
   foto, milik orangnya, tidak pernah memengaruhi perhitungan apa pun, dan tidak
   perlu jejak audit. Menyatukan keduanya dalam satu kunci penyimpanan berarti
   sekali kuota penuh, keduanya ikut gagal.

   Nama, NIM, email, program studi, dan angkatan TIDAK disimpan di sini. Semua
   itu berasal dari sistem akademik; kalau bisa ditimpa dari halaman profil,
   seorang mahasiswa dapat menampilkan NIM orang lain pada transkripnya sendiri.
   -------------------------------------------------------------------------- */

const KUNCI = 'sk5c.profil'

/** Sisi foto setelah diperkecil. 256 px sudah tajam untuk avatar terbesar
    (64 px) pada layar 2×, dan hasilnya cukup kecil untuk localStorage. */
export const UKURAN_FOTO = 256

/** Batas berkas sumber. Yang disimpan jauh lebih kecil karena diperkecil dulu,
    tetapi berkas raksasa tetap ditolak lebih awal agar peramban tidak
    tercekik saat membacanya. */
export const BATAS_FOTO_MB = 5

export const JENIS_FOTO = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const KOSONG = Object.freeze({ telepon: '', ponsel: '', alamat: '', foto: null })

let data = {}
let versi = 0
const listeners = new Set()
let sedangMenulis = false

const adaPenyimpanan = () => {
  try {
    return typeof localStorage !== 'undefined'
  } catch {
    return false
  }
}

function muat() {
  if (!adaPenyimpanan()) return
  try {
    data = JSON.parse(localStorage.getItem(KUNCI) ?? '{}') ?? {}
  } catch {
    data = {}
  }
}

function simpan() {
  if (!adaPenyimpanan()) return
  try {
    sedangMenulis = true
    localStorage.setItem(KUNCI, JSON.stringify(data))
  } catch {
    /* kuota penuh atau penyimpanan diblokir — isian tetap hidup di memori */
  } finally {
    sedangMenulis = false
  }
}

function berubah() {
  versi++
  listeners.forEach((fn) => fn())
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

const bacaVersi = () => versi

/**
 * Kunci akun. Mahasiswa dibedakan oleh NIM, bukan email, karena email bisa
 * berubah sedangkan NIM tidak. Peran Kemahasiswaan hanya satu, jadi cukup
 * ditandai perannya.
 */
export const kunciAkun = (user) =>
  user?.role === 'student' ? 'nim:' + (user.nim ?? user.studentId ?? '?') : 'unit:kemahasiswaan'

/**
 * Kunci akun untuk sesi yang sedang berjalan.
 *
 * Satu-satunya cara yang benar untuk menyusun kunci dari dalam komponen. Kalau
 * tiap tempat menghitungnya sendiri, navbar dan halaman profil bisa memakai
 * kunci berbeda untuk orang yang sama — foto tersimpan, tetapi avatar di pojok
 * kanan tidak pernah menemukannya. `cadanganNim` menutup celah sesi lama yang
 * belum sempat menyimpan NIM.
 */
export const kunciSesi = (user, cadanganNim) =>
  kunciAkun(user?.role === 'student' ? { role: 'student', nim: user?.nim ?? cadanganNim } : user)

/** Isi profil satu akun, ikut menyegarkan komponen bila berubah di tab lain. */
export function useProfil(kunci) {
  useSyncExternalStore(subscribe, bacaVersi, bacaVersi)
  return data[kunci] ?? KOSONG
}

/** Menimpa sebagian isi profil satu akun. */
export function simpanProfil(kunci, tambalan) {
  data[kunci] = { ...KOSONG, ...(data[kunci] ?? {}), ...tambalan }
  simpan()
  berubah()
  return data[kunci]
}

/* ---------------------------------- foto ---------------------------------- */

const bacaBerkas = (file) =>
  new Promise((selesai, gagal) => {
    const r = new FileReader()
    r.onload = () => selesai(r.result)
    r.onerror = () => gagal(new Error('Berkas tidak dapat dibaca.'))
    r.readAsDataURL(file)
  })

/**
 * Memeriksa, memotong bujur sangkar, dan memperkecil foto menjadi data URL.
 *
 * Pemotongan dilakukan di tengah supaya wajah pada foto potret tidak terpangkas
 * dari bawah, dan hasilnya selalu 1:1 sehingga bingkai avatar bulat di seluruh
 * aplikasi tidak pernah menggepengkan gambar.
 */
export async function siapkanFoto(file) {
  if (!file) throw new Error('Tidak ada berkas yang dipilih.')
  if (!JENIS_FOTO.includes(file.type)) {
    throw new Error('Jenis berkas harus JPG, PNG, WebP, atau GIF.')
  }
  if (file.size > BATAS_FOTO_MB * 1024 * 1024) {
    throw new Error(
      'Ukuran berkas ' +
        (file.size / 1024 / 1024).toFixed(1) +
        ' MB melebihi batas ' +
        BATAS_FOTO_MB +
        ' MB.',
    )
  }

  const sumber = await bacaBerkas(file)

  /* Tanpa canvas (misalnya di lingkungan uji) foto disimpan apa adanya —
     lebih baik gambar asli daripada gagal sama sekali. */
  if (typeof document === 'undefined' || !document.createElement('canvas').getContext) {
    return sumber
  }

  const img = new Image()
  img.src = sumber
  await (img.decode
    ? img.decode()
    : new Promise((ok, no) => {
        img.onload = ok
        img.onerror = () => no(new Error('Gambar tidak dapat dibuka.'))
      }))

  const kanvas = document.createElement('canvas')
  kanvas.width = UKURAN_FOTO
  kanvas.height = UKURAN_FOTO
  const ctx = kanvas.getContext('2d')

  /* Latar putih dulu: JPEG tidak menyimpan transparansi, dan tanpa ini bagian
     tembus pandang pada PNG akan menjadi hitam pekat. */
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, UKURAN_FOTO, UKURAN_FOTO)

  const sisi = Math.min(img.width, img.height)
  ctx.drawImage(
    img,
    (img.width - sisi) / 2,
    (img.height - sisi) / 2,
    sisi,
    sisi,
    0,
    0,
    UKURAN_FOTO,
    UKURAN_FOTO,
  )

  const webp = kanvas.toDataURL('image/webp', 0.85)
  return webp.startsWith('data:image/webp') ? webp : kanvas.toDataURL('image/jpeg', 0.85)
}

muat()

/* Profil yang diubah di tab lain ikut tampil di sini. */
if (typeof window !== 'undefined' && adaPenyimpanan()) {
  window.addEventListener('storage', (e) => {
    if (e.key === KUNCI && !sedangMenulis) {
      muat()
      berubah()
    }
  })
}
