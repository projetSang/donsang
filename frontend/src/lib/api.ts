const BASE_URL = "http://localhost:8000/api";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const isFormData = options.body instanceof FormData;
  
  const headers: Record<string, string> = {
    "Accept": "application/json",
    ...Object.fromEntries(Object.entries(options.headers || {}) as [string, string][]),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }
  
  return response.json();
};
