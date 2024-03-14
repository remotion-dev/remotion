import fs, {closeSync} from 'fs';
import util from 'util';
const PImage = require('pureimage');

const DATA_START = 44;

const read = util.promisify(fs.read);
const close = util.promisify(fs.close);

type Options = {
	width: number;
	height: number;
	rms: boolean;
	maximums: boolean;
	average: boolean;
	start: 'START';
	end: 'END';
	colors: {
		maximums: string;
		rms: string;
		background: string;
	};
	filename: string;
};

type Sample = {
	posRms?: number;
	negRms?: number;
	posMax?: number;
	negMax?: number;
};

export class Wavedraw {
	path: string;
	header: {
		chunkId: string;
		chunkSize: number;
		format: string;
		subChunk1ID: string;
		subChunk1Size: number;
		audioFormat: number;
		numChannels: number;
		sampleRate: number;
		byteRate: number;
		blockAlign: number;
		bitsPerSample: number;
		subChunk2ID: string;
		subChunk2Size: number;
		length?: {seconds: number; minutes: number; hours: number};
	} | null;

	constructor(path: string) {
		if (!path) {
			throw new Error('path to wave file must be included in constructor');
		}

		this.path = path;
		this.header = null;
	}

	async getHeader() {
		if (this.header) {
			return this.header;
		}

		const buf = Buffer.alloc(44);
		let file;
		try {
			file = fs.openSync(this.path, 'r');
		} catch (err) {
			throw new Error(`Cannot open file of path ${this.path}`);
		}

		const result = await read(file, buf, 0, 44, 0);
		const h = {
			chunkId: Wavedraw.getStringBE(result.buffer.slice(0, 4)),
			chunkSize: result.buffer.readInt32LE(4),
			format: Wavedraw.getStringBE(result.buffer.slice(8, 12)),
			subChunk1ID: Wavedraw.getStringBE(result.buffer.slice(12, 16)),
			subChunk1Size: result.buffer.readInt32LE(16),
			audioFormat: result.buffer.readUInt16LE(20),
			numChannels: result.buffer.readUInt16LE(22),
			sampleRate: result.buffer.readInt32LE(24),
			byteRate: result.buffer.readInt32LE(28),
			blockAlign: result.buffer.readUInt16LE(32),
			bitsPerSample: result.buffer.readUInt16LE(34),
			subChunk2ID: Wavedraw.getStringBE(result.buffer.slice(36, 40)),
			subChunk2Size: result.buffer.readInt32LE(40),
		};
		this.header = h;
		await close(file);
		this.header.length = this.getFileLength();
		return this.header;
	}

	static getStringBE(bytes: Buffer) {
		const arr = Array.prototype.slice.call(bytes, 0);
		let result = '';
		for (let i = 0; i < arr.length; i += 1) {
			result += String.fromCharCode(arr[i]);
		}

		return result;
	}

	getFileLength() {
		if (!this.header) {
			throw new Error('Cannot get file length until header is loaded');
		}

		const numSamples = parseInt(
			(this.header.subChunk2Size / this.header.blockAlign) as unknown as string,
			10,
		);
		let seconds = parseInt(
			(numSamples / this.header.sampleRate) as unknown as string,
			10,
		);
		const minutes = parseInt((seconds / 60) as unknown as string, 10);
		const hours = parseInt((minutes / 60) as unknown as string, 10);
		seconds %= 60;
		return {
			seconds,
			minutes,
			hours,
		};
	}

	getOffsetInfo(
		start: undefined | 'START',
		end: undefined | 'END',
		width: number,
	) {
		let startPos;
		let endPos;

		if (start === undefined || start === 'START') {
			startPos = DATA_START;
		} else {
			startPos = this.getOffset(start) + DATA_START;
		}

		if (end === undefined || end === 'END') {
			endPos = this.header?.subChunk2Size;
		} else {
			endPos = this.getOffset(end);
		}

		const blockSize = parseInt(
			(((endPos as number) - startPos) /
				(this.header?.blockAlign as number) /
				width) as unknown as string,
			10,
		);
		const chunkSize = parseInt(
			// eslint-disable-next-line no-unsafe-optional-chaining
			(blockSize * (this.header?.blockAlign as number)) as unknown as string,
			10,
		);
		return {
			startPos,
			endPos,
			blockSize,
			chunkSize,
		};
	}

	getOffset(time: string) {
		const [hours, minutes, seconds] = time
			.split(':')
			.map((unit) => parseInt(unit, 10));
		if (hours > (this.header?.length?.hours as number)) {
			throw new Error('Length in hours is too long');
		} else if (minutes > (this.header?.length?.minutes as number)) {
			throw new Error('Length in minutes is too long');
		} else if (
			seconds > (this.header?.length?.seconds as number) &&
			minutes === (this.header?.length?.minutes as number)
		) {
			throw new Error('Length in seconds is too long');
		}

		let adjustedSeconds = seconds + hours * 60 * 60;
		adjustedSeconds += minutes * 60;
		return parseInt(
			(adjustedSeconds *
				(this.header?.sampleRate as number) *
				(this.header?.blockAlign as number)) as unknown as string,
			10,
		);
	}

	static validateDrawWaveOptions(options: {width?: number; height?: number}) {
		if (!(options.width && options.height)) {
			throw new Error('drawWave() required parameters: width, height');
		}
	}

	async drawWave(options: Options) {
		Wavedraw.validateDrawWaveOptions(options);
		if (!this.header) await this.getHeader();
		if (this.header?.bitsPerSample !== 16) {
			throw new Error('drawWave() currently only supports 16 bit audio files!');
		}

		const samples = await this.getSamples(options);
		console.log('got samples');
		const img1 = PImage.make(options.width, options.height);
		const ctx = img1.getContext('2d');
		const ceiling = 32767;

		if (options.colors && options.colors.background) {
			ctx.fillStyle = options.colors.background;
			ctx.fillRect(0, 0, options.width, options.height);
		}

		for (let i = 0; i < options.width; i += 1) {
			if (options.maximums) {
				ctx.strokeStyle =
					options.colors && options.colors.maximums
						? options.colors.maximums
						: '#0000ff';

				ctx.drawLine({
					start: {
						x: i,
						y: Number.parseInt((options.height / 2) as unknown as string, 10),
					},
					end: {
						x: i,
						y: Number.parseInt(
							(options.height / 2 -
								(options.height / 2 / ceiling) *
									(samples[i].posMax as number)) as unknown as string,
							10,
						),
					},
				});

				ctx.drawLine({
					start: {
						x: i,
						y: Number.parseInt((options.height / 2) as unknown as string, 10),
					},
					end: {
						x: i,
						y: Number.parseInt(
							(options.height / 2 +
								-(
									(options.height / 2 / ceiling) *
									(samples[i].negMax as number)
								)) as unknown as string,
							10,
						),
					},
				});
			}

			if (options.rms) {
				ctx.strokeStyle =
					options.colors && options.colors.rms ? options.colors.rms : '#659df7';
				ctx.drawLine({
					start: {
						x: i,
						y: Number.parseInt((options.height / 2) as unknown as string, 10),
					},
					end: {
						x: i,
						y: Number.parseInt(
							(options.height / 2 -
								(options.height / 2 / ceiling) *
									(samples[i].posRms as number)) as unknown as string,
							10,
						),
					},
				});

				ctx.drawLine({
					start: {
						x: i,
						y: Number.parseInt((options.height / 2) as unknown as string, 10),
					},
					end: {
						x: i,
						y: Number.parseInt(
							(options.height / 2 +
								-(
									(options.height / 2 / ceiling) *
									(samples[i].negRms as number)
								)) as unknown as string,
							10,
						),
					},
				});
			}
		}

		const filename = options.filename ? options.filename : 'wave.png';
		await PImage.encodePNGToStream(img1, fs.createWriteStream(filename));
	}

	async getSamples(options: Options) {
		if (!options.width) {
			throw new Error('getSamples() required parameter: width');
		}

		if (!this.header) {
			await this.getHeader();
		}

		const offsetInfo = this.getOffsetInfo(
			options.start,
			options.end,
			options.width,
		);
		console.log({offsetInfo});
		const file = fs.openSync(this.path, 'r');
		if (!file) {
			throw new Error(`Error opening file ${this.path}`);
		}

		const samples: Sample[] = [];
		for (let x = 0; x < options.width; x += 1) {
			const buf = new ArrayBuffer(offsetInfo.chunkSize);
			const intView = new Int16Array(buf);
			const position = offsetInfo.chunkSize * x + offsetInfo.startPos;
			await read(file, intView, 0, offsetInfo.chunkSize, position);
			let sampleInfo = {};
			if (options.maximums) sampleInfo = {...Wavedraw.computeMaximums(intView)};
			if (options.average)
				sampleInfo = {...sampleInfo, ...Wavedraw.computeAverage(intView)};
			if (options.rms)
				sampleInfo = {...sampleInfo, ...Wavedraw.computeRms(intView)};
			samples.push(sampleInfo);
		}

		console.log('closing');

		closeSync(file);
		console.log('done');
		return samples;
	}

	static computeMaximums(inputSignal: Int16Array) {
		return {
			posMax: Math.max.apply(null, inputSignal as unknown as number[]),
			negMax: Math.min.apply(null, inputSignal as unknown as number[]),
		};
	}

	static computeRms(inputSignal: Int16Array) {
		const positives = inputSignal.filter((x) => x >= 0);
		const posInt32 = Int32Array.from(positives);
		const posRms =
			posInt32.length > 0
				? Math.sqrt(
						posInt32.map((x) => x * x).reduce((a, b) => a + b, 0) /
							posInt32.length,
					)
				: 0;
		const negatives = inputSignal.filter((x) => x < 0);
		const negInt32 = Int32Array.from(negatives);
		const negRms =
			negInt32.length > 0
				? -Math.sqrt(
						Math.abs(negInt32.map((x) => x * x).reduce((a, b) => a + b, 0)) /
							negInt32.length,
					)
				: 0;
		return {
			posRms,
			negRms,
		};
	}

	static computeAverage(inputSignal: Int16Array) {
		const positives = inputSignal.filter((x) => x >= 0);
		const posAvg =
			positives.length > 0
				? positives.reduce((a, b) => a + b, 0) / positives.length
				: 0;
		const negatives = inputSignal.filter((x) => x < 0);
		const negAvg =
			negatives.length > 0
				? negatives.reduce((a, b) => a + b, 0) / negatives.length
				: 0;
		return {
			posAvg,
			negAvg,
		};
	}

	static computeDft(inputSignal: Int16Array) {
		const N = inputSignal.length;
		const pi2 = Math.PI * 2.0;
		const dftValues = [];
		for (let i = 0; i < N; i += 1) {
			dftValues[i] = {
				real: 0.0,
				imag: 0.0,
			};
			for (let j = 0; j < N; j += 1) {
				dftValues[i].real += inputSignal[j] * Math.cos((pi2 * j * i) / N);
				dftValues[i].imag += inputSignal[j] * Math.sin((pi2 * j * i) / N);
			}
		}

		return dftValues;
	}
}
