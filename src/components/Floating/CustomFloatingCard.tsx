import { useEffect, useRef, useState, useCallback } from "react";
import { Sparkles, Maximize2 } from "lucide-react";
import gsap from "gsap";
import React from "react";

interface IndependentCustomCardProps {
  config: {
    isCustomCardVisible?: boolean;
    customCardTitle?: string;
    customCardText?: string;
    customCardImageUrl?: string;
  };
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
  x: number; y: number;
  width: string | number | undefined; height: string | number | undefined;
  position: string; left: string; top: string; right: string; bottom: string;
  rectLeft: number; rectTop: number; rectWidth: number; rectHeight: number;
}

export const IndependentCustomCard: React.FC<IndependentCustomCardProps> = ({
  config, style = {}, floatRange = 16, speed = 4, introDelay = 0,
  introDuration = 1.15, stackX = 0, stackY = 0, introRotation = 0,
  introScale = 1, floatRotation = 1.5,
}) => { 
  const cardRef = useRef<HTMLDivElement>(null);
  const floatTweenRef = useRef<gsap.core.Tween | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const originalTransformRef = useRef<OriginalCardState | null>(null);
  
  const animPropsRef = useRef({
    floatRange, speed, introDelay, introDuration,
    stackX, stackY, introRotation, introScale, floatRotation,
  });

  const hasImg = Boolean(config.customCardImageUrl);
  const hasText = Boolean(config.customCardText?.trim());

  const renderText = (text?: string) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => (
      <React.Fragment key={i}>{line}<br /></React.Fragment>
    ));
  };

  const startFloating = () => {
    if (!cardRef.current) return;
    const p = animPropsRef.current;
    floatTweenRef.current?.kill();
    floatTweenRef.current = gsap.to(cardRef.current, {
      y: `-=${p.floatRange}`, rotation: `+=${p.floatRotation}`,
      duration: p.speed, repeat: -1, yoyo: true, ease: "sine.inOut",
    });
  };

  const openCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cardRef.current || isOpen) return;
    const card = cardRef.current;
    floatTweenRef.current?.pause();
    gsap.killTweensOf(card);
    card.classList.add("is-focused");

    const rect = card.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(card);

    originalTransformRef.current = {
      x: Number(gsap.getProperty(card, "x")) || 0,
      y: Number(gsap.getProperty(card, "y")) || 0,
      width: style.width, height: style.height,
      position: computedStyle.position,
      left: computedStyle.left, top: computedStyle.top,
      right: computedStyle.right, bottom: computedStyle.bottom,
      rectLeft: rect.left, rectTop: rect.top,
      rectWidth: rect.width, rectHeight: rect.height,
    };

    const openW = Math.min(1300, window.innerWidth * 1.1);
    const openH = Math.min(820, window.innerHeight * 0.95);

    gsap.set(card, {
      position: "fixed", left: `${rect.left}px`, top: `${rect.top}px`,
      right: "auto", bottom: "auto", width: `${rect.width}px`, height: `${rect.height}px`,
      x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: "50% 50%", zIndex: 10001,
    });

    setIsOpen(true);

    gsap.set(card, { width: `${openW}px`, height: `${openH}px` });
    const finalRect = card.getBoundingClientRect();
    const targetLeft = (window.innerWidth - finalRect.width) / 2;
    const targetTop = (window.innerHeight - finalRect.height) / 2;

    gsap.set(card, { width: `${rect.width}px`, height: `${rect.height}px` });

    gsap.to(card, {
      left: targetLeft, top: targetTop, width: `${openW}px`, height: `${openH}px`,
      x: 0, y: 0, rotation: 0, scale: 1, zIndex: 10001,
      boxShadow: "0 50px 120px rgba(0,0,0,0.45)", duration: 0.6,
      ease: "power4.out", overwrite: true,
    });
  };

  // ✅ FIX: useCallback per evitare warning di dipendenze mancanti
  const closeCard = useCallback(() => {
    if (!cardRef.current || !isOpen) return;
    const card = cardRef.current;
    const original = originalTransformRef.current;

    if (!original) {
      setIsOpen(false);
      card.classList.remove("is-focused");
      return;
    }

    gsap.killTweensOf(card);
    gsap.to(card, {
      left: original.rectLeft, top: original.rectTop,
      width: original.rectWidth, height: original.rectHeight,
      x: 0, y: 0, rotation: 0, scale: 1, zIndex: 30,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)", duration: 0.55,
      ease: "power3.inOut", overwrite: true,
      onComplete: () => {
        gsap.set(card, {
          position: original.position, left: original.left, top: original.top,
          right: original.right, bottom: original.bottom,
          width: original.width !== undefined ? original.width : "auto",
          height: original.height !== undefined ? original.height : "auto",
          x: original.x, y: original.y, rotation: 0, scale: 1, zIndex: 30,
          boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
        });
        card.classList.remove("is-focused");
        setIsOpen(false);
        startFloating();
        originalTransformRef.current = null;
      },
    });
  }, [isOpen]);

  /* INTRO ANIMATION */
  useEffect(() => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const p = animPropsRef.current;

    const ctx = gsap.context(() => {
      requestAnimationFrame(() => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const centerX = window.innerWidth / 2 - (rect.left + rect.width / 2) + p.stackX;
        const centerY = window.innerHeight / 2 - (rect.top + rect.height / 2) + p.stackY;

        gsap.set(card, { x: centerX, y: centerY, scale: p.introScale, rotation: p.introRotation, opacity: 1, transformOrigin: "center center" });
        gsap.to(card, { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, duration: p.introDuration, delay: p.introDelay, ease: "expo.out", onComplete: () => { if (!isOpen) startFloating(); } });
      });
    }, cardRef);

    return () => { floatTweenRef.current?.kill(); ctx.revert(); };
  }, []);

  /* ESC & SCROLL LOCK */
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => { if (event.key === "Escape") closeCard(); };
    document.addEventListener("keydown", handleEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, closeCard]); // ✅ Dipendenze fixate

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) openCard(e);
  };

  // ✅ FIX CRITICO: L'early return va DOPO tutti gli hook!
  if (!config.isCustomCardVisible) return null;

  return (
    <>
      {isOpen && (
        <div className="floating-card-overlay" onClick={closeCard} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)", zIndex: 10000 }} aria-hidden="true" />
      )}
      <div ref={cardRef} onClick={handleCardClick} className="cloud-glass-card position-absolute" style={{ zIndex: isOpen ? 10001 : 30, transformStyle: "preserve-3d", willChange: "transform, width, left, top", cursor: isOpen ? "default" : "pointer", transition: "border-color 0.3s ease", width: isOpen ? undefined : style.width ?? "280px", height: isOpen ? undefined : style.height ?? "140px", ...(isOpen ? { alignItems: "stretch", justifyContent: "flex-start", textAlign: "left", display: "flex", flexDirection: "column" } : {}), ...style }}>
        {!isOpen && (
          <div className="w-100 h-100 p-3 d-flex flex-column justify-content-between">
            <div className="d-flex align-items-center justify-content-between">
              <span className="font-monospace fw-bold text-uppercase fs-7 text-muted">{config.customCardTitle || "Custom Info"}</span>
              <Maximize2 size={14} className="text-muted" />
            </div>
            <div className="text-truncate text-secondary small">{config.customCardText || (hasImg ? "Immagine allegata" : "Clicca per aprire...")}</div>
          </div>
        )}
        {isOpen && (
          <div className="d-flex flex-column w-100 h-100 position-relative overflow-hidden">
            <div className="d-flex align-items-center justify-content-between px-3 border-3">
              <div className="d-flex align-items-center w-100 mt-3 gap-2 mb-3 text-muted font-monospace border-bottom pb-2">
                <Sparkles size={16} className="text-dark" />
                <span className="font-monospace fw-bold text-uppercase fs-5">{config.customCardTitle || "Custom Info"}</span>
              </div>
            </div>
            <div className="d-flex flex-column flex-grow-1 overflow-hidden">
              {hasImg && !hasText && (
                <div className="w-100 h-100 bg-black">
                  <img src={config.customCardImageUrl} alt="Custom Content" className="w-100 h-100 px-3" loading="lazy" decoding="async" style={{ objectFit: "cover" }} />
                </div>
              )}
              {!hasImg && hasText && (
                <div className="w-100 h-100 d-flex align-items-center justify-content-center p-5 text-center">
                  <p className="fs-5 fw-medium text-dark lh-base m-0">{renderText(config.customCardText)}</p>
                </div>
              )}
              {hasImg && hasText && (
                <>
                  <div className="w-100 border-bottom pb-2" style={{ height: "65%" }}>
                    <img src={config.customCardImageUrl} alt="Custom Content" className="w-100 h-100 px-3" loading="lazy" decoding="async" style={{ objectFit: "cover" }} fetchPriority="high" />
                  </div>
                  <div className="w-100 d-flex align-items-center justify-content-center px-5 text-start overflow-auto" style={{ height: "35%" }}>
                    <p className="fs-5 fw-medium text-dark lh-base m-0">{renderText(config.customCardText)}</p>
                  </div>
                </>
              )}
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); closeCard(); }} aria-label="Chiudi" style={{ position: "absolute", top: "12px", right: "12px", width: "36px", height: "36px", border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.9)", color: "#111", fontSize: "20px", lineHeight: 1, cursor: "pointer", zIndex: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>×</button>
          </div>
        )}
      </div>
    </>
  );
};