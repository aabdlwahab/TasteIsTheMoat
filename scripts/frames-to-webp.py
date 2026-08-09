from pathlib import Path
import math
import sys

from PIL import Image


def main() -> None:
    frame_dir = Path(sys.argv[1])
    output = Path(sys.argv[2])
    source_frames = [Image.open(path).convert("RGB") for path in sorted(frame_dir.glob("*.png"))]
    frames = []
    for index, frame in enumerate(source_frames):
        width, height = frame.size
        progress = index / max(1, len(source_frames) - 1)
        scale = 1.025 + math.sin(progress * math.pi) * 0.018
        resized = frame.resize((round(width * scale), round(height * scale)), Image.Resampling.LANCZOS)
        travel_x = round((resized.width - width) * progress)
        travel_y = round((resized.height - height) * (1 - progress) * 0.55)
        frames.append(resized.crop((travel_x, travel_y, travel_x + width, travel_y + height)))
    if not frames:
        raise RuntimeError(f"No frames found in {frame_dir}")

    output.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(
        output,
        format="WEBP",
        save_all=True,
        append_images=frames[1:],
        duration=140,
        loop=0,
        quality=56,
        method=4,
    )


if __name__ == "__main__":
    main()
