/* Menyatukan modul sumber lewat esbuild agar resolusi impornya sama dengan Vite
   (tanpa ekstensi berkas), lalu mengembalikan lokasi hasilnya. */
const path = require('path')
const esbuild = require('esbuild')

module.exports = function bundle(masuk, keluar, opsi = {}) {
  const abs = path.join(__dirname, keluar)
  esbuild.buildSync({
    entryPoints: [path.join(__dirname, masuk)],
    bundle: true,
    outfile: abs,
    logLevel: 'error',
    define: { 'process.env.NODE_ENV': '"development"' },
    ...opsi,
  })
  return abs
}
