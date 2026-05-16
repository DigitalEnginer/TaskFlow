'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useBoardStore } from '@/store/boardStore'
import { useWebSocket } from '@/lib/useWebSocket'
import Navbar from '@/components/Navbar'
import BoardColumn from '@/components/BoardColumn'
import OnlineUsers from '@/components/OnlineUsers'
import CardModal from '@/components/CardModal'
import styles from './board.module.css'

export default function BoardPage() {
  const router = useRouter()
  const params = useParams()
  const boardId = params.boardId

  const { board, setBoard } = useBoardStore()
  const { send } = useWebSocket(boardId)

  const [loading, setLoading] = useState(true)
  const [addingCol, setAddingCol] = useState(false)
  const [newColTitle, setNewColTitle] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [draggingColId, setDraggingColId] = useState(null)
  const [dragOverColId, setDragOverColId] = useState(null)
  const [selectedSearchCard, setSelectedSearchCard] = useState(null)
  const [selectedSearchColumnId, setSelectedSearchColumnId] = useState(null)
  const [membersOpen, setMembersOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteStatus, setInviteStatus] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('taskflow_token')
    if (!token) { router.push('/login'); return }
    fetchBoard()
  }, [boardId])

  async function fetchBoard() {
    setLoading(true)
    try {
      const res = await api.boards.getById(boardId)
      if (res?.data) {
        setBoard(res.data)
      } else {
        router.push('/dashboard')
      }
    } catch (e) {
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddColumn(e) {
    e.preventDefault()
    if (!newColTitle.trim()) return
    try {
      const res = await api.columns.create(boardId, { title: newColTitle.trim() })
      if (res?.data) {
        setBoard({
          ...board,
          columns: [...(board?.columns || []), { ...res.data, cards: [] }],
        })
        setNewColTitle('')
        setAddingCol(false)
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function handleSearch(e) {
    e.preventDefault()
    if (!searchQuery.trim()) { setSearchResults(null); return }
    setSearching(true)
    try {
      const res = await api.search.cards(searchQuery, boardId)
      setSearchResults(res?.cards || res?.data?.cards || [])
    } catch (e) {
      console.error(e)
    } finally {
      setSearching(false)
    }
  }

  function clearSearch() {
    setSearchQuery('')
    setSearchResults(null)
  }

  function handleSearchResultClick(searchCard) {
    for (const col of board.columns || []) {
      const found = col.cards.find((c) => c._id === searchCard._id)
      if (found) {
        setSelectedSearchCard(found)
        setSelectedSearchColumnId(col._id)
        return
      }
    }
    setSelectedSearchCard(searchCard)
    setSelectedSearchColumnId(searchCard.column?._id)
  }

  async function handleInviteMember(e) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviteStatus('loading')
    try {
      const found = await api.users.findByEmail(inviteEmail.trim())
      if (!found?.data?._id) {
        setInviteStatus(found?.message || 'Пользователь не найден')
        return
      }
      const res = await api.boards.addMember(boardId, { userId: found.data._id })
      if (res?.data) {
        setInviteStatus(`${found.data.name} добавлен!`)
        setBoard({ ...board, members: res.data.members })
        setInviteEmail('')
      } else {
        setInviteStatus(res?.message || 'Ошибка')
      }
    } catch {
      setInviteStatus('Ошибка при добавлении')
    }
  }

  function handleColDragStart(colId) {
    setDraggingColId(colId)
  }

  function handleColDragOver(e, colId) {
    e.preventDefault()
    if (colId !== draggingColId) setDragOverColId(colId)
  }

  function handleColDragLeave() {
    setDragOverColId(null)
  }

  async function handleColDrop(targetColId) {
    setDragOverColId(null)
    if (!draggingColId || draggingColId === targetColId) {
      setDraggingColId(null)
      return
    }
    const cols = [...(board.columns || [])]
    const fromIdx = cols.findIndex((c) => c._id === draggingColId)
    const toIdx = cols.findIndex((c) => c._id === targetColId)
    if (fromIdx === -1 || toIdx === -1) { setDraggingColId(null); return }

    const reordered = [...cols]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)

    setBoard({ ...board, columns: reordered })
    setDraggingColId(null)

    try {
      await api.columns.reorder(boardId, {
        columnOrder: reordered.map((c) => c._id),
      })
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div className={styles.layout}>
        <Navbar />
        <div className={styles.loading}>Загрузка доски...</div>
      </div>
    )
  }

  if (!board) return null

  const boardBg = board.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  const isGradient = boardBg.startsWith('linear') || boardBg.startsWith('radial')
  const isColor = !isGradient && (boardBg.startsWith('#') || boardBg.startsWith('rgb'))

  return (
    <>
    <div className={styles.layout}>
      <Navbar />
      <div
        className={styles.boardWrapper}
        style={
          isGradient
            ? { background: boardBg }
            : isColor
              ? { background: boardBg }
              : { backgroundImage: `url(${boardBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        }
      >
        {/* Board header */}
        <div className={styles.boardHeader}>
          <div className={styles.boardInfo}>
            <h1 className={styles.boardTitle}>{board.title}</h1>
            <OnlineUsers />
            <button className={styles.membersBtn} onClick={() => { setMembersOpen(true); setInviteStatus('') }}>
              Участники
            </button>
          </div>

          {/* Search */}
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <input
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск карточек..."
            />
            <button type="submit" className={styles.searchBtn} disabled={searching}>
              {searching ? '...' : 'Найти'}
            </button>
            {searchResults !== null && (
              <button type="button" className={styles.clearBtn} onClick={clearSearch}>✕</button>
            )}
          </form>
        </div>

        {/* Search results */}
        {searchResults !== null && (
          <div className={styles.searchResults}>
            <h3 className={styles.searchTitle}>
              Результаты поиска ({searchResults.length})
            </h3>
            {searchResults.length === 0 ? (
              <p className={styles.noResults}>Ничего не найдено</p>
            ) : (
              <div className={styles.resultsList}>
                {searchResults.map((card) => (
                  <div key={card._id} className={styles.resultItem} onClick={() => handleSearchResultClick(card)}>
                    <span className={styles.resultTitle}>{card.title}</span>
                    <span className={styles.resultCol}>{card.column?.title}</span>
                    {card.priority && (
                      <span className={`${styles.priority} ${styles[card.priority]}`}>
                        {card.priority}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Columns */}
        <div className={styles.columns}>
          {board.columns?.map((column) => (
            <BoardColumn
              key={column._id}
              column={column}
              boardId={boardId}
              send={send}
              isDragging={draggingColId === column._id}
              isDragOver={dragOverColId === column._id}
              onColDragStart={() => handleColDragStart(column._id)}
              onColDragOver={(e) => handleColDragOver(e, column._id)}
              onColDragLeave={handleColDragLeave}
              onColDrop={() => handleColDrop(column._id)}
            />
          ))}

          {/* Add column */}
          <div className={styles.addColumnWrapper}>
            {addingCol ? (
              <form className={styles.addColForm} onSubmit={handleAddColumn}>
                <input
                  className={styles.addColInput}
                  value={newColTitle}
                  onChange={(e) => setNewColTitle(e.target.value)}
                  placeholder="Название колонки"
                  autoFocus
                />
                <div className={styles.addColActions}>
                  <button type="submit" className={styles.btnAdd}>Добавить</button>
                  <button
                    type="button"
                    className={styles.btnCancelCol}
                    onClick={() => { setAddingCol(false); setNewColTitle('') }}
                  >
                    ✕
                  </button>
                </div>
              </form>
            ) : (
              <button className={styles.addColumnBtn} onClick={() => setAddingCol(true)}>
                <span style={{fontSize:'1.1rem'}}>＋</span> Добавить колонку
              </button>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Members panel */}
      {membersOpen && (
        <div className={styles.membersOverlay} onClick={() => setMembersOpen(false)}>
          <div className={styles.membersPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.membersPanelHeader}>
              <h3>Участники доски</h3>
              <button className={styles.membersPanelClose} onClick={() => setMembersOpen(false)}>✕</button>
            </div>

            <div className={styles.membersList}>
              {board.members?.map((m) => (
                <div key={m._id} className={styles.memberItem}>
                  <div className={styles.memberAvatar}>
                    {m.avatar ? <img src={m.avatar} alt={m.name} /> : (m.name?.[0] || '?').toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.memberName}>{m.name}</div>
                    <div className={styles.memberEmail}>{m.email}</div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleInviteMember} className={styles.inviteForm}>
              <p className={styles.inviteLabel}>Пригласить по email:</p>
              <div className={styles.inviteRow}>
                <input
                  className={styles.inviteInput}
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => { setInviteEmail(e.target.value); setInviteStatus('') }}
                  placeholder="user@example.com"
                />
                <button type="submit" className={styles.inviteBtn} disabled={inviteStatus === 'loading'}>
                  {inviteStatus === 'loading' ? '...' : 'Добавить'}
                </button>
              </div>
              {inviteStatus && inviteStatus !== 'loading' && (
                <p className={`${styles.inviteStatus} ${inviteStatus.includes('добавлен') ? styles.inviteOk : styles.inviteErr}`}>
                  {inviteStatus}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Card modal opened from search results */}
      {selectedSearchCard && (
        <CardModal
          card={selectedSearchCard}
          boardId={boardId}
          columnId={selectedSearchColumnId}
          onClose={() => setSelectedSearchCard(null)}
        />
      )}
    </>
  )
}
