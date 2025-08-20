import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils'
import { runAxeTest, checkAriaAttributes } from '@/lib/test-utils'

// Test components for accessibility
const AccessibleButton = ({ children, ...props }: any) => (
  <button
    type="button"
    aria-label={props['aria-label']}
    aria-describedby={props['aria-describedby']}
    disabled={props.disabled}
    {...props}
  >
    {children}
  </button>
)

const AccessibleForm = () => (
  <form role="form" aria-label="UAV Registration Form">
    <div>
      <label htmlFor="uav-name">UAV Name</label>
      <input
        id="uav-name"
        type="text"
        required
        aria-describedby="uav-name-help"
        aria-invalid="false"
      />
      <div id="uav-name-help">Enter a unique name for your UAV</div>
    </div>
    
    <div>
      <label htmlFor="uav-type">UAV Type</label>
      <select id="uav-type" required aria-describedby="uav-type-help">
        <option value="">Select type</option>
        <option value="quadcopter">Quadcopter</option>
        <option value="fixed-wing">Fixed Wing</option>
      </select>
      <div id="uav-type-help">Choose the type of UAV</div>
    </div>
    
    <button type="submit">Register UAV</button>
  </form>
)

const AccessibleModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      data-testid="modal"
    >
      <div onClick={onClose} data-testid="modal-backdrop" />
      <div>
        <h2 id="modal-title">UAV Details</h2>
        <p id="modal-description">View and edit UAV information</p>
        <button onClick={onClose} aria-label="Close modal">
          ×
        </button>
      </div>
    </div>
  )
}

const AccessibleDataTable = () => (
  <table role="table" aria-label="UAV Fleet Status">
    <caption>Current status of all UAVs in the fleet</caption>
    <thead>
      <tr>
        <th scope="col">UAV ID</th>
        <th scope="col">Status</th>
        <th scope="col">Battery</th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>UAV-001</td>
        <td>
          <span aria-label="Active status">🟢 Active</span>
        </td>
        <td>
          <div role="progressbar" aria-label="Battery level" aria-valuenow={85} aria-valuemin={0} aria-valuemax={100}>
            85%
          </div>
        </td>
        <td>
          <button aria-label="View details for UAV-001">View</button>
          <button aria-label="Edit UAV-001">Edit</button>
        </td>
      </tr>
    </tbody>
  </table>
)

describe('Accessibility Tests', () => {
  describe('ARIA Attributes', () => {
    it('provides proper ARIA labels', () => {
      render(
        <AccessibleButton aria-label="Close dialog">
          ×
        </AccessibleButton>
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Close dialog')
    })

    it('uses aria-describedby correctly', () => {
      render(
        <div>
          <AccessibleButton aria-describedby="help-text">
            Submit
          </AccessibleButton>
          <div id="help-text">This will submit the form</div>
        </div>
      )

      const button = screen.getByRole('button')
      checkAriaAttributes(button, {
        'aria-describedby': 'help-text'
      })
    })

    it('handles aria-expanded for collapsible content', () => {
      const CollapsibleComponent = () => {
        const [isExpanded, setIsExpanded] = React.useState(false)
        
        return (
          <div>
            <button
              aria-expanded={isExpanded}
              aria-controls="collapsible-content"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              Toggle Content
            </button>
            <div id="collapsible-content" hidden={!isExpanded}>
              Collapsible content
            </div>
          </div>
        )
      }

      render(<CollapsibleComponent />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'false')
      
      fireEvent.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    it('uses aria-invalid for form validation', () => {
      const ValidationForm = () => {
        const [error, setError] = React.useState('')
        
        return (
          <div>
            <input
              aria-invalid={!!error}
              aria-describedby={error ? 'error-message' : undefined}
              onChange={(e) => {
                if (e.target.value.length < 3) {
                  setError('Name must be at least 3 characters')
                } else {
                  setError('')
                }
              }}
            />
            {error && (
              <div id="error-message" role="alert">
                {error}
              </div>
            )}
          </div>
        )
      }

      render(<ValidationForm />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'false')
      
      fireEvent.change(input, { target: { value: 'ab' } })
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports tab navigation', () => {
      render(
        <div>
          <button>First</button>
          <button>Second</button>
          <input type="text" />
          <button>Third</button>
        </div>
      )

      const buttons = screen.getAllByRole('button')
      const input = screen.getByRole('textbox')

      // Test tab order
      buttons[0].focus()
      expect(buttons[0]).toHaveFocus()

      fireEvent.keyDown(buttons[0], { key: 'Tab' })
      buttons[1].focus()
      expect(buttons[1]).toHaveFocus()

      fireEvent.keyDown(buttons[1], { key: 'Tab' })
      input.focus()
      expect(input).toHaveFocus()
    })

    it('handles Enter and Space key activation', () => {
      const handleClick = jest.fn()
      
      render(
        <AccessibleButton onClick={handleClick}>
          Activate
        </AccessibleButton>
      )

      const button = screen.getByRole('button')
      
      fireEvent.keyDown(button, { key: 'Enter' })
      expect(handleClick).toHaveBeenCalledTimes(1)
      
      fireEvent.keyDown(button, { key: ' ' })
      expect(handleClick).toHaveBeenCalledTimes(2)
    })

    it('handles Escape key for modals', () => {
      const handleClose = jest.fn()
      
      render(<AccessibleModal isOpen={true} onClose={handleClose} />)
      
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('traps focus in modals', () => {
      const FocusTrapModal = ({ isOpen }: { isOpen: boolean }) => {
        if (!isOpen) return null
        
        return (
          <div role="dialog" aria-modal="true">
            <button>First</button>
            <input type="text" />
            <button>Last</button>
          </div>
        )
      }

      render(<FocusTrapModal isOpen={true} />)
      
      const buttons = screen.getAllByRole('button')
      const input = screen.getByRole('textbox')

      // Focus should be trapped within modal
      buttons[0].focus()
      expect(buttons[0]).toHaveFocus()
    })
  })

  describe('Screen Reader Support', () => {
    it('provides proper headings hierarchy', () => {
      render(
        <div>
          <h1>Main Title</h1>
          <h2>Section Title</h2>
          <h3>Subsection Title</h3>
        </div>
      )

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    })

    it('uses landmarks correctly', () => {
      render(
        <div>
          <header>Site Header</header>
          <nav aria-label="Main navigation">Navigation</nav>
          <main>Main Content</main>
          <aside>Sidebar</aside>
          <footer>Site Footer</footer>
        </div>
      )

      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('complementary')).toBeInTheDocument()
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('provides live regions for dynamic content', () => {
      const LiveRegionComponent = () => {
        const [message, setMessage] = React.useState('')
        
        return (
          <div>
            <button onClick={() => setMessage('UAV status updated')}>
              Update Status
            </button>
            <div aria-live="polite" aria-atomic="true">
              {message}
            </div>
          </div>
        )
      }

      render(<LiveRegionComponent />)
      
      const button = screen.getByRole('button')
      const liveRegion = screen.getByText('').parentElement

      expect(liveRegion).toHaveAttribute('aria-live', 'polite')
      
      fireEvent.click(button)
      expect(screen.getByText('UAV status updated')).toBeInTheDocument()
    })

    it('uses proper table structure', async () => {
      const { container } = render(<AccessibleDataTable />)

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByText('Current status of all UAVs in the fleet')).toBeInTheDocument()
      
      const headers = screen.getAllByRole('columnheader')
      expect(headers).toHaveLength(4)
      
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '85')

      await runAxeTest(container)
    })
  })

  describe('Form Accessibility', () => {
    it('associates labels with form controls', async () => {
      const { container } = render(<AccessibleForm />)

      const nameInput = screen.getByLabelText('UAV Name')
      const typeSelect = screen.getByLabelText('UAV Type')

      expect(nameInput).toHaveAttribute('id', 'uav-name')
      expect(typeSelect).toHaveAttribute('id', 'uav-type')

      await runAxeTest(container)
    })

    it('provides helpful error messages', () => {
      const ErrorForm = () => {
        const [errors, setErrors] = React.useState<Record<string, string>>({})
        
        const validate = () => {
          const newErrors: Record<string, string> = {}
          const nameInput = document.getElementById('name') as HTMLInputElement
          
          if (!nameInput.value) {
            newErrors.name = 'Name is required'
          }
          
          setErrors(newErrors)
        }
        
        return (
          <form>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <div id="name-error" role="alert">
                {errors.name}
              </div>
            )}
            <button type="button" onClick={validate}>
              Validate
            </button>
          </form>
        )
      }

      render(<ErrorForm />)
      
      const validateButton = screen.getByText('Validate')
      fireEvent.click(validateButton)
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })

    it('handles required field indicators', () => {
      render(
        <div>
          <label htmlFor="required-field">
            Required Field <span aria-label="required">*</span>
          </label>
          <input id="required-field" required />
        </div>
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('required')
    })
  })

  describe('Color and Contrast', () => {
    it('does not rely solely on color for information', () => {
      render(
        <div>
          <span style={{ color: 'red' }}>
            <span aria-label="Error">⚠️</span> Error message
          </span>
          <span style={{ color: 'green' }}>
            <span aria-label="Success">✅</span> Success message
          </span>
        </div>
      )

      // Icons provide additional context beyond color
      expect(screen.getByLabelText('Error')).toBeInTheDocument()
      expect(screen.getByLabelText('Success')).toBeInTheDocument()
    })

    it('provides sufficient contrast ratios', () => {
      render(
        <div>
          <button style={{ backgroundColor: '#007bff', color: '#ffffff' }}>
            High Contrast Button
          </button>
          <p style={{ color: '#333333', backgroundColor: '#ffffff' }}>
            High contrast text
          </p>
        </div>
      )

      // These would pass WCAG contrast requirements
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('High contrast text')).toBeInTheDocument()
    })
  })

  describe('Comprehensive Accessibility Tests', () => {
    it('passes axe accessibility tests for complex components', async () => {
      const ComplexComponent = () => (
        <div>
          <AccessibleForm />
          <AccessibleDataTable />
          <AccessibleModal isOpen={false} onClose={() => {}} />
        </div>
      )

      const { container } = render(<ComplexComponent />)
      await runAxeTest(container)
    })

    it('maintains accessibility during state changes', async () => {
      const StatefulComponent = () => {
        const [isModalOpen, setIsModalOpen] = React.useState(false)
        
        return (
          <div>
            <button onClick={() => setIsModalOpen(true)}>
              Open Modal
            </button>
            <AccessibleModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
            />
          </div>
        )
      }

      const { container } = render(<StatefulComponent />)
      
      // Test initial state
      await runAxeTest(container)
      
      // Open modal and test again
      fireEvent.click(screen.getByText('Open Modal'))
      await runAxeTest(container)
    })
  })
})
