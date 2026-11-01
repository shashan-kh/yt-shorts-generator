import React from "react";
import { AbsoluteFill } from "remotion";

export const ShortComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center", color: "#fff" }}>
      <h1>Waiting for Gemini Generation...</h1>
    </AbsoluteFill>
  );
};
