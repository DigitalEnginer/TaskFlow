'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useGlobalWebSocket } from '@/lib/useGlobalWebSocket'
import Navbar from '@/components/Navbar'
import BoardCard from '@/components/BoardCard'
import ConfirmDialog from '@/components/ConfirmDialog'
import styles from './dashboard.module.css'

const BG_PRESETS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
]

export default function DashboardPage() {
  const router = useRouter()
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', background: BG_PRESETS[0] })
  const [error, setError] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('taskflow_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchBoards()

    function onVisible() {
      if (document.visibilityState === 'visible') fetchBoards()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  useGlobalWebSocket((msg) => {
    if (msg.type === 'BOARD_ADDED') fetchBoards()
    if (msg.type === 'BOARD_REMOVED') {
      setBoards((prev) => prev.filter((b) => b._id !== msg.payload.boardId))
    }
  })

  async function fetchBoards() {
    setLoading(true)
    try {
      const res = await api.boards.list()
      if (res?.data) setBoards(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setCreating(true)
    setError('')
    try {
      const res = await api.boards.create(form)
      if (res?.data) {
        setBoards((prev) => [res.data, ...prev])
        setForm({ title: '', description: '', background: BG_PRESETS[0] })
        setShowUrlInput(false)
        setShowForm(false)
      } else {
        setError(res?.message || 'Ошибка при создании')
      }
    } catch (e) {
      setError('Ошибка при создании доски')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(boardId) {
    try {
      await api.boards.delete(boardId)
      setBoards((prev) => prev.filter((b) => b._id !== boardId))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Мои доски</h1>
          <button className={styles.btnNew} onClick={() => setShowForm(true)}>
            + Новая доска
          </button>
        </div>

        {showForm && (
          <div className={styles.formOverlay} onClick={() => { setShowForm(false); setShowUrlInput(false) }}>
            <div className={styles.formCard} onClick={(e) => e.stopPropagation()}>
              <h2 className={styles.formTitle}>Создать доску</h2>
              {error && <p className={styles.error}>{error}</p>}
              <form onSubmit={handleCreate} className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>Название *</label>
                  <input
                    className={styles.input}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Название доски"
                    required
                    autoFocus
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Описание</label>
                  <input
                    className={styles.input}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Описание проекта"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Фон доски</label>
                  <div className={styles.bgPresets}>
                    {BG_PRESETS.map((bg, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`${styles.bgSwatch} ${form.background === bg ? styles.bgSwatchActive : ''}`}
                        style={{ background: bg }}
                        onClick={() => setForm({ ...form, background: bg })}
                        title={`Пресет ${i + 1}`}
                      />
                    ))}
                  </div>
                  <div className={styles.bgCustomRow}>
                    <label className={styles.bgColorLabel}>
                      Свой цвет:
                      <input
                        type="color"
                        className={styles.bgColorInput}
                        value={form.background.startsWith('#') ? form.background : '#667eea'}
                        onChange={(e) => setForm({ ...form, background: e.target.value })}
                      />
                    </label>
                    <button
                      type="button"
                      className={styles.bgUrlToggle}
                      onClick={() => setShowUrlInput(!showUrlInput)}
                    >
                      {showUrlInput ? 'Скрыть URL' : 'URL картинки'}
                    </button>
                  </div>
                  {showUrlInput && (
                    <input
                      className={styles.input}
                      value={form.background.startsWith('http') ? form.background : ''}
                      onChange={(e) => setForm({ ...form, background: e.target.value })}
                      placeholder="https://example.com/photo.jpg"
                    />
                  )}
                  {form.background && (
                    <div
                      className={styles.bgPreview}
                      style={form.background.startsWith('http')
                        ? { backgroundImage: `url(${form.background})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : { background: form.background }}
                    />
                  )}
                </div>
                <div className={styles.formActions}>
                  <button type="button" className={styles.btnCancel} onClick={() => setShowForm(false)}>
                    Отмена
                  </button>
                  <button type="submit" className={styles.btnSubmit} disabled={creating}>
                    {creating ? 'Создание...' : 'Создать'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>Загрузка досок...</div>
        ) : boards.length === 0 ? (
          <div className={styles.empty}>
            <p>У вас пока нет досок.</p>
            <button className={styles.btnNew} onClick={() => setShowForm(true)}>
              Создать первую доску
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {boards.map((board) => (
              <BoardCard
                key={board._id}
                board={board}
                onDelete={setConfirmDeleteId}
              />
            ))}
          </div>
        )}
      </main>
    </div>
    {confirmDeleteId && (
      <ConfirmDialog
        message="Удалить доску? Это действие нельзя отменить."
        onConfirm={() => { handleDelete(confirmDeleteId); setConfirmDeleteId(null) }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    )}
    </>
  )
}
