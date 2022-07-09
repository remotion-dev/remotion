import {Spacing} from '../components/layout';
import {ColorDot} from '../components/Notifications/ColorDot';
import {notificationCenter} from '../components/Notifications/NotificationCenter';
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
			copyText(color.sRGBHex);
			notificationCenter.current?.addNotification({
				content: (
					<>
						<ColorDot color={color.sRGBHex} /> <Spacing x={1} /> Copied{' '}
						{color.sRGBHex}
					</>
				),
				created: Date.now(),
				duration: 2000,
				id: String(Math.random()),
			});
		})
		.catch((err: Error) => {
			if (err.message.includes('canceled')) {
				return;
			}

			notificationCenter.current?.addNotification({
				content: `Could not pick color.`,
				duration: 2000,
				created: Date.now(),
				id: String(Math.random()),
			});
		});
};
