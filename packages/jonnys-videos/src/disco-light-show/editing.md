# Editing the disco light show

`Composition.tsx` assembles Master at 30 fps. Open the connected chapters under
**DiscoLightShow → Chapters** to edit their internal shots and transitions.

| Chapter                | Start in Master | Length | Content                                                                      |
| ---------------------- | --------------: | -----: | ---------------------------------------------------------------------------- |
| OpeningScene           |               0 |    325 | Intro, party footage, and Get them to dance                                  |
| BackgroundRemovalScene |             296 |    526 | Effect preview, Hugging Face demo, technology stickers, and layer separation |
| CustomToolScene        |             803 |    255 | Fork, chat drop, custom export tool, and fork sound                          |
| RemotionAssemblyScene  |            1053 |    265 | Importing clips, the three-layer stack, and code editor                      |
| FinaleScene            |            1364 |    244 | Countdown, drumsticks, and final video stack                                 |

Chapter entrances and exits overlap deliberately. Their keyframes use local
frames, so moving a chapter keeps its shots, stickers, sounds, and transitions
together. The existing per-shot playback rates and source trims remain inside
the chapter. `CodeEditor` is also connected for editing its screenshot and solid
independently.

Master keeps the continuous paper background, two music segments, and the hidden
social safe-zone guide. Its **Narration and captions** timing group moves or trims
the voiceover and captions together; it remains above all visual chapters.
Captions use the existing corrected transcript in `voiceover-captions.ts`.

The chapter previews use a neutral dark background. Master supplies its paper
background beneath the transparent portions of each chapter.
