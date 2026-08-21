import type { CSSProperties, ReactNode } from "react";

import type { PhotoDoodlePlacement } from "./photo-collections";

type PhotoDoodleProps = {
  placement: PhotoDoodlePlacement;
};

const commonSvgProps = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 5,
  viewBox: "0 0 100 100",
};

function doodleShape(type: PhotoDoodlePlacement["type"]): ReactNode {
  switch (type) {
    case "arrow":
      return <><path d="M13 72C34 68 54 54 76 28" /><path d="m56 29 22-3-2 22" /></>;
    case "cat-ears":
      return <><path d="M19 67 24 25l25 23" /><path d="m51 48 25-23 5 42" /><path d="M31 70c12 8 26 8 38 0" /></>;
    case "circle":
      return <><path d="M49 17C27 15 12 32 15 54c3 24 24 34 47 27 22-6 30-29 18-48C69 16 40 11 24 25" /></>;
    case "crown":
      return <><path d="m16 65 7-38 24 21 14-30 18 30 10-21-5 42Z" /><path d="M20 76c20-4 42-3 63 1" /></>;
    case "goose":
      return <><path d="M27 72c5-17 22-21 32-13 8 6 4 19-9 21-11 2-24-1-31-8" /><path d="M55 59c-6-14-4-30 6-37 7-5 17 0 15 8-2 7-10 5-15 10" /><path d="m76 29 13 4-13 5" /><circle cx="69" cy="27" r="2" fill="currentColor" stroke="none" /></>;
    case "mustache":
      return <><path d="M49 51c-9-17-22-12-28-2-5 9 3 22 17 17 7-2 11-8 12-15" /><path d="M51 51c9-17 22-12 28-2 5 9-3 22-17 17-7-2-11-8-12-15" /></>;
    case "scribble":
      return <path d="M11 58c13-23 17 18 30-4 12-22 14 20 27-2 9-15 10 9 22-7" />;
    case "spark":
      return <><path d="M50 10c3 26 9 33 32 39-23 4-30 12-33 39-4-26-10-34-32-38 22-6 29-13 33-40Z" /><path d="M80 12v14M73 19h14" /></>;
    case "speech":
      return <><path d="M15 21h70v45H48L29 82l5-16H15Z" /><path d="M30 44h40" /></>;
    case "starfish":
      return <path d="m50 12 10 26 28-2-22 18 11 27-27-15-25 16 8-28-21-17 28 1Z" />;
    case "tape":
      return <><path className="photoDoodleTapeFill" d="M14 25h72v50H14z" /><path d="M27 27 18 73M51 27 42 73M75 27 66 73" opacity=".35" /></>;
    case "underline":
      return <><path d="M10 55c21-3 49-1 80-5" /><path d="M18 68c19 3 42 2 66-2" opacity=".55" /></>;
  }
}

export default function PhotoDoodle({ placement }: PhotoDoodleProps) {
  const style: CSSProperties = {
    left: `${placement.x}%`,
    top: `${placement.y}%`,
    transform: `translate(-50%, -50%) rotate(${placement.rotate ?? 0}deg) scale(${placement.scale ?? 1})`,
  };

  return (
    <span
      aria-hidden="true"
      className={`photoDoodle photoDoodle--${placement.tone ?? "chalk"}`}
      style={style}
    >
      <svg {...commonSvgProps}>{doodleShape(placement.type)}</svg>
    </span>
  );
}
