import type { AudioCodec, Codec, FileExtension } from "@remotion/renderer";
import { BrowserSafeApis } from "@remotion/renderer/client";
import React from "react";

export const SupportedAudioCodecTable = () => {
  return (
    <table>
      <tr>
        <th>Video codec</th>
        <th>Default</th>
        <th>Supported audio codecs</th>
        <th>Possible file extensions</th>
      </tr>
      {Object.keys(BrowserSafeApis.supportedAudioCodecs).map((api: Codec) => {
        if (api === "h264-mkv") {
          return null;
        }

        return (
          <React.Fragment key={api}>
            {BrowserSafeApis.supportedAudioCodecs[api].map(
              (audioCodec: AudioCodec, i: number) => {
                const possibleExtensions = BrowserSafeApis
                  .defaultFileExtensionMap[api].forAudioCodec[audioCodec] as {
                  possible: FileExtension[];
                  default: FileExtension;
                };

                return (
                  <tr key={audioCodec}>
                    <td>{i === 0 ? <code>{api}</code> : null}</td>
                    <td>
                      {BrowserSafeApis.defaultAudioCodecs[api].compressed ===
                      audioCodec ? (
                        <span>✅</span>
                      ) : null}
                      {api === "prores" && i === 0 ? <span> *</span> : null}
                    </td>
                    <td>
                      <code>{audioCodec}</code>
                    </td>
                    <td>
                      {possibleExtensions.possible.map((p, index) => {
                        return (
                          <span key={p}>
                            <code>.{p}</code>{" "}
                            {p === possibleExtensions.default ? (
                              <em>(default)</em>
                            ) : null}
                            {index ===
                            possibleExtensions.possible.length - 1 ? null : (
                              <span>, </span>
                            )}
                          </span>
                        );
                      })}
                    </td>
                  </tr>
                );
              }
            )}
          </React.Fragment>
        );
      })}
    </table>
  );
};

export const FileExtensionTable: React.FC = () => {
  const extensions = Object.keys(BrowserSafeApis.defaultCodecsForFileExtension);

  return (
    <table>
      <tr>
        <th>File extension</th>
        <th>Default codec</th>
      </tr>
      {extensions.map((e) => {
        return (
          <tr key={e}>
            <td>.{e}</td>
            <td>
              <code>{BrowserSafeApis.defaultCodecsForFileExtension[e]}</code>
            </td>
          </tr>
        );
      })}
    </table>
  );
};
