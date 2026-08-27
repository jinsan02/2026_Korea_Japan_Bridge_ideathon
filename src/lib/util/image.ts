'use client';

/**
 * Client-side image preparation.
 *
 * Runs in the browser on purpose. Re-encoding through a canvas does three
 * things at once:
 *   - strips EXIF, including GPS coordinates, before the bytes leave the device
 *   - applies the camera's rotation flag, so a sideways photo reaches the model
 *     the right way up
 *   - downscales to the configured longest edge, which keeps a phone photo
 *     inside the 8GB VRAM budget of the local Qwen3-VL path
 *
 * Doing it here rather than on the server also means the oversized original is
 * never transmitted at all.
 */

export interface PreparedImage {
  /** Base64 bytes, no data: prefix. */
  base64: string;
  mimeType: string;
  /** Object URL for on-screen preview. Revoke when finished. */
  previewUrl: string;
  width: number;
  height: number;
  bytes: number;
}

export interface PrepareOptions {
  maxEdgePx?: number;
  /** JPEG quality. 0.85 is visually clean for document text at 1600px. */
  quality?: number;
}

const DEFAULT_MAX_EDGE = 1_600;
const DEFAULT_QUALITY = 0.85;

function decodeViaImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image_decode_failed'));
    };
    image.src = url;
  });
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  // createImageBitmap honours EXIF orientation with imageOrientation:
  // 'from-image'. Safari shipped the function years before the option, and
  // rejects rather than ignoring it - so a failure here is a browser that
  // needs the <img> path, not a broken photo.
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      // Fall through to the element path, which auto-orients anyway.
    }
  }

  return decodeViaImageElement(file);
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('encode_failed'))),
      'image/jpeg',
      quality,
    );
  });
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  // Chunked to avoid blowing the argument limit on multi-megabyte images.
  let binary = '';
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary);
}

export async function prepareImage(
  file: File,
  options: PrepareOptions = {},
): Promise<PreparedImage> {
  const maxEdge = options.maxEdgePx ?? DEFAULT_MAX_EDGE;
  const quality = options.quality ?? DEFAULT_QUALITY;

  const source = await loadBitmap(file);
  const sourceWidth = 'width' in source ? source.width : 0;
  const sourceHeight = 'height' in source ? source.height : 0;

  const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvas_unavailable');
  // White ground: a transparent PNG would otherwise flatten to black and make
  // the text unreadable to the model.
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(source as CanvasImageSource, 0, 0, width, height);

  if ('close' in source && typeof source.close === 'function') {
    source.close();
  }

  const blob = await canvasToBlob(canvas, quality);
  const base64 = await blobToBase64(blob);

  return {
    base64,
    mimeType: 'image/jpeg',
    previewUrl: URL.createObjectURL(blob),
    width,
    height,
    bytes: blob.size,
  };
}
