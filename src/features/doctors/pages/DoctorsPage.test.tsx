import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { renderApp } from '../../../test/render'
import { server } from '../../../test/server'

describe('DoctorsPage', () => {
  test('shows the doctors after loading', async () => {
    renderApp('/doctors')

    expect(await screen.findByText(/24 doctors/)).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(24)
  })

  test('typing a clinic name filters the list and writes ?q= to the URL', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/doctors')
    await screen.findByText(/24 doctors/)

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'bastille')

    expect(router.state.location.search).toBe('?q=bastille')
    const cards = await screen.findAllByRole('article')
    expect(cards.length).toBeLessThan(24)
    for (const card of cards) {
      expect(card).toHaveTextContent(/Bastille/)
    }
  })

  test('shows the error, then Retry loads the doctors', async () => {
    server.use(
      http.get('/api/doctors', () => HttpResponse.json({ message: 'Server is down' }, { status: 500 }), { once: true }),
    )
    const user = userEvent.setup()
    renderApp('/doctors')

    expect(await screen.findByText('Could not load doctors')).toBeInTheDocument()
    expect(screen.getByText('Server is down')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText(/24 doctors/)).toBeInTheDocument()
  })

  test('Clear search empties the filters and shows all doctors again', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/doctors?q=zzz&specialty=Dentist')

    await user.click(await screen.findByRole('button', { name: 'Clear search' }))

    expect(router.state.location.search).toBe('')
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('')
    expect(await screen.findByText(/24 doctors/)).toBeInTheDocument()
  })
})
