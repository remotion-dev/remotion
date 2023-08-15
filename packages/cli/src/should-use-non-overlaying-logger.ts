// Should not use a logger that uses ANSI Diffing if
// - using verbose logging (intersection of Chrome + Remotion + compositor logs)
// - using a non-interactive terminal such as CI

import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

export const shouldUseNonOverlayingLogger = ({
	logLevel,
}: {
	logLevel: LogLevel;
}): boolean => {
	return (
		RenderInternals.isEqualOrBelowLogLevel(logLevel, 'verbose') ||
		!process.stdout.isTTY
	);
};
