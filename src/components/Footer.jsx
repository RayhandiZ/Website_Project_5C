import { IconBook, IconBuilding, IconCheckShield, IconLogo, IconUsers } from './Icons'

const QUICK = [
  { label: 'Portal Mahasiswa', icon: IconUsers },
  { label: 'Panduan 5C', icon: IconBook },
  { label: 'Unit Kegiatan', icon: IconBuilding },
  { label: 'Ajukan Bukti', icon: IconCheckShield },
]

export default function Footer() {
  return (
    <footer className="mt-12 bg-[linear-gradient(100deg,var(--brand-deep),var(--brand))] text-white">
      <div className="mx-auto grid max-w-shell gap-10 px-5 py-12 sm:px-6 md:grid-cols-[1.1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <IconLogo size={26} />
            <span className="text-[15px] font-extrabold tracking-tight">
              SOFTSKILL <span className="text-[var(--accent)]">5C</span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-[13.5px] leading-relaxed text-white/70">
            Sistem pemantauan capaian softskill mahasiswa berbasis lima nilai inti: Caring, Credible,
            Competent, Competitive, dan Customer Delight.
          </p>
        </div>

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[.1em] text-white/50">Akses Cepat</h3>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {QUICK.map(({ label, icon: Icon }) => (
              <li key={label}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-xl border border-white/15 px-3 py-2.5 text-left text-[13px] font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
                >
                  <Icon size={17} />
                  <span className="truncate">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[.1em] text-white/50">Bantuan</h3>
          <address className="mt-4 space-y-2 text-[13.5px] not-italic leading-relaxed text-white/75">
            <p>Biro Kemahasiswaan & Humaniora</p>
            <p>Gedung A, Lantai 9</p>
            <p>Senin–Jumat, 09.00–16.00 WIB</p>
            <p className="pt-1 font-semibold text-white">softskill@umn.ac.id</p>
          </address>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-[12.5px] text-white/55">
        © 2026 Universitas Multimedia Nusantara.
      </div>
    </footer>
  )
}
