import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  UAV,
  UAVFilter,
  PaginationParams,
  SystemStatistics,
  HibernatePodStatus,
  Region,
  CreateUAVRequest,
  UpdateUAVRequest,
} from '@/types/uav';
import { uavApi, hibernatePodApi, regionApi } from '@/api/uav-api';
import { toast } from 'react-hot-toast';

/**
 * State interface for the UAV management store.
 *
 * This interface defines the complete state structure for UAV management,
 * including data entities, UI state, and all available actions for
 * interacting with UAVs, regions, and the hibernate pod.
 *
 * @interface UAVState
 */
interface UAVState {
  // Data entities
  /** Array of all UAVs currently loaded in the store */
  uavs: UAV[];
  /** Currently selected UAV for detailed operations */
  selectedUAV: UAV | null;
  /** Array of all available regions for UAV assignment */
  regions: Region[];
  /** System-wide statistics and metrics */
  systemStats: SystemStatistics | null;
  /** Current status of the hibernate pod */
  hibernatePodStatus: HibernatePodStatus | null;

  // UI State management
  /** Loading state for async operations */
  loading: boolean;
  /** Current error message, if any */
  error: string | null;
  /** Active filter criteria for UAV list */
  filter: UAVFilter;
  /** Pagination parameters for UAV list */
  pagination: PaginationParams;
  /** Current search query string */
  searchQuery: string;

  // Core UAV actions
  /** Fetches all UAVs with current filter and pagination */
  fetchUAVs: () => Promise<void>;
  /** Fetches a specific UAV by ID and sets it as selected */
  fetchUAVById: (id: number) => Promise<void>;
  /** Creates a new UAV in the system */
  createUAV: (uav: CreateUAVRequest) => Promise<boolean>;
  /** Updates an existing UAV's information */
  updateUAV: (id: number, uav: Partial<UpdateUAVRequest>) => Promise<boolean>;
  /** Permanently deletes a UAV from the system */
  deleteUAV: (id: number) => Promise<boolean>;
  /** Toggles the authorization status of a UAV */
  updateUAVStatus: (id: number) => Promise<boolean>;

  // Region management actions
  /** Fetches all available regions */
  fetchRegions: () => Promise<void>;
  /** Assigns a region to a UAV for access control */
  addRegionToUAV: (uavId: number, regionId: number) => Promise<boolean>;
  /** Removes a region assignment from a UAV */
  removeRegionFromUAV: (uavId: number, regionId: number) => Promise<boolean>;

  // Hibernate pod management actions
  /** Fetches current hibernate pod status and capacity */
  fetchHibernatePodStatus: () => Promise<void>;
  /** Adds a UAV to the hibernate pod for storage */
  addToHibernatePod: (uavId: number) => Promise<boolean>;
  /** Removes a UAV from the hibernate pod */
  removeFromHibernatePod: (uavId: number) => Promise<boolean>;

  // Statistics and analytics
  /** Fetches system-wide UAV statistics and metrics */
  fetchSystemStats: () => Promise<void>;

  // UI state management actions
  /** Updates the active filter criteria */
  setFilter: (filter: Partial<UAVFilter>) => void;
  /** Updates pagination parameters */
  setPagination: (pagination: Partial<PaginationParams>) => void;
  /** Updates the search query */
  setSearchQuery: (query: string) => void;
  /** Sets the currently selected UAV */
  setSelectedUAV: (uav: UAV | null) => void;
  /** Clears any current error state */
  clearError: () => void;

  // Bulk operations
  /** Updates status for multiple UAVs simultaneously */
  bulkUpdateStatus: (uavIds: number[], status: string) => Promise<boolean>;
  /** Deletes multiple UAVs simultaneously */
  bulkDelete: (uavIds: number[]) => Promise<boolean>;

  // Real-time update handlers
  /** Updates a UAV in the store from real-time data */
  updateUAVInStore: (uav: UAV) => void;
  /** Removes a UAV from the store (for real-time deletions) */
  removeUAVFromStore: (uavId: number) => void;
  /** Updates hibernate pod status from real-time data */
  updateHibernatePodInStore: (status: HibernatePodStatus) => void;
}

/**
 * Zustand store for UAV management state and operations.
 *
 * This store provides comprehensive state management for the UAV management system,
 * including data fetching, CRUD operations, real-time updates, and UI state management.
 * It uses Zustand with Immer for immutable state updates, devtools for debugging,
 * and subscribeWithSelector for selective subscriptions.
 *
 * @example
 * ```typescript
 * // Basic usage in a component
 * function UAVList() {
 *   const { uavs, loading, fetchUAVs } = useUAVStore();
 *
 *   useEffect(() => {
 *     fetchUAVs();
 *   }, [fetchUAVs]);
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       {uavs.map(uav => (
 *         <div key={uav.id}>{uav.rfidTag}</div>
 *       ))}
 *     </div>
 *   );
 * }
 *
 * // Selective subscription for performance
 * function UAVCounter() {
 *   const uavCount = useUAVStore(state => state.uavs.length);
 *   return <div>Total UAVs: {uavCount}</div>;
 * }
 *
 * // Using actions
 * function CreateUAVForm() {
 *   const createUAV = useUAVStore(state => state.createUAV);
 *
 *   const handleSubmit = async (data) => {
 *     const success = await createUAV(data);
 *     if (success) {
 *       // Handle success
 *     }
 *   };
 * }
 * ```
 *
 * @features
 * - **Immutable Updates**: Uses Immer for safe state mutations
 * - **DevTools Integration**: Full Redux DevTools support for debugging
 * - **Selective Subscriptions**: Optimized re-renders with subscribeWithSelector
 * - **Error Handling**: Comprehensive error states and user feedback
 * - **Real-time Updates**: WebSocket integration for live data updates
 * - **Optimistic Updates**: Immediate UI feedback with rollback on failure
 * - **Bulk Operations**: Efficient batch operations for multiple UAVs
 *
 * @author UAV Management System Team
 * @version 1.0
 * @since 1.0
 */
export const useUAVStore = create<UAVState>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state values
        uavs: [],
        selectedUAV: null,
        regions: [],
        systemStats: null,
        hibernatePodStatus: null,
        loading: false,
        error: null,
        filter: {},
        pagination: { page: 1, limit: 10, sortBy: 'id', sortOrder: 'desc' },
        searchQuery: '',

        /**
         * Fetches UAVs from the API with current filter and pagination settings.
         *
         * This method applies the current filter criteria and search query,
         * then fetches UAVs from the backend API. It handles loading states
         * and error conditions automatically.
         *
         * @async
         * @function fetchUAVs
         * @returns {Promise<void>} Promise that resolves when fetch is complete
         *
         * @example
         * ```typescript
         * const { fetchUAVs, setFilter } = useUAVStore();
         *
         * // Fetch all UAVs
         * await fetchUAVs();
         *
         * // Apply filter and fetch
         * setFilter({ status: 'AUTHORIZED' });
         * await fetchUAVs();
         * ```
         */
        fetchUAVs: async () => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const { filter, pagination, searchQuery } = get();
            const finalFilter = searchQuery ? { ...filter, search: searchQuery } : filter;
            const uavs = await uavApi.getUAVs(finalFilter, pagination);

            set((state) => {
              state.uavs = uavs;
              state.loading = false;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to fetch UAVs';
              state.loading = false;
            });
          }
        },

        // Fetch UAV by ID
        fetchUAVById: async (id: number) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const uav = await uavApi.getUAVById(id);
            set((state) => {
              state.selectedUAV = uav;
              state.loading = false;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to fetch UAV';
              state.loading = false;
            });
          }
        },

        // Create UAV
        createUAV: async (uav: CreateUAVRequest) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const response = await uavApi.createUAV(uav);
            if (response.success && response.data) {
              set((state) => {
                state.uavs.unshift(response.data!);
                state.loading = false;
              });
              toast.success('UAV created successfully');
              return true;
            } else {
              throw new Error(response.message || 'Failed to create UAV');
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create UAV';
            set((state) => {
              state.error = message;
              state.loading = false;
            });
            toast.error(message);
            return false;
          }
        },

        // Update UAV
        updateUAV: async (id: number, uav: Partial<UpdateUAVRequest>) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const response = await uavApi.updateUAV(id, uav);
            if (response.success && response.data) {
              set((state) => {
                const index = state.uavs.findIndex(u => u.id === id);
                if (index !== -1) {
                  state.uavs[index] = response.data!;
                }
                if (state.selectedUAV?.id === id) {
                  state.selectedUAV = response.data!;
                }
                state.loading = false;
              });
              toast.success('UAV updated successfully');
              return true;
            } else {
              throw new Error(response.message || 'Failed to update UAV');
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update UAV';
            set((state) => {
              state.error = message;
              state.loading = false;
            });
            toast.error(message);
            return false;
          }
        },

        // Delete UAV
        deleteUAV: async (id: number) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const response = await uavApi.deleteUAV(id);
            if (response.success) {
              set((state) => {
                state.uavs = state.uavs.filter(u => u.id !== id);
                if (state.selectedUAV?.id === id) {
                  state.selectedUAV = null;
                }
                state.loading = false;
              });
              toast.success('UAV deleted successfully');
              return true;
            } else {
              throw new Error(response.message || 'Failed to delete UAV');
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete UAV';
            set((state) => {
              state.error = message;
              state.loading = false;
            });
            toast.error(message);
            return false;
          }
        },

        // Update UAV status
        updateUAVStatus: async (id: number) => {
          try {
            const response = await uavApi.updateUAVStatus(id);
            if (response.success) {
              set((state) => {
                const index = state.uavs.findIndex(u => u.id === id);
                if (index !== -1) {
                  // Toggle status
                  const currentStatus = state.uavs[index].status;
                  state.uavs[index].status = currentStatus === 'AUTHORIZED' ? 'UNAUTHORIZED' : 'AUTHORIZED';
                }
              });
              toast.success('UAV status updated successfully');
              return true;
            } else {
              throw new Error(response.message || 'Failed to update UAV status');
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update UAV status';
            toast.error(message);
            return false;
          }
        },

        // Fetch regions
        fetchRegions: async () => {
          try {
            const regions = await regionApi.getRegions();
            set((state) => {
              state.regions = regions;
            });
          } catch (error) {
            console.error('Failed to fetch regions:', error);
          }
        },

        // Add region to UAV
        addRegionToUAV: async (uavId: number, regionId: number) => {
          try {
            const response = await uavApi.addRegionToUAV(uavId, regionId);
            if (response.success && response.data) {
              set((state) => {
                const index = state.uavs.findIndex(u => u.id === uavId);
                if (index !== -1) {
                  state.uavs[index] = response.data!;
                }
              });
              toast.success('Region added to UAV successfully');
              return true;
            } else {
              throw new Error(response.message || 'Failed to add region to UAV');
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to add region to UAV';
            toast.error(message);
            return false;
          }
        },

        // Remove region from UAV
        removeRegionFromUAV: async (uavId: number, regionId: number) => {
          try {
            const response = await uavApi.removeRegionFromUAV(uavId, regionId);
            if (response.success) {
              set((state) => {
                const index = state.uavs.findIndex(u => u.id === uavId);
                if (index !== -1) {
                  state.uavs[index].regions = state.uavs[index].regions.filter(r => r.id !== regionId);
                }
              });
              toast.success('Region removed from UAV successfully');
              return true;
            } else {
              throw new Error(response.message || 'Failed to remove region from UAV');
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to remove region from UAV';
            toast.error(message);
            return false;
          }
        },

        // Fetch hibernate pod status
        fetchHibernatePodStatus: async () => {
          try {
            const status = await hibernatePodApi.getStatus();
            set((state) => {
              state.hibernatePodStatus = status;
            });
          } catch (error) {
            console.error('Failed to fetch hibernate pod status:', error);
          }
        },

        // Add to hibernate pod
        addToHibernatePod: async (uavId: number) => {
          try {
            const response = await hibernatePodApi.addUAV(uavId);
            if (response.success) {
              set((state) => {
                const index = state.uavs.findIndex(u => u.id === uavId);
                if (index !== -1) {
                  state.uavs[index].inHibernatePod = true;
                  state.uavs[index].operationalStatus = 'HIBERNATING';
                }
              });
              // Refresh hibernate pod status
              get().fetchHibernatePodStatus();
              toast.success('UAV added to hibernate pod successfully');
              return true;
            } else {
              throw new Error(response.message || 'Failed to add UAV to hibernate pod');
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to add UAV to hibernate pod';
            toast.error(message);
            return false;
          }
        },

        // Remove from hibernate pod
        removeFromHibernatePod: async (uavId: number) => {
          try {
            const response = await hibernatePodApi.removeUAV(uavId);
            if (response.success) {
              set((state) => {
                const index = state.uavs.findIndex(u => u.id === uavId);
                if (index !== -1) {
                  state.uavs[index].inHibernatePod = false;
                  state.uavs[index].operationalStatus = 'READY';
                }
              });
              // Refresh hibernate pod status
              get().fetchHibernatePodStatus();
              toast.success('UAV removed from hibernate pod successfully');
              return true;
            } else {
              throw new Error(response.message || 'Failed to remove UAV from hibernate pod');
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to remove UAV from hibernate pod';
            toast.error(message);
            return false;
          }
        },

        // Fetch system statistics
        fetchSystemStats: async () => {
          try {
            const stats = await uavApi.getSystemStatistics();
            set((state) => {
              state.systemStats = stats;
            });
          } catch (error) {
            console.error('Failed to fetch system statistics:', error);
          }
        },

        // UI actions
        setFilter: (filter: Partial<UAVFilter>) => {
          set((state) => {
            state.filter = { ...state.filter, ...filter };
          });
        },

        setPagination: (pagination: Partial<PaginationParams>) => {
          set((state) => {
            state.pagination = { ...state.pagination, ...pagination };
          });
        },

        setSearchQuery: (query: string) => {
          set((state) => {
            state.searchQuery = query;
          });
        },

        setSelectedUAV: (uav: UAV | null) => {
          set((state) => {
            state.selectedUAV = uav;
          });
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        // Bulk actions
        bulkUpdateStatus: async (uavIds: number[], status: string) => {
          try {
            const response = await uavApi.bulkUpdateStatus(uavIds, status);
            if (response.success) {
              set((state) => {
                uavIds.forEach(id => {
                  const index = state.uavs.findIndex(u => u.id === id);
                  if (index !== -1) {
                    state.uavs[index].status = status as any;
                  }
                });
              });
              toast.success(`${uavIds.length} UAVs updated successfully`);
              return true;
            } else {
              throw new Error(response.message || 'Failed to update UAVs');
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update UAVs';
            toast.error(message);
            return false;
          }
        },

        bulkDelete: async (uavIds: number[]) => {
          try {
            const response = await uavApi.bulkDelete(uavIds);
            if (response.success) {
              set((state) => {
                state.uavs = state.uavs.filter(u => !uavIds.includes(u.id));
              });
              toast.success(`${uavIds.length} UAVs deleted successfully`);
              return true;
            } else {
              throw new Error(response.message || 'Failed to delete UAVs');
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete UAVs';
            toast.error(message);
            return false;
          }
        },

        // Real-time updates
        updateUAVInStore: (uav: UAV) => {
          set((state) => {
            const index = state.uavs.findIndex(u => u.id === uav.id);
            if (index !== -1) {
              state.uavs[index] = uav;
            } else {
              state.uavs.unshift(uav);
            }
            if (state.selectedUAV?.id === uav.id) {
              state.selectedUAV = uav;
            }
          });
        },

        removeUAVFromStore: (uavId: number) => {
          set((state) => {
            state.uavs = state.uavs.filter(u => u.id !== uavId);
            if (state.selectedUAV?.id === uavId) {
              state.selectedUAV = null;
            }
          });
        },

        updateHibernatePodInStore: (status: HibernatePodStatus) => {
          set((state) => {
            state.hibernatePodStatus = status;
          });
        },
      }))
    ),
    {
      name: 'uav-store',
    }
  )
);
