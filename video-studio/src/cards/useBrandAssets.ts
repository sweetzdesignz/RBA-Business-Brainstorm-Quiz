import { useEffect, useState } from "react";
import { staticFile, useDelayRender } from "remotion";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

// Loads the 3D font (for Three.js text) and the web font (for normal text).
// Rendering waits until both are ready, so no frame shows missing text.
export const useBrandAssets = () => {
  const [font3d, setFont3d] = useState<Font | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender("Loading brand fonts"));

  useEffect(() => {
    const load = async () => {
      try {
        const face = new FontFace(
          "Montserrat",
          `url(${staticFile("fonts/Montserrat-Black.woff")})`,
          { weight: "900" },
        );
        await face.load();
        document.fonts.add(face);

        const res = await fetch(staticFile("fonts/Montserrat-Black.typeface.json"));
        setFont3d(new FontLoader().parse(await res.json()));
        continueRender(handle);
      } catch (e) {
        cancelRender(e);
      }
    };
    load();
  }, [handle, continueRender, cancelRender]);

  return font3d;
};
