import {CodemodInternals} from '@remotion/codemods';

const {pasteEffects: pasteEffectsCodemod} = CodemodInternals;

type PasteEffectsInput = Parameters<typeof pasteEffectsCodemod>[0] & {
	readonly targetFileName: string;
};

export const pasteEffects = (input: PasteEffectsInput) =>
	pasteEffectsCodemod(input);
