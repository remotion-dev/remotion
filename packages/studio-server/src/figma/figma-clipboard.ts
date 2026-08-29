import {Buffer} from 'node:buffer';
import * as zlib from 'node:zlib';
import {compileSchema, decodeBinarySchema} from 'kiwi-schema';
import {renderFigmaMessageToSvg, type FigmaMessage} from './figma-to-svg';

const figmaMetaStart = '<!--(figmeta)';
const figmaMetaEnd = '(/figmeta)-->';
const figmaDataStart = '<!--(figma)';
const figmaDataEnd = '(/figma)-->';
const figKiwiPrelude = 'fig-kiwi';

const maxClipboardHtmlBytes = 25 * 1024 * 1024;
const maxMetaBytes = 1024 * 1024;
const maxArchiveBytes = 16 * 1024 * 1024;
const maxCompressedSchemaBytes = 5 * 1024 * 1024;
const maxCompressedMessageBytes = 10 * 1024 * 1024;
const maxSchemaBytes = 10 * 1024 * 1024;
const maxMessageBytes = 40 * 1024 * 1024;
const maxSchemaDefinitions = 2_000;
const maxSchemaFields = 50_000;
const maxNodeChanges = 20_000;
const maxBlobs = 20_000;
const nodeVersionRequirement =
	'Figma paste is only available with Node.js 22.15 or newer';

type ZstdDecompressSync = (
	buffer: Uint8Array,
	options: {maxOutputLength: number},
) => Uint8Array;

const nativeZstdDecompressSync = (
	zlib as typeof zlib & {zstdDecompressSync?: ZstdDecompressSync}
).zstdDecompressSync;

const fail = (message: string): never => {
	throw new Error(`Cannot import Figma selection: ${message}`);
};

const withFriendlyFailure = <T>(operation: () => T, fallback: string): T => {
	try {
		return operation();
	} catch (error) {
		if (
			error instanceof Error &&
			error.message.startsWith('Cannot import Figma selection:')
		) {
			throw error;
		}

		return fail(fallback);
	}
};

export const getFigmaClipboardPasteSupportError = (
	zstdDecompressSync: unknown,
) => {
	return typeof zstdDecompressSync === 'function'
		? null
		: nodeVersionRequirement;
};

const extractMarker = ({
	end,
	html,
	label,
	start,
}: {
	end: string;
	html: string;
	label: string;
	start: string;
}) => {
	const startIndex = html.indexOf(start);
	if (startIndex === -1) {
		fail(`clipboard is missing its ${label}`);
	}

	const valueStart = startIndex + start.length;
	const endIndex = html.indexOf(end, valueStart);
	if (endIndex === -1) {
		fail(`clipboard has an incomplete ${label}`);
	}

	return html.slice(valueStart, endIndex);
};

const decodeBase64 = ({
	label,
	limit,
	value,
}: {
	label: string;
	limit: number;
	value: string;
}) => {
	const compact = value.replace(/[\t\n\r ]/g, '');
	if (
		compact.length === 0 ||
		compact.length % 4 !== 0 ||
		!/^[A-Za-z0-9+/]*={0,2}$/.test(compact)
	) {
		fail(`${label} is not valid Base64`);
	}

	if (compact.length > Math.ceil(limit / 3) * 4) {
		fail(`${label} is too large`);
	}

	const decoded = Buffer.from(compact, 'base64');
	if (decoded.byteLength > limit) {
		fail(`${label} is too large`);
	}

	return new Uint8Array(decoded.buffer, decoded.byteOffset, decoded.byteLength);
};

const parseMeta = (base64: string) => {
	const bytes = decodeBase64({
		label: 'Figma metadata',
		limit: maxMetaBytes,
		value: base64,
	});
	let parsed: unknown;
	try {
		parsed = JSON.parse(new TextDecoder().decode(bytes));
	} catch {
		fail('clipboard metadata is invalid');
	}

	if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
		fail('clipboard metadata is invalid');
	}

	const meta = parsed as Record<string, unknown>;
	if (meta.dataType !== 'scene') {
		fail('clipboard does not contain a Figma scene');
	}

	const {selectedNodeData} = meta;
	if (typeof selectedNodeData !== 'string') {
		fail('clipboard does not identify its selected node');
	}

	const selectedNodeId = (selectedNodeData as string).split('|')[0];
	if (!/^\d+:\d+$/.test(selectedNodeId)) {
		fail('clipboard has an invalid selected node ID');
	}

	return selectedNodeId;
};

const parseArchive = (base64: string) => {
	const bytes = decodeBase64({
		label: 'Figma scene',
		limit: maxArchiveBytes,
		value: base64,
	});
	if (bytes.length < figKiwiPrelude.length + 4) {
		fail('clipboard scene is truncated');
	}

	const prelude = new TextDecoder().decode(
		bytes.subarray(0, figKiwiPrelude.length),
	);
	if (prelude !== figKiwiPrelude) {
		fail('clipboard scene has an unknown format');
	}

	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const version = view.getUint32(figKiwiPrelude.length, true);
	if (version === 0) {
		fail('clipboard scene has an invalid archive version');
	}

	let offset = figKiwiPrelude.length + 4;
	const chunks: Uint8Array[] = [];
	while (offset < bytes.length) {
		if (offset + 4 > bytes.length) {
			fail('clipboard scene has a truncated chunk header');
		}

		const size = view.getUint32(offset, true);
		offset += 4;
		if (size === 0 || offset + size > bytes.length) {
			fail('clipboard scene has an invalid chunk');
		}

		chunks.push(bytes.slice(offset, offset + size));
		offset += size;
	}

	if (chunks.length !== 2) {
		fail('clipboard scene uses an unsupported archive layout');
	}

	if (chunks[0].length > maxCompressedSchemaBytes) {
		fail('clipboard schema is too large');
	}

	if (chunks[1].length > maxCompressedMessageBytes) {
		fail('clipboard scene is too large');
	}

	return {message: chunks[1], schema: chunks[0]};
};

const inflateSchema = (compressed: Uint8Array) => {
	const inflated = zlib.inflateRawSync(compressed, {
		maxOutputLength: maxSchemaBytes,
	});
	return new Uint8Array(
		inflated.buffer,
		inflated.byteOffset,
		inflated.byteLength,
	);
};

const readLimitedLittleEndian = ({
	bytes,
	limit,
	length,
	offset,
}: {
	bytes: Uint8Array;
	limit: number;
	length: number;
	offset: number;
}) => {
	let result = 0;
	for (let index = length - 1; index >= 0; index--) {
		const nextByte = bytes[offset + index];
		if (result > Math.floor((limit - nextByte) / 256)) {
			fail('clipboard scene expands beyond the size limit');
		}

		result = result * 256 + nextByte;
	}

	return result;
};

const getZstandardContentSize = (compressed: Uint8Array) => {
	if (
		compressed.length < 6 ||
		compressed[0] !== 0x28 ||
		compressed[1] !== 0xb5 ||
		compressed[2] !== 0x2f ||
		compressed[3] !== 0xfd
	) {
		fail('clipboard scene uses an unsupported compression format');
	}

	const descriptor = compressed[4];
	if ((descriptor & 8) !== 0) {
		fail('clipboard scene has an invalid Zstandard frame');
	}

	const singleSegment = (descriptor >> 5) & 1;
	const dictionaryFlag = descriptor & 3;
	const contentSizeFlag = descriptor >> 6;
	const dictionaryBytes = dictionaryFlag === 3 ? 4 : dictionaryFlag;
	const contentSizeBytes = contentSizeFlag
		? 1 << contentSizeFlag
		: singleSegment;
	if (contentSizeBytes === 0) {
		fail('clipboard scene does not declare its expanded size');
	}

	const contentSizeOffset = 6 - singleSegment + dictionaryBytes;
	if (contentSizeOffset + contentSizeBytes > compressed.length) {
		fail('clipboard scene has a truncated Zstandard header');
	}

	let contentSize = readLimitedLittleEndian({
		bytes: compressed,
		limit: maxMessageBytes,
		length: contentSizeBytes,
		offset: contentSizeOffset,
	});
	if (contentSizeFlag === 1) {
		contentSize += 256;
	}

	if (contentSize <= 0 || contentSize > maxMessageBytes) {
		fail('clipboard scene expands beyond the size limit');
	}

	return contentSize;
};

const decompressMessage = ({
	compressed,
	zstdDecompressSync,
}: {
	compressed: Uint8Array;
	zstdDecompressSync: ZstdDecompressSync;
}) => {
	const expectedBytes = getZstandardContentSize(compressed);
	const decompressed = zstdDecompressSync(compressed, {
		maxOutputLength: expectedBytes,
	});
	if (decompressed.byteLength !== expectedBytes) {
		fail('clipboard scene did not match its declared size');
	}

	return new Uint8Array(
		decompressed.buffer,
		decompressed.byteOffset,
		decompressed.byteLength,
	);
};

const decodeMessage = ({
	messageBytes,
	schemaBytes,
}: {
	messageBytes: Uint8Array;
	schemaBytes: Uint8Array;
}) => {
	const schema = decodeBinarySchema(schemaBytes);
	if (
		schema.package !== null &&
		(typeof schema.package !== 'string' ||
			!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(schema.package))
	) {
		fail('clipboard schema has an invalid package name');
	}

	if (schema.definitions.length > maxSchemaDefinitions) {
		fail('clipboard schema has too many definitions');
	}

	const fieldCount = schema.definitions.reduce(
		(total, definition) => total + definition.fields.length,
		0,
	);
	if (fieldCount > maxSchemaFields) {
		fail('clipboard schema has too many fields');
	}

	const compiled = compileSchema(schema) as {
		decodeMessage: (data: Uint8Array) => unknown;
	};
	const decoded = compiled.decodeMessage(messageBytes);
	if (
		typeof decoded !== 'object' ||
		decoded === null ||
		Array.isArray(decoded)
	) {
		fail('clipboard scene decoded to an invalid message');
	}

	const message = decoded as FigmaMessage;
	if (
		(message.nodeChanges?.length ?? 0) > maxNodeChanges ||
		(message.blobs?.length ?? 0) > maxBlobs
	) {
		fail('clipboard scene has too many objects');
	}

	return message;
};

export const convertFigmaClipboardToSvg = (html: string) => {
	if (typeof html !== 'string' || html.length === 0) {
		fail('clipboard HTML is empty');
	}

	if (Buffer.byteLength(html, 'utf8') > maxClipboardHtmlBytes) {
		fail('clipboard HTML is too large');
	}

	const supportError = getFigmaClipboardPasteSupportError(
		nativeZstdDecompressSync,
	);
	if (supportError !== null) {
		fail(supportError);
	}

	const zstdDecompressSync = nativeZstdDecompressSync as ZstdDecompressSync;

	const metaBase64 = extractMarker({
		end: figmaMetaEnd,
		html,
		label: 'figmeta section',
		start: figmaMetaStart,
	});
	const figmaBase64 = extractMarker({
		end: figmaDataEnd,
		html,
		label: 'figma section',
		start: figmaDataStart,
	});
	const selectedNodeId = parseMeta(metaBase64);
	const archive = parseArchive(figmaBase64);
	const schemaBytes = withFriendlyFailure(
		() => inflateSchema(archive.schema),
		'clipboard schema could not be decompressed',
	);
	const messageBytes = withFriendlyFailure(
		() =>
			decompressMessage({
				compressed: archive.message,
				zstdDecompressSync,
			}),
		'clipboard scene could not be decompressed',
	);
	const message: FigmaMessage = withFriendlyFailure(
		() => decodeMessage({messageBytes, schemaBytes}),
		'clipboard scene could not be decoded',
	);

	return renderFigmaMessageToSvg({message, selectedNodeId});
};
