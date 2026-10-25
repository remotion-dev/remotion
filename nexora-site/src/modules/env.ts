const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

export const env = {
	get reducedMotion() {
		return reducedQuery.matches;
	},
	get finePointer() {
		return finePointerQuery.matches;
	},
	get isSmallScreen() {
		return window.innerWidth < 860;
	},
};

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
	root.querySelector<T>(sel);
export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
	Array.from(root.querySelectorAll<T>(sel));
