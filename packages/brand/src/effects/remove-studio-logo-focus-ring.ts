import {createEffect} from 'remotion';

export const removeStudioLogoFocusRing = createEffect<
	Record<string, never>,
	null
>({
	type: 'dev.remotion.brand.removeStudioLogoFocusRing',
	label: 'removeStudioLogoFocusRing()',
	documentationLink: null,
	backend: '2d',
	calculateKey: () => 'remove-studio-logo-focus-ring-v1',
	setup: () => null,
	apply: ({source, target, width, height}) => {
		const ctx = target.getContext('2d');
		if (!ctx) {
			throw new Error(
				'Could not get a 2D context for the Studio logo cleanup.',
			);
		}

		ctx.clearRect(0, 0, width, height);
		ctx.drawImage(source, 0, 0, width, height);
		ctx.save();
		ctx.scale(width / 2330, height / 1440);
		// Replace the recorded focus border with the adjacent header background,
		// then restore the logo from the untouched source. The cursor is a separate
		// layer and stays above this cleanup.
		ctx.drawImage(source, 160, 13, 14, 134, 179, 13, 164, 134);
		ctx.drawImage(source, 216, 36, 92, 88, 216, 36, 92, 88);
		ctx.restore();
	},
	cleanup: () => undefined,
	schema: {},
	validateParams: () => undefined,
});
