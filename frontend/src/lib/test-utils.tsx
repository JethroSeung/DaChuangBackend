import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n'

// Setup Jest DOM matchers
import '@testing-library/jest-dom'

// Mock framer-motion for tests
export const mockFramerMotion = () => {
  jest.mock('framer-motion', () => ({
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
      button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
      nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
      header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
      main: ({ children, ...props }: any) => <main {...props}>{children}</main>,
      aside: ({ children, ...props }: any) => <aside {...props}>{children}</aside>,
      section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
      article: ({ children, ...props }: any) => <article {...props}>{children}</article>,
      ul: ({ children, ...props }: any) => <ul {...props}>{children}</ul>,
      li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
      h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
      h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
      h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
      p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useAnimation: () => ({
      start: jest.fn(),
      stop: jest.fn(),
      set: jest.fn(),
    }),
    useInView: () => true,
    useMotionValue: () => ({ get: () => 0, set: jest.fn() }),
    useSpring: () => ({ get: () => 0, set: jest.fn() }),
    useTransform: () => ({ get: () => 0 }),
    MotionConfig: ({ children }: any) => <>{children}</>,
  }))
}

// Mock prefers-reduced-motion
export const mockPrefersReducedMotion = (value: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? value : false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
}

const AllTheProviders = ({ 
  children, 
  queryClient = createTestQueryClient() 
}: { 
  children: React.ReactNode
  queryClient?: QueryClient 
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <I18nextProvider i18n={i18n}>
          {children}
        </I18nextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { queryClient, ...renderOptions } = options
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders queryClient={queryClient}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Accessibility testing helper
export const runAxeTest = async (container: Element) => {
  console.warn('jest-axe not available, skipping accessibility test')
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { customRender as render }
export { createTestQueryClient }
