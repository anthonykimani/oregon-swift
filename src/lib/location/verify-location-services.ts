"use client";

export type LocationServiceStatus =
  | "granted"
  | "denied"
  | "unavailable"
  | "unsupported";

const PROBE_TIMEOUT_MS = 8_000;

function getCurrentPositionOnce(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: PROBE_TIMEOUT_MS,
    });
  });
}

/**
 * Verifies whether the courier's browser can access location services.
 *
 * - `unsupported`: browser/context can't do geolocation (needs secure context).
 * - `granted`/`denied`: resolved from the Permissions API when available.
 * - `unavailable`: OS-level location services are off or the probe timed out.
 *
 * When the Permissions API reports `prompt` (or is unavailable, e.g. Safari),
 * this falls through to a live `getCurrentPosition` probe, which triggers the
 * browser's native location prompt on first use.
 */
export async function verifyLocationServices(): Promise<{ status: LocationServiceStatus }> {
  if (typeof window === "undefined") {
    return { status: "unsupported" };
  }
  if (!("geolocation" in navigator) || window.isSecureContext === false) {
    return { status: "unsupported" };
  }

  try {
    const permission = await navigator.permissions.query({ name: "geolocation" as PermissionName });
    if (permission.state === "granted") {
      return { status: "granted" };
    }
    if (permission.state === "denied") {
      return { status: "denied" };
    }
    // "prompt" → fall through to the probe to actively ask the browser.
  } catch {
    // Permissions API unsupported for geolocation (Safari) → probe directly.
  }

  try {
    await getCurrentPositionOnce();
    return { status: "granted" };
  } catch (error) {
    const code = (error as GeolocationPositionError | undefined)?.code;
    if (code === 1) {
      return { status: "denied" };
    }
    return { status: "unavailable" };
  }
}
