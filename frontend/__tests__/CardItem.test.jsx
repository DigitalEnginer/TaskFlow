import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import CardItem from '@/components/CardItem'

const baseCard = {
  _id: 'card1',
  title: 'Fix login bug',
  priority: 'high',
  labels: [],
  assignees: [],
  attachments: [],
  dueDate: null,
}

describe('CardItem', () => {
  it('renders the card title', () => {
    render(<CardItem card={baseCard} columnId="col1" boardId="board1" />)
    expect(screen.getByText('Fix login bug')).toBeInTheDocument()
  })

  it('renders the priority badge', () => {
    render(<CardItem card={baseCard} columnId="col1" boardId="board1" />)
    const badge = screen.getByTestId('priority-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Высокий')
  })

  it('applies correct CSS class for high priority', () => {
    render(<CardItem card={baseCard} columnId="col1" boardId="board1" />)
    const badge = screen.getByTestId('priority-badge')
    expect(badge.className).toMatch(/high/)
  })

  it('renders medium priority correctly', () => {
    const card = { ...baseCard, priority: 'medium' }
    render(<CardItem card={card} columnId="col1" boardId="board1" />)
    expect(screen.getByTestId('priority-badge')).toHaveTextContent('Средний')
  })

  it('renders low priority correctly', () => {
    const card = { ...baseCard, priority: 'low' }
    render(<CardItem card={card} columnId="col1" boardId="board1" />)
    expect(screen.getByTestId('priority-badge')).toHaveTextContent('Низкий')
  })

  it('does not render priority badge when priority is absent', () => {
    const card = { ...baseCard, priority: '' }
    render(<CardItem card={card} columnId="col1" boardId="board1" />)
    expect(screen.queryByTestId('priority-badge')).not.toBeInTheDocument()
  })

  it('renders labels', () => {
    const card = { ...baseCard, labels: ['bug', 'urgent'] }
    render(<CardItem card={card} columnId="col1" boardId="board1" />)
    expect(screen.getByText('bug')).toBeInTheDocument()
    expect(screen.getByText('urgent')).toBeInTheDocument()
  })

  it('renders attachment count', () => {
    const card = { ...baseCard, attachments: ['url1', 'url2'] }
    render(<CardItem card={card} columnId="col1" boardId="board1" />)
    expect(screen.getByText(/📎 2/)).toBeInTheDocument()
  })

  it('renders due date', () => {
    const card = { ...baseCard, dueDate: '2025-12-31T00:00:00.000Z' }
    render(<CardItem card={card} columnId="col1" boardId="board1" />)
    expect(screen.getByText(/📅/)).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', () => {
    const handleClick = jest.fn()
    render(
      <CardItem card={baseCard} columnId="col1" boardId="board1" onClick={handleClick} />
    )
    screen.getByText('Fix login bug').closest('[role="button"]').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
