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
						console.log(info);
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
