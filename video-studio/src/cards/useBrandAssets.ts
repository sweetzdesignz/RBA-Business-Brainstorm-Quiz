import { useEffect, useState } from "react";
import { staticFile, useDelayRender } from "remotion";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

const WEB_FONTS: { family: string; file: string; weight: string; style?: string }[] = [
  { family: "Montserrat", file: "fonts/Montserrat-Black.woff", weight: "900" },
  { family: "Montserrat", file: "fonts/Montserrat-SemiBold.woff", weight: "600" },
  { family: "Playfair Display", file: "fonts/PlayfairDisplay-Bold.woff", weight: "700" },
  { family: "Playfair Display", file: "fonts/PlayfairDisplay-Italic.woff", weight: "400", style: "italic" },
];

// Loads the web fonts (flat text) and the theme's 3D font (Three.js text).
// Rendering waits until all are ready, so no frame shows missing text.
export const useBrandAssets = (font3dPath: string) => {
  const [font3d, setFont3d] = useState<Font | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender("Loading fonts"));

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all(
          WEB_FONTS.map(async (f) => {
            const face = new FontFace(f.family, `url(${staticFile(f.file)})`, {
              weight: f.weight,
              style: f.style ?? "normal",
            });
            await face.load();
            document.fonts.add(face);
          }),
        );
        const res = await fetch(staticFile(font3dPath));
        setFont3d(new FontLoader().parse(await res.json()));
        continueRender(handle);
      } catch (e) {
        cancelRender(e);
      }
    };
    load();
  }, [handle, continueRender, cancelRender, font3dPath]);

  return font3d;
};
