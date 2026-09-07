import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Palette, Type, LayoutGrid, CheckCircle2 } from "lucide-react";
import "./XRayStage.css";

interface XRayStageProps {
  isXrayActive: boolean;
  draftUrl: string;
  clientData: {
    name: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    headingFont: string;
    bodyFont: string;
  };
}

export const XRayStage = ({ isXrayActive, draftUrl, clientData }: XRayStageProps) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null); // Blueprint (Back)
  const layer2Ref = useRef<HTMLDivElement>(null); // Glass Design Tokens (Middle)
  const layer3Ref = useRef<HTMLDivElement>(null); // Live Preview (Front)

  // 1. ANIMAZIONE GSAP DI SCOMPOSIZIONE (EXPLODED VIEW)
  useEffect(() => {
    if (!stageRef.current) return;

    if (isXrayActive) {
      gsap.to(stageRef.current, {
        rotateY: -28,
        rotateX: 18,
        rotateZ: 2,
        duration: 1.4,
        ease: "power3.inOut",
      });

      // Layer 1 -> Spinto in profondità dietro (Z = -180px)
      gsap.to(layer1Ref.current, {
        z: -180,
        opacity: 0.85,
        duration: 1.2,
        ease: "power3.out",
      });

      // Layer 2 -> Fluttua nel mezzo (Z = +120px) e trasla a sinistra
      gsap.to(layer2Ref.current, {
        z: 120,
        x: -40,
        opacity: 1,
        duration: 1.3,
        ease: "power3.out",
        delay: 0.1,
      });

      // Layer 3 -> Schizza in primo piano (Z = +320px) e trasla a destra
      gsap.to(layer3Ref.current, {
        z: 320,
        x: 50,
        opacity: 0.95,
        duration: 1.4,
        ease: "power3.out",
        delay: 0.15,
      });
    } else {
      // 🌟 RESET ALLO STATO NORMALE: Tutti gli strati combaciano a Z = 0
      gsap.to(stageRef.current, {
        rotateY: 0,
        rotateX: 0,
        rotateZ: 0,
        duration: 1.2,
        ease: "power3.inOut",
      });

      gsap.to([layer1Ref.current, layer2Ref.current, layer3Ref.current], {
        z: 0,
        x: 0,
        opacity: 1,
        duration: 1.1,
        ease: "power3.inOut",
      });
    }
  }, [isXrayActive]);

  // 2. PARALLAX AL MOVIMENTO DEL MOUSE (Attivo solo in X-Ray)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isXrayActive || !stageRef.current) return;

      const { clientX, clientY } = e;
      const xRot = (clientY / window.innerHeight - 0.5) * -15 + 18;
      const yRot = (clientX / window.innerWidth - 0.5) * 20 - 28;

      gsap.to(stageRef.current, {
        rotateX: xRot,
        rotateY: yRot,
        duration: 0.8,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isXrayActive]);

  return (
    <div className="xray-viewport">
      <div className="xray-stage" ref={stageRef}>
        
        {/* --- LAYER 1: BLUEPRINT & WIREFRAME (RETRO) --- */}
        <div className="xray-layer layer-blueprint" ref={layer1Ref}>
          <div className="blueprint-grid d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-center text-warning font-monospace small">
              <span><LayoutGrid size={16} className="me-2" /> WIREFRAME GRID // 12 COLUMNS</span>
              <span>SCALE: 1:1</span>
            </div>
            
            <div className="border border-secondary border-dashed p-4 rounded text-center text-muted my-auto">
              <p className="font-monospace small mb-1">[ HERO SECTION CONTAINER ]</p>
              <div className="row g-2 mt-2">
                <div className="col-8"><div className="bg-secondary bg-opacity-25 py-3 rounded">Heading Block</div></div>
                <div className="col-4"><div className="bg-secondary bg-opacity-25 py-3 rounded">CTA Box</div></div>
              </div>
            </div>

            <div className="text-end text-secondary font-monospace extra-small">
              ARCHITECTURAL DRAFT v2.4
            </div>
          </div>
        </div>

        {/* --- LAYER 2: DESIGN DNA & BRAND TOKENS (CENTRO) --- */}
        <div className="xray-layer layer-dna" ref={layer2Ref}>
          {/* Card Palette Colori */}
          <div className="glass-dna-card">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Palette size={18} className="text-warning" />
              <span className="fw-bold small text-uppercase font-monospace">Color Palette</span>
            </div>
            <div className="d-flex gap-2">
              <div className="text-center">
                <div className="color-swatch mb-1" style={{ backgroundColor: clientData.primaryColor }}></div>
                <span className="extra-small font-monospace opacity-75">{clientData.primaryColor}</span>
              </div>
              <div className="text-center">
                <div className="color-swatch mb-1" style={{ backgroundColor: clientData.secondaryColor }}></div>
                <span className="extra-small font-monospace opacity-75">{clientData.secondaryColor}</span>
              </div>
              <div className="text-center">
                <div className="color-swatch mb-1" style={{ backgroundColor: clientData.accentColor }}></div>
                <span className="extra-small font-monospace opacity-75">{clientData.accentColor}</span>
              </div>
            </div>
          </div>

          {/* Card Tipografia */}
          <div className="glass-dna-card">
            <div className="d-flex align-items-center gap-2 mb-2">
              <Type size={18} className="text-warning" />
              <span className="fw-bold small text-uppercase font-monospace">Typography</span>
            </div>
            <div className="small">
              <div className="fw-bold text-truncate" style={{ fontFamily: 'serif' }}>
                H1: {clientData.headingFont}
              </div>
              <div className="text-secondary extra-small">
                Body: {clientData.bodyFont} (Regular 400)
              </div>
            </div>
          </div>

          {/* Card UX / Feature */}
          <div className="glass-dna-card align-self-end">
            <div className="d-flex align-items-center gap-2 text-success mb-1">
              <CheckCircle2 size={16} />
              <span className="fw-bold small font-monospace">Responsive Design</span>
            </div>
            <span className="extra-small text-secondary">Optimized for Mobile, Tablet & 4K Retina</span>
          </div>
        </div>

        {/* --- LAYER 3: ANTEPRIMA BOZZA REALE (PRIMO PIANO) --- */}
        <div className="xray-layer layer-preview" ref={layer3Ref}>
          <iframe src={draftUrl} title="Live Preview" />
        </div>

      </div>
    </div>
  );
};