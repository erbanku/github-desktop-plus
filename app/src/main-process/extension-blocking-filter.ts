import { OrderedWebRequest } from './ordered-webrequest'

/**
 * Installs a web request filter to block browser extension content scripts
 * from being injected into the Electron renderer process.
 *
 * Browser extensions (like password managers) may attempt to inject content
 * scripts into Electron applications, which can cause errors like
 * "Unable to initialize web-extension bridge. Unsupported context: null"
 * and result in a blank UI.
 *
 * This filter blocks requests from extension protocols (chrome-extension://,
 * moz-extension://) and known extension bundle files while allowing
 * legitimate local development resources.
 *
 * @param orderedWebRequest The ordered web request handler
 */
export function installExtensionBlockingFilter(
  orderedWebRequest: OrderedWebRequest
) {
  orderedWebRequest.onBeforeRequest.addEventListener(details => {
    const url = details.url

    // Block all extension protocol requests
    // These are always from browser extensions and should never be allowed
    if (
      url.startsWith('chrome-extension://') ||
      url.startsWith('moz-extension://')
    ) {
      return { cancel: true }
    }

    // Allow file:// and http(s):// from localhost (for dev mode)
    // This includes IPv4, IPv6, and both HTTP and HTTPS variants
    if (
      url.startsWith('file://') ||
      url.startsWith('http://localhost') ||
      url.startsWith('https://localhost') ||
      url.startsWith('http://127.0.0.1') ||
      url.startsWith('https://127.0.0.1') ||
      url.startsWith('http://[::1]') ||
      url.startsWith('https://[::1]')
    ) {
      return {}
    }

    // Block extension bundle files from non-local origins
    // These filenames are commonly used by browser extensions for content scripts
    // Only block if they're coming from external sources (not our local files)
    // Use endsWith to avoid false positives from URLs containing these strings
    const isExtensionBundle =
      url.endsWith('content.bundle.js') || url.endsWith('vendor.bundle.js')
    const isExternalSource =
      (url.startsWith('http://') || url.startsWith('https://')) &&
      !url.startsWith('http://localhost') &&
      !url.startsWith('https://localhost') &&
      !url.startsWith('http://127.0.0.1') &&
      !url.startsWith('https://127.0.0.1') &&
      !url.startsWith('http://[::1]') &&
      !url.startsWith('https://[::1]')

    if (isExtensionBundle && isExternalSource) {
      return { cancel: true }
    }

    return {}
  })
}
