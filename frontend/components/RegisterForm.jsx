'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import styles from './LoginForm.module.css'

export default function RegisterForm() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Заполните все поля')
      return
    }

    setLoading(true)
    try {
      const res = await api.auth.register(form)
      if (res?.data?.token) {
        localStorage.setItem('taskflow_token', res.data.token)
        router.push('/dashboard')
      } else {
        setError(res?.message || 'Ошибка регистрации')
      }
    } catch (err) {
      setError('Ошибка подключения к серверу')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      {error && <p className={styles.error} role="alert">{error}</p>}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="name">Имя</label>
        <input
          id="name"
          type="text"
          className={styles.input}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Ваше имя"
          autoComplete="name"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className={styles.input}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">Пароль</label>
        <input
          id="password"
          type="password"
          className={styles.input}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Минимум 6 символов"
          autoComplete="new-password"
        />
      </div>

      <button type="submit" className={styles.btn} disabled={loading}>
        {loading ? 'Регистрация...' : 'Создать аккаунт'}
      </button>
    </form>
  )
}
