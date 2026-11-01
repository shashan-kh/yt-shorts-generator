import React from "react";
import { Composition } from "remotion";
import { ShortComposition } from "./Composition";
import meta from "./meta.json";

export const Root: React.FC = () => {
  return (
    <Composition
      id="MyShort"
      component={ShortComposition}
      durationInFrames={meta.durationInFrames || 450}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
