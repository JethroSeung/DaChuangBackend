import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

// Types
interface APIError {
  message: string;
  status: number;
  code?: string;
}

interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

class APIClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp for debugging
        config.metadata = { startTime: new Date() };
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response time in development
        if (process.env.NODE_ENV === 'development') {
          const endTime = new Date();
          const startTime = response.config.metadata?.startTime;
          if (startTime) {
            const duration = endTime.getTime() - startTime.getTime();
            console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url}: ${duration}ms`);
          }
        }

        return response;
      },
      (error) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    // Get token from localStorage or cookie
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private handleError(error: any) {
    let message = 'An unexpected error occurred';
    let status = 500;

    if (error.response) {
      // Server responded with error status
      status = error.response.status;
      message = error.response.data?.message || error.response.statusText;

      switch (status) {
        case 401:
          message = 'Authentication required. Please log in.';
          this.handleAuthError();
          break;
        case 403:
          message = 'You do not have permission to perform this action.';
          break;
        case 404:
          message = 'The requested resource was not found.';
          break;
        case 422:
          message = 'Invalid data provided. Please check your input.';
          break;
        case 429:
          message = 'Too many requests. Please try again later.';
          break;
        case 500:
          message = 'Server error. Please try again later.';
          break;
        case 503:
          message = 'Service temporarily unavailable. Please try again later.';
          break;
      }
    } else if (error.request) {
      // Network error
      message = 'Network error. Please check your connection.';
      status = 0;
    }

    // Show error toast in production, log in development
    if (process.env.NODE_ENV === 'production') {
      toast.error(message);
    } else {
      console.error('API Error:', error);
      toast.error(`${message} (${status})`);
    }
  }

  private handleAuthError() {
    // Clear auth token and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      // Redirect to login page
      window.location.href = '/login';
    }
  }

  // Generic request methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // File upload method
  async uploadFile<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await this.client.post<T>(url, formData, config);
    return response.data;
  }

  // Batch request method
  async batch<T = any>(requests: Array<() => Promise<any>>): Promise<T[]> {
    try {
      const results = await Promise.allSettled(requests.map(req => req()));
      
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(`Batch request ${index} failed:`, result.reason);
          throw result.reason;
        }
      });
    } catch (error) {
      console.error('Batch request failed:', error);
      throw error;
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/actuator/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Set auth token
  setAuthToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  // Clear auth token
  clearAuthToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Get base URL
  getBaseURL(): string {
    return this.baseURL;
  }

  // Cancel all pending requests
  cancelAllRequests() {
    // Implementation would depend on tracking active requests
    // For now, we'll create a new axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.setupInterceptors();
  }
}

// Create singleton instance
const apiClient = new APIClient();

export default apiClient;

// Export types for use in other files
export type { APIError, APIResponse };

// Utility function for handling API responses
export const handleAPIResponse = <T>(response: APIResponse<T>): T => {
  if (!response.success) {
    throw new Error(response.message || 'API request failed');
  }
  return response.data as T;
};

// Utility function for creating query strings
export const createQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
};

// Utility function for retrying failed requests
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw lastError!;
};
