/**
 * Types for the Remotion Studio internal API.
 */

export interface AddKeyframesResponse {
	/** Indicates the operation succeeded */
	success: boolean;
	/**
	 * The new JSX node path after the codemod rewrite.
	 *
	 * This field is only present when the codemod caused a structural change
	 * (e.g. converting a concise arrow function to a block with a return statement).
	 */
	updatedNodePath?: string;
}
