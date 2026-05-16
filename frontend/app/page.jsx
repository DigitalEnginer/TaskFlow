import { redirect } from 'next/navigation'
import Link from 'next/link'
import styles from './landing.module.css'

export default function LandingPage() {
  return (
    <main className={styles.landing}>
      <div className={styles.hero}>
        <h1 className={styles.title}>TaskFlow</h1>
        <p className={styles.subtitle}>
          Управляй задачами как профессионал. Доски, колонки, карточки — всё в реальном времени.
        </p>
        <div className={styles.actions}>
          <Link href="/register" className={styles.btnPrimary}>Начать бесплатно</Link>
          <Link href="/login" className={styles.btnSecondary}>Войти</Link>
        </div>
      </div>
    </main>
  )
}
