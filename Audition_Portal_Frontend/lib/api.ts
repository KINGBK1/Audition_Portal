// // API utility functions with automatic token handling

// export const getAuthHeaders = (): HeadersInit => {
//   const token = localStorage.getItem("authToken");
  
//   const headers: HeadersInit = {
//     "Content-Type": "application/json",
//   };
  
//   if (token) {
//     headers["Authorization"] = `Bearer ${token}`;
//   }
  
//   return headers;
// };

// export const apiRequest = async (
//   url: string,
//   options: RequestInit = {}
// ): Promise<Response> => {
//   const defaultOptions: RequestInit = {
//     credentials: "include",
//     headers: getAuthHeaders(),
//   };

//   const mergedOptions: RequestInit = {
//     ...defaultOptions,
//     ...options,
//     headers: {
//       ...defaultOptions.headers,
//       ...(options.headers || {}),
//     },
//   };

//   return fetch(url, mergedOptions);
// };
