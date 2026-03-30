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
			'Passing `objectFit` via the `style` prop is not supported for the `<Video>` component from `@remotion/media`. Use the `objectFit` prop directly instead.',
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
			'Passing an `object-fit` CSS class via `className` is not supported for the `<Video>` component from `@remotion/media`. Use the `objectFit` prop directly instead.',
		);
	}
};
