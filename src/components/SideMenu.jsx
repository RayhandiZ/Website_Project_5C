import { NavLink } from 'react-router-dom'

/* Menu vertikal pada kolom kiri — penanda aktif berupa batang aksen di sisi kiri
   agar status tidak hanya dibedakan oleh warna latar. */

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
                'relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-[14px] font-bold transition ' +
                (isActive
                  ? 'bg-brand-soft text-brand-ink'
                  : 'text-ink-2 hover:bg-surface-2 hover:text-ink')
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-ink" />
                  ) : null}
                  <Icon size={19} />
                  <span className="truncate">{label}</span>
                  {badge ? (
                    <span className="ml-auto rounded-md bg-[var(--critical)] px-1.5 py-0.5 text-[11px] font-extrabold text-white">
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
