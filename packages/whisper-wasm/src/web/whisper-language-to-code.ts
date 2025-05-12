const WHISPER_LANGUAGES = [
	['en', 'english'],
	['zh', 'chinese'],
	['de', 'german'],
	['es', 'spanish'],
	['ru', 'russian'],
	['ko', 'korean'],
	['fr', 'french'],
	['ja', 'japanese'],
	['pt', 'portuguese'],
	['tr', 'turkish'],
	['pl', 'polish'],
	['ca', 'catalan'],
	['nl', 'dutch'],
	['ar', 'arabic'],
	['sv', 'swedish'],
	['it', 'italian'],
	['id', 'indonesian'],
	['hi', 'hindi'],
	['fi', 'finnish'],
	['vi', 'vietnamese'],
	['he', 'hebrew'],
	['uk', 'ukrainian'],
	['el', 'greek'],
	['ms', 'malay'],
	['cs', 'czech'],
	['ro', 'romanian'],
	['da', 'danish'],
	['hu', 'hungarian'],
	['ta', 'tamil'],
	['no', 'norwegian'],
	['th', 'thai'],
	['ur', 'urdu'],
	['hr', 'croatian'],
	['bg', 'bulgarian'],
	['lt', 'lithuanian'],
	['la', 'latin'],
	['mi', 'maori'],
	['ml', 'malayalam'],
	['cy', 'welsh'],
	['sk', 'slovak'],
	['te', 'telugu'],
	['fa', 'persian'],
	['lv', 'latvian'],
	['bn', 'bengali'],
	['sr', 'serbian'],
	['az', 'azerbaijani'],
	['sl', 'slovenian'],
	['kn', 'kannada'],
	['et', 'estonian'],
	['mk', 'macedonian'],
	['br', 'breton'],
	['eu', 'basque'],
	['is', 'icelandic'],
	['hy', 'armenian'],
	['ne', 'nepali'],
	['mn', 'mongolian'],
	['bs', 'bosnian'],
	['kk', 'kazakh'],
	['sq', 'albanian'],
	['sw', 'swahili'],
	['gl', 'galician'],
	['mr', 'marathi'],
	['pa', 'punjabi'],
	['si', 'sinhala'],
	['km', 'khmer'],
	['sn', 'shona'],
	['yo', 'yoruba'],
	['so', 'somali'],
	['af', 'afrikaans'],
	['oc', 'occitan'],
	['ka', 'georgian'],
	['be', 'belarusian'],
	['tg', 'tajik'],
	['sd', 'sindhi'],
	['gu', 'gujarati'],
	['am', 'amharic'],
	['yi', 'yiddish'],
	['lo', 'lao'],
	['uz', 'uzbek'],
	['fo', 'faroese'],
	['ht', 'haitian creole'],
	['ps', 'pashto'],
	['tk', 'turkmen'],
	['nn', 'nynorsk'],
	['mt', 'maltese'],
	['sa', 'sanskrit'],
	['lb', 'luxembourgish'],
	['my', 'myanmar'],
	['bo', 'tibetan'],
	['tl', 'tagalog'],
	['mg', 'malagasy'],
	['as', 'assamese'],
	['tt', 'tatar'],
	['haw', 'hawaiian'],
	['ln', 'lingala'],
	['ha', 'hausa'],
	['ba', 'bashkir'],
	['jw', 'javanese'],
	['su', 'sundanese'],
] as [string, string][];

export const WHISPER_LANGUAGE_MAPPING = new Map(WHISPER_LANGUAGES);

export const WHISPER_TO_LANGUAGE_CODE_MAPPING = new Map<string, string>([
	...WHISPER_LANGUAGES.map(([k, v]) => [v, k] as const),
	...([
		['burmese', 'my'],
		['valencian', 'ca'],
		['flemish', 'nl'],
		['haitian', 'ht'],
		['letzeburgesch', 'lb'],
		['pushto', 'ps'],
		['panjabi', 'pa'],
		['moldavian', 'ro'],
		['moldovan', 'ro'],
		['sinhalese', 'si'],
		['castilian', 'es'],
	] as [string, string][]),
]);

/**
 * @param {string} language The language name or code
 * @returns {string} The language code
 */
export function whisper_language_to_code(language: string) {
	language = language.toLowerCase();

	// Map to code from user-friendly name (e.g., "english" -> "en")
	let language_code = WHISPER_TO_LANGUAGE_CODE_MAPPING.get(language);

	if (language_code === undefined) {
		// User provided something that is not a language name

		if (WHISPER_LANGUAGE_MAPPING.has(language)) {
			// User provided the language code directly (e.g., "en")
			language_code = language;
		} else {
			// User provided something that is not a language code or name
			const is_language_code = language.length === 2;
			const langs = is_language_code
				? WHISPER_LANGUAGE_MAPPING.keys()
				: WHISPER_LANGUAGE_MAPPING.values();

			throw new Error(
				`Language "${language}" is not supported. Must be one of: ${JSON.stringify(langs)}`,
			);
		}
	}

	return language_code;
}
