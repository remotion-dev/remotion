---
image: /generated/articles-docs-font-picker.png
id: font-picker
title: Build a Google Font picker
crumb: "Building video apps"
---

To show various Google fonts in a font picker and load them once the user selects them, first install `@remotion/google-fonts` (at least v3.3.64).

This feature is only available if `@remotion/google-fonts` is imported as an ES Module. If it is imported as a CommonJS module instead, loading a font will throw an error.

Call [`getAvailableFonts()`](/docs/google-fonts/get-available-fonts) to get a list of Google Fonts and call `.load()` to load a specific font. Afterwards, you can call `getInfo()` to retrieve available styles and weights.

Use the `fontFamily` CSS property to apply a font.

Remember that if you want to render a video with said font, you also need to load the font inside the Remotion video. You can do it in the same way, by looping through the available fonts, finding the font you want to load and then load it.

## Show all fonts in a font picker

The following snippet renders a dropdown with all Google Fonts, and loads one it it has been selected. The list is approximately 1400 fonts.

```tsx twoslash
import { getAvailableFonts } from "@remotion/google-fonts";
import React from "react";

export const FontPicker: React.FC = () => {
  const newFonts = getAvailableFonts();

  return (
    <div>
      <select
        onChange={(e) => {
          const fonts = newFonts[e.target.selectedIndex];
          const loaded = fonts.load();

          loaded.then((l) => {
            const info = l.getInfo();
            const styles = Object.keys(info.fonts);
            console.log("Font", info.fontFamily, " Styles", styles);
            for (const style of styles) {
              const weightObject = info.fonts[style as keyof typeof info.fonts];
              const weights = Object.keys(weightObject);
              console.log("- Style", style, "supports weights", weights);
              for (const weight of weights) {
                const scripts = Object.keys(weightObject[weight]);
                console.log("-- Weight", weight, "supports scripts", scripts);
              }
            }
          });
        }}
      >
        {newFonts.map((f) => {
          return (
            <option key={f.importName} value={f.importName}>
              {f.fontFamily}
            </option>
          );
        })}
      </select>
    </div>
  );
};
```

## Show only the 250 most popular Google Fonts

To reduce bundle size, you can limit the selection. Instead of calling `getAvailableFonts()`, create a file with the following contents and use it as the fonts array:

```ts twoslash
export const top250 = [
  { family: "ABeeZee", load: () => import("@remotion/google-fonts/ABeeZee") },
  { family: "Abel", load: () => import("@remotion/google-fonts/Abel") },
  {
    family: "Abril Fatface",
    load: () => import("@remotion/google-fonts/AbrilFatface"),
  },
  { family: "Acme", load: () => import("@remotion/google-fonts/Acme") },
  {
    family: "Advent Pro",
    load: () => import("@remotion/google-fonts/AdventPro"),
  },
  { family: "Alata", load: () => import("@remotion/google-fonts/Alata") },
  { family: "Alegreya", load: () => import("@remotion/google-fonts/Alegreya") },
  {
    family: "Alegreya Sans",
    load: () => import("@remotion/google-fonts/AlegreyaSans"),
  },
  {
    family: "Alegreya Sans SC",
    load: () => import("@remotion/google-fonts/AlegreyaSansSC"),
  },
  { family: "Aleo", load: () => import("@remotion/google-fonts/Aleo") },
  {
    family: "Alfa Slab One",
    load: () => import("@remotion/google-fonts/AlfaSlabOne"),
  },
  { family: "Alice", load: () => import("@remotion/google-fonts/Alice") },
  { family: "Almarai", load: () => import("@remotion/google-fonts/Almarai") },
  {
    family: "Amatic SC",
    load: () => import("@remotion/google-fonts/AmaticSC"),
  },
  { family: "Amiri", load: () => import("@remotion/google-fonts/Amiri") },
  {
    family: "Antic Slab",
    load: () => import("@remotion/google-fonts/AnticSlab"),
  },
  { family: "Anton", load: () => import("@remotion/google-fonts/Anton") },
  { family: "Archivo", load: () => import("@remotion/google-fonts/Archivo") },
  {
    family: "Archivo Black",
    load: () => import("@remotion/google-fonts/ArchivoBlack"),
  },
  {
    family: "Archivo Narrow",
    load: () => import("@remotion/google-fonts/ArchivoNarrow"),
  },
  { family: "Arimo", load: () => import("@remotion/google-fonts/Arimo") },
  { family: "Arvo", load: () => import("@remotion/google-fonts/Arvo") },
  { family: "Asap", load: () => import("@remotion/google-fonts/Asap") },
  {
    family: "Asap Condensed",
    load: () => import("@remotion/google-fonts/AsapCondensed"),
  },
  {
    family: "Assistant",
    load: () => import("@remotion/google-fonts/Assistant"),
  },
  { family: "Baloo 2", load: () => import("@remotion/google-fonts/Baloo2") },
  { family: "Bangers", load: () => import("@remotion/google-fonts/Bangers") },
  { family: "Barlow", load: () => import("@remotion/google-fonts/Barlow") },
  {
    family: "Barlow Condensed",
    load: () => import("@remotion/google-fonts/BarlowCondensed"),
  },
  {
    family: "Barlow Semi Condensed",
    load: () => import("@remotion/google-fonts/BarlowSemiCondensed"),
  },
  {
    family: "Be Vietnam Pro",
    load: () => import("@remotion/google-fonts/BeVietnamPro"),
  },
  {
    family: "Bebas Neue",
    load: () => import("@remotion/google-fonts/BebasNeue"),
  },
  { family: "Bitter", load: () => import("@remotion/google-fonts/Bitter") },
  { family: "Blinker", load: () => import("@remotion/google-fonts/Blinker") },
  {
    family: "Bodoni Moda",
    load: () => import("@remotion/google-fonts/BodoniModa"),
  },
  {
    family: "Bree Serif",
    load: () => import("@remotion/google-fonts/BreeSerif"),
  },
  { family: "Cabin", load: () => import("@remotion/google-fonts/Cabin") },
  { family: "Cairo", load: () => import("@remotion/google-fonts/Cairo") },
  {
    family: "Cantarell",
    load: () => import("@remotion/google-fonts/Cantarell"),
  },
  { family: "Cardo", load: () => import("@remotion/google-fonts/Cardo") },
  {
    family: "Carter One",
    load: () => import("@remotion/google-fonts/CarterOne"),
  },
  {
    family: "Catamaran",
    load: () => import("@remotion/google-fonts/Catamaran"),
  },
  { family: "Caveat", load: () => import("@remotion/google-fonts/Caveat") },
  {
    family: "Chakra Petch",
    load: () => import("@remotion/google-fonts/ChakraPetch"),
  },
  { family: "Changa", load: () => import("@remotion/google-fonts/Changa") },
  { family: "Chivo", load: () => import("@remotion/google-fonts/Chivo") },
  { family: "Cinzel", load: () => import("@remotion/google-fonts/Cinzel") },
  {
    family: "Comfortaa",
    load: () => import("@remotion/google-fonts/Comfortaa"),
  },
  {
    family: "Commissioner",
    load: () => import("@remotion/google-fonts/Commissioner"),
  },
  {
    family: "Concert One",
    load: () => import("@remotion/google-fonts/ConcertOne"),
  },
  { family: "Cookie", load: () => import("@remotion/google-fonts/Cookie") },
  {
    family: "Cormorant",
    load: () => import("@remotion/google-fonts/Cormorant"),
  },
  {
    family: "Cormorant Garamond",
    load: () => import("@remotion/google-fonts/CormorantGaramond"),
  },
  {
    family: "Courgette",
    load: () => import("@remotion/google-fonts/Courgette"),
  },
  {
    family: "Creepster",
    load: () => import("@remotion/google-fonts/Creepster"),
  },
  {
    family: "Crete Round",
    load: () => import("@remotion/google-fonts/CreteRound"),
  },
  {
    family: "Crimson Pro",
    load: () => import("@remotion/google-fonts/CrimsonPro"),
  },
  {
    family: "Crimson Text",
    load: () => import("@remotion/google-fonts/CrimsonText"),
  },
  { family: "Cuprum", load: () => import("@remotion/google-fonts/Cuprum") },
  { family: "DM Sans", load: () => import("@remotion/google-fonts/DMSans") },
  {
    family: "DM Serif Display",
    load: () => import("@remotion/google-fonts/DMSerifDisplay"),
  },
  {
    family: "DM Serif Text",
    load: () => import("@remotion/google-fonts/DMSerifText"),
  },
  {
    family: "Dancing Script",
    load: () => import("@remotion/google-fonts/DancingScript"),
  },
  {
    family: "Didact Gothic",
    load: () => import("@remotion/google-fonts/DidactGothic"),
  },
  { family: "Domine", load: () => import("@remotion/google-fonts/Domine") },
  { family: "Dosis", load: () => import("@remotion/google-fonts/Dosis") },
  {
    family: "EB Garamond",
    load: () => import("@remotion/google-fonts/EBGaramond"),
  },
  { family: "Eczar", load: () => import("@remotion/google-fonts/Eczar") },
  {
    family: "El Messiri",
    load: () => import("@remotion/google-fonts/ElMessiri"),
  },
  {
    family: "Encode Sans",
    load: () => import("@remotion/google-fonts/EncodeSans"),
  },
  { family: "Exo", load: () => import("@remotion/google-fonts/Exo") },
  { family: "Exo 2", load: () => import("@remotion/google-fonts/Exo2") },
  { family: "Faustina", load: () => import("@remotion/google-fonts/Faustina") },
  { family: "Figtree", load: () => import("@remotion/google-fonts/Figtree") },
  {
    family: "Fira Sans",
    load: () => import("@remotion/google-fonts/FiraSans"),
  },
  {
    family: "Fira Sans Condensed",
    load: () => import("@remotion/google-fonts/FiraSansCondensed"),
  },
  {
    family: "Fira Sans Extra Condensed",
    load: () => import("@remotion/google-fonts/FiraSansExtraCondensed"),
  },
  {
    family: "Fjalla One",
    load: () => import("@remotion/google-fonts/FjallaOne"),
  },
  {
    family: "Francois One",
    load: () => import("@remotion/google-fonts/FrancoisOne"),
  },
  {
    family: "Frank Ruhl Libre",
    load: () => import("@remotion/google-fonts/FrankRuhlLibre"),
  },
  {
    family: "Fredoka One",
    load: () => import("@remotion/google-fonts/FredokaOne"),
  },
  { family: "Gelasio", load: () => import("@remotion/google-fonts/Gelasio") },
  {
    family: "Gloria Hallelujah",
    load: () => import("@remotion/google-fonts/GloriaHallelujah"),
  },
  {
    family: "Gothic A1",
    load: () => import("@remotion/google-fonts/GothicA1"),
  },
  {
    family: "Great Vibes",
    load: () => import("@remotion/google-fonts/GreatVibes"),
  },
  { family: "Handlee", load: () => import("@remotion/google-fonts/Handlee") },
  { family: "Heebo", load: () => import("@remotion/google-fonts/Heebo") },
  { family: "Hind", load: () => import("@remotion/google-fonts/Hind") },
  {
    family: "Hind Madurai",
    load: () => import("@remotion/google-fonts/HindMadurai"),
  },
  {
    family: "Hind Siliguri",
    load: () => import("@remotion/google-fonts/HindSiliguri"),
  },
  {
    family: "IBM Plex Mono",
    load: () => import("@remotion/google-fonts/IBMPlexMono"),
  },
  {
    family: "IBM Plex Sans",
    load: () => import("@remotion/google-fonts/IBMPlexSans"),
  },
  {
    family: "IBM Plex Sans Arabic",
    load: () => import("@remotion/google-fonts/IBMPlexSansArabic"),
  },
  {
    family: "IBM Plex Sans Condensed",
    load: () => import("@remotion/google-fonts/IBMPlexSansCondensed"),
  },
  {
    family: "IBM Plex Serif",
    load: () => import("@remotion/google-fonts/IBMPlexSerif"),
  },
  {
    family: "Inconsolata",
    load: () => import("@remotion/google-fonts/Inconsolata"),
  },
  {
    family: "Indie Flower",
    load: () => import("@remotion/google-fonts/IndieFlower"),
  },
  { family: "Inter", load: () => import("@remotion/google-fonts/Inter") },
  {
    family: "Josefin Sans",
    load: () => import("@remotion/google-fonts/JosefinSans"),
  },
  {
    family: "Josefin Slab",
    load: () => import("@remotion/google-fonts/JosefinSlab"),
  },
  { family: "Jost", load: () => import("@remotion/google-fonts/Jost") },
  { family: "Kalam", load: () => import("@remotion/google-fonts/Kalam") },
  { family: "Kanit", load: () => import("@remotion/google-fonts/Kanit") },
  { family: "Karla", load: () => import("@remotion/google-fonts/Karla") },
  {
    family: "Kaushan Script",
    load: () => import("@remotion/google-fonts/KaushanScript"),
  },
  { family: "Khand", load: () => import("@remotion/google-fonts/Khand") },
  { family: "Lato", load: () => import("@remotion/google-fonts/Lato") },
  { family: "Lexend", load: () => import("@remotion/google-fonts/Lexend") },
  {
    family: "Lexend Deca",
    load: () => import("@remotion/google-fonts/LexendDeca"),
  },
  {
    family: "Libre Baskerville",
    load: () => import("@remotion/google-fonts/LibreBaskerville"),
  },
  {
    family: "Libre Franklin",
    load: () => import("@remotion/google-fonts/LibreFranklin"),
  },
  {
    family: "Lilita One",
    load: () => import("@remotion/google-fonts/LilitaOne"),
  },
  { family: "Lobster", load: () => import("@remotion/google-fonts/Lobster") },
  {
    family: "Lobster Two",
    load: () => import("@remotion/google-fonts/LobsterTwo"),
  },
  { family: "Lora", load: () => import("@remotion/google-fonts/Lora") },
  {
    family: "Luckiest Guy",
    load: () => import("@remotion/google-fonts/LuckiestGuy"),
  },
  { family: "M PLUS 1p", load: () => import("@remotion/google-fonts/MPLUS1p") },
  {
    family: "M PLUS Rounded 1c",
    load: () => import("@remotion/google-fonts/MPLUSRounded1c"),
  },
  { family: "Macondo", load: () => import("@remotion/google-fonts/Macondo") },
  { family: "Manrope", load: () => import("@remotion/google-fonts/Manrope") },
  {
    family: "Marcellus",
    load: () => import("@remotion/google-fonts/Marcellus"),
  },
  {
    family: "Marck Script",
    load: () => import("@remotion/google-fonts/MarckScript"),
  },
  { family: "Martel", load: () => import("@remotion/google-fonts/Martel") },
  {
    family: "Maven Pro",
    load: () => import("@remotion/google-fonts/MavenPro"),
  },
  {
    family: "Merriweather",
    load: () => import("@remotion/google-fonts/Merriweather"),
  },
  {
    family: "Merriweather Sans",
    load: () => import("@remotion/google-fonts/MerriweatherSans"),
  },
  { family: "Michroma", load: () => import("@remotion/google-fonts/Michroma") },
  { family: "Mitr", load: () => import("@remotion/google-fonts/Mitr") },
  { family: "Monda", load: () => import("@remotion/google-fonts/Monda") },
  {
    family: "Montserrat",
    load: () => import("@remotion/google-fonts/Montserrat"),
  },
  {
    family: "Montserrat Alternates",
    load: () => import("@remotion/google-fonts/MontserratAlternates"),
  },
  { family: "Mr Dafoe", load: () => import("@remotion/google-fonts/MrDafoe") },
  { family: "Mukta", load: () => import("@remotion/google-fonts/Mukta") },
  {
    family: "Mukta Malar",
    load: () => import("@remotion/google-fonts/MuktaMalar"),
  },
  { family: "Mulish", load: () => import("@remotion/google-fonts/Mulish") },
  {
    family: "Nanum Gothic",
    load: () => import("@remotion/google-fonts/NanumGothic"),
  },
  {
    family: "Nanum Myeongjo",
    load: () => import("@remotion/google-fonts/NanumMyeongjo"),
  },
  { family: "Neucha", load: () => import("@remotion/google-fonts/Neucha") },
  { family: "Neuton", load: () => import("@remotion/google-fonts/Neuton") },
  {
    family: "News Cycle",
    load: () => import("@remotion/google-fonts/NewsCycle"),
  },
  {
    family: "Noticia Text",
    load: () => import("@remotion/google-fonts/NoticiaText"),
  },
  {
    family: "Noto Kufi Arabic",
    load: () => import("@remotion/google-fonts/NotoKufiArabic"),
  },
  {
    family: "Noto Sans",
    load: () => import("@remotion/google-fonts/NotoSans"),
  },
  {
    family: "Noto Sans Arabic",
    load: () => import("@remotion/google-fonts/NotoSansArabic"),
  },
  {
    family: "Noto Sans Display",
    load: () => import("@remotion/google-fonts/NotoSansDisplay"),
  },
  {
    family: "Noto Sans HK",
    load: () => import("@remotion/google-fonts/NotoSansHK"),
  },
  {
    family: "Noto Sans JP",
    load: () => import("@remotion/google-fonts/NotoSansJP"),
  },
  {
    family: "Noto Sans KR",
    load: () => import("@remotion/google-fonts/NotoSansKR"),
  },
  {
    family: "Noto Sans SC",
    load: () => import("@remotion/google-fonts/NotoSansSC"),
  },
  {
    family: "Noto Sans TC",
    load: () => import("@remotion/google-fonts/NotoSansTC"),
  },
  {
    family: "Noto Serif",
    load: () => import("@remotion/google-fonts/NotoSerif"),
  },
  {
    family: "Noto Serif JP",
    load: () => import("@remotion/google-fonts/NotoSerifJP"),
  },
  {
    family: "Noto Serif KR",
    load: () => import("@remotion/google-fonts/NotoSerifKR"),
  },
  {
    family: "Noto Serif TC",
    load: () => import("@remotion/google-fonts/NotoSerifTC"),
  },
  { family: "Nunito", load: () => import("@remotion/google-fonts/Nunito") },
  {
    family: "Nunito Sans",
    load: () => import("@remotion/google-fonts/NunitoSans"),
  },
  {
    family: "Old Standard TT",
    load: () => import("@remotion/google-fonts/OldStandardTT"),
  },
  {
    family: "Oleo Script",
    load: () => import("@remotion/google-fonts/OleoScript"),
  },
  {
    family: "Open Sans",
    load: () => import("@remotion/google-fonts/OpenSans"),
  },
  { family: "Orbitron", load: () => import("@remotion/google-fonts/Orbitron") },
  { family: "Oswald", load: () => import("@remotion/google-fonts/Oswald") },
  { family: "Outfit", load: () => import("@remotion/google-fonts/Outfit") },
  { family: "Overpass", load: () => import("@remotion/google-fonts/Overpass") },
  { family: "Oxygen", load: () => import("@remotion/google-fonts/Oxygen") },
  { family: "PT Mono", load: () => import("@remotion/google-fonts/PTMono") },
  { family: "PT Sans", load: () => import("@remotion/google-fonts/PTSans") },
  {
    family: "PT Sans Caption",
    load: () => import("@remotion/google-fonts/PTSansCaption"),
  },
  {
    family: "PT Sans Narrow",
    load: () => import("@remotion/google-fonts/PTSansNarrow"),
  },
  { family: "PT Serif", load: () => import("@remotion/google-fonts/PTSerif") },
  { family: "Pacifico", load: () => import("@remotion/google-fonts/Pacifico") },
  {
    family: "Passion One",
    load: () => import("@remotion/google-fonts/PassionOne"),
  },
  {
    family: "Pathway Gothic One",
    load: () => import("@remotion/google-fonts/PathwayGothicOne"),
  },
  {
    family: "Patrick Hand",
    load: () => import("@remotion/google-fonts/PatrickHand"),
  },
  {
    family: "Patua One",
    load: () => import("@remotion/google-fonts/PatuaOne"),
  },
  {
    family: "Paytone One",
    load: () => import("@remotion/google-fonts/PaytoneOne"),
  },
  {
    family: "Permanent Marker",
    load: () => import("@remotion/google-fonts/PermanentMarker"),
  },
  {
    family: "Philosopher",
    load: () => import("@remotion/google-fonts/Philosopher"),
  },
  { family: "Play", load: () => import("@remotion/google-fonts/Play") },
  {
    family: "Playfair Display",
    load: () => import("@remotion/google-fonts/PlayfairDisplay"),
  },
  {
    family: "Playfair Display SC",
    load: () => import("@remotion/google-fonts/PlayfairDisplaySC"),
  },
  {
    family: "Plus Jakarta Sans",
    load: () => import("@remotion/google-fonts/PlusJakartaSans"),
  },
  {
    family: "Poiret One",
    load: () => import("@remotion/google-fonts/PoiretOne"),
  },
  { family: "Poppins", load: () => import("@remotion/google-fonts/Poppins") },
  { family: "Prata", load: () => import("@remotion/google-fonts/Prata") },
  {
    family: "Press Start 2P",
    load: () => import("@remotion/google-fonts/PressStart2P"),
  },
  { family: "Prompt", load: () => import("@remotion/google-fonts/Prompt") },
  {
    family: "Public Sans",
    load: () => import("@remotion/google-fonts/PublicSans"),
  },
  {
    family: "Quattrocento",
    load: () => import("@remotion/google-fonts/Quattrocento"),
  },
  {
    family: "Quattrocento Sans",
    load: () => import("@remotion/google-fonts/QuattrocentoSans"),
  },
  {
    family: "Questrial",
    load: () => import("@remotion/google-fonts/Questrial"),
  },
  {
    family: "Quicksand",
    load: () => import("@remotion/google-fonts/Quicksand"),
  },
  { family: "Rajdhani", load: () => import("@remotion/google-fonts/Rajdhani") },
  { family: "Raleway", load: () => import("@remotion/google-fonts/Raleway") },
  {
    family: "Red Hat Display",
    load: () => import("@remotion/google-fonts/RedHatDisplay"),
  },
  {
    family: "Righteous",
    load: () => import("@remotion/google-fonts/Righteous"),
  },
  { family: "Roboto", load: () => import("@remotion/google-fonts/Roboto") },
  {
    family: "Roboto Condensed",
    load: () => import("@remotion/google-fonts/RobotoCondensed"),
  },
  {
    family: "Roboto Mono",
    load: () => import("@remotion/google-fonts/RobotoMono"),
  },
  {
    family: "Roboto Slab",
    load: () => import("@remotion/google-fonts/RobotoSlab"),
  },
  { family: "Rokkitt", load: () => import("@remotion/google-fonts/Rokkitt") },
  {
    family: "Ropa Sans",
    load: () => import("@remotion/google-fonts/RopaSans"),
  },
  { family: "Rowdies", load: () => import("@remotion/google-fonts/Rowdies") },
  { family: "Rubik", load: () => import("@remotion/google-fonts/Rubik") },
  {
    family: "Rubik Mono One",
    load: () => import("@remotion/google-fonts/RubikMonoOne"),
  },
  {
    family: "Russo One",
    load: () => import("@remotion/google-fonts/RussoOne"),
  },
  {
    family: "Sacramento",
    load: () => import("@remotion/google-fonts/Sacramento"),
  },
  { family: "Saira", load: () => import("@remotion/google-fonts/Saira") },
  {
    family: "Saira Condensed",
    load: () => import("@remotion/google-fonts/SairaCondensed"),
  },
  { family: "Sarabun", load: () => import("@remotion/google-fonts/Sarabun") },
  { family: "Satisfy", load: () => import("@remotion/google-fonts/Satisfy") },
  {
    family: "Sawarabi Gothic",
    load: () => import("@remotion/google-fonts/SawarabiGothic"),
  },
  {
    family: "Sawarabi Mincho",
    load: () => import("@remotion/google-fonts/SawarabiMincho"),
  },
  {
    family: "Secular One",
    load: () => import("@remotion/google-fonts/SecularOne"),
  },
  { family: "Sen", load: () => import("@remotion/google-fonts/Sen") },
  {
    family: "Shadows Into Light",
    load: () => import("@remotion/google-fonts/ShadowsIntoLight"),
  },
  { family: "Signika", load: () => import("@remotion/google-fonts/Signika") },
  {
    family: "Signika Negative",
    load: () => import("@remotion/google-fonts/SignikaNegative"),
  },
  {
    family: "Slabo 27px",
    load: () => import("@remotion/google-fonts/Slabo27px"),
  },
  { family: "Sora", load: () => import("@remotion/google-fonts/Sora") },
  {
    family: "Source Code Pro",
    load: () => import("@remotion/google-fonts/SourceCodePro"),
  },
  {
    family: "Source Sans Pro",
    load: () => import("@remotion/google-fonts/SourceSansPro"),
  },
  {
    family: "Source Serif Pro",
    load: () => import("@remotion/google-fonts/SourceSerifPro"),
  },
  {
    family: "Space Grotesk",
    load: () => import("@remotion/google-fonts/SpaceGrotesk"),
  },
  {
    family: "Space Mono",
    load: () => import("@remotion/google-fonts/SpaceMono"),
  },
  {
    family: "Special Elite",
    load: () => import("@remotion/google-fonts/SpecialElite"),
  },
  { family: "Spectral", load: () => import("@remotion/google-fonts/Spectral") },
  {
    family: "Staatliches",
    load: () => import("@remotion/google-fonts/Staatliches"),
  },
  { family: "Tajawal", load: () => import("@remotion/google-fonts/Tajawal") },
  {
    family: "Tangerine",
    load: () => import("@remotion/google-fonts/Tangerine"),
  },
  { family: "Teko", load: () => import("@remotion/google-fonts/Teko") },
  {
    family: "Tenor Sans",
    load: () => import("@remotion/google-fonts/TenorSans"),
  },
  { family: "Tinos", load: () => import("@remotion/google-fonts/Tinos") },
  {
    family: "Titan One",
    load: () => import("@remotion/google-fonts/TitanOne"),
  },
  {
    family: "Titillium Web",
    load: () => import("@remotion/google-fonts/TitilliumWeb"),
  },
  { family: "Ubuntu", load: () => import("@remotion/google-fonts/Ubuntu") },
  {
    family: "Ubuntu Condensed",
    load: () => import("@remotion/google-fonts/UbuntuCondensed"),
  },
  {
    family: "Ubuntu Mono",
    load: () => import("@remotion/google-fonts/UbuntuMono"),
  },
  { family: "Ultra", load: () => import("@remotion/google-fonts/Ultra") },
  { family: "Unna", load: () => import("@remotion/google-fonts/Unna") },
  { family: "Urbanist", load: () => import("@remotion/google-fonts/Urbanist") },
  {
    family: "Varela Round",
    load: () => import("@remotion/google-fonts/VarelaRound"),
  },
  { family: "Vidaloka", load: () => import("@remotion/google-fonts/Vidaloka") },
  { family: "Vollkorn", load: () => import("@remotion/google-fonts/Vollkorn") },
  {
    family: "Work Sans",
    load: () => import("@remotion/google-fonts/WorkSans"),
  },
  {
    family: "Yanone Kaffeesatz",
    load: () => import("@remotion/google-fonts/YanoneKaffeesatz"),
  },
  {
    family: "Yantramanav",
    load: () => import("@remotion/google-fonts/Yantramanav"),
  },
  {
    family: "Yellowtail",
    load: () => import("@remotion/google-fonts/Yellowtail"),
  },
  {
    family: "Yeseva One",
    load: () => import("@remotion/google-fonts/YesevaOne"),
  },
  { family: "Zeyada", load: () => import("@remotion/google-fonts/Zeyada") },
  {
    family: "Zilla Slab",
    load: () => import("@remotion/google-fonts/ZillaSlab"),
  },
];
```

## Show only the 100 most popular Google Fonts

To reduce bundle size, you can limit the selection. Instead of calling `getAvailableFonts()`, create a file with the following contents and use it as the fonts array:

```ts twoslash
export const top100 = [
  { family: "Abel", load: () => import("@remotion/google-fonts/Abel") },
  {
    family: "Abril Fatface",
    load: () => import("@remotion/google-fonts/AbrilFatface"),
  },
  { family: "Anton", load: () => import("@remotion/google-fonts/Anton") },
  { family: "Archivo", load: () => import("@remotion/google-fonts/Archivo") },
  { family: "Arimo", load: () => import("@remotion/google-fonts/Arimo") },
  { family: "Arvo", load: () => import("@remotion/google-fonts/Arvo") },
  { family: "Asap", load: () => import("@remotion/google-fonts/Asap") },
  {
    family: "Asap Condensed",
    load: () => import("@remotion/google-fonts/AsapCondensed"),
  },
  {
    family: "Assistant",
    load: () => import("@remotion/google-fonts/Assistant"),
  },
  { family: "Barlow", load: () => import("@remotion/google-fonts/Barlow") },
  {
    family: "Barlow Condensed",
    load: () => import("@remotion/google-fonts/BarlowCondensed"),
  },
  {
    family: "Bebas Neue",
    load: () => import("@remotion/google-fonts/BebasNeue"),
  },
  { family: "Bitter", load: () => import("@remotion/google-fonts/Bitter") },
  { family: "Cabin", load: () => import("@remotion/google-fonts/Cabin") },
  { family: "Cairo", load: () => import("@remotion/google-fonts/Cairo") },
  { family: "Caveat", load: () => import("@remotion/google-fonts/Caveat") },
  {
    family: "Comfortaa",
    load: () => import("@remotion/google-fonts/Comfortaa"),
  },
  {
    family: "Cormorant Garamond",
    load: () => import("@remotion/google-fonts/CormorantGaramond"),
  },
  {
    family: "Crimson Text",
    load: () => import("@remotion/google-fonts/CrimsonText"),
  },
  { family: "DM Sans", load: () => import("@remotion/google-fonts/DMSans") },
  {
    family: "Dancing Script",
    load: () => import("@remotion/google-fonts/DancingScript"),
  },
  { family: "Dosis", load: () => import("@remotion/google-fonts/Dosis") },
  {
    family: "EB Garamond",
    load: () => import("@remotion/google-fonts/EBGaramond"),
  },
  { family: "Exo 2", load: () => import("@remotion/google-fonts/Exo2") },
  {
    family: "Fira Sans",
    load: () => import("@remotion/google-fonts/FiraSans"),
  },
  {
    family: "Fira Sans Condensed",
    load: () => import("@remotion/google-fonts/FiraSansCondensed"),
  },
  {
    family: "Fjalla One",
    load: () => import("@remotion/google-fonts/FjallaOne"),
  },
  { family: "Heebo", load: () => import("@remotion/google-fonts/Heebo") },
  { family: "Hind", load: () => import("@remotion/google-fonts/Hind") },
  {
    family: "Hind Madurai",
    load: () => import("@remotion/google-fonts/HindMadurai"),
  },
  {
    family: "Hind Siliguri",
    load: () => import("@remotion/google-fonts/HindSiliguri"),
  },
  {
    family: "IBM Plex Sans",
    load: () => import("@remotion/google-fonts/IBMPlexSans"),
  },
  {
    family: "Inconsolata",
    load: () => import("@remotion/google-fonts/Inconsolata"),
  },
  {
    family: "Indie Flower",
    load: () => import("@remotion/google-fonts/IndieFlower"),
  },
  { family: "Inter", load: () => import("@remotion/google-fonts/Inter") },
  {
    family: "Josefin Sans",
    load: () => import("@remotion/google-fonts/JosefinSans"),
  },
  { family: "Jost", load: () => import("@remotion/google-fonts/Jost") },
  { family: "Kanit", load: () => import("@remotion/google-fonts/Kanit") },
  { family: "Karla", load: () => import("@remotion/google-fonts/Karla") },
  { family: "Lato", load: () => import("@remotion/google-fonts/Lato") },
  {
    family: "Libre Baskerville",
    load: () => import("@remotion/google-fonts/LibreBaskerville"),
  },
  {
    family: "Libre Franklin",
    load: () => import("@remotion/google-fonts/LibreFranklin"),
  },
  { family: "Lobster", load: () => import("@remotion/google-fonts/Lobster") },
  { family: "Lora", load: () => import("@remotion/google-fonts/Lora") },
  {
    family: "M PLUS Rounded 1c",
    load: () => import("@remotion/google-fonts/MPLUSRounded1c"),
  },
  { family: "Manrope", load: () => import("@remotion/google-fonts/Manrope") },
  {
    family: "Maven Pro",
    load: () => import("@remotion/google-fonts/MavenPro"),
  },
  {
    family: "Merriweather",
    load: () => import("@remotion/google-fonts/Merriweather"),
  },
  {
    family: "Merriweather Sans",
    load: () => import("@remotion/google-fonts/MerriweatherSans"),
  },
  {
    family: "Montserrat",
    load: () => import("@remotion/google-fonts/Montserrat"),
  },
  { family: "Mukta", load: () => import("@remotion/google-fonts/Mukta") },
  { family: "Mulish", load: () => import("@remotion/google-fonts/Mulish") },
  {
    family: "Nanum Gothic",
    load: () => import("@remotion/google-fonts/NanumGothic"),
  },
  {
    family: "Noto Sans",
    load: () => import("@remotion/google-fonts/NotoSans"),
  },
  {
    family: "Noto Sans HK",
    load: () => import("@remotion/google-fonts/NotoSansHK"),
  },
  {
    family: "Noto Sans JP",
    load: () => import("@remotion/google-fonts/NotoSansJP"),
  },
  {
    family: "Noto Sans KR",
    load: () => import("@remotion/google-fonts/NotoSansKR"),
  },
  {
    family: "Noto Sans SC",
    load: () => import("@remotion/google-fonts/NotoSansSC"),
  },
  {
    family: "Noto Sans TC",
    load: () => import("@remotion/google-fonts/NotoSansTC"),
  },
  {
    family: "Noto Serif",
    load: () => import("@remotion/google-fonts/NotoSerif"),
  },
  {
    family: "Noto Serif JP",
    load: () => import("@remotion/google-fonts/NotoSerifJP"),
  },
  { family: "Nunito", load: () => import("@remotion/google-fonts/Nunito") },
  {
    family: "Nunito Sans",
    load: () => import("@remotion/google-fonts/NunitoSans"),
  },
  {
    family: "Open Sans",
    load: () => import("@remotion/google-fonts/OpenSans"),
  },
  { family: "Oswald", load: () => import("@remotion/google-fonts/Oswald") },
  { family: "Overpass", load: () => import("@remotion/google-fonts/Overpass") },
  { family: "Oxygen", load: () => import("@remotion/google-fonts/Oxygen") },
  { family: "PT Sans", load: () => import("@remotion/google-fonts/PTSans") },
  {
    family: "PT Sans Narrow",
    load: () => import("@remotion/google-fonts/PTSansNarrow"),
  },
  { family: "PT Serif", load: () => import("@remotion/google-fonts/PTSerif") },
  { family: "Pacifico", load: () => import("@remotion/google-fonts/Pacifico") },
  {
    family: "Playfair Display",
    load: () => import("@remotion/google-fonts/PlayfairDisplay"),
  },
  { family: "Poppins", load: () => import("@remotion/google-fonts/Poppins") },
  { family: "Prompt", load: () => import("@remotion/google-fonts/Prompt") },
  {
    family: "Public Sans",
    load: () => import("@remotion/google-fonts/PublicSans"),
  },
  {
    family: "Quicksand",
    load: () => import("@remotion/google-fonts/Quicksand"),
  },
  { family: "Rajdhani", load: () => import("@remotion/google-fonts/Rajdhani") },
  { family: "Raleway", load: () => import("@remotion/google-fonts/Raleway") },
  {
    family: "Righteous",
    load: () => import("@remotion/google-fonts/Righteous"),
  },
  { family: "Roboto", load: () => import("@remotion/google-fonts/Roboto") },
  {
    family: "Roboto Condensed",
    load: () => import("@remotion/google-fonts/RobotoCondensed"),
  },
  {
    family: "Roboto Mono",
    load: () => import("@remotion/google-fonts/RobotoMono"),
  },
  {
    family: "Roboto Slab",
    load: () => import("@remotion/google-fonts/RobotoSlab"),
  },
  { family: "Rubik", load: () => import("@remotion/google-fonts/Rubik") },
  { family: "Satisfy", load: () => import("@remotion/google-fonts/Satisfy") },
  {
    family: "Secular One",
    load: () => import("@remotion/google-fonts/SecularOne"),
  },
  {
    family: "Shadows Into Light",
    load: () => import("@remotion/google-fonts/ShadowsIntoLight"),
  },
  {
    family: "Signika Negative",
    load: () => import("@remotion/google-fonts/SignikaNegative"),
  },
  {
    family: "Slabo 27px",
    load: () => import("@remotion/google-fonts/Slabo27px"),
  },
  {
    family: "Source Code Pro",
    load: () => import("@remotion/google-fonts/SourceCodePro"),
  },
  {
    family: "Source Sans Pro",
    load: () => import("@remotion/google-fonts/SourceSansPro"),
  },
  {
    family: "Source Serif Pro",
    load: () => import("@remotion/google-fonts/SourceSerifPro"),
  },
  {
    family: "Space Grotesk",
    load: () => import("@remotion/google-fonts/SpaceGrotesk"),
  },
  { family: "Tajawal", load: () => import("@remotion/google-fonts/Tajawal") },
  { family: "Teko", load: () => import("@remotion/google-fonts/Teko") },
  {
    family: "Titillium Web",
    load: () => import("@remotion/google-fonts/TitilliumWeb"),
  },
  { family: "Ubuntu", load: () => import("@remotion/google-fonts/Ubuntu") },
  {
    family: "Varela Round",
    load: () => import("@remotion/google-fonts/VarelaRound"),
  },
  {
    family: "Work Sans",
    load: () => import("@remotion/google-fonts/WorkSans"),
  },
  {
    family: "Yanone Kaffeesatz",
    load: () => import("@remotion/google-fonts/YanoneKaffeesatz"),
  },
];
```

## Show only the 25 most popular Google Fonts

To reduce bundle size, you can limit the selection. Instead of calling `getAvailableFonts()`, create a file with the following contents and use it as the fonts array:

```ts twoslash
export const top25 = [
  { family: "Inter", load: () => import("@remotion/google-fonts/Inter") },
  { family: "Lato", load: () => import("@remotion/google-fonts/Lato") },
  { family: "Lora", load: () => import("@remotion/google-fonts/Lora") },
  {
    family: "Merriweather",
    load: () => import("@remotion/google-fonts/Merriweather"),
  },
  {
    family: "Montserrat",
    load: () => import("@remotion/google-fonts/Montserrat"),
  },
  { family: "Mukta", load: () => import("@remotion/google-fonts/Mukta") },
  {
    family: "Noto Sans",
    load: () => import("@remotion/google-fonts/NotoSans"),
  },
  {
    family: "Noto Sans JP",
    load: () => import("@remotion/google-fonts/NotoSansJP"),
  },
  {
    family: "Noto Sans KR",
    load: () => import("@remotion/google-fonts/NotoSansKR"),
  },
  { family: "Nunito", load: () => import("@remotion/google-fonts/Nunito") },
  {
    family: "Nunito Sans",
    load: () => import("@remotion/google-fonts/NunitoSans"),
  },
  {
    family: "Open Sans",
    load: () => import("@remotion/google-fonts/OpenSans"),
  },
  { family: "Oswald", load: () => import("@remotion/google-fonts/Oswald") },
  { family: "PT Sans", load: () => import("@remotion/google-fonts/PTSans") },
  {
    family: "Playfair Display",
    load: () => import("@remotion/google-fonts/PlayfairDisplay"),
  },
  { family: "Poppins", load: () => import("@remotion/google-fonts/Poppins") },
  { family: "Raleway", load: () => import("@remotion/google-fonts/Raleway") },
  { family: "Roboto", load: () => import("@remotion/google-fonts/Roboto") },
  {
    family: "Roboto Condensed",
    load: () => import("@remotion/google-fonts/RobotoCondensed"),
  },
  {
    family: "Roboto Mono",
    load: () => import("@remotion/google-fonts/RobotoMono"),
  },
  {
    family: "Roboto Slab",
    load: () => import("@remotion/google-fonts/RobotoSlab"),
  },
  { family: "Rubik", load: () => import("@remotion/google-fonts/Rubik") },
  {
    family: "Source Sans Pro",
    load: () => import("@remotion/google-fonts/SourceSansPro"),
  },
  { family: "Ubuntu", load: () => import("@remotion/google-fonts/Ubuntu") },
  {
    family: "Work Sans",
    load: () => import("@remotion/google-fonts/WorkSans"),
  },
];
```
