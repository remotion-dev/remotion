import {makeArrow} from '@remotion/shapes';
import {CUTOUT_PAPER_COLOR} from '../paper-disco/cutout-paper';

const arrow = makeArrow({
	length: 300,
	headWidth: 185,
	headLength: 120,
	shaftWidth: 80,
	direction: 'right',
	cornerRadius: 0,
});

// A raster-backed SVG keeps the textured arrow renderable while it slides offscreen.
export const NOTEBOOK_ARROW_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
	`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="185" viewBox="0 0 300 185"><path d="${arrow.path}" fill="${CUTOUT_PAPER_COLOR}"/></svg>`,
)}`;
