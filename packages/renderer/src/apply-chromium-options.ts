import type {ChromiumOptions} from './open-browser';

export const applyChromiumOptions = (
	args: string[],
	options: ChromiumOptions,
): string[] => {
	let result = [...args];
	for (const [name, value] of Object.entries(options.flags ?? {})) {
		const flag = `--${name}`;
		result = result.filter(
			(arg) => arg !== flag && !arg.startsWith(`${flag}=`),
		);
		if (value !== false) {
			result.push(value === true ? flag : `${flag}=${value}`);
		}
	}

	for (const [features, enabledFlag, disabledFlag] of [
		[options.features, '--enable-features', '--disable-features'],
		[
			options.blinkFeatures,
			'--enable-blink-features',
			'--disable-blink-features',
		],
	] as const) {
		if (!features || Object.keys(features).length === 0) {
			continue;
		}

		const lists = [enabledFlag, disabledFlag].map((flag) =>
			result
				.filter((arg) => arg.startsWith(`${flag}=`))
				.flatMap((arg) => arg.slice(flag.length + 1).split(','))
				.map((feature) => feature.trim())
				.filter(Boolean),
		);
		for (const [name, enabled] of Object.entries(features)) {
			for (let i = 0; i < lists.length; i++) {
				lists[i] = lists[i].filter(
					(feature) =>
						feature.replace(/^\*/, '').split(/[<:]/)[0].trim() !== name,
				);
			}

			lists[enabled ? 0 : 1].push(name);
		}

		result = result.filter(
			(arg) =>
				arg !== enabledFlag &&
				arg !== disabledFlag &&
				!arg.startsWith(`${enabledFlag}=`) &&
				!arg.startsWith(`${disabledFlag}=`),
		);
		for (let i = 0; i < lists.length; i++) {
			if (lists[i].length > 0) {
				result.push(`${[enabledFlag, disabledFlag][i]}=${lists[i].join(',')}`);
			}
		}
	}

	return result;
};
