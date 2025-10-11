export const shouldLogBrowserMessage = (message: string) => {
	// Not relevant for the user
	if (message.startsWith('DevTools listening on')) {
		return false;
	}

	// In Ubuntu GitHub Action
	if (message.includes('Falling back to ALSA for audio output')) {
		return false;
	}

	// In Ubuntu GitHub Action
	if (
		message.includes(
			'Floss manager not present, cannot set Floss enable/disable',
		)
	) {
		return false;
	}

	// Noisy but harmless warning
	if (message.includes('Failed to send GpuControl.CreateCommandBuffer')) {
		return false;
	}

	if (
		message.includes(
			'CreatePlatformSocket() failed: Address family not supported by protocol',
		)
	) {
		return false;
	}

	if (message.includes('Fontconfig error: No writable cache directories')) {
		return false;
	}

	if (
		message.includes(
			'AttributionReportingCrossAppWeb cannot be enabled in this configuration',
		)
	) {
		return false;
	}

	if (
		message.includes(
			'Trying to Produce a Memory representation from a non-existent mailbox.',
		)
	) {
		return false;
	}

	if (message.includes('Received HEADERS for invalid stream')) {
		return false;
	}

	if (message.includes('CVDisplayLinkCreateWithCGDisplay failed')) {
		return false;
	}

	if (message.includes('Falling back to ALSA for audio output')) {
		return false;
	}

	if (message.includes('VizNullHypothesis is disabled')) {
		return false;
	}

	return true;
};

type ParsedBrowserLogMessage = {
	day: number;
	month: number;
	hour: number;
	minute: number;
	seconds: number;
	microseconds: number;
	level: string;
	location: string;
	lineNumber: number;
	message: string;
};

export const parseBrowserLogMessage = (
	input: string,
): ParsedBrowserLogMessage | null => {
	const format =
		/^\[([0-9]{4})\/([0-9]{6})\.([0-9]{6}):([A-Z]+):(.*)\(([0-9]+)\)\](.*)/;
	const match = input.match(format);
	if (!match) {
		return null;
	}

	const date = match[1];
	const day = parseInt(date.slice(0, 2), 10);
	const month = parseInt(date.slice(2, 4), 10);

	const time = match[2];
	const hour = parseInt(time.slice(0, 2), 10);
	const minute = parseInt(time.slice(2, 4), 10);
	const seconds = parseInt(time.slice(4, 6), 10);

	const microseconds = parseInt(match[3], 10);

	const level = match[4];

	const location = match[5];
	const lineNumber = parseInt(match[6], 10);

	const message = match[7].trim();

	return {
		day,
		month,
		hour,
		minute,
		seconds,
		microseconds,
		level,
		location,
		lineNumber,
		message,
	};
};

export const formatChromeMessage = (
	input: string,
): {output: string; tag: string} | null => {
	const parsed = parseBrowserLogMessage(input);
	if (!parsed) {
		return {output: input, tag: 'chrome'};
	}

	const {location, lineNumber, message} = parsed;
	// Don't print console.log's, these are handled through the WebSocket
	if (location === 'CONSOLE') {
		return null;
	}

	return {output: `${location}:${lineNumber}: ${message}`, tag: 'chrome'};
};

type ChromeLogLocation = {
	location: string;
	lineNumber: number;
};

export const parseChromeLogLocation = (
	message: string,
): ChromeLogLocation | null => {
	const regex = /(.*), source: (.*) \(([0-9]+)\)/;
	const match = message.match(regex);
	if (!match) {
		return null;
	}

	return {
		lineNumber: parseInt(match[3], 10),
		location: match[2],
	};
};
