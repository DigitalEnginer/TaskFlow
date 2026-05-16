'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import styles from './Navbar.module.css'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('taskflow_token')
    if (token) {
      api.auth.me().then((res) => {
        if (res?.data) setUser(res.data)
      })
    }
  }, [])

  function handleLogout() {
    api.auth.logout().finally(() => {
      localStorage.removeItem('taskflow_token')
      router.push('/login')
    })
  }

  const avatarLetter = user?.name?.[0]?.toUpperCase() || '?'

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link href="/dashboard" className={styles.logo}>TaskFlow</Link>

        <nav className={styles.nav}>
          <Link
            href="/dashboard"
            className={`${styles.link} ${pathname === '/dashboard' ? styles.active : ''}`}
          >
            Доски
          </Link>
          <Link
            href="/profile"
            className={`${styles.link} ${pathname === '/profile' ? styles.active : ''}`}
          >
            Профиль
          </Link>
        </nav>

        <div className={styles.user}>
          {user && (
            <button className={styles.avatar} onClick={() => setMenuOpen(!menuOpen)}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
              ) : (
                <span className={styles.avatarLetter}>{avatarLetter}</span>
              )}
            </button>
          )}

          {menuOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownUser}>
                <strong>{user?.name}</strong>
                <span className={styles.dropdownEmail}>{user?.email}</span>
              </div>
              <Link href="/profile" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                Профиль
              </Link>
              <button className={styles.dropdownItem} onClick={handleLogout}>
                Выйти
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
