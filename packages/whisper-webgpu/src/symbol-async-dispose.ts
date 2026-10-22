if (typeof Symbol.asyncDispose !== 'symbol') {
	Object.defineProperty(Symbol, 'asyncDispose', {
		value: Symbol.for('asyncDispose'),
	});
}
