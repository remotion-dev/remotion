export const ensureFont = () => {
  if (typeof window !== "undefined" && "FontFace" in window) {
    const font = new FontFace(
      "IBM Plex Sans",
      "url(https://fonts.gstatic.com/s/ibmplexsans/v14/zYX9KVElMYYaJe8bpLHnCwDKjQ76AIFsdP3pBms.woff2)",
    );
    return font.load().then(() => {
      document.fonts.add(font);
    });
  }

  throw new Error("browser does not support FontFace");
};
