/** Client-safe photo URL. For other people's photos the level is only a cache key; the server decides what you get. */
export const photoUrl = (photoId: string, level: string | number) => `/api/photos/${photoId}?level=${level}`;
