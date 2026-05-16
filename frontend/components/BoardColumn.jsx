'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { useBoardStore } from '@/store/boardStore'
import CardItem from './CardItem'
import CardModal from './CardModal'
import ConfirmDialog from './ConfirmDialog'
import styles from './BoardColumn.module.css'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

function sortCardsByPriority(cards) {
  return [...cards].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 3
    const pb = PRIORITY_ORDER[b.priority] ?? 3
    if (pa !== pb) return pa - pb
    return (a.order ?? 0) - (b.order ?? 0)
  })
}

const emptyForm = { title: '', description: '', priority: '', dueDate: '', labels: '' }

export default function BoardColumn({
  column, boardId, send,
  isDragging, isDragOver,
  onColDragStart, onColDragOver, onColDragLeave, onColDrop,
}) {
  const { board, setBoard, deleteColumn, updateColumn } = useBoardStore()
  const [addingCard, setAddingCard] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(false)
  const [colTitle, setColTitle] = useState(column.title)
  const [selectedCard, setSelectedCard] = useState(null)
  const [cardDragOver, setCardDragOver] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function setField(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  async function handleAddCard(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    try {
      const res = await api.cards.create(boardId, {
        title: form.title.trim(),
        columnId: column._id,
        description: form.description.trim() || undefined,
        priority: form.priority || undefined,
        dueDate: form.dueDate || undefined,
        labels: form.labels
          ? form.labels.split(',').map((l) => l.trim()).filter(Boolean)
          : undefined,
      })
      if (res?.data) {
        setBoard({
          ...board,
          columns: board.columns.map((col) =>
            col._id === column._id
              ? { ...col, cards: [...col.cards, res.data] }
              : col
          ),
        })
        setForm(emptyForm)
        setAddingCard(false)
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleRenameColumn(e) {
    e.preventDefault()
    if (!colTitle.trim() || colTitle === column.title) { setEditing(false); return }
    try {
      const res = await api.columns.update(boardId, column._id, { title: colTitle.trim() })
      if (res?.data) updateColumn(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setEditing(false)
    }
  }

  async function handleDeleteColumn() {
    try {
      await api.columns.delete(boardId, column._id)
      deleteColumn(column._id)
    } catch (err) {
      console.error(err)
    }
  }

  /* ── Card drop handlers ── */
  function onCardDragOver(e) {
    if (e.dataTransfer.types.includes('application/json')) {
      e.preventDefault()
      setCardDragOver(true)
    }
  }

  function onCardDragLeave() { setCardDragOver(false) }

  async function onCardDrop(e) {
    e.preventDefault()
    setCardDragOver(false)
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      if (!data?.cardId || data.sourceColumnId === column._id) return
      const res = await api.cards.move(boardId, {
        cardId: data.cardId,
        sourceColumnId: data.sourceColumnId,
        destinationColumnId: column._id,
        newOrder: column.cards.length,
      })
      if (res) {
        const updated = await api.boards.getById(boardId)
        if (updated?.data) setBoard(updated.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const sortedCards = sortCardsByPriority(column.cards)

  return (
    <>
      <div
        className={[
          styles.column,
          cardDragOver ? styles.cardDragOver : '',
          isDragging   ? styles.colDragging  : '',
          isDragOver   ? styles.colDragOver  : '',
        ].filter(Boolean).join(' ')}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes('application/json')) onCardDragOver(e)
          else if (e.dataTransfer.types.includes('col')) onColDragOver?.(e)
        }}
        onDragLeave={() => { onCardDragLeave(); onColDragLeave?.() }}
        onDrop={(e) => {
          if (e.dataTransfer.types.includes('application/json')) onCardDrop(e)
          else if (e.dataTransfer.types.includes('col')) { e.preventDefault(); onColDrop?.() }
        }}
      >
        <div
          className={styles.header}
          style={column.color ? { borderTopColor: column.color } : {}}
          draggable
          onDragStart={(e) => {
            e.stopPropagation()
            e.dataTransfer.setData('col', column._id)
            onColDragStart?.()
          }}
        >
          {editing ? (
            <form onSubmit={handleRenameColumn} className={styles.editForm}>
              <input
                className={styles.editInput}
                value={colTitle}
                onChange={(e) => setColTitle(e.target.value)}
                autoFocus
                onBlur={handleRenameColumn}
              />
            </form>
          ) : (
            <h3 className={styles.title} onDoubleClick={() => setEditing(true)}>
              {column.title}
              <span className={styles.count}>{column.cards.length}</span>
            </h3>
          )}
          <button className={styles.deleteColBtn} onClick={() => setConfirmDelete(true)} title="Удалить">✕</button>
        </div>

        <div className={styles.cards}>
          {sortedCards.map((card) => (
            <CardItem
              key={card._id}
              card={card}
              columnId={column._id}
              boardId={boardId}
              onClick={() => setSelectedCard(card)}
            />
          ))}
        </div>

        {addingCard ? (
          <form onSubmit={handleAddCard} className={styles.addCardForm}>
            <textarea
              className={styles.cardInput}
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Заголовок карточки *"
              autoFocus
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(e) }
              }}
            />

            <textarea
              className={styles.cardInputSm}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Описание (необязательно)"
              rows={2}
            />

            <div className={styles.cardRow}>
              <select
                className={styles.cardSelect}
                value={form.priority}
                onChange={(e) => setField('priority', e.target.value)}
              >
                <option value="">Без приоритета</option>
                <option value="low">🟢 Низкий</option>
                <option value="medium">🟡 Средний</option>
                <option value="high">🔴 Высокий</option>
              </select>

              <input
                type="date"
                className={styles.cardInputSm}
                value={form.dueDate}
                onChange={(e) => setField('dueDate', e.target.value)}
              />
            </div>

            <input
              className={styles.cardInputSm}
              value={form.labels}
              onChange={(e) => setField('labels', e.target.value)}
              placeholder="Метки: bug, feature..."
            />

            <div className={styles.addCardActions}>
              <button type="submit" className={styles.btnAddCard}>Добавить</button>
              <button
                type="button"
                className={styles.btnCancelCard}
                onClick={() => { setAddingCard(false); setForm(emptyForm) }}
              >
                ✕
              </button>
            </div>
          </form>
        ) : (
          <button className={styles.addCardBtn} onClick={() => setAddingCard(true)}>
            + Добавить карточку
          </button>
        )}
      </div>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          boardId={boardId}
          columnId={column._id}
          onClose={() => setSelectedCard(null)}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          message={`Удалить колонку "${column.title}" со всеми карточками?`}
          onConfirm={() => { setConfirmDelete(false); handleDeleteColumn() }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}
