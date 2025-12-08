/**
 * Validates if a URL is from YouTube, Vimeo, or Google Drive.
 * @param url The URL string to check
 * @returns boolean
 */
export const isValidVideoUrl = (url: string): boolean => {
  // Regex pattern for allowed domains
  const pattern =
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|drive\.google\.com)\/.+$/;

  return pattern.test(url);
};
