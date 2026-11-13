// Turn a font file (.ttf / .otf / .woff) into the JSON format Three.js needs
// for 3D text. Usage:
//   npm run font3d -- public/fonts/MyFont.ttf
// Output: public/fonts/MyFont.typeface.json
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";

const input = process.argv[2];
if (!input) {
  console.error("Usage: npm run font3d -- public/fonts/MyFont.ttf");
  process.exit(1);
}

const buf = fs.readFileSync(input);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const round = Math.round;
const scale = 100000 / ((font.unitsPerEm || 2048) * 72);
const glyphs = {};

for (let i = 0; i < font.glyphs.length; i++) {
  const glyph = font.glyphs.get(i);
  const codes = glyph.unicodes?.length ? glyph.unicodes : glyph.unicode ? [glyph.unicode] : [];
  if (!codes.length) continue;
  const token = {
    ha: round(glyph.advanceWidth * scale),
    x_min: round((glyph.xMin ?? 0) * scale),
    x_max: round((glyph.xMax ?? 0) * scale),
    o: "",
  };
  for (const c of glyph.path.commands) {
    const type = c.type.toLowerCase() === "c" ? "b" : c.type.toLowerCase();
    token.o += type + " ";
    if (c.x !== undefined) token.o += `${round(c.x * scale)} ${round(c.y * scale)} `;
    if (c.x1 !== undefined) token.o += `${round(c.x1 * scale)} ${round(c.y1 * scale)} `;
    if (c.x2 !== undefined) token.o += `${round(c.x2 * scale)} ${round(c.y2 * scale)} `;
  }
  for (const u of codes) glyphs[String.fromCodePoint(u)] = token;
}

const out = {
  glyphs,
  familyName: font.getEnglishName("fullName"),
  ascender: round(font.ascender * scale),
  descender: round(font.descender * scale),
  underlinePosition: font.tables.post.underlinePosition,
  underlineThickness: font.tables.post.underlineThickness,
  boundingBox: {
    xMin: font.tables.head.xMin,
    xMax: font.tables.head.xMax,
    yMin: font.tables.head.yMin,
    yMax: font.tables.head.yMax,
  },
  resolution: 1000,
};

const dest = path.join(path.dirname(input), path.basename(input, path.extname(input)) + ".typeface.json");
fs.writeFileSync(dest, JSON.stringify(out));
console.log(`3D font saved to ${dest} (${Object.keys(glyphs).length} characters)`);
