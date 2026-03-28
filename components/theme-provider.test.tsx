import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from './theme-provider'

const mockThemeProvider = vi.fn(({ children, ...props }: any) => (
  <div data-testid="theme-provider" {...props}>{children}</div>
))

vi.mock('next-themes', () => ({
  ThemeProvider: (props: any) => mockThemeProvider(props),
}))

describe('ThemeProvider', () => {
  beforeEach(() => {
    mockThemeProvider.mockClear()
  })

  it('renders children prop', () => {
    render(
      <ThemeProvider>
        <span>Test Child</span>
      </ThemeProvider>
    )
    expect(screen.getByText('Test Child')).toBeInTheDocument()
    expect(mockThemeProvider).toHaveBeenCalled()
  })

  it('passes attribute prop to NextThemesProvider', () => {
    render(
      <ThemeProvider attribute="class">
        <span>Test</span>
      </ThemeProvider>
    )
    expect(mockThemeProvider).toHaveBeenCalledWith(
      expect.objectContaining({ attribute: 'class' })
    )
  })

  it('passes defaultTheme prop to NextThemesProvider', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <span>Test</span>
      </ThemeProvider>
    )
    expect(mockThemeProvider).toHaveBeenCalledWith(
      expect.objectContaining({ defaultTheme: 'dark' })
    )
  })

  it('passes enableSystem prop to NextThemesProvider', () => {
    render(
      <ThemeProvider enableSystem={true}>
        <span>Test</span>
      </ThemeProvider>
    )
    expect(mockThemeProvider).toHaveBeenCalledWith(
      expect.objectContaining({ enableSystem: true })
    )
  })

  it('passes multiple props to NextThemesProvider', () => {
    render(
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={true}
        disableTransitionOnChange={false}
      >
        <span>Test</span>
      </ThemeProvider>
    )
    expect(mockThemeProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        attribute: 'class',
        defaultTheme: 'light',
        enableSystem: true,
        disableTransitionOnChange: false,
      })
    )
  })

  it('works without any props', () => {
    render(
      <ThemeProvider>
        <span>Test</span>
      </ThemeProvider>
    )
    expect(mockThemeProvider).toHaveBeenCalledWith(
      expect.objectContaining({ children: expect.anything() })
    )
  })

  it('passes children to NextThemesProvider', () => {
    render(
      <ThemeProvider>
        <span data-testid="child">Child Content</span>
      </ThemeProvider>
    )
    const provider = screen.getByTestId('theme-provider')
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(provider).toContainElement(screen.getByTestId('child'))
  })
})
