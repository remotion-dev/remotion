import {pasteEffects as pasteEffectsCodemod} from '@remotion/studio-codemods';

type PasteEffectsInput = Parameters<typeof pasteEffectsCodemod>[0] & {
	readonly targetFileName: string;
};

export const pasteEffects = (input: PasteEffectsInput) =>
	pasteEffectsCodemod(input);
