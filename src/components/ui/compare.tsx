"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  lazy,
  Suspense,
} from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { IconDotsVertical } from "@tabler/icons-react";

const SparklesCoreLazy = lazy(() =>
  import("@/components/ui/sparkles").then((mod) => ({
    default: mod.SparklesCore,
  }))
);

interface CompareProps {
  firstImage?: string;
  secondImage?: string;
  className?: string;
  firstImageClassName?: string;
  secondImageClassname?: string;
  initialSliderPercentage?: number;
  slideMode?: "hover" | "drag";
  showHandlebar?: boolean;
  autoplay?: boolean;
  autoplayDuration?: number;
}

const THROTTLE_MS = 16;
const INTERSECTION_OPTIONS: IntersectionObserverInit = { threshold: 0.1, rootMargin: "50px" };

function useThrottle<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number
): (...args: TArgs) => void {
  const lastCall = useRef<number>(0);
  const lastArgs = useRef<TArgs | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return useCallback(
    (...args: TArgs) => {
      const now = performance.now();
      lastArgs.current = args;

      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      } else if (rafId.current === null) {
        rafId.current = requestAnimationFrame(() => {
          if (lastArgs.current) {
            lastCall.current = performance.now();
            callback(...lastArgs.current);
          }
          rafId.current = null;
        });
      }
    },
    [callback, delay]
  );
}

function useIntersectionObserver(
  ref: React.RefObject<HTMLElement | null>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}

export const Compare = ({
  firstImage = "",
  secondImage = "",
  className,
  firstImageClassName,
  secondImageClassname,
  initialSliderPercentage = 50,
  slideMode = "hover",
  showHandlebar = true,
  autoplay = false,
  autoplayDuration = 5000,
}: CompareProps) => {
  const [sliderXPercent, setSliderXPercent] = useState(initialSliderPercentage);
  const [isDragging, setIsDragging] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({ first: false, second: false });

  const sliderRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);

  const isVisible = useIntersectionObserver(sliderRef, INTERSECTION_OPTIONS);

  const stopAutoplay = useCallback(() => {
    isAnimatingRef.current = false;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  const startAutoplay = useCallback(() => {
    if (!autoplay || !isVisible) return;

    stopAutoplay();
    isAnimatingRef.current = true;
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      if (!isAnimatingRef.current || startTimeRef.current === null) return;

      const elapsedTime = currentTime - startTimeRef.current;
      const cycleTime = autoplayDuration * 2;
      const progress = (elapsedTime % cycleTime) / autoplayDuration;
      const percentage = progress <= 1 ? progress * 100 : (2 - progress) * 100;

      setSliderXPercent(percentage);

      if (isAnimatingRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [autoplay, autoplayDuration, isVisible, stopAutoplay]);

  useEffect(() => {
    if (isVisible) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
    return () => stopAutoplay();
  }, [isVisible, startAutoplay, stopAutoplay]);

  const mouseEnterHandler = useCallback(() => {
    stopAutoplay();
  }, [stopAutoplay]);

  const mouseLeaveHandler = useCallback(() => {
    if (slideMode === "hover") {
      setSliderXPercent(initialSliderPercentage);
    }
    if (slideMode === "drag") {
      setIsDragging(false);
    }
    startAutoplay();
  }, [slideMode, initialSliderPercentage, startAutoplay]);

  const handleStart = useCallback(() => {
    if (slideMode === "drag") {
      setIsDragging(true);
    }
  }, [slideMode]);

  const handleEnd = useCallback(() => {
    if (slideMode === "drag") {
      setIsDragging(false);
    }
  }, [slideMode]);

  const handleMoveInternal = useCallback(
    (clientX: number) => {
      const slider = sliderRef.current;
      if (!slider) return;
      if (slideMode === "hover" || (slideMode === "drag" && isDragging)) {
        const rect = slider.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderXPercent(percent);
      }
    },
    [slideMode, isDragging]
  );

  const handleMove = useThrottle(handleMoveInternal, THROTTLE_MS);

  const handleMouseDown = useCallback(() => {
    handleStart();
  }, [handleStart]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleMove(e.clientX);
    },
    [handleMove]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!autoplay) {
        e.preventDefault();
        handleStart();
      }
    },
    [handleStart, autoplay]
  );

  const handleTouchEnd = useCallback(() => {
    if (!autoplay) {
      handleEnd();
    }
  }, [handleEnd, autoplay]);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!autoplay && e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    },
    [handleMove, autoplay]
  );

  const handleFirstImageLoad = useCallback(() => {
    setImagesLoaded((prev) => ({ ...prev, first: true }));
  }, []);

  const handleSecondImageLoad = useCallback(() => {
    setImagesLoaded((prev) => ({ ...prev, second: true }));
  }, []);

  const showSparkles = isVisible && (imagesLoaded.first || imagesLoaded.second);

  return (
    <div
      ref={sliderRef}
      className={cn("w-[400px] h-[400px] overflow-hidden", className)}
      style={{
        position: "relative",
        cursor: slideMode === "drag" ? "grab" : "col-resize",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={mouseLeaveHandler}
      onMouseEnter={mouseEnterHandler}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <AnimatePresence initial={false}>
        <motion.div
          className="h-full w-px absolute top-0 m-auto z-30 bg-gradient-to-b from-transparent from-[5%] to-[95%] via-indigo-500 to-transparent"
          style={{
            left: `${sliderXPercent}%`,
            top: "0",
            zIndex: 40,
          }}
          transition={{ duration: 0 }}
        >
          <div className="w-36 h-full [mask-image:radial-gradient(100px_at_left,white,transparent)] absolute top-1/2 -translate-y-1/2 left-0 bg-gradient-to-r from-indigo-400 via-transparent to-transparent z-20 opacity-50" />
          <div className="w-10 h-1/2 [mask-image:radial-gradient(50px_at_left,white,transparent)] absolute top-1/2 -translate-y-1/2 left-0 bg-gradient-to-r from-cyan-400 via-transparent to-transparent z-10 opacity-100" />
          <div className="w-10 h-3/4 top-1/2 -translate-y-1/2 absolute -right-10 [mask-image:radial-gradient(100px_at_left,white,transparent)]">
            {showSparkles && (
              <Suspense fallback={<div className="w-full h-full" />}>
                <MemoizedSparklesCore
                  background="transparent"
                  minSize={0.4}
                  maxSize={1}
                  particleDensity={1200}
                  className="w-full h-full"
                  particleColor="#FFFFFF"
                />
              </Suspense>
            )}
          </div>
          {showHandlebar && (
            <div className="h-5 w-5 rounded-md top-1/2 -translate-y-1/2 bg-white z-30 -right-2.5 absolute flex items-center justify-center shadow-[0px_-1px_0px_0px_#FFFFFF40]">
              <IconDotsVertical className="h-4 w-4 text-black" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="overflow-hidden w-full h-full relative z-20 pointer-events-none">
        <AnimatePresence initial={false}>
          {firstImage && (
            <motion.div
              className={cn(
                "absolute inset-0 z-20 rounded-2xl shrink-0 w-full h-full select-none overflow-hidden",
                firstImageClassName
              )}
              style={{
                clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)`,
              }}
              transition={{ duration: 0 }}
            >
              <div className="relative h-full w-full">
                <Image
                  alt="first image"
                  src={firstImage}
                  fill
                  sizes="(max-width: 768px) 300px, 450px"
                  className={cn(
                    "z-20 rounded-2xl select-none object-cover",
                    firstImageClassName
                  )}
                  draggable={false}
                  loading="lazy"
                  onLoad={handleFirstImageLoad}
                  priority={false}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence initial={false}>
        {secondImage && (
          <motion.div
            className={cn(
              "absolute top-0 left-0 z-[19] h-full w-full rounded-2xl select-none overflow-hidden",
              secondImageClassname
            )}
            transition={{ duration: 0 }}
          >
            <div className="relative h-full w-full">
              <Image
                alt="second image"
                src={secondImage}
                fill
                sizes="(max-width: 768px) 300px, 450px"
                className="rounded-2xl object-cover"
                draggable={false}
                loading="lazy"
                onLoad={handleSecondImageLoad}
                priority={false}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MemoizedSparklesCore = React.memo(SparklesCoreLazy);
