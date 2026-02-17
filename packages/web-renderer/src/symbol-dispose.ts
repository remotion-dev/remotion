if (typeof Symbol.dispose !== 'symbol')
	Object.defineProperty(Symbol, 'dispose', {value: Symbol.for('dispose')});

if (typeof Symbol.asyncDispose !== 'symbol')
	Object.defineProperty(Symbol, 'asyncDispose', {
		value: Symbol.for('asyncDispose'),
	});
