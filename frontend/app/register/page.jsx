'use client'

import RegisterForm from '@/components/RegisterForm'
import Link from 'next/link'
import styles from './register.module.css'

export default function RegisterPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>TaskFlow</div>
        <h1 className={styles.title}>Создать аккаунт</h1>
        <RegisterForm />
        <p className={styles.footer}>
          Уже есть аккаунт? <Link href="/login">Войти</Link>
        </p>
      </div>
    </main>
  )
}
