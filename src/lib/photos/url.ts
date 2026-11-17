/** Client-safe photo URL. The level is only a cache key; the server decides what you get. */
export const photoUrl = (photoId: string, level: string | number) => `/api/photos/${photoId}?v=${level}`;
