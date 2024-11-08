import { getAuthToken, setAuthToken, clearAuthToken, isTokenExpired } from '@/lib/auth';

const API_BASE = "https://962450b2-0b01-4d98-81a6-eb2f6bd25c58-00-2tbe9rimsz2tw.sisko.replit.dev";

export interface ApiResponse<T = any> {
  status: "success" | "error";
  data: T | null;
  message: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
  };
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string;
  created_at: string;
  metadata?: {
    duration?: string;
    format?: string;
    resolution?: string;
    fps?: number;
    size?: number;
  };
}

class ApiClient {
  private refreshPromise: Promise<boolean> | null = null;

  private async getHeaders(): Promise<Headers> {
    const headers = new Headers();
    const token = getAuthToken();
    
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      console.error("API error:", {
        status: response.status,
        statusText: response.statusText,
      });
      
      if (response.status === 401) {
        clearAuthToken();
      }
      
      const errorText = await response.text();
      console.error("Error response:", errorText);
      
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API response:", data);
    return data;
  }

  async login(email: string, password: string): Promise<ApiResponse<TokenResponse>> {
    console.log("Attempting login for:", email);
    
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await this.handleResponse<TokenResponse>(response);
      
      if (data.status === 'success' && data.data?.access_token) {
        console.log("Login successful, setting token");
        setAuthToken(data.data.access_token);
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async refreshToken(): Promise<boolean> {
    // If there's already a refresh in progress, return that promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    try {
      console.log("Attempting token refresh");
      
      // Create new refresh promise
      this.refreshPromise = (async () => {
        const headers = await this.getHeaders();
        const response = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          headers,
          credentials: 'include',
        });

        const data = await this.handleResponse<TokenResponse>(response);
        
        if (data.status === 'success' && data.data?.access_token) {
          console.log("Token refresh successful");
          setAuthToken(data.data.access_token);
          return true;
        }
        
        return false;
      })();

      return await this.refreshPromise;
    } catch (error) {
      console.error("Token refresh error:", error);
      clearAuthToken();
      return false;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();
    
    // Check if token needs refresh before making request
    if (token && isTokenExpired(token)) {
      console.log("Token expired or expiring soon, refreshing...");
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        throw new Error('Authentication failed');
      }
    }
    
    const headers = await this.getHeaders();
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (response.status === 401) {
        console.log("Unauthorized request, attempting token refresh");
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry with new token
          const newHeaders = await this.getHeaders();
          const retryResponse = await fetch(url, {
            ...options,
            headers: newHeaders,
            credentials: 'include',
          });
          
          return this.handleResponse<T>(retryResponse);
        }
        throw new Error('Authentication failed');
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  }

  async sendMessage(message: string, videos?: File[]): Promise<ApiResponse> {
    console.log("Sending message:", { message, videoCount: videos?.length });
    
    const formData = new FormData();
    formData.append('message', message);
    
    if (videos?.length) {
      videos.forEach(video => formData.append('videos', video));
    }

    return this.fetchWithAuth(`${API_BASE}/api/chat/message`, {
      method: 'POST',
      body: formData,
    });
  }

  async getChatHistory(): Promise<ApiResponse<{ history: ChatMessage[] }>> {
    console.log("Fetching chat history");
    return this.fetchWithAuth(`${API_BASE}/api/chat/history`);
  }

  async getVideoAnalysisHistory(): Promise<ApiResponse> {
    console.log("Fetching video analysis history");
    return this.fetchWithAuth(`${API_BASE}/api/video/analysis/history`);
  }

  async checkHealth(): Promise<ApiResponse> {
    console.log("Checking API health");
    const response = await fetch(`${API_BASE}/api/health`);
    return this.handleResponse(response);
  }
}

export const apiClient = new ApiClient();