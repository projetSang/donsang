const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

export const apiUrl = (endpoint: string) => {
  return `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = apiUrl(endpoint);
  
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
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      const text = await response.text();
      throw new Error(`API Error: ${response.status} - ${text}`);
    }

    // Handle validation errors
    if (response.status === 422 && errorData.errors) {
      const errorMessages = Object.values(errorData.errors).flat();
      throw Object.assign(
        new Error(errorMessages.map(String).join(", ") || errorData.message || `API Error: ${response.status}`),
        errorData
      );
    }

    throw Object.assign(new Error(errorData.message || `API Error: ${response.status}`), errorData);
  }
  
  return response.json();
};
