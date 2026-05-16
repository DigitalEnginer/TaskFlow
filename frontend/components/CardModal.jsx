'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useBoardStore } from '@/store/boardStore'
import ConfirmDialog from './ConfirmDialog'
import styles from './CardModal.module.css'

export default function CardModal({ card, boardId, columnId, onClose }) {
  const { updateCard, deleteCard } = useBoardStore()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [form, setForm] = useState({
    title: card.title || '',
    description: card.description || '',
    priority: card.priority || '',
    dueDate: card.dueDate ? card.dueDate.slice(0, 10) : '',
    labels: card.labels?.join(', ') || '',
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [attachmentUrl, setAttachmentUrl] = useState('')
  const [attachments, setAttachments] = useState(card.attachments || [])

  const [uploading, setUploading] = useState(false)

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await api.upload.file(file)
      if (res?.data?.url) {
        const newAttachments = [...attachments, res.data.url]
        const saveRes = await api.cards.update(boardId, card._id, { attachments: newAttachments })
        if (saveRes?.data) {
          setAttachments(saveRes.data.attachments || [])
          updateCard(saveRes.data)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Заголовок обязателен'); return }
    setSaving(true)
    setError('')
    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority || undefined,
        dueDate: form.dueDate || undefined,
        labels: form.labels ? form.labels.split(',').map((l) => l.trim()).filter(Boolean) : [],
      }
      const res = await api.cards.update(boardId, card._id, body)
      if (res?.data) {
        updateCard(res.data)
        onClose()
      } else {
        setError(res?.message || 'Ошибка сохранения')
      }
    } catch (e) {
      setError('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await api.cards.delete(boardId, card._id)
      deleteCard({ cardId: card._id, columnId })
      onClose()
    } catch (e) {
      console.error(e)
      setDeleting(false)
    }
  }

  async function handleAddAttachment() {
    if (!attachmentUrl.trim()) return
    try {
      const res = await api.cards.update(boardId, card._id, {
        attachments: [...attachments, attachmentUrl.trim()],
      })
      if (res?.data) {
        setAttachments(res.data.attachments || [])
        updateCard(res.data)
        setAttachmentUrl('')
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Карточка</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Заголовок *</label>
            <input
              className={styles.input}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Заголовок карточки"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Описание</label>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Подробное описание задачи..."
              rows={4}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Приоритет</label>
              <select
                className={styles.select}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="">— Не задан —</option>
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Дедлайн</label>
              <input
                type="date"
                className={styles.input}
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Метки (через запятую)</label>
            <input
              className={styles.input}
              value={form.labels}
              onChange={(e) => setForm({ ...form, labels: e.target.value })}
              placeholder="bug, feature, review"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Вложения</label>
            {attachments.length > 0 && (
              <div className={styles.attachmentList}>
                {attachments.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer" className={styles.attachmentLink}>
                    📎 {url.split('/').pop() || `Файл ${i + 1}`}
                  </a>
                ))}
              </div>
            )}
            <div className={styles.attachmentRow}>
              <label className={styles.btnUploadFile} title="Загрузить файл с компьютера">
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading ? '...' : '📎 Файл'}
              </label>
              <input
                className={styles.input}
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="или вставьте URL"
              />
              <button type="button" className={styles.btnAttach} onClick={handleAddAttachment}>
                +
              </button>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnDelete}
              onClick={() => setConfirmOpen(true)}
              disabled={deleting}
            >
              {deleting ? '...' : 'Удалить'}
            </button>
            <button type="submit" className={styles.btnSave} disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>

    {confirmOpen && (
      <ConfirmDialog
        message="Удалить карточку? Это действие нельзя отменить."
        onConfirm={() => { setConfirmOpen(false); handleDelete() }}
        onCancel={() => setConfirmOpen(false)}
      />
    )}
    </>
  )
}
