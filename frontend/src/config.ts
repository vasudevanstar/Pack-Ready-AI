export const API_BASE = 
  process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : (process.env.NODE_ENV === 'production' 
        ? 'https://pack-ready-ai.onrender.com/api'
        : 'http://localhost:5000/api');
