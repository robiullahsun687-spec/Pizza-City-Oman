import React, { useMemo, useState } from "react";

/**
 * Narrow media renderer for DB-driven Cloudinary assets.
 *
 * Verified delivery constraints for this account (probed live):
 * - GIFs uploaded as `resource_type: image` CANNOT be served via
 *   `/video/upload/` (always 404) and reject `f_auto` (400) — no
 *   delivery-time path to video without re-uploading.
 * - `f_webp`/`f_auto` ARE accepted at small widths, and `w_*` resizing
 *   works up to a per-asset output budget (~400px for the heavy menu
 *   GIFs, ~1000px for the hero banners).
 *
 * Behavior:
 * - Cloudinary GIF → <picture> with an animated-WebP source plus a
 *   GIF <img> ladder [requested → safe 400 → original]. Browsers take
 *   the WebP; anything that fails drops through automatically, and a
 *   JS onError advances the <img> ladder as the last resort.
 * - Other Cloudinary images (JPG/PNG/…) → sized `f_auto` <img> with
 *   original as the onError fallback (auto WebP/AVIF where supported).
 * - Explicit Cloudinary video URLs → silent looping <video>.
 * - Everything else → <img> with the src completely untouched.
 */

const CLOUDINARY_HOST = "res.cloudinary.com";
const IMAGE_MARKER = "/image/upload/";

/** Last-resort GIF width: verified to load on every GIF asset tested. */
const SAFE_GIF_WIDTH = 400;

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

function isCloudinaryHost(src: unknown): src is string {
  const url = parseUrl(src);
  return !!url && url.hostname.toLowerCase().includes(CLOUDINARY_HOST);
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

/** True for Cloudinary *image* delivery URLs (any image format). */
export function isCloudinaryImageUrl(src: unknown): src is string {
  const url = parseUrl(src);
  if (!url) return false;
  if (!url.hostname.toLowerCase().includes(CLOUDINARY_HOST)) return false;
  return url.pathname.includes(IMAGE_MARKER);
}

interface ParsedDelivery {
  origin: string;
  prefix: string;
  afterUpload: string;
  versioned: boolean;
}

/** Split a Cloudinary image delivery URL, or return undefined if unparseable. */
function parseDelivery(src: string): ParsedDelivery | undefined {
  const url = parseUrl(src);
  if (!url) return undefined;
  if (!url.hostname.toLowerCase().includes(CLOUDINARY_HOST)) return undefined;
  const idx = url.pathname.indexOf(IMAGE_MARKER);
  if (idx === -1) return undefined;
  const afterUpload = url.pathname.slice(idx + IMAGE_MARKER.length);
  const segments = afterUpload.split("/").filter(Boolean);
  if (segments.length === 0) return undefined;
  return {
    origin: url.origin,
    prefix: `${url.origin}${url.pathname.slice(0, idx)}${IMAGE_MARKER}`,
    afterUpload,
    versioned: /^v\d+$/.test(segments[0]),
  };
}

function clampWidth(width: number, max: number): number {
  return Math.max(1, Math.min(max, Math.round(width) || max));
}

/**
 * GIF-safe responsively-sized URL (`w_<n>,q_auto`, never `f_auto`).
 * Only version-led paths (no existing transforms) are resized; anything
 * else returns undefined so the caller keeps the original src.
 */
export function toSizedGifUrl(src: string, width: number): string | undefined {
  const parsed = parseDelivery(src);
  if (!parsed || !parsed.versioned) return undefined;
  if (!assetPath(parseUrl(src)!).endsWith(".gif")) return undefined;
  const w = clampWidth(width, 2000);
  return `${parsed.prefix}w_${w},q_auto/${parsed.afterUpload}`;
}

/**
 * Animated-WebP delivery URL for a Cloudinary GIF (`w_<n>,q_auto,f_webp`,
 * width capped at the proven 400px ceiling). Undefined when unsafe.
 */
export function toWebpGifUrl(src: string, width: number): string | undefined {
  const parsed = parseDelivery(src);
  if (!parsed || !parsed.versioned) return undefined;
  if (!assetPath(parseUrl(src)!).endsWith(".gif")) return undefined;
  const w = clampWidth(width, SAFE_GIF_WIDTH);
  return `${parsed.prefix}w_${w},q_auto,f_webp/${parsed.afterUpload}`;
}

/**
 * Sized auto-format URL for non-GIF Cloudinary images
 * (`w_<n>,q_auto,f_auto` → WebP/AVIF where the browser supports it).
 * No GIF-style output cap applies to stills. Undefined when unsafe.
 */
export function toAutoImageUrl(src: string, width: number): string | undefined {
  const parsed = parseDelivery(src);
  if (!parsed || !parsed.versioned) return undefined;
  if (assetPath(parseUrl(src)!).endsWith(".gif")) return undefined;
  const w = clampWidth(width, 2000);
  return `${parsed.prefix}w_${w},q_auto,f_auto/${parsed.afterUpload}`;
}

/**
 * Ordered delivery candidates for a GIF <img> fallback:
 * requested width → safe width → original (duplicates collapsed).
 */
export function gifCandidates(src: string, width: number): string[] {
  const out: string[] = [];
  const push = (u?: string) => {
    if (u && !out.includes(u)) out.push(u);
  };
  push(toSizedGifUrl(src, width));
  push(toSizedGifUrl(src, SAFE_GIF_WIDTH));
  push(src);
  return out;
}

export interface MediaRendererProps {
  src?: string;
  alt: string;
  className?: string;
  /** Passed through to <img> only (video uses preload="metadata"). */
  loading?: "lazy" | "eager";
  referrerPolicy?: React.ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
  draggable?: boolean;
  /** Display-width bucket for Cloudinary sizing (default 400 = proven
   *  ceiling for menu GIFs; pass higher only where probed — the ladder
   *  steps down automatically). Non-Cloudinary srcs ignore it. */
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
  width = 400,
}: MediaRendererProps) {
  // Retry state lives above all early returns (hook order must be stable
  // even if src changes between video/GIF/image across renders). Keyed by
  // src so navigating to another item resets the ladder.
  const [failedBySrc, setFailedBySrc] = useState<Record<string, number>>({});
  const plan = useMemo(() => {
    if (typeof src !== "string" || !src) return null;
    if (!isCloudinaryHost(src)) return null;
    if (isCloudinaryVideoUrl(src)) return { video: src } as const;
    if (isCloudinaryGifUrl(src)) {
      return {
        webp: toWebpGifUrl(src, width),
        ladder: gifCandidates(src, width),
      } as const;
    }
    if (isCloudinaryImageUrl(src)) {
      const sized = toAutoImageUrl(src, width);
      return {
        ladder: sized && sized !== src ? [sized, src] : [src],
      } as const;
    }
    return null;
  }, [src, width]);
  if (plan && "video" in plan) {
    return <MutedVideo src={plan.video} alt={alt} className={className} />;
  }
  if (plan && "webp" in plan && plan.webp) {
    const stage =
      typeof src === "string"
        ? Math.min(failedBySrc[src] ?? 0, plan.ladder.length - 1)
        : 0;
    const canRetry =
      typeof src === "string" && stage < plan.ladder.length - 1;
    return (
      <picture className={className}>
        <source type="image/webp" srcSet={plan.webp} />
        <img
          src={plan.ladder[stage]}
          alt={alt}
          className="h-full w-full object-cover"
          loading={loading}
          referrerPolicy={referrerPolicy}
          draggable={draggable}
          onError={() => {
            if (canRetry && typeof src === "string") {
              setFailedBySrc((prev) => ({ ...prev, [src]: stage + 1 }));
            }
          }}
        />
      </picture>
    );
  }
  if (plan && "ladder" in plan && typeof src === "string") {
    const stage = Math.min(failedBySrc[src] ?? 0, plan.ladder.length - 1);
    const canRetry = stage < plan.ladder.length - 1;
    return (
      <img
        src={plan.ladder[stage]}
        alt={alt}
        className={className}
        loading={loading}
        referrerPolicy={referrerPolicy}
        draggable={draggable}
        onError={() => {
          if (canRetry) {
            setFailedBySrc((prev) => ({ ...prev, [src]: stage + 1 }));
          }
        }}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      referrerPolicy={referrerPolicy}
      draggable={draggable}
    />
  );
}
