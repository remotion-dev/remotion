/* eslint-disable @typescript-eslint/no-unused-vars */
import {Callable} from './callable';
import {TemplateProcessing} from './template-processing';

/**
 * @extends Callable
 */
export class PostProcessor extends Callable {
	/**
	 * @param {Object} config The configuration for the post-processor.
	 */
	config: any;
	constructor(config: any) {
		super();
		this.config = config;
	}

	/**
	 * Factory method to create a PostProcessor object from a configuration object.
	 *
	 * @param {Object} config Configuration object representing a PostProcessor.
	 * @returns {PostProcessor} A PostProcessor object created from the given configuration.
	 * @throws {Error} If an unknown PostProcessor type is encountered.
	 */
	static fromConfig(config: any) {
		return new TemplateProcessing(config);
	}

	/**
	 * Method to be implemented in subclass to apply post-processing on the given tokens.
	 *
	 * @param {Array} tokens The input tokens to be post-processed.
	 * @param {...*} args Additional arguments required by the post-processing logic.
	 * @returns {PostProcessedOutput} The post-processed tokens.
	 * @throws {Error} If the method is not implemented in subclass.
	 */
	post_process(_tokens: any, ..._args: any[]): any {
		throw Error('post_process should be implemented in subclass.');
	}

	/**
	 * Alias for {@link PostProcessor#post_process}.
	 * @param {Array} tokens The text or array of texts to post-process.
	 * @param {...*} args Additional arguments required by the post-processing logic.
	 * @returns {PostProcessedOutput} The post-processed tokens.
	 */
	_call(tokens: any, ...args: any[]): any {
		return this.post_process(tokens, ...args);
	}
}
