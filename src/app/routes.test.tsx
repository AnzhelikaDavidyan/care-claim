import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/render'

describe('app routes', () => {
  test('redirects / to the claims page', async () => {
    const { router } = renderApp('/')
    expect(await screen.findByRole('heading', { name: 'Claims' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/claims')
  })

  test.each([
    ['/claims/new', 'New claim'],
    ['/claims/c-00001', 'Claim c-00001'],
    ['/claims/c-00001/edit', 'Edit claim c-00001'],
    ['/members', 'Members'],
  ])('%s renders its page inside the layout', async (url, heading) => {
    renderApp(url)
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })

  test('unknown URL shows the 404 page with the sidebar', async () => {
    renderApp('/does-not-exist')
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })

  test('highlights the active sidebar link, including on nested claim routes', async () => {
    const user = userEvent.setup()
    renderApp('/claims/c-00001')
    const claimsLink = await screen.findByRole('link', { name: 'Claims' })
    const membersLink = screen.getByRole('link', { name: 'Members' })
    expect(claimsLink).toHaveAttribute('aria-current', 'page')
    expect(membersLink).not.toHaveAttribute('aria-current')

    await user.click(membersLink)
    expect(await screen.findByRole('heading', { name: 'Members' })).toBeInTheDocument()
    expect(membersLink).toHaveAttribute('aria-current', 'page')
    expect(claimsLink).not.toHaveAttribute('aria-current')
  })
})
