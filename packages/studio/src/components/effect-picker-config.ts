import type {EffectCatalogItem} from '@remotion/studio-shared';

export const getEffectPickerConfig: (
	item: EffectCatalogItem,
) => EffectCatalogItem['effect']['config'] = (item) => {
	const params = {...item.effect.config};
	// Use a visible strength for neutral defaults, shared by hover and insertion.
	switch (item.effect.name) {
		case 'brightness':
			params.amount = 0.25;
			break;
		case 'contrast':
			params.amount = 1.6;
			break;
		case 'colorCorrection':
			params.temperature = 0.4;
			params.contrast = 1.3;
			params.saturation = 1.4;
			break;
		case 'exposure':
			params.stops = 0.8;
			break;
		case 'hue':
			params.degrees = 90;
			break;
		case 'levels':
			params.blackPoint = 0.08;
			params.whitePoint = 0.85;
			params.gamma = 1.3;
			break;
		case 'saturation':
			params.amount = 2;
			break;
		case 'shadowsHighlights':
			params.shadows = 0.6;
			params.highlights = -0.6;
			break;
		case 'whiteBalance':
			params.temperature = 0.5;
			params.tint = 0.2;
			break;
		case 'vibrance':
			params.amount = 0.8;
			break;
		case 'scale':
			params.scale = 0.8;
			break;
		case 'uvTranslate':
			params.u = 0.2;
			params.v = 0.1;
			break;
		case 'xyTranslate':
			params.x = 100;
			params.y = 40;
			break;
		case 'evolve':
		case 'tear':
		case 'venetianBlinds':
		case 'pixelDissolve':
		case 'shine':
		case 'lightLeak':
			params.progress = 0.5;
			break;
		default:
			break;
	}

	return params;
};
