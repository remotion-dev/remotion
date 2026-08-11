export class ResizableBuffer {
	buffer: ArrayBuffer;
	uintarray: Uint8Array;

	constructor(buffer: ArrayBuffer) {
		this.buffer = buffer;
		this.uintarray = new Uint8Array(buffer);
	}

	resize(newLength: number) {
		if (typeof this.buffer.resize === 'function') {
			this.buffer.resize(newLength);
		} else {
			const newBuffer = new ArrayBuffer(newLength);
			new Uint8Array(newBuffer).set(
				new Uint8Array(this.buffer).subarray(
					0,
					Math.min(this.buffer.byteLength, newLength),
				),
			);
			this.buffer = newBuffer;
			this.uintarray = new Uint8Array(newBuffer);
		}
	}
}
