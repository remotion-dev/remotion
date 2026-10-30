// https://github.com/remotion-dev/remotion/issues/12568
if (typeof Symbol.dispose !== 'symbol')
	Object.defineProperty(Symbol, 'dispose', {
		value: Symbol.for('Symbol.dispose'),
	});

if (typeof Symbol.asyncDispose !== 'symbol')
	Object.defineProperty(Symbol, 'asyncDispose', {
		value: Symbol.for('Symbol.asyncDispose'),
	});
