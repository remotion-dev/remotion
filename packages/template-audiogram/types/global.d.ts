declare module "parse-srt" {
  export type SubtitleItem = {
    id: number;
    start: number;
    end: number;
    text: string;
  };
  export type Subtitles = SubtitleItem[];

  function parseSRT(srt: string): Subtitles;

  export default parseSRT;
}
