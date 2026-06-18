const DEFAULT_API_BASE_URL = 'http://localhost:4000';

const trimTrailingSlash = (url: string) => url.replace(/\/+$/, '');

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
);

export const buildApiUrl = (path: string) => {
  if (!path.startsWith('/')) {
    return `${API_BASE_URL}/${path}`;
  }
  return `${API_BASE_URL}${path}`;
};
