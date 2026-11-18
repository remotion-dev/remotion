import {expect, test} from 'bun:test';
import {EFFECT_CATALOG} from '@remotion/studio-shared';
import {getEffectPickerConfig} from '../components/effect-picker-config';
import {
	effectPreviewLoaders,
	type EffectPreviewFactory,
} from '../components/effect-preview-loaders';

test.each(EFFECT_CATALOG.map((item) => [item.label, item] as const))(
	'loads %s for effect previews',
	async (_label, item) => {
		const loader = effectPreviewLoaders[item.effect.importPath];
		expect(loader).toBeFunction();

		const module = await loader();
		const factory = module[item.effect.name] as EffectPreviewFactory;
		expect(factory).toBeFunction();
		const original = await import(item.effect.importPath);
		expect(factory).not.toBe(original[item.effect.name]);

		const effect = factory(getEffectPickerConfig(item));
		expect(effect.definition.label).toBe(item.label);
	},
);
