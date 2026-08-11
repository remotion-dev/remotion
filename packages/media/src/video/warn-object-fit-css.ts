import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';

const OBJECT_FIT_CLASS_PATTERN =
	/\bobject-(contain|cover|fill|none|scale-down)\b/;

let warnedStyle = false;
let warnedClassName = false;

export const warnAboutObjectFitInStyleOrClassName = ({
	style,
	className,
	logLevel,
}: {
	style: React.CSSProperties | undefined;
	className: string | undefined;
	logLevel: LogLevel;
}): void => {
	if (!warnedStyle && style?.objectFit) {
		warnedStyle = true;
		Internals.Log.warn(
			{logLevel, tag: '@remotion/media'},
			'Use the `objectFit` prop instead of the `style` prop.',
		);
	}

	if (
		!warnedClassName &&
		className &&
		OBJECT_FIT_CLASS_PATTERN.test(className)
	) {
		warnedClassName = true;
		Internals.Log.warn(
			{logLevel, tag: '@remotion/media'},
			'Use the `objectFit` prop instead of `object-*` CSS class names.',
		);
	}
};
