import { Composition } from "remotion";
import { ShortComposition } from "./Composition";

export const Root = () => {
  return (
    <Composition
      id="MyShort"
      component={ShortComposition}
      durationInFrames={450} // 15 seconds at 30 fps
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
