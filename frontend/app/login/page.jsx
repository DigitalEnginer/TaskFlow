'use client'

import LoginForm from '@/components/LoginForm'
import Link from 'next/link'
import styles from './login.module.css'

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>TaskFlow</div>
        <h1 className={styles.title}>Войти в аккаунт</h1>
        <LoginForm />
        <p className={styles.footer}>
          Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </main>
  )
}
