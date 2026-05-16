'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import Navbar from '@/components/Navbar'
import styles from './profile.module.css'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({ name: '', bio: '', avatar: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('taskflow_token')
    if (!token) { router.push('/login'); return }
    fetchUser()
  }, [])

  async function fetchUser() {
    const res = await api.auth.me()
    if (res?.data) {
      setUser(res.data)
      setForm({ name: res.data.name || '', bio: res.data.bio || '', avatar: res.data.avatar || '' })
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const res = await api.auth.update({ name: form.name, bio: form.bio, avatar: form.avatar })
      if (res?.data) {
        setUser(res.data)
        setMessage('Профиль обновлён!')
      } else {
        setError(res?.message || 'Ошибка сохранения')
      }
    } catch (err) {
      setError('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Файл слишком большой. Максимум 5MB.')
      return
    }
    setUploading(true)
    setError('')
    setMessage('')

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target.result
      setForm((prev) => ({ ...prev, avatar: base64 }))
      try {
        const res = await api.auth.update({ name: form.name, bio: form.bio, avatar: base64 })
        if (res?.data) {
          setUser(res.data)
          setMessage('Аватар обновлён!')
        } else {
          setError(res?.message || 'Ошибка сохранения')
        }
      } catch {
        setError('Ошибка сохранения')
      } finally {
        setUploading(false)
      }
    }
    reader.onerror = () => { setError('Не удалось прочитать файл'); setUploading(false) }
    reader.readAsDataURL(file)
  }

  if (!user) {
    return (
      <div className={styles.layout}>
        <Navbar />
        <div className={styles.loading}>Загрузка...</div>
      </div>
    )
  }

  const avatarLetter = user.name?.[0]?.toUpperCase() || '?'

  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Мой профиль</h1>

          {/* Avatar */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrap}>
              {form.avatar ? (
                <img src={form.avatar} alt="Аватар" className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>{avatarLetter}</div>
              )}
              <label className={styles.avatarOverlay} title="Загрузить фото">
                <input
                  type="file"
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
                {uploading ? '...' : '📷'}
              </label>
            </div>
            <p className={styles.avatarHint}>Нажмите на фото чтобы выбрать изображение (макс. 5MB)</p>
          </div>

          {message && <p className={styles.success}>{message}</p>}
          {error && <p className={styles.error}>{error}</p>}

          <form onSubmit={handleSave} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Имя</label>
              <input
                className={styles.input}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ваше имя"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} value={user.email} disabled />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>О себе</label>
              <textarea
                className={styles.input}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Расскажите о себе..."
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
            <button type="submit" className={styles.btnSave} disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </form>

          <div className={styles.meta}>
            <span>В системе с: {new Date(user.createdAt).toLocaleDateString('ru-RU')}</span>
          </div>
        </div>
      </main>
    </div>
  )
}
