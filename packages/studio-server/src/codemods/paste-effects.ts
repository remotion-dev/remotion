import {CodemodsInternals} from '@remotion/codemods';

const {pasteEffects: pasteEffectsCodemod} = CodemodsInternals;

type PasteEffectsInput = Parameters<typeof pasteEffectsCodemod>[0] & {
	readonly targetFileName: string;
};

export const pasteEffects = (input: PasteEffectsInput) =>
	pasteEffectsCodemod(input);
