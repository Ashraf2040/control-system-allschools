// lib/fetchWithSchool.ts
export const fetchWithSchool = async (url: string, options: RequestInit = {}) => {
    const school = localStorage.getItem('selectedSchool') || 'forqan'; // Default school
    const headers = new Headers(options.headers || {});
    headers.set('x-school', school);
  
    const response = await fetch(url, {
      ...options,
      headers,
    });
  
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  
    return response;
  };