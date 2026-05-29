import {RenderInternals} from '@remotion/renderer';
import type {LogLevel} from '@remotion/renderer';
import {formatEffectPropChange} from './format-effect-prop-change';
import type {PropDelta} from './formatting';
import {normalizeQuotes, warnAboutPrettierOnce} from './log-update';

export const logEffectUpdate = ({
	fileRelativeToRoot,
	line,
	effectName,
	propKey,
	oldValueString,
	newValueString,
	defaultValueString,
	formatted,
	logLevel,
	removedProps,
	addedProps,
}: {
	fileRelativeToRoot: string;
	line: number;
	effectName: string;
	propKey: string;
	oldValueString: string;
	newValueString: string;
	defaultValueString: string | null;
	formatted: boolean;
	logLevel: LogLevel;
	removedProps: PropDelta[];
	addedProps: PropDelta[];
}) => {
	const locationLabel = `${fileRelativeToRoot}:${line}`;
	const propChange = formatEffectPropChange({
		effectName,
		key: propKey,
		oldValueString: normalizeQuotes(oldValueString),
		newValueString: normalizeQuotes(newValueString),
		defaultValueString:
			defaultValueString !== null ? normalizeQuotes(defaultValueString) : null,
		removedProps,
		addedProps,
	});
	RenderInternals.Log.info(
		{indent: false, logLevel},
		`${RenderInternals.chalk.blueBright(`${locationLabel}`)} ${propChange}`,
	);
	if (!formatted) {
		warnAboutPrettierOnce(logLevel);
	}
};
