import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "../cn";

export interface PixelDitherRevealProps {
  children: ReactNode;
  label?: string;
  className?: string;
}

/** Media reveal that dissolves a pixel-and-dither veil on hover or focus. */
export function PixelDitherReveal({
  children,
  label = "Reveal image",
  className,
}: PixelDitherRevealProps) {
  return (
    <div
      tabIndex={0}
      aria-label={label}
      className={cn(
        "group relative isolate overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-300",
        className,
      )}
    >
      <div className="transition-[filter,transform] duration-700 group-hover:scale-[1.025] group-hover:filter-none group-focus:scale-[1.025] group-focus:filter-none [filter:saturate(.45)_contrast(1.2)]">
        {children}
      </div>
      <div
        aria-hidden="true"
        className="sbg-dither pointer-events-none absolute inset-0 bg-ink-950 transition-[opacity,mask-position] duration-700 group-hover:opacity-0 group-focus:opacity-0"
      />
    </div>
  );
}

export interface ScrollScrubVideoProps {
  src?: string;
  poster?: string;
  frames?: ReactNode[];
  height?: number;
  className?: string;
}

/** Video or frame sequence whose playback position follows viewport progress. */
export function ScrollScrubVideo({
  src,
  poster,
  frames = [],
  height = 760,
  className,
}: ScrollScrubVideoProps) {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!root.current) return;
        const rect = root.current.getBoundingClientRect();
        const available = Math.max(rect.height - window.innerHeight, 1);
        const value = Math.max(0, Math.min(1, -rect.top / available));
        setProgress(value);
        if (video.current?.duration) {
          video.current.currentTime = value * video.current.duration;
        }
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const frameIndex = Math.min(
    frames.length - 1,
    Math.max(0, Math.floor(progress * frames.length)),
  );

  return (
    <div
      ref={root}
      className={cn("relative", className)}
      style={{ minHeight: height }}
    >
      <div className="sticky top-20 overflow-hidden rounded-3xl border border-ink-700 bg-ink-900 shadow-2xl shadow-black/40">
        {src ? (
          <video
            ref={video}
            src={src}
            poster={poster}
            muted
            playsInline
            preload="metadata"
            className="aspect-video w-full object-cover"
          />
        ) : (
          <div className="aspect-video">{frames[frameIndex]}</div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-brand-400 to-accent-400"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="absolute bottom-4 right-4 rounded-full bg-black/55 px-3 py-1 text-[11px] text-white/70 backdrop-blur">
          {Math.round(progress * 100)}%
        </span>
      </div>
    </div>
  );
}

export interface AudioReactiveShaderProps {
  children?: ReactNode;
  bars?: number;
  className?: string;
}

/** Microphone-reactive wrapper that exposes live energy through bars and scale. */
export function AudioReactiveShader({
  children,
  bars = 24,
  className,
}: AudioReactiveShaderProps) {
  const [status, setStatus] = useState<"idle" | "active" | "denied">("idle");
  const [levels, setLevels] = useState(() => Array.from({ length: bars }, () => 0.1));
  const cleanup = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      cleanup.current?.();
    },
    [],
  );

  async function enable() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 64;
      context.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let frame = 0;

      const read = () => {
        analyser.getByteFrequencyData(data);
        setLevels(
          Array.from(
            { length: bars },
            (_, index) => (data[index % data.length] ?? 0) / 255,
          ),
        );
        frame = requestAnimationFrame(read);
      };
      read();
      cleanup.current = () => {
        cancelAnimationFrame(frame);
        stream.getTracks().forEach((track) => track.stop());
        void context.close();
      };
      setStatus("active");
    } catch {
      setStatus("denied");
    }
  }

  const energy = levels.reduce((sum, value) => sum + value, 0) / levels.length;

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-3xl border border-ink-700 bg-ink-900",
        className,
      )}
    >
      <div
        className="absolute inset-0 transition-transform duration-100"
        style={{ transform: `scale(${1 + energy * 0.08})` }}
      >
        {children ?? (
          <div className="size-full bg-[radial-gradient(circle_at_35%_35%,#4f46e5,transparent_40%),radial-gradient(circle_at_70%_70%,#22d3ee,transparent_38%),#08090e]" />
        )}
      </div>
      <div className="relative z-10 flex min-h-72 flex-col items-center justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-6">
        <div className="flex h-20 items-end gap-1">
          {levels.map((level, index) => (
            <span
              key={index}
              className={cn(
                "w-1.5 rounded-full bg-gradient-to-t from-brand-500 to-accent-300 transition-[height] duration-75",
                status === "idle" && "sbg-audio-idle",
              )}
              style={{
                height: `${Math.max(12, level * 78)}px`,
                animationDelay: `${index * -70}ms`,
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={enable}
          disabled={status === "active"}
          className="mt-5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black disabled:opacity-65"
        >
          {status === "active"
            ? "Listening"
            : status === "denied"
              ? "Microphone unavailable"
              : "Enable microphone"}
        </button>
      </div>
    </div>
  );
}

export interface WebcamPixelGridProps {
  columns?: number;
  className?: string;
}

/** Opt-in webcam feed rendered as a deliberately low-resolution pixel canvas. */
export function WebcamPixelGrid({
  columns = 48,
  className,
}: WebcamPixelGridProps) {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const cleanup = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<"idle" | "active" | "denied">("idle");

  useEffect(
    () => () => {
      cleanup.current?.();
    },
    [],
  );

  async function enable() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (!video.current || !canvas.current) return;
      video.current.srcObject = stream;
      await video.current.play();
      const context = canvas.current.getContext("2d");
      if (!context) return;
      const rows = Math.round(columns * 0.67);
      canvas.current.width = columns;
      canvas.current.height = rows;
      context.imageSmoothingEnabled = false;
      let frame = 0;
      const draw = () => {
        if (video.current) {
          context.drawImage(video.current, 0, 0, columns, rows);
        }
        frame = requestAnimationFrame(draw);
      };
      draw();
      cleanup.current = () => {
        cancelAnimationFrame(frame);
        stream.getTracks().forEach((track) => track.stop());
      };
      setStatus("active");
    } catch {
      setStatus("denied");
    }
  }

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-3xl border border-ink-700 bg-ink-900",
        className,
      )}
    >
      <video ref={video} muted playsInline className="hidden" />
      {status === "active" ? (
        <canvas
          ref={canvas}
          className="aspect-[3/2] w-full bg-black object-cover [image-rendering:pixelated]"
          aria-label="Pixelated webcam preview"
        />
      ) : (
        <div className="sbg-pixel-grid aspect-[3/2] w-full bg-[linear-gradient(135deg,#111827,#312e81,#164e63)] opacity-80" />
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 to-transparent p-5 pt-16">
        <p className="text-xs text-white/60">
          Camera stays in your browser.
        </p>
        <button
          type="button"
          onClick={enable}
          disabled={status === "active"}
          className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black disabled:opacity-65"
        >
          {status === "active"
            ? "Camera active"
            : status === "denied"
              ? "Camera unavailable"
              : "Enable camera"}
        </button>
      </div>
    </div>
  );
}
