/**
 * Extracts the YouTube video ID from various YouTube URL formats.
 * @param url The YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID, https://youtu.be/VIDEO_ID, https://www.youtube.com/embed/VIDEO_ID)
 * @returns The video ID or null if not found.
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  // Handle embed URLs
  if (url.includes('youtube.com/embed/')) {
    const parts = url.split('youtube.com/embed/');
    return parts[1].split(/[?#]/)[0];
  }
  
  // Handle youtu.be URLs
  if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/');
    return parts[1].split(/[?#]/)[0];
  }
  
  // Handle standard watch URLs
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Converts any YouTube URL to a valid embed URL.
 * @param url The YouTube URL.
 * @returns A valid YouTube embed URL.
 */
export function getYouTubeEmbedUrl(url: string): string {
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url; // Return original if no ID found (might be already an embed or invalid)
}
