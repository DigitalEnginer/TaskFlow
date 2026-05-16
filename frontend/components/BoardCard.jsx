'use client'

import Link from 'next/link'
import styles from './BoardCard.module.css'

export default function BoardCard({ board, onDelete }) {
  const bg = board.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  const isGradient = bg.startsWith('linear') || bg.startsWith('radial')
  const isColor = bg.startsWith('#') || bg.startsWith('rgb')

  const ownerLetter = board.owner?.name?.[0]?.toUpperCase() || '?'

  return (
    <div className={styles.card}>
      <Link href={`/boards/${board._id}`} className={styles.preview} style={
        isGradient || isColor
          ? { background: bg }
          : { backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      }>
        <span className={styles.previewTitle}>{board.title}</span>
      </Link>
      <div className={styles.body}>
        <h3 className={styles.title}>{board.title}</h3>
        {board.description && (
          <p className={styles.desc}>{board.description}</p>
        )}
        <div className={styles.footer}>
          <div className={styles.members}>
            {board.members?.slice(0, 4).map((m) => (
              <div key={m._id} className={styles.memberAvatar} title={m.name}>
                {m.avatar ? (
                  <img src={m.avatar} alt={m.name} />
                ) : (
                  m.name?.[0]?.toUpperCase()
                )}
              </div>
            ))}
            {(board.members?.length || 0) > 4 && (
              <div className={styles.memberMore}>+{board.members.length - 4}</div>
            )}
          </div>
          {onDelete && (
            <button
              className={styles.deleteBtn}
              onClick={() => onDelete(board._id)}
              title="Удалить доску"
            >
              🗑
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
