import { googleFonts } from "./google-fonts";

export const filteredFonts = googleFonts.filter((f) => {
  // Has no unicode range
  return (
    !f.family.includes("Material Icons") &&
    !f.family.includes("Material Symbols") &&
    !f.family.includes("Material Symbols Rounded") &&
    !f.family.includes("Wavefont")
  );
});
