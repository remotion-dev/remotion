declare module '@remotion/effects/*?studio-preview' {
	import type {EffectDescriptor} from 'remotion';

	const effects: Record<
		string,
		(params: Record<string, unknown>) => EffectDescriptor<unknown>
	>;
	export = effects;
}
