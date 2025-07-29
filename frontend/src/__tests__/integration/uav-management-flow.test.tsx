import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils'
import { useUAVStore } from '@/stores/uav-store'
import { uavApi } from '@/api/uav-api'
import { createMockUAV } from '@/lib/test-utils'
import { UAV } from '@/types/uav'

// Mock the API
jest.mock('@/api/uav-api')
const mockedUAVApi = uavApi as jest.Mocked<typeof uavApi>

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Integration test component for UAV management
const UAVManagementTestComponent = () => {
  const {
    uavs,
    selectedUAV,
    loading: isLoading,
    error,
    fetchUAVs,
    setSelectedUAV,
    updateUAVStatus,
    createUAV,
    updateUAV,
    deleteUAV
  } = useUAVStore()

  const [showCreateForm, setShowCreateForm] = React.useState(false)
  const [formData, setFormData] = React.useState({
    rfidTag: '',
    ownerName: '',
    model: '',
  })

  React.useEffect(() => {
    fetchUAVs()
  }, [fetchUAVs])

  const handleCreateUAV = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await createUAV(formData)
    if (success) {
      setShowCreateForm(false)
      setFormData({ rfidTag: '', ownerName: '', model: '' })
    }
  }

  const handleUpdateStatus = async (uavId: number) => {
    await updateUAVStatus(uavId)
  }

  const handleDeleteUAV = async (uavId: number) => {
    if (window.confirm('Are you sure you want to delete this UAV?')) {
      await deleteUAV(uavId)
    }
  }

  if (isLoading && uavs.length === 0) {
    return <div>Loading UAVs...</div>
  }

  return (
    <div>
      <h1>UAV Management</h1>
      
      {error && <div role="alert">{error}</div>}
      
      <div>
        <button onClick={() => setShowCreateForm(true)}>
          Add New UAV
        </button>
        <button onClick={() => fetchUAVs()} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateUAV} data-testid="create-form">
          <h2>Create New UAV</h2>
          
          <div>
            <label htmlFor="rfidTag">RFID Tag</label>
            <input
              id="rfidTag"
              type="text"
              value={formData.rfidTag}
              onChange={(e) => setFormData(prev => ({ ...prev, rfidTag: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label htmlFor="ownerName">Owner Name</label>
            <input
              id="ownerName"
              type="text"
              value={formData.ownerName}
              onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label htmlFor="model">Model</label>
            <input
              id="model"
              type="text"
              value={formData.model}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              required
            />
          </div>
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create UAV'}
          </button>
          <button type="button" onClick={() => setShowCreateForm(false)}>
            Cancel
          </button>
        </form>
      )}

      <div data-testid="uav-list">
        {uavs.length === 0 ? (
          <p>No UAVs found</p>
        ) : (
          uavs.map(uav => (
            <div key={uav.id} data-testid={`uav-item-${uav.id}`}>
              <h3>{uav.rfidTag}</h3>
              <p>Owner: {uav.ownerName}</p>
              <p>Model: {uav.model}</p>
              <p>Status: {uav.status}</p>
              <p>Operational Status: {uav.operationalStatus}</p>
              
              <div>
                <button onClick={() => setSelectedUAV(uav)}>
                  {selectedUAV?.id === uav.id ? 'Selected' : 'Select'}
                </button>
                <button onClick={() => handleUpdateStatus(uav.id)}>
                  Update Status
                </button>
                <button onClick={() => handleDeleteUAV(uav.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedUAV && (
        <div data-testid="selected-uav-details">
          <h2>Selected UAV Details</h2>
          <p>ID: {selectedUAV.id}</p>
          <p>RFID: {selectedUAV.rfidTag}</p>
          <p>Owner: {selectedUAV.ownerName}</p>
          <p>Model: {selectedUAV.model}</p>
          <p>Flight Hours: {selectedUAV.totalFlightHours}</p>
          <p>Flight Cycles: {selectedUAV.totalFlightCycles}</p>
        </div>
      )}
    </div>
  )
}

describe('UAV Management Flow Integration Tests', () => {
  const mockUAVs: UAV[] = [
    createMockUAV({
      id: 1,
      rfidTag: 'UAV-001',
      ownerName: 'John Doe',
      model: 'Quadcopter X1',
      status: 'AUTHORIZED',
      operationalStatus: 'READY',
    }),
    createMockUAV({
      id: 2,
      rfidTag: 'UAV-002',
      ownerName: 'Jane Smith',
      model: 'Fixed Wing Y2',
      status: 'PENDING',
      operationalStatus: 'MAINTENANCE',
    }),
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset UAV store
    useUAVStore.setState({
      uavs: [],
      selectedUAV: null,
      loading: false,
      error: null,
      filter: {},
      pagination: { page: 1, limit: 10, sortBy: 'id', sortOrder: 'desc' },
      searchQuery: '',
      regions: [],
      systemStats: null,
      hibernatePodStatus: null,
    })

    // Mock window.confirm
    window.confirm = jest.fn()
  })

  it('loads and displays UAVs on mount', async () => {
    mockedUAVApi.getUAVs.mockResolvedValue(mockUAVs)

    render(<UAVManagementTestComponent />)

    // Should show loading initially
    expect(screen.getByText('Loading UAVs...')).toBeInTheDocument()

    // Wait for UAVs to load
    await waitFor(() => {
      expect(screen.getByText('UAV-001')).toBeInTheDocument()
      expect(screen.getByText('UAV-002')).toBeInTheDocument()
    })

    // Should display UAV details
    expect(screen.getByText('Owner: John Doe')).toBeInTheDocument()
    expect(screen.getByText('Model: Quadcopter X1')).toBeInTheDocument()
    expect(screen.getByText('Status: AUTHORIZED')).toBeInTheDocument()

    // Verify API was called
    expect(mockedUAVApi.getUAVs).toHaveBeenCalled()
  })

  it('handles UAV selection', async () => {
    mockedUAVApi.getUAVs.mockResolvedValue(mockUAVs)

    render(<UAVManagementTestComponent />)

    // Wait for UAVs to load
    await waitFor(() => {
      expect(screen.getByText('UAV-001')).toBeInTheDocument()
    })

    // Select first UAV
    const selectButton = screen.getAllByText('Select')[0]
    fireEvent.click(selectButton)

    // Should show selected UAV details
    await waitFor(() => {
      expect(screen.getByTestId('selected-uav-details')).toBeInTheDocument()
      expect(screen.getByText('ID: 1')).toBeInTheDocument()
      expect(screen.getByText('RFID: UAV-001')).toBeInTheDocument()
    })

    // Button should show as selected
    expect(screen.getByText('Selected')).toBeInTheDocument()
  })

  it('creates new UAV successfully', async () => {
    mockedUAVApi.getUAVs.mockResolvedValue([])
    
    const newUAV = createMockUAV({
      id: 3,
      rfidTag: 'UAV-003',
      ownerName: 'New Owner',
      model: 'New Model',
    })
    
    mockedUAVApi.createUAV.mockResolvedValue({
      success: true,
      data: newUAV,
      message: 'UAV created successfully',
    })

    // Mock updated list after creation
    mockedUAVApi.getUAVs.mockResolvedValueOnce([]).mockResolvedValueOnce([newUAV])

    render(<UAVManagementTestComponent />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('No UAVs found')).toBeInTheDocument()
    })

    // Open create form
    fireEvent.click(screen.getByText('Add New UAV'))
    expect(screen.getByTestId('create-form')).toBeInTheDocument()

    // Fill in form
    fireEvent.change(screen.getByLabelText('RFID Tag'), {
      target: { value: 'UAV-003' }
    })
    fireEvent.change(screen.getByLabelText('Owner Name'), {
      target: { value: 'New Owner' }
    })
    fireEvent.change(screen.getByLabelText('Model'), {
      target: { value: 'New Model' }
    })

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Create UAV' }))

    // Wait for creation to complete
    await waitFor(() => {
      expect(screen.getByText('UAV-003')).toBeInTheDocument()
    })

    // Form should be hidden
    expect(screen.queryByTestId('create-form')).not.toBeInTheDocument()

    // Verify API was called
    expect(mockedUAVApi.createUAV).toHaveBeenCalledWith({
      rfidTag: 'UAV-003',
      ownerName: 'New Owner',
      model: 'New Model',
    })
  })

  it('handles UAV creation failure', async () => {
    mockedUAVApi.getUAVs.mockResolvedValue([])
    mockedUAVApi.createUAV.mockRejectedValue(new Error('RFID tag already exists'))

    render(<UAVManagementTestComponent />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('No UAVs found')).toBeInTheDocument()
    })

    // Open create form and fill it
    fireEvent.click(screen.getByText('Add New UAV'))
    
    fireEvent.change(screen.getByLabelText('RFID Tag'), {
      target: { value: 'DUPLICATE-TAG' }
    })
    fireEvent.change(screen.getByLabelText('Owner Name'), {
      target: { value: 'Owner' }
    })
    fireEvent.change(screen.getByLabelText('Model'), {
      target: { value: 'Model' }
    })

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Create UAV' }))

    // Wait for error
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('RFID tag already exists')).toBeInTheDocument()
    })

    // Form should still be visible
    expect(screen.getByTestId('create-form')).toBeInTheDocument()
  })

  it('updates UAV status', async () => {
    mockedUAVApi.getUAVs.mockResolvedValue(mockUAVs)
    mockedUAVApi.updateUAVStatus.mockResolvedValue({
      success: true,
      message: 'Status updated',
    })

    render(<UAVManagementTestComponent />)

    // Wait for UAVs to load
    await waitFor(() => {
      expect(screen.getByText('UAV-001')).toBeInTheDocument()
    })

    // Click update status for first UAV
    const updateButtons = screen.getAllByText('Update Status')
    fireEvent.click(updateButtons[0])

    // Wait for update to complete
    await waitFor(() => {
      expect(mockedUAVApi.updateUAVStatus).toHaveBeenCalledWith(1)
    })
  })

  it('deletes UAV with confirmation', async () => {
    mockedUAVApi.getUAVs.mockResolvedValue(mockUAVs)
    mockedUAVApi.deleteUAV.mockResolvedValue({
      success: true,
      message: 'UAV deleted',
    })
    
    // Mock updated list after deletion
    mockedUAVApi.getUAVs.mockResolvedValueOnce(mockUAVs).mockResolvedValueOnce([mockUAVs[1]])
    
    ;(window.confirm as jest.Mock).mockReturnValue(true)

    render(<UAVManagementTestComponent />)

    // Wait for UAVs to load
    await waitFor(() => {
      expect(screen.getByText('UAV-001')).toBeInTheDocument()
    })

    // Click delete for first UAV
    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])

    // Should show confirmation
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this UAV?')

    // Wait for deletion to complete
    await waitFor(() => {
      expect(mockedUAVApi.deleteUAV).toHaveBeenCalledWith(1)
    })
  })

  it('cancels deletion when user declines confirmation', async () => {
    mockedUAVApi.getUAVs.mockResolvedValue(mockUAVs)
    ;(window.confirm as jest.Mock).mockReturnValue(false)

    render(<UAVManagementTestComponent />)

    // Wait for UAVs to load
    await waitFor(() => {
      expect(screen.getByText('UAV-001')).toBeInTheDocument()
    })

    // Click delete for first UAV
    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])

    // Should show confirmation but not call delete API
    expect(window.confirm).toHaveBeenCalled()
    expect(mockedUAVApi.deleteUAV).not.toHaveBeenCalled()
  })

  it('handles refresh functionality', async () => {
    mockedUAVApi.getUAVs.mockResolvedValue(mockUAVs)

    render(<UAVManagementTestComponent />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('UAV-001')).toBeInTheDocument()
    })

    // Clear previous calls
    mockedUAVApi.getUAVs.mockClear()

    // Click refresh
    fireEvent.click(screen.getByText('Refresh'))

    // Should show loading state
    expect(screen.getByText('Refreshing...')).toBeInTheDocument()

    // Wait for refresh to complete
    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument()
    })

    // Verify API was called again
    expect(mockedUAVApi.getUAVs).toHaveBeenCalled()
  })

  it('handles API errors gracefully', async () => {
    mockedUAVApi.getUAVs.mockRejectedValue(new Error('Network error'))

    render(<UAVManagementTestComponent />)

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    // Should not show loading state
    expect(screen.queryByText('Loading UAVs...')).not.toBeInTheDocument()
  })
})
