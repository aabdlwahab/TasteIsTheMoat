"""Resize a captured PNG to card size and write it as WebP.

Usage: png-to-webp.py <source.png> <output.webp> [width] [height]
""" 

from pathlib import Path
import sys

from PIL import Image, ImageStat

# Cards render around 200 CSS pixels wide, so this covers a 2x display.
# Past this the noisiest shaders start costing more than they are worth.
DEFAULT_TARGET = (400, 300)


def main() -> None:
    source = Path(sys.argv[1])
    output = Path(sys.argv[2])
    target = (
        (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else DEFAULT_TARGET
    )
    image = Image.open(source).convert("RGB")

    # A few pieces photograph as an empty frame no matter how long the shutter
    # is held — a dither cover that only clears under a real pointer, a shader
    # that needs input this script cannot fake. Writing those out gives the
    # gallery a black rectangle, which is worse than the generated tile it
    # falls back to, so refuse the shot and let the manifest omit it.
    if ImageStat.Stat(image.convert("L")).stddev[0] < 2.5:
        print(f"  blank, skipped: {output.name}")
        return

    # Cover, not contain: the card is a fixed 4:3 tile, and letterboxing a
    # preview inside it would read as a rendering bug rather than a crop.
    scale = max(target[0] / image.width, target[1] / image.height)
    resized = image.resize(
        (round(image.width * scale), round(image.height * scale)),
        Image.Resampling.LANCZOS,
    )
    left = (resized.width - target[0]) // 2
    top = (resized.height - target[1]) // 2
    resized.crop((left, top, left + target[0], top + target[1])).save(
        output, "WEBP", quality=60, method=6
    )


if __name__ == "__main__":
    main()
