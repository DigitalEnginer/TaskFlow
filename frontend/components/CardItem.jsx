'use client'

import styles from './CardItem.module.css'

const PRIORITY_LABEL = { low: 'Низкий', medium: 'Средний', high: 'Высокий' }

export default function CardItem({ card, columnId, boardId, onClick }) {
  function handleDragStart(e) {
    e.stopPropagation() // не даём всплыть до drag колонки
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ cardId: card._id, sourceColumnId: columnId })
    )
    e.dataTransfer.effectAllowed = 'move'
  }

  const hasDueDate = card.dueDate
  const isOverdue = hasDueDate && new Date(card.dueDate) < new Date()

  return (
    <div
      className={styles.card}
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Labels */}
      {card.labels?.length > 0 && (
        <div className={styles.labels}>
          {card.labels.map((label, i) => (
            <span key={i} className={styles.label}>{label}</span>
          ))}
        </div>
      )}

      <p className={styles.title}>{card.title}</p>

      {/* Priority badge */}
      {card.priority && (
        <span className={`${styles.priority} ${styles[card.priority]}`} data-testid="priority-badge">
          {PRIORITY_LABEL[card.priority] || card.priority}
        </span>
      )}

      <div className={styles.meta}>
        {/* Due date */}
        {hasDueDate && (
          <span className={`${styles.due} ${isOverdue ? styles.overdue : ''}`}>
            📅 {new Date(card.dueDate).toLocaleDateString('ru-RU')}
          </span>
        )}

        {/* Attachments */}
        {card.attachments?.length > 0 && (
          <span className={styles.attachment}>📎 {card.attachments.length}</span>
        )}

        {/* Assignees */}
        {card.assignees?.length > 0 && (
          <div className={styles.assignees}>
            {card.assignees.slice(0, 3).map((u) => (
              <div key={u._id} className={styles.assigneeAvatar} title={u.name}>
                {u.avatar ? (
                  <img src={u.avatar} alt={u.name} />
                ) : (
                  u.name?.[0]?.toUpperCase()
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
