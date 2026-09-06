import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme'
import { Avatar } from './Ui'
import { IconBell, IconChat, IconChevronDown, IconLogo, IconLogout, IconMoon, IconSun } from './Icons'

export default function Navbar({ links = [], notifications = 0 }) {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header className="sticky top-0 z-40 bg-[linear-gradient(100deg,var(--brand-deep),var(--brand))] text-white">
      <div className="mx-auto flex h-[64px] max-w-shell items-center gap-3 px-4 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2.5 text-white">
          <IconLogo size={28} />
          <span className="hidden text-[15px] font-extrabold tracking-tight sm:block">
            SOFTSKILL <span className="text-[var(--accent)]">5C</span>
          </span>
        </NavLink>

        <nav className="ml-2 flex items-center gap-1 overflow-x-auto sm:ml-6">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                'whitespace-nowrap rounded-lg px-3 py-2 text-[13.5px] font-bold transition ' +
                (isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white')
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className="relative grid h-9 w-9 place-items-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label={'Notifikasi (' + notifications + ' baru)'}
          >
            <IconBell size={19} />
            {notifications > 0 ? (
              <span className="absolute right-1.5 top-1.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-extrabold text-[#2b1c00]">
                {notifications}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className="hidden h-9 w-9 place-items-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white sm:grid"
            aria-label="Pesan"
          >
            <IconChat size={19} />
          </button>

          <span className="mx-1.5 hidden h-6 w-px bg-white/20 sm:block" />

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition hover:bg-white/10"
            >
              <Avatar initials={user?.initials ?? '??'} size={34} tone="onbrand" />
              <IconChevronDown size={16} className="text-white/70" />
            </button>

            {open ? (
              <div className="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-2xl border border-line bg-surface shadow-pop animate-rise">
                <div className="border-b border-line px-4 py-3">
                  <p className="truncate text-sm font-bold text-ink">{user?.name}</p>
                  <p className="truncate text-[12.5px] text-ink-2">{user?.email}</p>
                  <p className="mt-1.5 inline-flex rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand-ink">
                    {user?.role === 'admin' ? 'Kemahasiswaan' : 'Mahasiswa'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggle}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-ink-2 transition hover:bg-surface-2"
                >
                  {theme === 'dark' ? <IconSun size={17} /> : <IconMoon size={17} />}
                  Mode {theme === 'dark' ? 'terang' : 'gelap'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    navigate('/masuk', { replace: true })
                  }}
                  className="flex w-full items-center gap-2.5 border-t border-line px-4 py-2.5 text-left text-sm font-semibold text-[var(--critical)] transition hover:bg-surface-2"
                >
                  <IconLogout size={17} />
                  Keluar
                </button>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
            className="ml-1 grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
          >
            {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </button>
        </div>
      </div>
    </header>
  )
}
