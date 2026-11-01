import { Composition } from "remotion";
import { ShortComposition } from "./Composition";
import scriptData from "./script.json";

export const Root = () => {
  return (
    <Composition
      id="MyShort"
      component={ShortComposition}
      durationInFrames={scriptData.durationInFrames || 450}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
