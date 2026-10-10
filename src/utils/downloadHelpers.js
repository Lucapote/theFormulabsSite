/**
 * Utility functions for downloading media assets cleanly in the browser.
 */

/**
 * Triggers a direct file download in the browser without opening unnecessary tabs.
 * Attempts fetch -> blob -> object URL -> anchor download.
 * Falls back to opening the URL in a new tab if fetch or CORS fails.
 *
 * @param {string} url - Target file URL to download.
 * @param {string} [filename] - Desired downloaded filename.
 * @returns {Promise<boolean>} Resolves true if direct blob download succeeded, false if fallback was used.
 */
export async function triggerMediaDownload(url, filename = "descarga-medio") {
  if (!url) return false;

  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) {
      throw new Error(`Error en descarga: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    return true;
  } catch (err) {
    console.warn("Direct blob download failed, attempting fallback:", err);
    // Fallback: create dynamic anchor with download and target blank
    const fallbackLink = document.createElement("a");
    fallbackLink.href = url;
    fallbackLink.target = "_blank";
    fallbackLink.rel = "noopener noreferrer";
    fallbackLink.download = filename;
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    document.body.removeChild(fallbackLink);
    return false;
  }
}

/**
 * Extracts a sensible file name from a URL or returns a fallback name.
 *
 * @param {string} url - Target URL.
 * @param {string} fallbackName - Fallback name if extraction fails.
 * @returns {string} Sanitized filename.
 */
export function extractFilenameFromUrl(url, fallbackName = "archivo") {
  try {
    const urlObj = new URL(url);
    const segments = urlObj.pathname.split("/");
    const last = segments[segments.length - 1];
    if (last && last.includes(".")) {
      return decodeURIComponent(last);
    }
  } catch {
    // fallback
  }
  return fallbackName;
}

