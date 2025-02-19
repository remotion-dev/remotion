import { getAvailableFonts } from "@remotion/google-fonts";
import React from "react";

export const AvailableFonts: React.FC = () => {
  return (
    <table>
      <tr>
        <th>Font Family</th>
        <th>import statement</th>
      </tr>
      {getAvailableFonts().map((font) => {
        return (
          <tr key={font.importName}>
            <td>{font.fontFamily}</td>
            <td>
              <code>{`import {loadFont} from "@remotion/google-fonts/${font.importName}"`}</code>
            </td>
          </tr>
        );
      })}
    </table>
  );
};
