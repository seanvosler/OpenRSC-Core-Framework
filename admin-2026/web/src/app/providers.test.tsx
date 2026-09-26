import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AppProviders } from '@/app/providers'

describe('AppProviders', () => {
  it('renders application content', () => {
    render(
      <AppProviders>
        <div>OpenRSC Admin 2026</div>
      </AppProviders>,
    )

    expect(screen.getByText('OpenRSC Admin 2026')).toBeInTheDocument()
  })
})
