import {Callable} from './callable';

/**
 * A base class for text normalization.
 * @abstract
 */
export abstract class Normalizer extends Callable {
	config: any;
	/**
	 * @param {Object} config The configuration object for the normalizer.
	 */
	constructor(config: any) {
		super();
		this.config = config;
	}

	/**
	 * Factory method for creating normalizers from config objects.
	 * @static
	 * @param {Object} config The configuration object for the normalizer.
	 * @returns {Normalizer} A Normalizer object.
	 * @throws {Error} If an unknown Normalizer type is specified in the config.
	 */
	static fromConfig(config: any): Normalizer | null {
		if (config === null) return null;
		switch (config.type) {
			case 'BertNormalizer':
				// @ts-expect-error: BertNormalizer is not defined
				return new BertNormalizer(config);
			case 'Precompiled':
				// @ts-expect-error: Precompiled is not defined
				return new Precompiled(config);
			case 'Sequence':
				// @ts-expect-error: NormalizerSequence is not defined
				return new NormalizerSequence(config);
			case 'Replace':
				// @ts-expect-error: Replace is not defined
				return new Replace(config);
			case 'NFC':
				// @ts-expect-error: NFC is not defined
				return new NFC(config);
			case 'NFD':
				// @ts-expect-error: NFD is not defined
				return new NFD(config);
			case 'NFKC':
				// @ts-expect-error: NFKC is not defined
				return new NFKC(config);
			case 'NFKD':
				// @ts-expect-error: NFKD is not defined
				return new NFKD(config);
			case 'Strip':
				// @ts-expect-error: StripNormalizer is not defined
				return new StripNormalizer(config);
			case 'StripAccents':
				// @ts-expect-error: StripAccents is not defined
				return new StripAccents(config);
			case 'Lowercase':
				// @ts-expect-error: Lowercase is not defined
				return new Lowercase(config);
			case 'Prepend':
				// @ts-expect-error: Prepend is not defined
				return new Prepend(config);
			default:
				throw new Error(`Unknown Normalizer type: ${config.type}`);
		}
	}

	/**
	 * Normalize the input text.
	 * @abstract
	 * @param {string} text The text to normalize.
	 * @returns {string} The normalized text.
	 * @throws {Error} If this method is not implemented in a subclass.
	 */
	abstract normalize(text: string): string;

	/**
	 * Alias for {@link Normalizer#normalize}.
	 * @param {string} text The text to normalize.
	 * @returns {string} The normalized text.
	 */
	_call(text: string): string {
		return this.normalize(text);
	}
}
