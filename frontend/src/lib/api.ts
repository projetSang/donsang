const BASE_URL = "https://backend-production-4a57.up.railway.app/api";

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

  console.log(`API Request: ${options.method || 'GET'} ${url}`, options.body);

  const response = await fetch(url, { ...options, headers });
  
  console.log(`API Response: ${response.status} ${response.statusText}`);
  
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      const text = await response.text();
      console.error('API Error Response (text):', text);
      throw new Error(`API Error: ${response.status} - ${text}`);
    }
    
    console.error('API Error Data:', errorData);
    
    // Handle validation errors
    if (response.status === 422 && errorData.errors) {
      console.error('Validation errors:', errorData.errors);
      const errorMessages = Object.values(errorData.errors).flat();
      throw new Error(errorMessages.join(', ') || errorData.message || `API Error: ${response.status}`);
    }
    
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }
  
  return response.json();
};