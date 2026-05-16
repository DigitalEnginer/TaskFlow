import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/lib/api', () => ({
  api: {
    auth: {
      login: jest.fn(),
    },
  },
}))

import LoginForm from '@/components/LoginForm'
import { api } from '@/lib/api'

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders email and password fields', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument()
  })

  it('shows error when fields are empty on submit', async () => {
    render(<LoginForm />)
    fireEvent.click(screen.getByRole('button', { name: /войти/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Заполните все поля')
    })
  })

  it('shows error when only email is filled', async () => {
    render(<LoginForm />)
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@test.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /войти/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('calls api.auth.login with correct data', async () => {
    api.auth.login.mockResolvedValue({ data: { token: 'fake-token', user: {} } })
    render(<LoginForm />)
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/пароль/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /войти/i }))
    await waitFor(() => {
      expect(api.auth.login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      })
    })
  })

  it('shows server error message on failed login', async () => {
    api.auth.login.mockResolvedValue({ message: 'Неверный email или пароль' })
    render(<LoginForm />)
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'bad@user.com' },
    })
    fireEvent.change(screen.getByLabelText(/пароль/i), {
      target: { value: 'wrongpass' },
    })
    fireEvent.click(screen.getByRole('button', { name: /войти/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Неверный email или пароль')
    })
  })
})
