import { create } from 'zustand'

export const useBoardStore = create((set) => ({
  board: null,
  onlineUsers: [],

  setBoard: (board) => set({ board }),

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  moveCard: ({ cardId, sourceColumnId, destinationColumnId, newOrder }) =>
    set((state) => {
      if (!state.board) return state

      const columns = state.board.columns.map((col) => ({
        ...col,
        cards: [...col.cards],
      }))

      let movedCard = null
      const srcCol = columns.find((c) => c._id === sourceColumnId)
      if (srcCol) {
        const idx = srcCol.cards.findIndex((c) => c._id === cardId)
        if (idx !== -1) {
          movedCard = { ...srcCol.cards[idx], column: destinationColumnId, order: newOrder }
          srcCol.cards.splice(idx, 1)
        }
      }

      if (!movedCard) return state

      const dstCol = columns.find((c) => c._id === destinationColumnId)
      if (dstCol) {
        dstCol.cards.splice(newOrder, 0, movedCard)
        dstCol.cards = dstCol.cards.map((c, i) => ({ ...c, order: i }))
      }

      return { board: { ...state.board, columns } }
    }),

  addCard: (card) =>
    set((state) => {
      if (!state.board) return state
      const columns = state.board.columns.map((col) => {
        const colId = typeof col._id === 'string' ? col._id : String(col._id)
        const cardCol = typeof card.column === 'string' ? card.column : String(card.column)
        if (colId === cardCol) {
          return { ...col, cards: [...col.cards, card] }
        }
        return col
      })
      return { board: { ...state.board, columns } }
    }),

  updateCard: (updatedCard) =>
    set((state) => {
      if (!state.board) return state
      const columns = state.board.columns.map((col) => ({
        ...col,
        cards: col.cards.map((c) =>
          c._id === updatedCard._id ? { ...c, ...updatedCard } : c
        ),
      }))
      return { board: { ...state.board, columns } }
    }),

  deleteCard: ({ cardId, columnId }) =>
    set((state) => {
      if (!state.board) return state
      const columns = state.board.columns.map((col) => {
        if (col._id === columnId) {
          return { ...col, cards: col.cards.filter((c) => c._id !== cardId) }
        }
        return col
      })
      return { board: { ...state.board, columns } }
    }),

  addColumn: (column) =>
    set((state) => {
      if (!state.board) return state
      return {
        board: {
          ...state.board,
          columns: [...state.board.columns, { ...column, cards: [] }],
        },
      }
    }),

  updateColumn: (updatedColumn) =>
    set((state) => {
      if (!state.board) return state
      const columns = state.board.columns.map((col) =>
        col._id === updatedColumn._id ? { ...col, ...updatedColumn } : col
      )
      return { board: { ...state.board, columns } }
    }),

  deleteColumn: (columnId) =>
    set((state) => {
      if (!state.board) return state
      return {
        board: {
          ...state.board,
          columns: state.board.columns.filter((c) => c._id !== columnId),
        },
      }
    }),

  reorderColumns: (columnOrder) =>
    set((state) => {
      if (!state.board) return state
      const colMap = {}
      state.board.columns.forEach((c) => { colMap[c._id] = c })
      const columns = columnOrder.map((id) => colMap[id]).filter(Boolean)
      return { board: { ...state.board, columns } }
    }),
}))
