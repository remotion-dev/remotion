import {darken, transparentize} from 'polished';

export const PALETTE = {
	BOX_STROKE: 'var(--box-stroke)',
	TEXT_COLOR: 'var(--text-color)',
	BORDER_COLOR: 'var(--border-color)',
	BRAND: 'var(--ifm-color-primary)',
};

export const UNDERLAY_BLUE = transparentize(0.85, PALETTE.BRAND);
export const RED = '#e74c3c';
export const UNDERLAY_RED = transparentize(0.9, RED);
export const BLUE_TEXT = darken(0.3, PALETTE.BRAND);
