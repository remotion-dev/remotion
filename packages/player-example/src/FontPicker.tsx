import {getAvailableFonts} from '@remotion/google-fonts';
import React, {useCallback} from 'react';

export const FontPicker: React.FC = () => {
	const newFonts = getAvailableFonts();

	const onChange = useCallback(
		async (e: React.ChangeEvent<HTMLSelectElement>) => {
			const fonts = newFonts[e.target.selectedIndex];

			// Load font information
			const loaded = await fonts.load();

			// Load the font itself
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const {fontFamily, ...otherInfo} = loaded.loadFont();

			// Or get metadata about the font
			const info = loaded.getInfo();
			const styles = Object.keys(info.fonts);
			console.log('Font', info.fontFamily, ' Styles', styles);
			for (const style of styles) {
				const weightObject = info.fonts[style as keyof typeof info.fonts];
				const weights = Object.keys(weightObject);
				console.log('- Style', style, 'supports weights', weights);
				for (const weight of weights) {
					const scripts = Object.keys(weightObject[weight]);
					console.log('-- Weight', weight, 'supports scripts', scripts);
				}
			}
		},
		[newFonts],
	);

	return (
		<div>
			<select onChange={onChange}>
				{newFonts.map((f) => {
					return (
						<option key={f.importName} value={f.importName}>
							{f.fontFamily}
						</option>
					);
				})}
			</select>
		</div>
	);
};
