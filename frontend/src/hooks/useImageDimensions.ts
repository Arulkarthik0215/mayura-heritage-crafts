import { useState, useEffect, useCallback } from "react";

export type ImageOrientation = "portrait" | "landscape" | "square";

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  orientation: ImageOrientation;
  loaded: boolean;
}

/**
 * Hook that loads an image and returns its natural dimensions, aspect ratio,
 * and orientation. This allows components to dynamically adapt their layout
 * based on the actual image content.
 */
export function useImageDimensions(src: string | undefined): ImageDimensions {
  const [dimensions, setDimensions] = useState<ImageDimensions>({
    width: 0,
    height: 0,
    aspectRatio: 4 / 5, // default portrait fallback
    orientation: "portrait",
    loaded: false,
  });

  const classify = useCallback((w: number, h: number): ImageOrientation => {
    const ratio = w / h;
    if (ratio > 1.15) return "landscape";
    if (ratio < 0.85) return "portrait";
    return "square";
  }, []);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setDimensions({
        width: w,
        height: h,
        aspectRatio: w / h,
        orientation: classify(w, h),
        loaded: true,
      });
    };
    img.onerror = () => {
      // Keep defaults on error
      setDimensions((prev) => ({ ...prev, loaded: true }));
    };
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, classify]);

  return dimensions;
}

/**
 * Returns a CSS aspect-ratio value and object-fit strategy
 * suitable for the given image orientation.
 */
export function getAdaptiveStyles(orientation: ImageOrientation, aspectRatio: number) {
  // Clamp aspect ratios to prevent extreme layouts
  const clampedRatio = Math.max(0.5, Math.min(2, aspectRatio));

  switch (orientation) {
    case "landscape":
      return {
        aspectRatio: `${clampedRatio}`,
        objectFit: "contain" as const,
      };
    case "square":
      return {
        aspectRatio: "1",
        objectFit: "contain" as const,
      };
    case "portrait":
    default:
      return {
        aspectRatio: `${clampedRatio}`,
        objectFit: "contain" as const,
      };
  }
}
