export const API_BASE = 
  process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : 'http://localhost:5000/api';
