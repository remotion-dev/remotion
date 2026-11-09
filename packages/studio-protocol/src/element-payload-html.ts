import {
	parseStudioElementPayload,
	type StudioElementPayload,
} from './element-payload';

export const ELEMENT_PAYLOAD_MIME_TYPE =
	'application/vnd.remotion.element+json';

export type ParsedElementPayloadsFromHtml = {
	readonly payloads: StudioElementPayload[];
	readonly invalidPayloadCount: number;
	readonly alternateHrefs: string[];
};

export const serializeElementPayloadForHtml = (
	payload: StudioElementPayload,
): string => {
	if (parseStudioElementPayload(payload) === null) {
		throw new TypeError(
			'serializeElementPayloadForHtml() must receive a payload returned by createElementPayload()',
		);
	}

	// JSON.stringify() output can contain `</script>`, `<!--` or line separators.
	return JSON.stringify(payload)
		.replace(/</g, '\\u003c')
		.replace(/>/g, '\\u003e')
		.replace(/&/g, '\\u0026')
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029');
};

const decodeHtmlAttributeValue = (value: string): string => {
	return value.replace(
		/&(?:#(\d+)|#x([0-9a-f]+)|(amp|quot|apos|lt|gt));/gi,
		(match, decimal: string, hex: string, named: string) => {
			if (decimal !== undefined || hex !== undefined) {
				const codePoint = Number.parseInt(decimal ?? hex, decimal ? 10 : 16);
				return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match;
			}

			switch (named.toLowerCase()) {
				case 'amp':
					return '&';
				case 'quot':
					return '"';
				case 'apos':
					return "'";
				case 'lt':
					return '<';
				case 'gt':
					return '>';
				default:
					return match;
			}
		},
	);
};

const parseHtmlAttributes = (attributes: string): Map<string, string> => {
	const result = new Map<string, string>();
	const attributeRegex =
		/([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

	for (const match of attributes.matchAll(attributeRegex)) {
		const name = match[1].toLowerCase();
		// Like browsers, the first occurrence of a duplicate attribute wins.
		if (result.has(name)) {
			continue;
		}

		result.set(
			name,
			decodeHtmlAttributeValue(match[2] ?? match[3] ?? match[4] ?? ''),
		);
	}

	return result;
};

const isElementPayloadMimeType = (value: string | undefined): boolean => {
	return value?.trim().toLowerCase() === ELEMENT_PAYLOAD_MIME_TYPE;
};

export const parseElementPayloadsFromHtml = (
	html: string,
): ParsedElementPayloadsFromHtml => {
	const payloads: StudioElementPayload[] = [];
	const alternateHrefs: string[] = [];
	let invalidPayloadCount = 0;

	const tokenRegex =
		/<!--[\s\S]*?(?:-->|$)|<script\b([^>]*)>([\s\S]*?)<\/script\s*>|<link\b([^>]*)>/gi;

	for (const match of html.matchAll(tokenRegex)) {
		const [, scriptAttributes, scriptContent, linkAttributes] = match;

		if (scriptAttributes !== undefined) {
			if (
				!isElementPayloadMimeType(
					parseHtmlAttributes(scriptAttributes).get('type'),
				)
			) {
				continue;
			}

			let json: unknown;
			try {
				json = JSON.parse(scriptContent);
			} catch {
				invalidPayloadCount++;
				continue;
			}

			const payload = parseStudioElementPayload(json);
			if (payload === null) {
				invalidPayloadCount++;
				continue;
			}

			payloads.push(payload);
			continue;
		}

		if (linkAttributes !== undefined) {
			const attributes = parseHtmlAttributes(linkAttributes);
			const rel = (attributes.get('rel') ?? '').toLowerCase().split(/\s+/);
			const href = attributes.get('href')?.trim();

			if (
				rel.includes('alternate') &&
				isElementPayloadMimeType(attributes.get('type')) &&
				href
			) {
				alternateHrefs.push(href);
			}
		}
	}

	return {payloads, invalidPayloadCount, alternateHrefs};
};
