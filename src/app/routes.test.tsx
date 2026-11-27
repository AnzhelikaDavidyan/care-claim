import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/render'

describe('app routes', () => {
  test('redirects / to the doctors page', async () => {
    const { router } = renderApp('/')
    expect(await screen.findByRole('heading', { name: 'Doctors' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/doctors')
  })

  test.each([
    ['/doctors/d-001/book', 'Book an appointment'],
    ['/bookings', 'Bookings'],
    ['/bookings/BK-2031/reschedule', 'Reschedule booking BK-2031'],
    ['/claims', 'Claims'],
  ])('%s renders its page inside the layout', async (url, heading) => {
    renderApp(url)
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })

  test.each([
    ['/claims/new', 'New claim'],
    ['/claims/CL-1001/edit', 'Edit claim CL-1001'],
  ])('%s opens the claim drawer over the claims page', async (url, drawerTitle) => {
    renderApp(url)
    expect(await screen.findByRole('heading', { level: 2, name: drawerTitle })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Claims' })).toBeInTheDocument()
  })

  test('unknown URL shows the 404 page with the sidebar', async () => {
    renderApp('/does-not-exist')
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })

  test('Doctors stays the active sidebar link on /doctors/:id/book', async () => {
    const user = userEvent.setup()
    renderApp('/doctors/d-001/book')
    const doctorsLink = await screen.findByRole('link', { name: 'Doctors' })
    const bookingsLink = screen.getByRole('link', { name: 'Bookings' })
    expect(doctorsLink).toHaveAttribute('aria-current', 'page')
    expect(bookingsLink).not.toHaveAttribute('aria-current')

    await user.click(bookingsLink)
    expect(await screen.findByRole('heading', { name: 'Bookings' })).toBeInTheDocument()
    expect(bookingsLink).toHaveAttribute('aria-current', 'page')
    expect(doctorsLink).not.toHaveAttribute('aria-current')
  })
})
