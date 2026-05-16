'use client'

import { useBoardStore } from '@/store/boardStore'
import styles from './OnlineUsers.module.css'

export default function OnlineUsers() {
  const onlineUsers = useBoardStore((s) => s.onlineUsers)

  if (onlineUsers.length < 2) return null

  return (
    <div className={styles.wrap}>
      <span className={styles.dot} />
      <span className={styles.count}>{onlineUsers.length} онлайн</span>
      <div className={styles.avatars}>
        {onlineUsers.slice(0, 5).map((u) => (
          <div key={u._id} className={styles.avatar} title={u.name || u._id}>
            {u.avatar ? (
              <img src={u.avatar} alt={u.name} />
            ) : (
              (u.name?.[0] || '?').toUpperCase()
            )}
          </div>
        ))}
        {onlineUsers.length > 5 && (
          <div className={styles.more}>+{onlineUsers.length - 5}</div>
        )}
      </div>
    </div>
  )
}
