import {Spacing} from '../components/layout';
import {ColorDot} from '../components/Notifications/ColorDot';
import {showNotification} from '../components/Notifications/NotificationCenter';
import {copyText} from './copy-text';

export const pickColor = () => {
	// @ts-expect-error
	const open = new EyeDropper().open();
	(
		open as Promise<{
			sRGBHex: string;
		}>
	)
		.then((color) => {
			copyText(color.sRGBHex)
				.then(() => {
					showNotification(
						<>
							<ColorDot color={color.sRGBHex} /> <Spacing x={1} /> Copied{' '}
							{color.sRGBHex}
						</>,
						2000,
					);
				})
				.catch((err) => {
					showNotification(`Could not copy: ${err.message}`, 2000);
				});
		})
		.catch((err: Error) => {
			if (err.message.includes('canceled')) {
				return;
			}

			showNotification(`Could not pick color.`, 2000);
		});
};
