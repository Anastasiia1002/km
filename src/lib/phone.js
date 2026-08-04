/** True only on devices that place cellular calls — not macOS FaceTime. */
export function canPlacePhoneCall() {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || "";

  // Desktop / laptop Mac & iPadOS-desktop mode: tel: opens FaceTime — block it.
  if (/Macintosh|Mac OS X/i.test(ua) && !/iPhone|iPod/i.test(ua)) {
    return false;
  }

  // Windows/Linux desktops without a phone app should not navigate either.
  if (!/Android|iPhone|iPod|Windows Phone|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return false;
  }

  // Android tablets sometimes omit "Mobile"; still allow if Android.
  if (/Android/i.test(ua)) return true;

  return /iPhone|iPod|Windows Phone|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

export function telHref(phone) {
  return `tel:${String(phone).replace(/\s+/g, "")}`;
}
