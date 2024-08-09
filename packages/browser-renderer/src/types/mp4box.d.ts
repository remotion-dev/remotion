// https://github.com/gpac/mp4box.js/issues/233

declare module 'mp4box' {
	export interface MP4MediaTrack {
		id: number;
		created: Date;
		modified: Date;
		movie_duration: number;
		layer: number;
		alternate_group: number;
		volume: number;
		track_width: number;
		track_height: number;
		timescale: number;
		duration: number;
		bitrate: number;
		codec: string;
		language: string;
		nb_samples: number;
	}

	export interface MP4VideoData {
		width: number;
		height: number;
	}

	export interface MP4VideoTrack extends MP4MediaTrack {
		video: MP4VideoData;
	}

	export interface MP4AudioData {
		sample_rate: number;
		channel_count: number;
		sample_size: number;
	}

	export interface MP4AudioTrack extends MP4MediaTrack {
		audio: MP4AudioData;
	}

	export type MP4Track = MP4VideoTrack | MP4AudioTrack;

	export interface MP4Info {
		duration: number;
		timescale: number;
		fragment_duration: number;
		isFragmented: boolean;
		isProgressive: boolean;
		hasIOD: boolean;
		brands: string[];
		created: Date;
		modified: Date;
		tracks: MP4Track[];
		mime: string;
		audioTracks: MP4AudioTrack[];
		videoTracks: MP4VideoTrack[];
	}

	export type MP4ArrayBuffer = ArrayBuffer & {fileStart: number};

	export interface MP4File {
		onMoovStart?: () => void;
		onReady?: (info: MP4Info) => void;
		onError?: (e: string) => void;
		onSamples?: (id: number, user: any, samples: Sample[]) => void;

		appendBuffer(data: MP4ArrayBuffer): number;
		start(): void;
		stop(): void;
		flush(): void;

		addTrack(options?: TrackOptions): number;
		addSample(
			track: number,
			data: ArrayBuffer,
			options?: SampleOptions,
		): Sample;
		save(filename: string): void;

		setExtractionOptions(
			id: number,
			user: any,
			options: ExtractionOptions,
		): void;

		getTrackById(id: number): BoxParser.trakBox;
	}

	export function createFile(): MP4File;

	export interface Sample {
		number: number;
		track_id: number;
		timescale: number;
		description_index: number;
		description: {
			avcC?: BoxParser.avcCBox; // h.264
			hvcC?: BoxParser.hvcCBox; // hevc
			vpcC?: BoxParser.vpcCBox; // vp9
			av1C?: BoxParser.av1CBox; // av1
		};
		data: ArrayBuffer;
		size: number;
		alreadyRead?: number;
		duration: number;
		cts: number;
		dts: number;
		is_sync: boolean;
		is_leading?: number;
		depends_on?: number;
		is_depended_on?: number;
		has_redundancy?: number;
		degradation_priority?: number;
		offset?: number;
		subsamples?: any;
	}

	export interface ExtractionOptions {
		nbSamples: number;
	}

	export class DataStream {
		// WARNING, the default is little endian, which is not what MP4 uses.
		constructor(
			buffer?: ArrayBuffer,
			byteOffset?: number,
			endianness?: boolean,
		);

		getPosition(): number;

		get byteLength(): number;
		get buffer(): ArrayBuffer;
		set buffer(v: ArrayBuffer);
		get byteOffset(): number;
		set byteOffset(v: number);
		get dataView(): DataView;
		set dataView(v: DataView);

		seek(pos: number): void;
		isEof(): boolean;

		mapFloat32Array(length: number, e?: boolean): any;
		mapFloat64Array(length: number, e?: boolean): any;
		mapInt16Array(length: number, e?: boolean): any;
		mapInt32Array(length: number, e?: boolean): any;
		mapInt8Array(length: number): any;
		mapUint16Array(length: number, e?: boolean): any;
		mapUint32Array(length: number, e?: boolean): any;
		mapUint8Array(length: number): any;

		readInt32Array(length: number, endianness?: boolean): Int32Array;
		readInt16Array(length: number, endianness?: boolean): Int16Array;
		readInt8Array(length: number): Int8Array;
		readUint32Array(length: number, endianness?: boolean): Uint32Array;
		readUint16Array(length: number, endianness?: boolean): Uint16Array;
		readUint8Array(length: number): Uint8Array;
		readFloat64Array(length: number, endianness?: boolean): Float64Array;
		readFloat32Array(length: number, endianness?: boolean): Float32Array;

		readInt32(endianness?: boolean): number;
		readInt16(endianness?: boolean): number;
		readInt8(): number;
		readUint32(endianness?: boolean): number;
		// readUint32Array(length: any, e: any): any
		readUint24(): number;
		readUint16(endianness?: boolean): number;
		readUint8(): number;
		// readUint64(): any
		readFloat32(endianness?: boolean): number;
		readFloat64(endianness?: boolean): number;
		// readCString(length: number): any
		// readString(length: number, encoding: any): any

		static endianness: boolean;

		memcpy(
			dst: ArrayBufferLike,
			dstOffset: number,
			src: ArrayBufferLike,
			srcOffset: number,
			byteLength: number,
		): void;

		// TODO I got bored porting all functions

		save(filename: string): void;
		shift(offset: number): void;

		writeInt32Array(arr: Int32Array, endianness?: boolean): void;
		writeInt16Array(arr: Int16Array, endianness?: boolean): void;
		writeInt8Array(arr: Int8Array): void;
		writeUint32Array(arr: Uint32Array, endianness?: boolean): void;
		writeUint16Array(arr: Uint16Array, endianness?: boolean): void;
		writeUint8Array(arr: Uint8Array): void;
		writeFloat64Array(arr: Float64Array, endianness?: boolean): void;
		writeFloat32Array(arr: Float32Array, endianness?: boolean): void;
		writeInt32(v: number, endianness?: boolean): void;
		writeInt16(v: number, endianness?: boolean): void;
		writeInt8(v: number): void;
		writeUint32(v: number, endianness?: boolean): void;
		writeUint16(v: number, endianness?: boolean): void;
		writeUint8(v: number): void;
		writeFloat32(v: number, endianness?: boolean): void;
		writeFloat64(v: number, endianness?: boolean): void;
		writeUCS2String(s: string, endianness?: boolean, length?: number): void;
		writeString(s: string, encoding?: string, length?: number): void;
		writeCString(s: string, length?: number): void;
		writeUint64(v: number): void;
		writeUint24(v: number): void;
		adjustUint32(pos: number, v: number): void;

		static LITTLE_ENDIAN: boolean;
		static BIG_ENDIAN: boolean;

		// TODO add correct types; these are exported by dts-gen
		readCString(length: any): any;
		readInt64(): any;
		readString(length: any, encoding: any): any;
		readUint64(): any;
		writeStruct(structDefinition: any, struct: any): void;
		writeType(t: any, v: any, struct: any): any;

		static arrayToNative(array: any, arrayIsLittleEndian: any): any;
		static flipArrayEndianness(array: any): any;
		static memcpy(
			dst: any,
			dstOffset: any,
			src: any,
			srcOffset: any,
			byteLength: any,
		): void;

		static nativeToEndian(array: any, littleEndian: any): any;
	}

	export interface TrackOptions {
		id?: number;
		type?: string;
		width?: number;
		height?: number;
		duration?: number;
		layer?: number;
		timescale?: number;
		media_duration?: number;
		language?: string;
		hdlr?: string;

		// video
		avcDecoderConfigRecord?: any;
		hevcDecoderConfigRecord?: any;

		// audio
		balance?: number;
		channel_count?: number;
		samplesize?: number;
		samplerate?: number;

		// captions
		namespace?: string;
		schema_location?: string;
		auxiliary_mime_types?: string;

		description?: BoxParser.Box;
		description_boxes?: BoxParser.Box[];

		default_sample_description_index_id?: number;
		default_sample_duration?: number;
		default_sample_size?: number;
		default_sample_flags?: number;
	}

	export interface FileOptions {
		brands?: string[];
		timescale?: number;
		rate?: number;
		duration?: number;
		width?: number;
	}

	export interface SampleOptions {
		sample_description_index?: number;
		duration?: number;
		cts?: number;
		dts?: number;
		is_sync?: boolean;
		is_leading?: number;
		depends_on?: number;
		is_depended_on?: number;
		has_redundancy?: number;
		degradation_priority?: number;
		subsamples?: any;
	}

	// TODO add the remaining functions
	// TODO move to another module
	export class ISOFile {
		constructor(stream?: DataStream);

		init(options?: FileOptions): ISOFile;
		addTrack(options?: TrackOptions): number;
		addSample(
			track: number,
			data: ArrayBuffer,
			options?: SampleOptions,
		): Sample;

		createSingleSampleMoof(sample: Sample): BoxParser.moofBox;

		// helpers
		getTrackById(id: number): BoxParser.trakBox | undefined;
		getTrexById(id: number): BoxParser.trexBox | undefined;

		// boxes that are added to the root
		boxes: BoxParser.Box[];
		mdats: BoxParser.mdatBox[];
		moofs: BoxParser.moofBox[];

		ftyp?: BoxParser.ftypBox;
		moov?: BoxParser.moovBox;

		static writeInitializationSegment(
			ftyp: BoxParser.ftypBox,
			moov: BoxParser.moovBox,
			total_duration: number,
			sample_duration: number,
		): ArrayBuffer;

		// TODO add correct types; these are exported by dts-gen
		add(name: any): any;
		addBox(box: any): any;
		appendBuffer(ab: any, last: any): any;
		buildSampleLists(): void;
		buildTrakSampleLists(trak: any): void;
		checkBuffer(ab: any): any;
		createFragment(track_id: any, sampleNumber: any, stream_: any): any;
		equal(b: any): any;
		flattenItemInfo(): void;
		flush(): void;
		getAllocatedSampleDataSize(): any;
		getBox(type: any): any;
		getBoxes(type: any, returnEarly: any): any;
		getBuffer(): any;
		getCodecs(): any;
		getInfo(): any;
		getItem(item_id: any): any;
		getMetaHandler(): any;
		getPrimaryItem(): any;
		getSample(trak: any, sampleNum: any): any;
		getTrackSample(track_id: any, number: any): any;
		getTrackSamplesInfo(track_id: any): any;
		hasIncompleteMdat(): any;
		hasItem(name: any): any;
		initializeSegmentation(): any;
		itemToFragmentedTrackFile(_options: any): any;
		parse(): void;
		print(output: any): void;
		processIncompleteBox(ret: any): any;
		processIncompleteMdat(): any;
		processItems(callback: any): void;
		processSamples(last: any): void;
		releaseItem(item_id: any): any;
		releaseSample(trak: any, sampleNum: any): any;
		releaseUsedSamples(id: any, sampleNum: any): void;
		resetTables(): void;
		restoreParsePosition(): any;
		save(name: any): void;
		saveParsePosition(): void;
		seek(time: any, useRap: any): any;
		seekTrack(time: any, useRap: any, trak: any): any;
		setExtractionOptions(id: any, user: any, options: any): void;
		setSegmentOptions(id: any, user: any, options: any): void;
		start(): void;
		stop(): void;
		unsetExtractionOptions(id: any): void;
		unsetSegmentOptions(id: any): void;
		updateSampleLists(): void;
		updateUsedBytes(box: any, ret: any): void;
		write(outstream: any): void;

		static initSampleGroups(
			trak: any,
			traf: any,
			sbgps: any,
			trak_sgpds: any,
			traf_sgpds: any,
		): void;

		static process_sdtp(sdtp: any, sample: any, number: any): void;
		static setSampleGroupProperties(
			trak: any,
			sample: any,
			sample_number: any,
			sample_groups_info: any,
		): void;
	}

	export namespace BoxParser {
		export class Box {
			size?: number;
			data?: Uint8Array;

			constructor(type?: string, size?: number);

			add(name: string): Box;
			addBox(box: Box): Box;
			set(name: string, value: any): void;
			addEntry(value: string, prop?: string): void;
			printHeader(output: any): void;
			write(stream: DataStream): void;
			writeHeader(stream: DataStream, msg?: string): void;
			computeSize(): void;

			// TODO add types for these
			parse(stream: any): void;
			parseDataAndRewind(stream: any): void;
			parseLanguage(stream: any): void;
			print(output: any): void;
		}

		// TODO finish add types for these classes
		export class AudioSampleEntry extends SampleEntry {
			constructor(type: any, size: any);

			getChannelCount(): any;
			getSampleRate(): any;
			getSampleSize(): any;
			isAudio(): any;
			parse(stream: any): void;
			write(stream: any): void;
		}

		export class CoLLBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class ContainerBox extends Box {
			constructor(type: any, size: any, uuid: any);

			parse(stream: any): void;
			print(output: any): void;
			write(stream: any): void;
		}

		export class FullBox extends Box {
			constructor(type: any, size: any, uuid: any);

			parse(stream: any): void;
			parseDataAndRewind(stream: any): void;
			parseFullHeader(stream: any): void;
			printHeader(output: any): void;
			writeHeader(stream: any): void;
		}

		export class HintSampleEntry extends SampleEntry {
			constructor(type: any, size: any);
		}

		export class MetadataSampleEntry extends SampleEntry {
			constructor(type: any, size: any);

			isMetadata(): any;
		}

		export class OpusSampleEntry extends SampleEntry {
			constructor(size: any);
		}

		export class SampleEntry extends Box {
			constructor(type: any, size: any, hdr_size: any, start: any);

			getChannelCount(): any;
			getCodec(): any;
			getHeight(): any;
			getSampleRate(): any;
			getSampleSize(): any;
			getWidth(): any;
			isAudio(): any;
			isHint(): any;
			isMetadata(): any;
			isSubtitle(): any;
			isVideo(): any;
			parse(stream: any): void;
			parseDataAndRewind(stream: any): void;
			parseFooter(stream: any): void;
			parseHeader(stream: any): void;
			write(stream: any): void;
			writeFooter(stream: any): void;
			writeHeader(stream: any): void;
		}

		export class SampleGroupEntry {
			constructor(type: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class SingleItemTypeReferenceBox extends ContainerBox {
			constructor(type: any, size: any, hdr_size: any, start: any);

			parse(stream: any): void;
		}

		export class SingleItemTypeReferenceBoxLarge {
			constructor(type: any, size: any, hdr_size: any, start: any);

			parse(stream: any): void;
		}

		export class SmDmBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class SubtitleSampleEntry extends SampleEntry {
			constructor(type: any, size: any);

			isSubtitle(): any;
		}

		export class SystemSampleEntry extends SampleEntry {
			constructor(type: any, size: any);
		}

		export class TextSampleEntry extends SampleEntry {
			constructor(type: any, size: any);
		}

		export class TrackGroupTypeBox extends FullBox {
			constructor(type: any, size: any);

			parse(stream: any): void;
		}

		export class TrackReferenceTypeBox extends ContainerBox {
			constructor(type: any, size: any, hdr_size: any, start: any);

			parse(stream: any): void;

			write(stream: any): void;
		}

		export class VisualSampleEntry extends SampleEntry {
			constructor(type: any, size: any);

			getHeight(): any;
			getWidth(): any;
			isVideo(): any;
			parse(stream: any): void;
			write(stream: any): void;
		}

		export class a1lxBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class a1opBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class alstSampleGroupEntry extends SampleGroupEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class auxCBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class av01SampleEntry extends SampleEntry {
			constructor(size: any);

			getCodec(): any;
		}

		export class av1CBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class avc1SampleEntry extends SampleEntry {
			constructor(size: any);

			getCodec(): any;
		}

		export class avc2SampleEntry extends SampleEntry {
			constructor(size: any);

			getCodec(): any;
		}

		export class avc3SampleEntry extends SampleEntry {
			constructor(size: any);

			getCodec(): any;
		}

		export class avc4SampleEntry extends SampleEntry {
			constructor(size: any);

			getCodec(): any;
		}

		export class avcCBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class avllSampleGroupEntry extends SampleGroupEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class avssSampleGroupEntry extends SampleGroupEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class btrtBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class bxmlBox extends FullBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class clapBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class clefBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class clliBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class co64Box extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class colrBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class cprtBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class cslgBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class cttsBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			unpack(samples: any): void;
			write(stream: any): void;
		}

		export class dOpsBox extends ContainerBox {
			constructor(size?: number);

			parse(stream: DataStream): void;

			Version: number;
			OutputChannelCount: number;
			PreSkip: number;
			InputSampleRate: number;
			OutputGain: number;
			ChannelMappingFamily: number;

			// When channelMappingFamily != 0
			StreamCount?: number;
			CoupledCount?: number;
			ChannelMapping?: number[];
		}

		export class dac3Box extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class dec3Box extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class dfLaBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class dimmBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class dinfBox extends ContainerBox {
			constructor(size: any);
		}

		export class dmaxBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class dmedBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class drefBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class drepBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class dtrtSampleGroupEntry extends SampleGroupEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class edtsBox extends ContainerBox {
			constructor(size: any);
		}

		export class elngBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class elstBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class emsgBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class encaSampleEntry extends SampleEntry {
			constructor(size: any);
		}

		export class encmSampleEntry extends SampleEntry {
			constructor(size: any);
		}

		export class encsSampleEntry extends SampleEntry {
			constructor(size: any);
		}

		export class enctSampleEntry extends SampleEntry {
			constructor(size: any);
		}

		export class encuSampleEntry extends SampleEntry {
			constructor(size: any);
		}

		export class encvSampleEntry extends SampleEntry {
			constructor(size: any);
		}

		export class enofBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class esdsBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class fielBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class freeBox extends Box {
			constructor(size: any);
		}

		export class frmaBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class ftypBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class hdlrBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class hev1SampleEntry extends SampleEntry {
			constructor(size: any);

			getCodec(): any;
		}

		export class hinfBox extends ContainerBox {
			constructor(size: any);
		}

		export class hmhdBox extends FullBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class hntiBox extends ContainerBox {
			constructor(size: any);
		}

		export class hvc1SampleEntry extends SampleEntry {
			constructor(size: any);

			getCodec(): any;
		}

		export class hvcCBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class idatBox extends Box {
			constructor(size: any);
		}

		export class iinfBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class ilocBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class imirBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class infeBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class iodsBox extends FullBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class ipcoBox extends ContainerBox {
			constructor(size: any);
		}

		export class ipmaBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class iproBox extends FullBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class iprpBox extends ContainerBox {
			constructor(size: any);
			ipmas: ipmaBox[];
		}

		export class irefBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class irotBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class ispeBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class kindBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;

			write(stream: any): void;
		}

		export class levaBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class lselBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class maxrBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class mdatBox extends Box {
			constructor(size: any);
		}

		export class mdcvBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class mdhdBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;

			write(stream: any): void;
		}

		export class mdiaBox extends ContainerBox {
			constructor(size: any);
			minf: minfBox;
		}

		export class mecoBox extends Box {
			constructor(size: any);
		}

		export class mehdBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;

			write(stream: any): void;
		}

		export class mereBox extends FullBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class metaBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class mettSampleEntry extends SampleEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class metxSampleEntry extends SampleEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class mfhdBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;

			write(stream: any): void;
		}

		export class mfraBox extends ContainerBox {
			constructor(size: any);
			tfras: tfraBox[];
		}

		export class mfroBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class minfBox extends ContainerBox {
			constructor(size: any);
			stbl: stblBox;
		}

		export class moofBox extends ContainerBox {
			constructor(size: any);
			trafs: trafBox[];
		}

		export class moovBox extends ContainerBox {
			constructor(size: any);
			traks: trakBox[];
			psshs: psshBox[];
		}

		export class mp4aSampleEntry extends SampleEntry {
			constructor(size: any);

			getCodec(): any;
		}

		export class msrcTrackGroupTypeBox extends ContainerBox {
			constructor(size: any);
		}

		export class mvexBox extends ContainerBox {
			constructor(size: any);

			trexs: trexBox[];
		}

		export class mvhdBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			print(output: any): void;
			write(stream: any): void;
		}

		export class mvifSampleGroupEntry extends SampleGroupEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class nmhdBox extends FullBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class npckBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class numpBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class padbBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class paspBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class paylBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class paytBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class pdinBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class pitmBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class pixiBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class pmaxBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class prftBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class profBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class prolSampleGroupEntry extends SampleGroupEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class psshBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class rashSampleGroupEntry extends SampleGroupEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class rinfBox extends ContainerBox {
			constructor(size: any);
		}

		export class rollSampleGroupEntry extends SampleGroupEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class saioBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class saizBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class sbgpBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;

			write(stream: any): void;
		}

		export class sbttSampleEntry extends SampleEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class schiBox extends ContainerBox {
			constructor(size: any);
		}

		export class schmBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class scifSampleGroupEntry extends SampleGroupEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class scnmSampleGroupEntry extends SampleGroupEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class sdtpBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class seigSampleGroupEntry extends SampleGroupEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class sencBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class sgpdBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class sidxBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class sinfBox extends ContainerBox {
			constructor(size: any);
		}

		export class skipBox extends Box {
			constructor(size: any);
		}

		export class smhdBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class ssixBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class stblBox extends ContainerBox {
			constructor(size: any);

			sgpds: sgpdBox[];
			sbgps: sbgpBox[];
			stsd: stsdBox;
		}

		export class stcoBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			unpack(samples: any): void;
			write(stream: any): void;
		}

		export class stdpBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class sthdBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class stppSampleEntry extends SampleEntry {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class strdBox extends ContainerBox {
			constructor(size: any);
		}

		export class striBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class strkBox extends Box {
			constructor(size: any);
		}

		export class stsaSampleGroupEntry extends SampleGroupEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class stscBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			unpack(samples: any): void;
			write(stream: any): void;
		}

		export class stsdBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
			entries: Iterable<{
				avcC?: avcCBox;
				hvcC?: hvcCBox;
			}>;
		}

		export class stsgBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class stshBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class stssBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class stszBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			unpack(samples: any): void;
			write(stream: any): void;
		}

		export class sttsBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			unpack(samples: any): void;
			write(stream: any): void;
		}

		export class stviBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class stxtSampleEntry extends SampleEntry {
			constructor(size: any);

			getCodec(): any;
			parse(stream: any): void;
		}

		export class stypBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class stz2Box extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class subsBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class syncSampleGroupEntry extends SampleGroupEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class taptBox extends ContainerBox {
			constructor(size: any);
		}

		export class teleSampleGroupEntry extends SampleGroupEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class tencBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class tfdtBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class tfhdBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class tfraBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class tkhdBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			print(output: any): void;
			write(stream: any): void;
		}

		export class tmaxBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class tminBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class totlBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class tpayBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class tpylBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class trafBox extends ContainerBox {
			constructor(size: any);
			truns: trunBox[];
			sgpd: sgpdBox[];
			sbgp: sbgpBox[];
		}

		export class trakBox extends ContainerBox {
			constructor(size: any);
			mdia: mdiaBox;
		}

		export class trefBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class trepBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class trexBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class trgrBox extends ContainerBox {
			constructor(size: any);
		}

		export class trpyBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class trunBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class tsasSampleGroupEntry extends SampleGroupEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class tsclSampleGroupEntry extends SampleGroupEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class tselBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class tx3gSampleEntry extends SampleEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class txtCBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class udtaBox extends ContainerBox {
			constructor(size: any);
			kinds: kindBox[];
		}

		export class viprSampleGroupEntry extends SampleGroupEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class vmhdBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
			write(stream: any): void;
		}

		export class vp08SampleEntry extends SampleEntry {
			constructor(size: any);

			getCodec(): any;
		}

		export class vp09SampleEntry extends SampleEntry {
			constructor(size: any);

			getCodec(): any;
		}

		export class vpcCBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class vttCBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class vttcBox extends ContainerBox {
			constructor(size: any);
		}

		export class vvc1SampleEntry extends SampleEntry {
			constructor(size: any);

			getCodec(): any;
		}

		export class vvcCBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class vvcNSampleEntry extends SampleEntry {
			constructor(size: any);
		}

		export class vvi1SampleEntry extends SampleEntry {
			constructor(size: any);

			getCodec(): any;
		}

		export class vvnCBox extends ContainerBox {
			constructor(size: any);

			parse(stream: any): void;
		}

		export class vvs1SampleEntry extends SampleEntry {
			constructor(size: any);
		}

		export class wvttSampleEntry extends SampleEntry {
			constructor(size: any);

			parse(stream: any): void;
		}

		export const BASIC_BOXES: string[];
		export const CONTAINER_BOXES: string[][];
		export const DIFF_BOXES_PROP_NAMES: string[];
		export const DIFF_PRIMITIVE_ARRAY_PROP_NAMES: string[];
		export const ERR_INVALID_DATA: number;
		export const ERR_NOT_ENOUGH_DATA: number;
		export const FULL_BOXES: string[];
		export const OK: number;
		export const SAMPLE_ENTRY_TYPE_AUDIO: string;
		export const SAMPLE_ENTRY_TYPE_HINT: string;
		export const SAMPLE_ENTRY_TYPE_METADATA: string;
		export const SAMPLE_ENTRY_TYPE_SUBTITLE: string;
		export const SAMPLE_ENTRY_TYPE_SYSTEM: string;
		export const SAMPLE_ENTRY_TYPE_TEXT: string;
		export const SAMPLE_ENTRY_TYPE_VISUAL: string;
		export const TFHD_FLAG_BASE_DATA_OFFSET: number;
		export const TFHD_FLAG_DEFAULT_BASE_IS_MOOF: number;
		export const TFHD_FLAG_DUR_EMPTY: number;
		export const TFHD_FLAG_SAMPLE_DESC: number;
		export const TFHD_FLAG_SAMPLE_DUR: number;
		export const TFHD_FLAG_SAMPLE_FLAGS: number;
		export const TFHD_FLAG_SAMPLE_SIZE: number;
		export const TKHD_FLAG_ENABLED: number;
		export const TKHD_FLAG_IN_MOVIE: number;
		export const TKHD_FLAG_IN_PREVIEW: number;
		export const TRUN_FLAGS_CTS_OFFSET: number;
		export const TRUN_FLAGS_DATA_OFFSET: number;
		export const TRUN_FLAGS_DURATION: number;
		export const TRUN_FLAGS_FIRST_FLAG: number;
		export const TRUN_FLAGS_FLAGS: number;
		export const TRUN_FLAGS_SIZE: number;
		export const UUIDs: string[];
		export const boxCodes: string[];
		export const containerBoxCodes: any[];
		export const fullBoxCodes: any[];

		export const sampleEntryCodes: {
			Audio: string[];
			Hint: any[];
			Metadata: string[];
			Subtitle: string[];
			System: string[];
			Text: string[];
			Visual: string[];
		};

		export const sampleGroupEntryCodes: any[];

		export const trackGroupTypes: any[];

		export function addSubBoxArrays(subBoxNames: any): void;
		export function boxEqual(box_a: any, box_b: any): any;
		export function boxEqualFields(box_a: any, box_b: any): any;
		export function createBoxCtor(type: any, parseMethod: any): void;
		export function createContainerBoxCtor(
			type: any,
			parseMethod: any,
			subBoxNames: any,
		): void;
		export function createEncryptedSampleEntryCtor(
			mediaType: any,
			type: any,
			parseMethod: any,
		): void;
		export function createFullBoxCtor(type: any, parseMethod: any): void;
		export function createMediaSampleEntryCtor(
			mediaType: any,
			parseMethod: any,
			subBoxNames: any,
		): void;
		export function createSampleEntryCtor(
			mediaType: any,
			type: any,
			parseMethod: any,
			subBoxNames: any,
		): void;
		export function createSampleGroupCtor(type: any, parseMethod: any): void;
		export function createTrackGroupCtor(type: any, parseMethod: any): void;
		export function createUUIDBox(
			uuid: any,
			isFullBox: any,
			isContainerBox: any,
			parseMethod: any,
		): void;
		export function decimalToHex(d: any, padding: any): any;
		export function initialize(): void;
		export function parseHex16(stream: any): any;
		export function parseOneBox(
			stream: any,
			headerOnly: any,
			parentSize: any,
		): any;
		export function parseUUID(stream: any): any;

		/* ???
	namespace UUIDBoxes {
		export class a2394f525a9b4f14a2446c427c648df4 {
			constructor(size: any)
		}

		export class a5d40b30e81411ddba2f0800200c9a66 {
			constructor(size: any)

			parse(stream: any): void
		}

		export class d08a4f1810f34a82b6c832d8aba183d3 {
			constructor(size: any)

			parse(stream: any): void
		}

		export class d4807ef2ca3946958e5426cb9e46a79f {
			constructor(size: any)

			parse(stream: any): void
		}
	}
	*/
	}

	// TODO Add types for the remaining classes found via dts-gen
	export class MP4BoxStream {
		constructor(arrayBuffer: any);

		getEndPosition(): any;
		getLength(): any;
		getPosition(): any;
		isEos(): any;
		readAnyInt(size: any, signed: any): any;
		readCString(): any;
		readInt16(): any;
		readInt16Array(length: any): any;
		readInt32(): any;
		readInt32Array(length: any): any;
		readInt64(): any;
		readInt8(): any;
		readString(length: any): any;
		readUint16(): any;
		readUint16Array(length: any): any;
		readUint24(): any;
		readUint32(): any;
		readUint32Array(length: any): any;
		readUint64(): any;
		readUint8(): any;
		readUint8Array(length: any): any;
		seek(pos: any): any;
	}

	export class MultiBufferStream {
		constructor(buffer: any);

		addUsedBytes(nbBytes: any): void;
		cleanBuffers(): void;
		findEndContiguousBuf(inputindex: any): any;
		findPosition(fromStart: any, filePosition: any, markAsUsed: any): any;
		getEndFilePositionAfter(pos: any): any;
		getEndPosition(): any;
		getLength(): any;
		getPosition(): any;
		initialized(): any;
		insertBuffer(ab: any): void;
		logBufferLevel(info: any): void;
		mergeNextBuffer(): any;
		reduceBuffer(buffer: any, offset: any, newLength: any): any;
		seek(filePosition: any, fromStart: any, markAsUsed: any): any;
		setAllUsedBytes(): void;
	}

	export class Textin4Parser {
		constructor();

		parseConfig(data: any): any;
		parseSample(sample: any): any;
	}

	export class XMLSubtitlein4Parser {
		constructor();

		parseSample(sample: any): any;
	}

	export function MPEG4DescriptorParser(): any;

	export namespace BoxParser {}

	export namespace Log {
		export const LOG_LEVEL_ERROR = 4;
		export const LOG_LEVEL_WARNING = 3;
		export const LOG_LEVEL_INFO = 2;
		export const LOG_LEVEL_DEBUG = 1;

		export function debug(module: any, msg: any): void;
		export function error(module: any, msg: any): void;
		export function getDurationString(duration: any, _timescale: any): any;
		export function info(module: any, msg: any): void;
		export function log(module: any, msg: any): void;
		export function printRanges(ranges: any): any;
		export function setLogLevel(level: any): void;
		export function warn(module: any, msg: any): void;
	}
}
