// Must keep this file synced with payloads.rs!

export type Layer =
  | {
      type: "Image";
      params: {
        src: string;
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }
  | {
      type: "Solid";
      params: {
        fill: [number, number, number, number];
        x: number;
        y: number;
        width: number;
        height: number;
      };
    };

export type CliInput = {
  v: number;
  output: string;
  width: number;
  height: number;
  layers: Layer[];
};
