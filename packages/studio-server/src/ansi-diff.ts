import {splitAnsi} from '@remotion/studio-shared';

const CLEAR_LINE = Buffer.from([0x1b, 0x5b, 0x30, 0x4b]);
const NEWLINE = Buffer.from('\n');

type Options = {width?: number; height?: number};

export class AnsiDiff {
	x: number;
	y: number;
	width: number;
	height: number;
	_buffer: string | null;
	_out: Buffer[];
	_lines: Line[];
	finished: boolean;

	constructor(opts?: Options) {
		this.x = 0;
		this.y = 0;
		this.width = opts?.width || Infinity;
		this.height = opts?.height || Infinity;

		this._buffer = null;
		this._out = [];
		this._lines = [];
		this.finished = false;
	}

	toString() {
		return this._buffer;
	}

	finish() {
		this.finished = true;
		if (this._out.length === 0) {
			return Buffer.from('');
		}

		if (!this._out[this._out.length - 1].toString().endsWith('\n')) {
			return NEWLINE;
		}

		return Buffer.from('');
	}

	update(buffer: string | Buffer, opts?: {moveTo?: [number, number]}) {
		if (this.finished) {
			return Buffer.from('');
		}

		this._buffer = Buffer.isBuffer(buffer) ? buffer.toString() : buffer;

		const other = this._buffer;
		const oldLines = this._lines;
		const lines = split(other, this);

		this._lines = lines;
		this._out = [];

		const min = Math.min(lines.length, oldLines.length);
		let i = 0;
		let a: Line;
		let b: Line;
		let scrub = false;

		for (; i < min; i++) {
			a = lines[i];
			b = oldLines[i];

			if (same(a, b)) continue;

			// if x === width there is an edgecase with inline diffing
			// easiest solution is just not to do it then! :)
			if (!scrub && this.x !== this.width && inlineDiff(a, b)) {
				const left = a.diffLeft(b);
				const right = a.diffRight(b);
				const slice = a.raw.slice(left, right ? -right : a.length);
				if (left + right > 4 && left + slice.length < this.width - 1) {
					this._moveTo(left, a.y);
					this._push(Buffer.from(slice));
					this.x += slice.length;
					continue;
				}
			}

			this._moveTo(0, a.y);
			this._write(a);
			if (a.y !== b.y || a.height !== b.height) scrub = true;
			if (b.length > a.length || scrub) this._push(CLEAR_LINE);
			if (a.newline) this._newline();
		}

		for (; i < lines.length; i++) {
			a = lines[i];

			this._moveTo(0, a.y);
			this._write(a);
			if (scrub) this._push(CLEAR_LINE);
			if (a.newline) this._newline();
		}

		const oldLast = top(oldLines);
		const last = top(lines);

		if (
			oldLast &&
			(!last || last.y + last.height < oldLast.y + oldLast.height)
		) {
			this._clearDown(oldLast.y + oldLast.height);
		}

		if (opts?.moveTo) {
			this._moveTo(opts.moveTo[0], opts.moveTo[1]);
		} else if (last) {
			this._moveTo(last.remainder, last.y + last.height);
		}

		return Buffer.concat(this._out);
	}

	_clearDown(y: number) {
		let {x} = this;
		for (let i = this.y; i <= y; i++) {
			this._moveTo(x, i);
			this._push(CLEAR_LINE);
			x = 0;
		}
	}

	_newline() {
		this._push(NEWLINE);
		this.x = 0;
		this.y++;
	}

	_write(line: Line) {
		this._out.push(line.toBuffer());
		this.x = line.remainder;
		this.y += line.height;
	}

	_moveTo(x: number, y: number) {
		const dx = x - this.x;
		const dy = y - this.y;

		if (dx > 0) this._push(moveRight(dx));
		else if (dx < 0) this._push(moveLeft(-dx));
		if (dy > 0) this._push(moveDown(dy));
		else if (dy < 0) this._push(moveUp(-dy));

		this.x = x;
		this.y = y;
	}

	_push = (buf: Buffer) => {
		this._out.push(buf);
	};
}

function same(a: Line, b: Line) {
	return (
		a.y === b.y &&
		a.width === b.width &&
		a.raw === b.raw &&
		a.newline === b.newline
	);
}

function top(list: Line[]) {
	return list.length ? list[list.length - 1] : null;
}

class Line {
	y: number;
	width: number;
	parts: string[];
	height: number;
	remainder: number;
	raw: string;
	length: number;
	newline: boolean;
	constructor(str: string, y: number, nl: boolean, term: AnsiDiff) {
		this.y = y;
		this.width = term.width;
		this.parts = splitAnsi(str);
		this.length = length(this.parts);
		this.raw = str;
		this.newline = nl;
		this.height = Math.floor(this.length / term.width);
		this.remainder = this.length - (this.height && this.height * term.width);
		if (this.height && !this.remainder) {
			this.height--;
			this.remainder = this.width;
		}
	}

	diffLeft(other: Line) {
		let left = 0;
		for (; left < this.length; left++) {
			if (this.raw[left] !== other.raw[left]) return left;
		}

		return left;
	}

	diffRight(other: Line) {
		let right = 0;
		for (; right < this.length; right++) {
			const r = this.length - right - 1;
			if (this.raw[r] !== other.raw[r]) return right;
		}

		return right;
	}

	toBuffer() {
		return Buffer.from(this.raw);
	}
}

function inlineDiff(a: Line, b: Line) {
	return (
		a.length === b.length &&
		a.parts.length === 1 &&
		b.parts.length === 1 &&
		a.y === b.y &&
		a.newline &&
		b.newline &&
		a.width === b.width
	);
}

function split(str: string, term: AnsiDiff) {
	let y = 0;
	const lines = str.split('\n');
	const wrapped = [];
	let line;

	for (let i = 0; i < lines.length; i++) {
		line = new Line(lines[i], y, i < lines.length - 1, term);
		y += line.height + (line.newline ? 1 : 0);
		wrapped.push(line);
	}

	return wrapped;
}

function moveUp(n: number) {
	return Buffer.from('1b5b' + toHex(n) + '41', 'hex');
}

function moveDown(n: number) {
	return Buffer.from('1b5b' + toHex(n) + '42', 'hex');
}

function moveRight(n: number) {
	return Buffer.from('1b5b' + toHex(n) + '43', 'hex');
}

function moveLeft(n: number) {
	return Buffer.from('1b5b' + toHex(n) + '44', 'hex');
}

function length(parts: string[]) {
	let len = 0;
	for (let i = 0; i < parts.length; i += 2) {
		len += parts[i].length;
	}

	return len;
}

function toHex(n: number) {
	return Buffer.from(String(n)).toString('hex');
}
