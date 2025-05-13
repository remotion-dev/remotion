/**
 * Represent a token added by the user on top of the existing Model vocabulary.
 * AddedToken can be configured to specify the behavior they should have in various situations like:
 *   - Whether they should only match single words
 *   - Whether to include any whitespace on its left or right
 */
export interface AddedTokenConfig {
	content: string;
	id: number;
	single_word?: boolean;
	lstrip?: boolean;
	rstrip?: boolean;
	normalized?: boolean | null;
	special?: boolean;
}

export class AddedToken {
	content: string;
	id: number;
	single_word: boolean;
	lstrip: boolean;
	rstrip: boolean;
	special: boolean;
	normalized: boolean | null;
	/**
	 * Creates a new instance of AddedToken.
	 * @param {AddedTokenConfig} config Added token configuration object.
	 */
	constructor(config: AddedTokenConfig) {
		this.content = config.content;
		this.id = config.id;
		this.single_word = config.single_word ?? false;
		this.lstrip = config.lstrip ?? false;
		this.rstrip = config.rstrip ?? false;
		this.special = config.special ?? false;
		this.normalized = config.normalized ?? null;
	}
}
