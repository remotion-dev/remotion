import { googleFonts } from "./google-fonts";

export const filteredFonts = googleFonts.filter((f) => {
  return (
    !f.family.includes("Material Icons") &&
    !f.family.includes("Material Symbols")
  );
});
