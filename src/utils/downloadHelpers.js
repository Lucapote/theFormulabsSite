/**
 * Utility functions for downloading media assets cleanly in the browser.
 */

/**
 * Triggers browser download without opening new tabs or leaving the page.
 * Uses a hidden iframe on desktop or location assignment on mobile.
 *
 * @param {string} downloadUrl - Direct attachment download URL.
 */
function triggerBrowserAttachment(downloadUrl) {
  if (!downloadUrl) return;

  const isMobile = typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = downloadUrl;
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.hidden = true;
  iframe.className = "hidden pointer-events-none";
  iframe.src = downloadUrl;
  document.body.appendChild(iframe);
  setTimeout(() => {
    try {
      document.body.removeChild(iframe);
    } catch (_) {}
  }, 45000);
}

/**
 * Triggers a direct file download in the browser without opening unnecessary tabs.
 * 1. Checks if the resource is hosted on Cloudflare R2 and obtains a presigned URL with Content-Disposition: attachment.
 * 2. Attempts fetch -> blob -> object URL -> anchor download for same-origin or CORS-enabled assets.
 * 3. Falls back to direct attachment download without opening new tabs.
 *
 * @param {string} url - Target file URL to download.
 * @param {string} [filename] - Desired downloaded filename.
 * @returns {Promise<boolean>} Resolves true if download was successfully triggered.
 */
export async function triggerMediaDownload(url, filename = "descarga-medio") {
  if (!url) return false;

  // 1. Check if URL is an R2 asset (contains 'calendarios/' or R2 domains)
  if (url.includes("calendarios/") || url.includes("r2.dev") || url.includes("cloudflarestorage.com")) {
    try {
      let key = null;
      if (url.includes("calendarios/")) {
        key = url.substring(url.indexOf("calendarios/")).split("?")[0];
      }

      const res = await fetch("/api/r2-presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "download",
          key,
          url,
          fileName: filename,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.downloadUrl) {
          triggerBrowserAttachment(data.downloadUrl);
          return true;
        }
      }
    } catch (r2Err) {
      console.warn("Could not obtain signed R2 download URL, trying direct blob:", r2Err);
    }
  }

  // 2. Try fetching as blob (if CORS is allowed or same-origin)
  try {
    const response = await fetch(url, { mode: "cors" });
    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
      return true;
    }
  } catch (err) {
    console.warn("Direct blob download failed, attempting attachment trigger:", err);
  }

  // 3. Fallback: trigger attachment download without opening new tab
  triggerBrowserAttachment(url);
  return true;
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
