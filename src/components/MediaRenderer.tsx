import React from "react";

/**
 * Narrow media renderer for DB-driven Cloudinary assets.
 *
 * Proven delivery constraints for this account (verified live):
 * - GIFs uploaded as `resource_type: image` CANNOT be served via
 *   `/video/upload/` (always 404) and reject `f_auto` (400) — so there is
 *   no delivery-time path to video/animated-WebP without re-uploading.
 * - `w_<n>,q_auto` image transforms DO work on GIFs and keep animation.
 *
 * Behavior:
 * - Explicit Cloudinary video URLs (.mp4/.webm, /video/upload/) → <video>
 *   autoplay muted loop playsinline preload="metadata" (silent, no controls).
 * - Cloudinary GIFs → <img> with GIF-safe responsive sizing
 *   (`w_<width>,q_auto`, never `f_auto`), so a 10MB original is never
 *   downloaded at thumbnail sizes.
 * - Everything else → <img> with the src completely untouched.
 *
 * Any URL that cannot be parsed safely falls back to the original <img>.
 */

const CLOUDINARY_HOST = "res.cloudinary.com";

function parseUrl(src: unknown): URL | undefined {
  if (typeof src !== "string" || !src) return undefined;
  try {
    return new URL(src);
  } catch {
    return undefined;
  }
}

function assetPath(url: URL): string {
  // Strip query string / fragment before checking the extension.
  return url.pathname.toLowerCase().split("?")[0].split("#")[0];
}

/** True only for Cloudinary delivery URLs whose asset path ends in .gif. */
export function isCloudinaryGifUrl(src: unknown): src is string {
  const url = parseUrl(src);
  if (!url) return false;
  if (!url.hostname.toLowerCase().includes(CLOUDINARY_HOST)) return false;
  return assetPath(url).endsWith(".gif");
}

/** True for Cloudinary video delivery URLs (explicit .mp4/.webm or /video/upload/). */
export function isCloudinaryVideoUrl(src: unknown): src is string {
  const url = parseUrl(src);
  if (!url) return false;
  if (!url.hostname.toLowerCase().includes(CLOUDINARY_HOST)) return false;
  const path = assetPath(url);
  return (
    path.includes("/video/upload/") ||
    path.endsWith(".mp4") ||
    path.endsWith(".webm") ||
    path.endsWith(".mov")
  );
}

/**
 * Derive a GIF-safe responsively-sized Cloudinary image URL, e.g.
 *   https://res.cloudinary.com/<cloud>/image/upload/v123/a/b.gif
 * → https://res.cloudinary.com/<cloud>/image/upload/w_800,q_auto/v123/a/b.gif
 *
 * Deliberately omits `f_auto` (proven to 400 on GIF assets) so animation is
 * preserved. URLs that already carry transformations are returned untouched
 * rather than mangled. Returns undefined when the URL cannot be handled
 * safely (caller keeps the original src).
 */
export function toSizedGifUrl(src: string, width: number): string | undefined {
  const url = parseUrl(src);
  if (!url) return undefined;
  if (!url.hostname.toLowerCase().includes(CLOUDINARY_HOST)) return undefined;
  if (!assetPath(url).endsWith(".gif")) return undefined;
  const marker = "/upload/";
  const idx = url.pathname.indexOf(marker);
  if (idx === -1) return undefined;
  const prefix = `${url.origin}${url.pathname.slice(0, idx)}${marker}`;
  // Only plain image delivery URLs are resized; anything else passes through.
  if (!prefix.includes("/image/upload/")) return undefined;
  const afterUpload = url.pathname.slice(idx + marker.length);
  const segments = afterUpload.split("/").filter(Boolean);
  if (segments.length === 0) return undefined;
  // Only version-led paths (no existing transforms) are resized.
  if (!/^v\d+$/.test(segments[0])) return undefined;
  const w = Math.max(1, Math.min(2000, Math.round(width) || 800));
  return `${prefix}w_${w},q_auto/${afterUpload}`;
}

export interface MediaRendererProps {
  src?: string;
  alt: string;
  className?: string;
  /** Passed through to <img> only (video uses preload="metadata"). */
  loading?: "lazy" | "eager";
  referrerPolicy?: React.ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
  draggable?: boolean;
  /** Display-width bucket for GIF sizing (default 800). Non-GIFs ignore it. */
  width?: number;
}

function MutedVideo({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <video
      src={src}
      className={className}
      autoPlay
      muted
      // React's muted prop does not always apply the underlying attribute —
      // enforce it imperatively so the video can never produce audio.
      ref={(el) => {
        if (el) el.muted = true;
      }}
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      // The video replaces image content 1:1 — expose the same name to AT.
      role="img"
      aria-label={alt}
    />
  );
}

export default function MediaRenderer({
  src,
  alt,
  className,
  loading,
  referrerPolicy,
  draggable,
  width = 800,
}: MediaRendererProps) {
  if (isCloudinaryVideoUrl(src)) {
    return <MutedVideo src={src} alt={alt} className={className} />;
  }
  let imgSrc: string | undefined = src;
  if (isCloudinaryGifUrl(src)) {
    imgSrc = toSizedGifUrl(src, width) ?? src;
  }
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading={loading}
      referrerPolicy={referrerPolicy}
      draggable={draggable}
    />
  );
}
