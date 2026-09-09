import { NavLink } from 'react-router-dom'

/* Menu vertikal pada kolom kiri.

   Penanda aktif berupa isian penuh warna merek dengan teks putih, bukan latar
   samar. Bedanya besar bagi pembaca yang matanya tidak lagi setajam dulu:
   halaman yang sedang dibuka terbaca sekali lihat, tanpa perlu membandingkan
   dua nada abu yang mirip. */

export default function SideMenu({ items }) {
  return (
    <nav className="card overflow-hidden p-2">
      <ul className="space-y-1">
        {items.map(({ to, label, icon: Icon, end, badge }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                'flex items-center gap-3 rounded-xl px-3.5 py-3 text-[14.5px] font-bold transition ' +
                (isActive
                  ? 'bg-brand text-white'
                  : 'text-ink-2 hover:bg-surface-2 hover:text-ink')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={19} />
                  <span className="truncate">{label}</span>
                  {badge ? (
                    <span
                      className={
                        'ml-auto rounded-md px-1.5 py-0.5 text-[11px] font-extrabold ' +
                        (isActive ? 'bg-white/25 text-white' : 'bg-[var(--critical)] text-white')
                      }
                    >
                      {badge}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
