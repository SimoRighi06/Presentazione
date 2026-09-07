import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./FloatingCard.css";

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
  floatRange = 16,
  speed = 4,
  introDelay = 0,
  introDuration = 1.15,
  stackX = 0,
  stackY = 0,
  introRotation = 0,
  introScale = 1,
  floatRotation = 1.5,
}: FloatingCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const floatTweenRef = useRef<gsap.core.Tween | null>(null);

  // Ref per catturare i valori delle props di animazione (stabili, non cambiano a runtime)
  const animPropsRef = useRef({
    floatRange, speed, introDelay, introDuration,
    stackX, stackY, introRotation, introScale, floatRotation,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // =========================================================
  // STATO ORIGINALE DELLA CARD
  // =========================================================
  const originalTransformRef =
    useRef<OriginalCardState | null>(null);

  // =========================================================
  // ANIMAZIONE FLOATING
  // =========================================================
  const startFloating = () => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const p = animPropsRef.current;
    floatTweenRef.current?.kill();
    floatTweenRef.current = gsap.to(card, {
      y: `-=${p.floatRange}`,
      rotation: `+=${p.floatRotation}`,
      duration: p.speed,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  };

  // =========================================================
  // APERTURA AL CENTRO PERFETTO DEL VIEWPORT
  // =========================================================
  const openCard = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!cardRef.current || isExpanded) return;

    const card = cardRef.current;

    // Ferma il floating
    floatTweenRef.current?.pause();

    // Evita che eventuali animazioni precedenti interferiscano
    gsap.killTweensOf(card);

    card.classList.add("is-focused");

    const currentX =
      Number(gsap.getProperty(card, "x")) || 0;

    const currentY =
      Number(gsap.getProperty(card, "y")) || 0;

    const rect = card.getBoundingClientRect();

    const computedStyle =
      window.getComputedStyle(card);

    originalTransformRef.current = {
      x: currentX,
      y: currentY,

      width: style.width,
      height: style.height,

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

    const finalSize = Math.min(
      1100,
      window.innerWidth * 0.88,
      window.innerHeight * 0.82,
    );

    // PASSIAMO TEMPORANEAMENTE A POSITION FIXED
    //
    // In questo modo left/top sono coordinate
    // direttamente relative al viewport.
    // =========================================================

    gsap.set(card, {
      position: "fixed",

      left: `${rect.left}px`,
      top: `${rect.top}px`,

      right: "auto",
      bottom: "auto",

      width: `${rect.width}px`,
      height: `${rect.height}px`,

      x: 0,
      y: 0,

      rotation: 0,
      scale: 1,

      transformOrigin: "50% 50%",

      zIndex: 10001,
    });

    // Attiva lo stato expanded
    setIsExpanded(true);

    // =========================================================
    // CALCOLO DELLA DIMENSIONE FINALE
    // =========================================================

    gsap.set(card, {
      width: `${finalSize}px`,
      height: `${finalSize}px`,
    });

    const finalRect =
      card.getBoundingClientRect();

    // =========================================================
    // CENTRO ESATTO DELLO SCHERMO
    // =========================================================

    const targetLeft =
      (window.innerWidth - finalRect.width) / 2;

    const targetTop =
      (window.innerHeight - finalRect.height) / 2;

    // Torniamo temporaneamente alla dimensione iniziale
    gsap.set(card, {
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });

    // =========================================================
    // ANIMAZIONE APERTURA
    // =========================================================

    gsap.to(card, {
      left: targetLeft,
      top: targetTop,

      width: `${finalSize}px`,
      height: `${finalSize}px`,

      x: 0,
      y: 0,

      rotation: 0,
      scale: 1,

      zIndex: 10001,

      boxShadow:
        "0 50px 120px rgba(0,0,0,0.45)",

      duration: 0.6,
      ease: "power4.out",

      overwrite: true,
    });
  };

  // =========================================================
  // CHIUSURA
  // =========================================================
  const closeCard = () => {
    if (!cardRef.current || !isExpanded) return;

    const card = cardRef.current;
    const original = originalTransformRef.current;

    if (!original) {
      setIsExpanded(false);
      card.classList.remove("is-focused");
      return;
    }

    // Ferma eventuali animazioni precedenti
    gsap.killTweensOf(card);

    // =========================================================
    // LA CARD È ANCORA POSITION: FIXED
    //
    // Quindi usiamo le coordinate viewport salvate
    // prima dell'apertura.
    // =========================================================

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

      boxShadow:
        "0 10px 20px rgba(0,0,0,0.1)",

      duration: 0.55,
      ease: "power3.inOut",

      overwrite: true,

      onComplete: () => {
        // =====================================================
        // RIPRISTINO COMPLETO DELLA POSIZIONE ORIGINALE
        // =====================================================

        gsap.set(card, {
          position: original.position,

          left: original.left,
          top: original.top,

          right: original.right,
          bottom: original.bottom,

          width:
            original.width !== undefined
              ? original.width
              : "auto",

          height:
            original.height !== undefined
              ? original.height
              : "auto",

          x: original.x,
          y: original.y,

          rotation: 0,
          scale: 1,

          zIndex: 30,

          boxShadow:
            "0 10px 20px rgba(0,0,0,0.1)",
        });

        // =====================================================
        // RIMUOVI STATO FOCUS
        // =====================================================

        card.classList.remove("is-focused");

        setIsExpanded(false);

        // =====================================================
        // RIPARTENZA FLOATING
        // =====================================================

        startFloating();

        // Pulizia
        originalTransformRef.current = null;
      },
    });
  };

  // =========================================================
  // ANIMAZIONE INIZIALE
  // =========================================================
  useEffect(() => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const p = animPropsRef.current;

    const ctx = gsap.context(() => {
      requestAnimationFrame(() => {
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;

        const centerX = viewportCenterX - cardCenterX + p.stackX;
        const centerY = viewportCenterY - cardCenterY + p.stackY;

        gsap.set(card, {
          x: centerX,
          y: centerY,
          scale: p.introScale,
          rotation: p.introRotation,
          opacity: 1,
          transformOrigin: "center center",
        });

        gsap.to(card, {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: p.introDuration,
          delay: p.introDelay,
          ease: "expo.out",
          onComplete: () => {
            if (!isExpanded) {
              startFloating();
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

  // =========================================================
  // GESTIONE ESC & SCROLL
  // =========================================================
  useEffect(() => {
    if (!isExpanded) return;

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        closeCard();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [isExpanded]);

  // =========================================================
  // CLICK CARD
  // =========================================================
  const handleCardClick = (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (!isExpanded) {
      openCard(e);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <>
      {/* =====================================================
          OVERLAY
      ===================================================== */}

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

            background:
              "rgba(0, 0, 0, 0.4)",

            backdropFilter:
              "blur(4px)",

            zIndex: 10000,
          }}
          aria-hidden="true"
        />
      )}

      {/* =====================================================
          CARD
      ===================================================== */}

      <div
        ref={cardRef}
        onClick={handleCardClick}
        className={`cloud-glass-card p-5 position-absolute ${className} ${
          isExpanded ? "is-expanded" : ""
        }`}
        style={{
          zIndex: isExpanded
            ? 10001
            : 30,

          transformStyle:
            "preserve-3d",

          willChange:
            "transform, width, left, top",

          cursor: isExpanded
            ? "default"
            : "pointer",

          transition:
            "border-color 0.3s ease",

          ...style,
        }}
      >
        {children}

        {/* ===================================================
            CONTENUTO ESPANSO
        =================================================== */}

        {expandedContent && (
          <div
            className={`expansion-details overflow-auto ${
              isExpanded
                ? "mt-3 pt-3 border-top opacity-100"
                : "max-height-0 m-0 p-0"
            }`}
            style={{
              maxHeight: isExpanded
                ? "calc(70vh - 80px)"
                : "0px",

              transition:
                "max-height 0.4s ease, opacity 0.3s ease",

              pointerEvents:
                isExpanded
                  ? "auto"
                  : "none",
            }}
          >
            {expandedContent}
          </div>
        )}

        {/* ===================================================
            CLOSE BUTTON
        =================================================== */}

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

              background:
                "rgba(255,255,255,0.9)",

              color: "#111",

              fontSize: "20px",
              lineHeight: 1,

              cursor: "pointer",

              zIndex: 20,

              boxShadow:
                "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            ×
          </button>
        )}
      </div>
    </>
  );
};