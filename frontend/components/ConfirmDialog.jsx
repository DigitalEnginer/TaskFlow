'use client'

import styles from './ConfirmDialog.module.css'

export default function ConfirmDialog({ message, onConfirm, onCancel, danger = true }) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.icon}>{danger ? '🗑' : '⚠️'}</div>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={onCancel}>Отмена</button>
          <button className={danger ? styles.btnDanger : styles.btnConfirm} onClick={onConfirm}>
            {danger ? 'Удалить' : 'Подтвердить'}
          </button>
        </div>
      </div>
    </div>
  )
}
