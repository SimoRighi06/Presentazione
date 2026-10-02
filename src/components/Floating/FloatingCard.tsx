import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import "../../styles/components/floating/FloatingCard.scss";

interface FloatingCardProps {
  children: React.ReactNode;
  expandedContent?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;

  floatRange?: number;
  speed?: number;
  introDelay?: number;
  introDuration?: number;
  stackX?: number;
  stackY?: number;
  introRotation?: number;
  introScale?: number;
  floatRotation?: number;
}

interface OriginalCardState {
  x: number;
  y: number;
  width: string | number | undefined;
  height: string | number | undefined;
  position: string;
  left: string;
  top: string;
  right: string;
  bottom: string;
  rectLeft: number;
  rectTop: number;
  rectWidth: number;
  rectHeight: number;
}

export const FloatingCard = ({
  children,
  expandedContent,
  className = "",
  style = {},
  floatRange = 8,
  speed = 6.5,
  introDelay = 0.2,
  introDuration = 1.4,
  stackX = 0,
  stackY = 0,
  introRotation = 0,
  introScale = 0.98,
  floatRotation = 0.5,
}: FloatingCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const floatTweenRef = useRef<gsap.core.Tween | null>(null);
  const originalTransformRef = useRef<OriginalCardState | null>(null);
  const hasIntroAnimatedRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const startFloating = useCallback(() => {
    if (!cardRef.current || isExpanded) return;
    const card = cardRef.current;

    floatTweenRef.current?.kill();
    floatTweenRef.current = gsap.to(card, {
      y: `-=${floatRange}`,
      rotation: `+=${floatRotation}`,
      duration: speed,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut", 
    });
  }, [floatRange, speed, floatRotation, isExpanded]);

  const introStateRef = useRef({
    isExpanded,
    startFloating,
    introDelay,
    introDuration,
    stackX,
    stackY,
    introRotation,
    introScale,
  });

  useEffect(() => {
    introStateRef.current = {
      isExpanded,
      startFloating,
      introDelay,
      introDuration,
      stackX,
      stackY,
      introRotation,
      introScale,
    };
  }, [
    isExpanded,
    startFloating,
    introDelay,
    introDuration,
    stackX,
    stackY,
    introRotation,
    introScale,
  ]);


  const openCard = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!cardRef.current || isExpanded) return;
      const card = cardRef.current;

      floatTweenRef.current?.pause();
      gsap.killTweensOf(card);
      card.classList.add("is-focused");

      const rect = card.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(card);
      const finalWidth = Math.min(1100, window.innerWidth * 0.88);
      const finalHeight = Math.min(800, window.innerHeight * 0.82);
      const targetLeft = (window.innerWidth - finalWidth) / 2;
      const targetTop = (window.innerHeight - finalHeight) / 2;

      originalTransformRef.current = {
        x: Number(gsap.getProperty(card, "x")) || 0,
        y: Number(gsap.getProperty(card, "y")) || 0,
        width: style.width || rect.width,
        height: style.height || rect.height,
        position: computedStyle.position,
        left: computedStyle.left,
        top: computedStyle.top,
        right: computedStyle.right,
        bottom: computedStyle.bottom,
        rectLeft: rect.left,
        rectTop: rect.top,
        rectWidth: rect.width,
        rectHeight: rect.height,
      };

      gsap.set(card, {
        position: "fixed",
        left: rect.left,
        top: rect.top,
        right: "auto",
        bottom: "auto",
        width: rect.width,
        height: rect.height,
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        transformOrigin: "center center",
        zIndex: 10001,
      });

      setIsExpanded(true);

      gsap.to(card, {
        left: targetLeft,
        top: targetTop,
        width: finalWidth,
        height: finalHeight,
        boxShadow: "0 40px 100px rgba(0,0,0,0.35)",
        duration: 0.8,
        ease: "power3.inOut",
        overwrite: "auto",
      });
    },
    [isExpanded, style.width, style.height],
  );

  const closeCard = useCallback(() => {
    if (!cardRef.current || !isExpanded) return;

    const card = cardRef.current;
    const original = originalTransformRef.current;

    if (!original) {
      setIsExpanded(false);
      card.classList.remove("is-focused");
      return;
    }

    gsap.killTweensOf(card);

    gsap.to(card, {
      left: original.rectLeft,
      top: original.rectTop,
      width: original.rectWidth,
      height: original.rectHeight,
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      zIndex: 30,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      duration: 0.7, 
      ease: "power3.inOut",
      overwrite: "auto",
      onComplete: () => {
        gsap.set(card, {
          position: original.position,
          left: original.left,
          top: original.top,
          right: original.right,
          bottom: original.bottom,
          width: original.width,
          height: original.height,
          x: original.x,
          y: original.y,
          rotation: 0,
          scale: 1,
          zIndex: 30,
          boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
        });

        card.classList.remove("is-focused");
        setIsExpanded(false);
        originalTransformRef.current = null;

        requestAnimationFrame(() => {
          if (cardRef.current) startFloating();
        });
      },
    });
  }, [isExpanded, startFloating]);

  useEffect(() => {
    if (!cardRef.current || hasIntroAnimatedRef.current) return;
    hasIntroAnimatedRef.current = true;
    const card = cardRef.current;
    const ctx = gsap.context(() => {
      requestAnimationFrame(() => {
        if (!card) return;
        const introState = introStateRef.current;

        const rect = card.getBoundingClientRect();
        const centerX =
          window.innerWidth / 2 - (rect.left + rect.width / 2) + introState.stackX;
        const centerY =
          window.innerHeight / 2 - (rect.top + rect.height / 2) + introState.stackY;

        gsap.set(card, {
          x: centerX,
          y: centerY,
          scale: introState.introScale,
          rotation: introState.introRotation,
          opacity: 0,
          transformOrigin: "center center",
        });

        gsap.to(card, {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: introState.introDuration,
          delay: introState.introDelay,
          ease: "power3.out",
          onComplete: () => {
            if (!introStateRef.current.isExpanded) {
              introStateRef.current.startFloating();
            }
          },
        });
      });
    }, cardRef);

    return () => {
      floatTweenRef.current?.kill();
      ctx.revert();
    };
  }, []);

  // Gestione esc
  useEffect(() => {
    if (!isExpanded) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCard();
    };

    document.addEventListener("keydown", handleEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isExpanded, closeCard]);

  // Renderizzazione
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isExpanded) {
      openCard(e);
    }
  };

  return (
    <>
      {/* OVERLAY */}
      {isExpanded && (
        <div
          className="floating-card-overlay"
          onClick={closeCard}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 10000,
          }}
          aria-hidden="true"
        />
      )}

      {/* CARD */}
      <div
        ref={cardRef}
        onClick={handleCardClick}
        className={`cloud-glass-card p-5 position-absolute ${className || ""} ${isExpanded ? "is-expanded" : ""} mobile-card-btn`}
        style={{
          zIndex: isExpanded ? 10001 : 30,
          transformStyle: "preserve-3d",
          willChange: "transform, width, height, left, top", 
          cursor: isExpanded ? "default" : "pointer",
          ...style,
        }}
      >
        {children}

        {/* CONTENUTO ESPANSO */}
        {expandedContent && (
          <div
            className={`expansion-details overflow-auto ${
              isExpanded
                ? "mt-3 pt-3 border-top opacity-100"
                : "max-height-0 m-0 p-0"
            }`}
            style={{
              maxHeight: isExpanded ? "calc(70vh - 80px)" : "0px",
              transition: "max-height 0.4s ease, opacity 0.3s ease",
              pointerEvents: isExpanded ? "auto" : "none",
            }}
          >
            {expandedContent}
          </div>
        )}

        {/* CLOSE BUTTON */}
        {isExpanded && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeCard();
            }}
            aria-label="Chiudi"
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              width: "36px",
              height: "36px",
              border: "none",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.9)",
              color: "#111",
              fontSize: "20px",
              lineHeight: 1,
              cursor: "pointer",
              zIndex: 20,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            ×
          </button>
        )}
      </div>
    </>
  );
};
