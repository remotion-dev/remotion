export const parseIsMadeWithRemotion = (key: string, value: unknown) => {
	if (key !== 'comment') {
		return null;
	}

	const isMadeWithRemotion = String(value).includes('Made with Remotion');
	if (!isMadeWithRemotion) {
		return null;
	}

	const version = String(value).split(' ')[3];
	return version;
};

export const renderMetadataLabel = (key: string, value: unknown) => {
	const version = parseIsMadeWithRemotion(key, value);
	if (version) {
		return 'Made with Remotion';
	}

	if (key === 'com.apple.quicktime.location.accuracy.horizontal') {
		return 'Location Accuracy (Horizontal)';
	}

	if (key === 'artist') {
		return 'Artist';
	}

	if (key === 'album') {
		return 'Album';
	}

	if (key === 'composer') {
		return 'Composer';
	}

	if (key === 'comment') {
		return 'Comment';
	}

	if (key === 'releaseDate') {
		return 'Release Date';
	}

	if (key === 'genre') {
		return 'Genre';
	}

	if (key === 'title') {
		return 'Title';
	}

	if (key === 'writer') {
		return 'Writer';
	}

	if (key === 'director') {
		return 'Director';
	}

	if (key === 'producer') {
		return 'Producer';
	}

	if (key === 'description') {
		return 'Description';
	}

	if (key === 'duration') {
		return 'Metadata Duration';
	}

	if (key === 'encoder') {
		return 'Encoder';
	}

	if (key === 'copyright') {
		return 'Copyright';
	}

	if (key === 'major_brand') {
		return 'Major Brand';
	}

	if (key === 'minor_version') {
		return 'Minor Version';
	}

	if (key === 'compatible_brands') {
		return 'Compatible Brands';
	}

	if (key === 'handler_name') {
		return 'Handler';
	}

	if (key === 'com.apple.quicktime.camera.focal_length.35mm_equivalent') {
		return '35mm-equivalent focal length';
	}

	if (key === 'com.apple.quicktime.camera.lens_model') {
		return 'Lens';
	}

	if (key === 'com.apple.quicktime.creationdate') {
		return 'Created';
	}

	if (key === 'com.apple.quicktime.software') {
		return 'OS Device Version';
	}

	if (key === 'com.apple.quicktime.model') {
		return 'Device';
	}

	if (key === 'com.apple.quicktime.make') {
		return 'Manufacturer';
	}

	if (key === 'com.apple.quicktime.live-photo.vitality-score') {
		return 'Live Photo Vitality Score';
	}

	if (key === 'com.apple.quicktime.live-photo.vitality-scoring-version') {
		return 'Live Photo Vitality Scoring Version';
	}

	if (key === 'com.apple.quicktime.content.identifier') {
		return 'Identifier';
	}

	if (key === 'com.apple.quicktime.full-frame-rate-playback-intent') {
		return 'Should play at full frame rate';
	}

	if (key === 'com.apple.quicktime.information') {
		return 'Information';
	}

	if (key === 'com.apple.quicktime.location.ISO6709') {
		return 'Location';
	}

	if (key === 'com.apple.quicktime.live-photo.auto') {
		return 'Live Photo Auto Mode';
	}

	if (key === 'TPE1') {
		return 'Artist';
	}

	if (key === 'TIT2') {
		return 'Title';
	}

	if (key === 'TYER') {
		return 'Year';
	}

	if (key === 'TCON') {
		return 'Genre';
	}

	if (key === 'TCOM') {
		return 'Composer';
	}

	if (key === 'TCMP') {
		return 'Compilation';
	}

	if (key === 'TALB') {
		return 'Album';
	}

	if (key === 'COMM') {
		return 'Comment';
	}

	if (key === 'TCOP') {
		return 'Copyright';
	}

	if (key === 'TIT3') {
		return 'Description';
	}

	if (key === 'TLAN') {
		return 'Language';
	}

	if (key === 'TSRC') {
		return 'ISRC';
	}

	if (key === 'WOAR') {
		return 'Artist Webpage';
	}

	if (key === 'WPUB') {
		return 'Publisher Webpage';
	}

	return key;
};

function formatDateString(dateString: string): string {
	// Parse the date string into a Date object
	const date = new Date(dateString);

	// Define the options for formatting the date
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		timeZoneName: 'short', // This includes the timezone
		hour12: false, // Use 24-hour format
	};

	// Create a DateTimeFormat object for the user's locale
	const formatter = new Intl.DateTimeFormat('en-CH', options);

	// Format the date
	return formatter.format(date);
}

export const renderMetadataValue = ({
	key,
	value,
}: {
	key: string;
	value: string | number;
}) => {
	const version = parseIsMadeWithRemotion(key, value);
	if (version) {
		return 'v' + version;
	}

	if (key === 'com.apple.quicktime.location.ISO6709') {
		return String(value);
	}

	if (key === 'com.apple.quicktime.creationdate') {
		return formatDateString(String(value));
	}

	if (key === 'TCMP') {
		return value === '1' ? 'Yes' : 'No';
	}

	if (key === 'com.apple.quicktime.camera.focal_length.35mm_equivalent') {
		return String(value) + 'mm';
	}

	return value;
};
