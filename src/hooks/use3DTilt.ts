import { useRef, useState,type MouseEvent } from "react";
import gsap from "gsap";

export function use3DTilt() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isFocusedOnDraft, setIsFocusedOnDraft] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const tiltFactor = isFocusedOnDraft ? 0.3 : 1;
    const rotateX =
      ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) *
      -3 *
      tiltFactor;
    const rotateY =
      ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) *
      3 *
      tiltFactor;

    gsap.to(stageRef.current, {
      rotateX,
      rotateY,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleMouseEnterStage = () => {
    setIsFocusedOnDraft(true);
    if (stageRef.current) {
      gsap.to(stageRef.current, {
        scale: 1.1,
        duration: 0.7,
        ease: "power3.out",
      });
    }
  };

  const handleMouseLeaveStage = () => {
    setIsFocusedOnDraft(false);
    if (!stageRef.current) return;
    gsap.to(stageRef.current, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.6,
      ease: "power3.out",
    });
  };

  return {
    stageRef,
    isFocusedOnDraft,
    handleMouseMove,
    handleMouseEnterStage,
    handleMouseLeaveStage,
  };
}
