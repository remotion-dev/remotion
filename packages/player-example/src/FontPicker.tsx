import React from 'react';
import {getAvailableFonts} from '@remotion/google-fonts';

export const FontPicker: React.FC = () => {
	const newFonts = getAvailableFonts();

	return (
		<div>
			<select
				onChange={(e) => {
					const fonts = newFonts[e.target.selectedIndex];
					const loaded = fonts.load();

					loaded.then((l) => {
						const info = l.getInfo();
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
					});
				}}
			>
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
