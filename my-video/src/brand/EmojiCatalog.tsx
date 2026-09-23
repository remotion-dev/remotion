import {AbsoluteFill, getStaticFiles} from "remotion";
import {poppins} from "../showcase/font";
import {NotoEmoji} from "./NotoEmoji";
import {brand} from "./theme";

// Every emoji saved in public/emoji/, with the name to pass to <NotoEmoji>.
// getStaticFiles() lists public/ as it was when the project was bundled, so a
// newly fetched emoji shows up here without editing this file.
export const EmojiCatalog: React.FC = () => {
  const names = getStaticFiles()
    .filter((file) => file.name.startsWith("emoji/") && file.name.endsWith(".json"))
    .map((file) => file.name.slice("emoji/".length, -".json".length))
    .sort();

  return (
    <AbsoluteFill style={{background: brand.background, fontFamily: poppins, padding: "40px 60px"}}>
      <div style={{color: brand.textDim, fontSize: 28, marginBottom: 24}}>
        {`public/emoji/: ${names.length} Noto animated emoji · <NotoEmoji name="…" size={…} loop />`}
      </div>
      <div style={{display: "flex", flexWrap: "wrap", gap: "18px 0"}}>
        {names.map((name) => (
          <div key={name} style={{width: 200, display: "flex", flexDirection: "column", alignItems: "center", gap: 6}}>
            <NotoEmoji name={name} size={120} loop />
            <div style={{color: brand.text, fontSize: 17}}>{name}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
