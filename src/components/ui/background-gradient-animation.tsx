"use client";

import { cn } from "@/lib/utils";
import { useEffect, useId, useRef, useState } from "react";

type BackgroundGradientAnimationProps = {
  size?: string;
  blendingValue?: string;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  containerClassName?: string;
};

export const BackgroundGradientAnimation = ({
  size = "80%",
  blendingValue = "hard-light",
  children,
  className,
  interactive = true,
  containerClassName,
}: BackgroundGradientAnimationProps) => {
  const filterId = useId().replace(/:/g, "");
  const interactiveRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const tgRef = useRef({ x: 0, y: 0 });
  const curRef = useRef({ x: 0, y: 0 });

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    el.style.setProperty("--size", size);
    el.style.setProperty("--blending-value", blendingValue);
  }, [size, blendingValue]);

  useEffect(() => {
    if (!interactive) return;
    let rafId = 0;
    const tick = () => {
      const el = interactiveRef.current;
      const { x: tx, y: ty } = tgRef.current;
      const cx = curRef.current.x + (tx - curRef.current.x) / 20;
      const cy = curRef.current.y + (ty - curRef.current.y) / 20;
      curRef.current = { x: cx, y: cy };
      if (el) {
        el.style.transform = `translate(${Math.round(cx)}px, ${Math.round(cy)}px)`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [interactive]);

  const handlePointer = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    tgRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  return (
    <div
      ref={rootRef}
      onMouseMoveCapture={interactive ? handlePointer : undefined}
      className={cn(
        "relative min-h-[280px] w-full overflow-hidden",
        "[background:linear-gradient(40deg,color-mix(in_oklch,var(--color-indigo-900)_52%,black),color-mix(in_oklch,var(--color-indigo-700)_24%,var(--background)))]",
        "[--bga-blob-1:color-mix(in_oklch,var(--color-indigo-700)_70%,var(--color-indigo-100))]",
        "[--bga-blob-2:color-mix(in_oklch,var(--color-indigo-700)_50%,transparent)]",
        "[--bga-blob-3:color-mix(in_oklch,var(--color-indigo-700)_42%,var(--color-indigo-200))]",
        "[--bga-blob-4:color-mix(in_oklch,var(--color-indigo-700)_58%,black)]",
        "[--bga-blob-5:color-mix(in_oklch,var(--color-indigo-700)_32%,transparent)]",
        "[--bga-pointer:color-mix(in_oklch,var(--color-indigo-700)_60%,var(--color-indigo-200))]",
        containerClassName,
      )}
    >
      <svg className="hidden" aria-hidden>
        <defs>
          <filter id={filterId}>
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <div className={cn("relative z-10", className)}>{children}</div>
      <div
        className={cn(
          "gradients-container absolute inset-0 z-0 h-full w-full blur-lg",
          isSafari && "blur-2xl",
        )}
        style={
          isSafari
            ? undefined
            : { filter: `url(#${filterId}) blur(40px)` }
        }
      >
        <div
          className={cn(
            "absolute [background:radial-gradient(circle_at_center,var(--bga-blob-1)_0%,transparent_52%)] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] [transform-origin:center_center] animate-bga-first opacity-100",
          )}
        />
        <div
          className={cn(
            "absolute [background:radial-gradient(circle_at_center,var(--bga-blob-2)_0%,transparent_52%)] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] [transform-origin:calc(50%-400px)] animate-bga-second opacity-100",
          )}
        />
        <div
          className={cn(
            "absolute [background:radial-gradient(circle_at_center,var(--bga-blob-3)_0%,transparent_52%)] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] [transform-origin:calc(50%+400px)] animate-bga-third opacity-100",
          )}
        />
        <div
          className={cn(
            "absolute [background:radial-gradient(circle_at_center,var(--bga-blob-4)_0%,transparent_52%)] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] [transform-origin:calc(50%-200px)] animate-bga-fourth opacity-70",
          )}
        />
        <div
          className={cn(
            "absolute [background:radial-gradient(circle_at_center,var(--bga-blob-5)_0%,transparent_52%)] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] [transform-origin:calc(50%-800px)_calc(50%+800px)] animate-bga-fifth opacity-100",
          )}
        />

        {interactive && (
          <div
            ref={interactiveRef}
            className={cn(
              "absolute [background:radial-gradient(circle_at_center,var(--bga-pointer)_0%,transparent_50%)] [mix-blend-mode:var(--blending-value)] w-full h-full -top-1/2 -left-1/2 opacity-70",
            )}
          />
        )}
      </div>
    </div>
  );
};
