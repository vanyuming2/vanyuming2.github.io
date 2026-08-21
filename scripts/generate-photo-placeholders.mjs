import { createHash } from "node:crypto";
import { mkdir, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import convertHeic from "heic-convert";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const collator = new Intl.Collator("zh-CN", { numeric: true, sensitivity: "base" });

const collections = [
  {
    source: path.join(root, "生活中的图片"),
    placeholderTarget: path.join(root, "public", "photo-placeholders", "life"),
    galleryTarget: path.join(root, "public", "photo-gallery", "life"),
    prefix: "life",
    expectedCount: 83,
  },
  {
    source: path.join(root, "风格化图片"),
    placeholderTarget: path.join(root, "public", "photo-placeholders", "styled"),
    galleryTarget: path.join(root, "public", "photo-gallery", "styled"),
    prefix: "styled",
    expectedCount: 27,
  },
];

async function sourceImages(directory) {
  return (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((left, right) => collator.compare(left, right));
}

function isHeif(buffer) {
  if (buffer.length < 12 || buffer.subarray(4, 8).toString("ascii") !== "ftyp") return false;
  return new Set(["heic", "heix", "hevc", "hevx", "mif1", "msf1"])
    .has(buffer.subarray(8, 12).toString("ascii"));
}

async function readableInput(source) {
  const sourceBuffer = await readFile(source);
  if (!isHeif(sourceBuffer)) return source;
  return Buffer.from(await convertHeic({ buffer: sourceBuffer, format: "JPEG", quality: 0.92 }));
}

async function createPlaceholder(source, target) {
  try {
    await sharp(await readableInput(source))
      .rotate()
      .resize({ width: 18, height: 18, fit: "inside", withoutEnlargement: true })
      .blur(1.2)
      .modulate({ brightness: 0.68, saturation: 0.62 })
      .webp({ quality: 42, effort: 6, smartSubsample: true })
      .toFile(target);
  } catch {
    // A few phone exports use HEIF data behind a .png name. The local Sharp
    // build cannot decode them, so make a deterministic, non-revealing tile
    // from the file hash instead of publishing the source or dropping a card.
    const digest = createHash("sha256").update(await readFile(source)).digest();
    const pixels = Buffer.alloc(18 * 18 * 3);
    for (let y = 0; y < 18; y += 1) {
      for (let x = 0; x < 18; x += 1) {
        const tile = Math.floor(x / 3) + Math.floor(y / 3) * 6;
        const offset = (y * 18 + x) * 3;
        pixels[offset] = 40 + (digest[tile % digest.length] % 70);
        pixels[offset + 1] = 36 + (digest[(tile + 11) % digest.length] % 62);
        pixels[offset + 2] = 34 + (digest[(tile + 23) % digest.length] % 54);
      }
    }
    await sharp(pixels, { raw: { width: 18, height: 18, channels: 3 } })
      .blur(1.1)
      .webp({ quality: 42, effort: 6 })
      .toFile(target);
    console.warn(`fallback mosaic: ${path.basename(source)}`);
  }
}

async function createGalleryImages(source, desktopTarget, mobileTarget) {
  const input = await readableInput(source);
  await Promise.all([
    sharp(input)
      .rotate()
      .resize({ width: 1080, height: 1080, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 5, smartSubsample: true })
      .toFile(desktopTarget),
    sharp(input)
      .rotate()
      .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 76, effort: 5, smartSubsample: true })
      .toFile(mobileTarget),
  ]);
}

for (const collection of collections) {
  const images = await sourceImages(collection.source);
  if (images.length !== collection.expectedCount) {
    throw new Error(
      `${path.basename(collection.source)} expected ${collection.expectedCount} images, found ${images.length}`,
    );
  }

  await Promise.all([
    mkdir(collection.placeholderTarget, { recursive: true }),
    mkdir(collection.galleryTarget, { recursive: true }),
  ]);
  for (const [index, name] of images.entries()) {
    const number = String(index + 1).padStart(3, "0");
    const source = path.join(collection.source, name);
    await Promise.all([
      createPlaceholder(
        source,
        path.join(collection.placeholderTarget, `${collection.prefix}-${number}.webp`),
      ),
      createGalleryImages(
        source,
        path.join(collection.galleryTarget, `${collection.prefix}-${number}.webp`),
        path.join(collection.galleryTarget, `${collection.prefix}-${number}-mobile.webp`),
      ),
    ]);
  }

  console.log(`${collection.prefix}: ${images.length} placeholders + responsive gallery images`);
}
