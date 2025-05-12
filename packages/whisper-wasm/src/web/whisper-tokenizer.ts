/* eslint-disable no-lonely-if */
import {PreTrainedTokenizer} from '@huggingface/transformers';
import {mergeArrays} from './merge-arrays';
import {whisper_language_to_code} from './whisper-language-to-code';

/**
 * WhisperTokenizer tokenizer
 * @extends PreTrainedTokenizer
 */
export class WhisperTokenizer extends PreTrainedTokenizer {
	get timestamp_begin() {
		return this.model.convert_tokens_to_ids(['<|notimestamps|>'])[0] + 1;
	}

	/**
	 * Decodes automatic speech recognition (ASR) sequences.
	 * @param {Array<{tokens: bigint[], token_timestamps?: number[], stride: number[]}>} sequences The sequences to decode.
	 * @param {Object} options The options to use for decoding.
	 * @returns {Array<string|{chunks?: undefined|Array<{language: string|null, timestamp: Array<number|null>, text: string}>}>} The decoded sequences.
	 */
	_decode_asr(
		sequences,
		{
			return_timestamps = false,
			return_language = false,
			time_precision = null,
			force_full_sequences = true,
		}: {
			return_timestamps?: boolean;
			return_language?: boolean;
			time_precision?: number | null;
			force_full_sequences?: boolean;
		} = {},
	) {
		// Set force_full_sequences=false if you want streaming
		// TODO add support for `return_language`

		// Internal method meant to only be used by asr pipeline.
		// Handles all the little quirks specific to whisper to handle
		// the various options not allowed in other seq2seq models

		// =========== Overview ============
		// - iterate over all outputs
		// - all tokens within output
		// - Each token can be
		//   - language token
		//   - special token
		//   - timestamp token
		//   - text token
		// - We accumulate the text tokens.
		// - We split on end timestamps
		// - Lots of complexity comes from stride and timestamps

		if (time_precision === null) {
			throw Error('Must specify time_precision');
		}

		let last_language = null;

		const returnWordTimestamps = return_timestamps === 'word';

		function new_chunk() {
			return {language: last_language, timestamp: [null, null], text: ''};
		}

		// Welcome to the state machine!
		const chunks = [];
		let chunk = new_chunk();
		let time_offset = 0.0;
		const {timestamp_begin} = this;

		let previous_tokens = [];
		let previous_token_timestamps = [];

		let skip = false;
		let right_stride_start = null;

		const all_special_ids = new Set(this.all_special_ids);

		for (const output of sequences) {
			// NOTE: python version has batches, so it uses [0]
			const token_ids = output.tokens;
			const token_timestamps = returnWordTimestamps
				? output.token_timestamps
				: null;

			// These keep track of timestamps within strides, which need
			// to be skipped and resolve all tokens in a single chunk.
			let last_timestamp = null;
			let first_timestamp = timestamp_begin;

			if ('stride' in output) {
				const [chunk_len, stride_left, stride_right] = output.stride;

				// Offset the timings to account for the other `model_outputs`.
				time_offset -= stride_left;
				right_stride_start = chunk_len - stride_right;

				// Keeping track of timestamps within strides
				// We're going to NOT split on those, and delay until we're
				// out of BOTH stride. Otherwise lots of issues occur and
				// corner cases
				if (stride_left) {
					first_timestamp = stride_left / time_precision + timestamp_begin;
				}

				if (stride_right) {
					for (let i = token_ids.length - 1; i >= 0; --i) {
						const token = Number(token_ids[i]);
						if (token >= timestamp_begin) {
							// There can be several token in the right stride
							// But the last one is ALWAYS going to be skipped
							if (
								last_timestamp !== null &&
								(token - timestamp_begin) * time_precision < right_stride_start
							) {
								break;
							}

							last_timestamp = token;
						}
					}
				}
			}

			let current_tokens = [];
			let current_token_timestamps = [];

			// - all tokens within output
			for (let i = 0; i < token_ids.length; ++i) {
				const token = Number(token_ids[i]);
				// 4 possible states for each token
				// - 1/ Language code
				// - 2/ all other special tokens (which we ignore)
				// - 3/ Timestamp
				// - 4/ Regular text

				if (all_special_ids.has(token)) {
					const text = this.decode([token]);
					const language = WHISPER_LANGUAGE_MAPPING.get(text.slice(2, -2));

					if (language !== undefined) {
						// 1/ Indeed some language
						// TODO Handle when language is different from the previous
						// one, and we cannot use timestamped tokens to create chunks
						if (
							last_language !== null &&
							language !== last_language &&
							!return_timestamps
						) {
							previous_tokens.push(current_tokens);
							const resolved_tokens =
								this.findLongestCommonSequence(previous_tokens)[0];
							const resolved_text = this.decode(resolved_tokens);
							chunk.text = resolved_text;
							chunks.push(chunk);

							// Flush all our temporary context
							previous_tokens = [];
							current_tokens = [];
							chunk = new_chunk();
						}

						last_language = chunk.language = language;
					} else {
						// 2/ This is a regular special token, ignoring it
					}
				} else if (token >= timestamp_begin) {
					// 3/ Timestamp token
					const time = (token - timestamp_begin) * time_precision + time_offset;
					const rounded_time = round(time, 2);

					if (last_timestamp !== null && token >= last_timestamp) {
						// Whisper outputted a timestamp token, but it falls within
						// our stride, so we're going to skip it for the time being
						// and resolve this later
						// Skip is necessary because timestamp tokens always come
						// by pair, so we need to skip the next one too (which would mark the start of another chunk).
						skip = true;
					} else if (
						skip ||
						(previous_tokens.length > 0 && token < first_timestamp)
					) {
						skip = false;
					} else if (chunk.timestamp[0] === null) {
						chunk.timestamp[0] = rounded_time;
					} else {
						// This is the end of the timestamp chunk
						if (rounded_time === chunk.timestamp[0]) {
							// This is a bug in timestamp token output
							// where we're taking the duplicate token
							// as a stop where it should be a start.
							// This is an issue in the underlying model output
							// Let's just skip it so it becomes de-factor a start agin
						} else {
							chunk.timestamp[1] = rounded_time;

							// Handling merges
							previous_tokens.push(current_tokens);

							if (returnWordTimestamps) {
								previous_token_timestamps.push(current_token_timestamps);
							}

							const [resolved_tokens, resolved_token_timestamps] =
								this.findLongestCommonSequence(
									previous_tokens,
									previous_token_timestamps,
								);

							const resolved_text = this.decode(resolved_tokens);
							chunk.text = resolved_text;

							if (returnWordTimestamps) {
								chunk.words = this.collateWordTimestamps(
									resolved_tokens,
									resolved_token_timestamps,
									last_language,
								);
							}

							chunks.push(chunk);

							// Flush all our temporary context
							previous_tokens = [];
							current_tokens = [];
							previous_token_timestamps = [];
							current_token_timestamps = [];
							chunk = new_chunk();
						}
					}
				} else {
					// 4/ Regular token
					// We just append to the list of all tokens so we can handle
					// merges later and decode into text.
					current_tokens.push(token);

					if (returnWordTimestamps) {
						const start_time = round(token_timestamps[i] + time_offset, 2);

						let end_time;
						if (i + 1 < token_timestamps.length) {
							end_time = round(token_timestamps[i + 1] + time_offset, 2);

							// Do not allow punctuation-only tokens to have a duration.
							// This prevents long pauses from messing up the timestamps.
							const decoded_text = this.decode([token]);
							if (PUNCTUATION_ONLY_REGEX.test(decoded_text)) {
								// Add `time_precision` to avoid overlapping timestamps
								end_time = round(
									Math.min(start_time + time_precision, end_time),
									2,
								);
							}
						} else {
							// should never happen
							end_time = null;
						}

						current_token_timestamps.push([start_time, end_time]);
					}
				}
			}

			if ('stride' in output) {
				const [chunk_len, stride_left, stride_right] = output.stride;
				time_offset += chunk_len - stride_right;
			}

			// Leftover tokens
			if (current_tokens.length > 0) {
				previous_tokens.push(current_tokens);
				if (returnWordTimestamps) {
					previous_token_timestamps.push(current_token_timestamps);
				}
			} else if (previous_tokens.every((p) => p.length === 0)) {
				// Flushing previous tokens (END)"
				chunk = new_chunk();
				previous_tokens = [];
				current_tokens = [];
				previous_token_timestamps = [];
				current_token_timestamps = [];
			}
		}

		if (previous_tokens.length > 0) {
			if (force_full_sequences && return_timestamps) {
				// Last token should always be timestamps, so there shouldn't be
				// leftover
				throw new Error(
					'Whisper did not predict an ending timestamp, which can happen if audio is cut off in the middle of a word. ' +
						'Also make sure WhisperTimeStampLogitsProcessor was used during generation.',
				);
			}

			// Happens when we don't use timestamps
			const [resolved_tokens, resolved_token_timestamps] =
				this.findLongestCommonSequence(
					previous_tokens,
					previous_token_timestamps,
				);

			// Flushing previous tokens (FINAL)
			const resolved_text = this.decode(resolved_tokens);
			chunk.text = resolved_text;
			if (returnWordTimestamps) {
				chunk.words = this.collateWordTimestamps(
					resolved_tokens,
					resolved_token_timestamps,
					last_language,
				);
			}

			chunks.push(chunk);
		}

		let optional = Object.create(null);

		// Preparing and cleaning up the pipeline output
		const full_text = chunks.map((chunk) => chunk.text).join('');
		if (return_timestamps || return_language) {
			for (let i = 0; i < chunks.length; ++i) {
				const chunk = chunks[i];
				if (!return_timestamps) {
					delete chunk.timestamp;
				}

				if (!return_language) {
					delete chunk.language;
				}
			}

			if (returnWordTimestamps) {
				const new_chunks = [];
				for (const chunk of chunks) {
					for (const word of chunk.words) {
						new_chunks.push(word);
					}
				}

				optional = {chunks: new_chunks};
			} else {
				optional = {chunks};
			}
		}

		return [full_text, optional];
	}

	/**
	 * Finds the longest common sequence among the provided sequences.
	 * @param {number[][]} sequences An array of sequences of token ids to compare.
	 * @returns {number[][]} The longest common sequence found.
	 * @throws {Error} If there is a bug within the function.
	 * @private
	 */
	findLongestCommonSequence(sequences, token_timestamp_sequences = null) {
		// It would be much harder to do O(n) because of fault tolerance.
		// We actually have a really good property which is that the total sequence
		// MUST be those subsequences in order.
		// If token_timestamp_sequences is provided, will split those sequences in
		// exactly the same way.
		let leftSequence = sequences[0];
		let leftLength = leftSequence.length;
		const totalSequence = [];

		const use_token_timestamp_sequences =
			Array.isArray(token_timestamp_sequences) &&
			token_timestamp_sequences.length > 0;
		const total_token_timestamp_sequence = use_token_timestamp_sequences
			? []
			: null;
		let left_token_timestamp_sequence = use_token_timestamp_sequences
			? token_timestamp_sequences[0]
			: null;
		for (let i = 1; i < sequences.length; ++i) {
			const rightSequence = sequences[i];
			let max = 0.0;
			let maxIndices = [leftLength, leftLength, 0, 0];
			// Here we're sliding matches
			// [a, b, c, d]
			//          [c, d, f]
			// =        [c] == [d]

			// [a, b, c, d]
			//       [c, d, f]
			// =     [c, d] == [c, d]

			// [a, b, c, d]
			//    [c, d, f]

			// =  [b, c, d] == [c, d, f]

			// [a, b, c, d]
			// [c, d, f]

			// [a, b, c] == [c, d, f]

			// [a, b, c, d]
			// [d, f]

			// [a, b] == [d, f]

			// [a, b, c, d]
			// [f]

			// [a] == [f]

			const rightLength = rightSequence.length;
			for (let j = 1; j < leftLength + rightLength; ++j) {
				// Slightly convoluted because we don't want out of bound indices
				// This will be necessary for a small conflict resolution optimization
				// later
				const leftStart = Math.max(0, leftLength - j);
				const leftStop = Math.min(leftLength, leftLength + rightLength - j);
				const left = leftSequence.slice(leftStart, leftStop);
				const rightStart = Math.max(0, j - leftLength);
				const rightStop = Math.min(rightLength, j);
				const right = rightSequence.slice(rightStart, rightStop);
				if (left.length !== right.length) {
					throw new Error(
						'There is a bug within whisper `decode_asr` function, please report it. Dropping to prevent bad inference.',
					);
				}

				let matches;
				if (use_token_timestamp_sequences) {
					// Get length of longest subsequence of tokens that match
					// and have timestamps that are in order
					matches = left.filter(
						(elem, idx) =>
							elem === right[idx] &&
							left_token_timestamp_sequence[leftStart + idx] <=
								token_timestamp_sequences[i][rightStart + idx],
					).length;
				} else {
					matches = left.filter((elem, idx) => elem === right[idx]).length;
				}

				// epsilon to favor long perfect matches
				const eps = j / 10000.0;
				const matching = matches / j + eps;
				if (matches > 1 && matching > max) {
					max = matching;
					maxIndices = [leftStart, leftStop, rightStart, rightStop];
				}
			}

			const [leftStart, leftStop, rightStart, rightStop] = maxIndices;
			const leftMid = Math.floor((leftStop + leftStart) / 2);
			const rightMid = Math.floor((rightStop + rightStart) / 2);
			totalSequence.push(...leftSequence.slice(0, leftMid));
			leftSequence = rightSequence.slice(rightMid);
			leftLength = leftSequence.length;

			if (use_token_timestamp_sequences) {
				total_token_timestamp_sequence.push(
					...left_token_timestamp_sequence.slice(0, leftMid),
				);
				left_token_timestamp_sequence =
					token_timestamp_sequences[i].slice(rightMid);
			}
		}

		totalSequence.push(...leftSequence);

		if (use_token_timestamp_sequences) {
			total_token_timestamp_sequence.push(...left_token_timestamp_sequence);
			return [totalSequence, total_token_timestamp_sequence];
		}

		return [totalSequence, []];
	}

	/** @private */
	collateWordTimestamps(tokens, token_timestamps, language) {
		const [words, _, token_indices] = this.combineTokensIntoWords(
			tokens,
			language,
		);

		const timings = [];
		for (let i = 0; i < words.length; ++i) {
			const indices = token_indices[i];
			timings.push({
				text: words[i],
				timestamp: [
					token_timestamps[indices.at(0)][0],
					token_timestamps[indices.at(-1)][1],
				],
			});
		}

		return timings;
	}

	/**
	 * Groups tokens by word. Returns a tuple containing a list of strings with the words,
	 * and a list of `token_id` sequences with the tokens making up each word.
	 * @param {number[]} tokens
	 * @param {string} [language]
	 * @param {string} prepend_punctionations
	 * @param {string} append_punctuations
	 *
	 * @private
	 */
	combineTokensIntoWords(
		tokens,
		language,
		prepend_punctionations = '"\'“¡¿([{-',
		append_punctuations = '"\'.。,，!！?？:：”)]}、',
	) {
		language = language ?? 'english';

		let words;
		let word_tokens;
		let token_indices;

		if (['chinese', 'japanese', 'thai', 'lao', 'myanmar'].includes(language)) {
			// These languages don't typically use spaces.
			[words, word_tokens, token_indices] = this.splitTokensOnUnicode(tokens);
		} else {
			[words, word_tokens, token_indices] = this.splitTokensOnSpaces(tokens);
		}

		return this.mergePunctuations(
			words,
			word_tokens,
			token_indices,
			prepend_punctionations,
			append_punctuations,
		);
	}

	/** @type {PreTrainedTokenizer['decode']} */
	decode(token_ids, decode_args) {
		let text;
		// @ts-expect-error
		if (decode_args?.decode_with_timestamps) {
			if (token_ids instanceof Tensor) {
				token_ids = prepareTensorForDecode(token_ids);
			}

			text = this.decodeWithTimestamps(token_ids, decode_args);
		} else {
			text = super.decode(token_ids, decode_args);
		}

		// TODO: implement offsets
		// if (decode_args.output_offsets) {
		//     let offsets = this.computeOffsets
		// }
		return text;
	}

	/**
	 * @param {number[]|bigint[]} token_ids List of token IDs to decode.
	 * @param {Object} decode_args Optional arguments for decoding
	 * @private
	 */
	decodeWithTimestamps(token_ids, decode_args) {
		const time_precision = decode_args?.time_precision ?? 0.02;

		const timestamp_begin = Array.from(this.all_special_ids).at(-1) + 1;
		/** @type {Array} */
		let outputs = [[]];
		for (let token of token_ids) {
			token = Number(token);
			if (token >= timestamp_begin) {
				const timestamp = ((token - timestamp_begin) * time_precision).toFixed(
					2,
				);
				outputs.push(`<|${timestamp}|>`);
				outputs.push([]);
			} else {
				outputs[outputs.length - 1].push(token);
			}
		}

		outputs = outputs.map((s) =>
			typeof s === 'string' ? s : super.decode(s, decode_args),
		);

		return outputs.join('');
	}

	/**
	 * Combine tokens into words by splitting at any position where the tokens are decoded as valid unicode points.
	 * @param {number[]} tokens
	 * @returns {*}
	 * @private
	 */
	splitTokensOnUnicode(tokens) {
		const decoded_full = this.decode(tokens, {
			// @ts-expect-error
			decode_with_timestamps: true,
		});
		const replacement_char = '\uFFFD';

		const words = [];
		const word_tokens = [];
		const token_indices = [];
		let current_tokens = [];
		let current_indices = [];
		let unicode_offset = 0;

		for (let token_idx = 0; token_idx < tokens.length; ++token_idx) {
			const token = tokens[token_idx];

			current_tokens.push(token);
			current_indices.push(token_idx);

			const decoded = this.decode(current_tokens, {
				// @ts-expect-error
				decode_with_timestamps: true,
			});

			if (
				!decoded.includes(replacement_char) ||
				decoded_full[unicode_offset + decoded.indexOf(replacement_char)] ===
					replacement_char
			) {
				words.push(decoded);
				word_tokens.push(current_tokens);
				token_indices.push(current_indices);
				current_tokens = [];
				current_indices = [];
				unicode_offset += decoded.length;
			}
		}

		return [words, word_tokens, token_indices];
	}

	/**
	 * Combine tokens into words by splitting at whitespace and punctuation tokens.
	 * @param {number[]} tokens
	 * @private
	 */
	splitTokensOnSpaces(tokens) {
		const [subwords, subword_tokens_list, subword_indices_list] =
			this.splitTokensOnUnicode(tokens);

		const words = [];
		const word_tokens = [];
		const token_indices = [];

		const punctuationRegex = new RegExp(`^[${PUNCTUATION_REGEX}]$`, 'gu');

		for (let i = 0; i < subwords.length; ++i) {
			const subword = subwords[i];
			const subword_tokens = subword_tokens_list[i];
			const subword_indices = subword_indices_list[i];

			// @ts-expect-error
			const special =
				subword_tokens[0] >= this.model.tokens_to_ids.get('<|endoftext|>');
			const with_space = subword.startsWith(' ');
			const trimmed = subword.trim();
			const punctuation = punctuationRegex.test(trimmed);

			if (special || with_space || punctuation || words.length === 0) {
				words.push(subword);
				word_tokens.push(subword_tokens);
				token_indices.push(subword_indices);
			} else {
				const ix = words.length - 1;
				words[ix] += subword;
				word_tokens[ix].push(...subword_tokens);
				token_indices[ix].push(...subword_indices);
			}
		}

		return [words, word_tokens, token_indices];
	}

	/**
	 * Merges punctuation tokens with neighboring words.
	 * @param {string[]} words
	 * @param {number[][]} tokens
	 * @param {number[][]} indices
	 * @param {string} prepended
	 * @param {string} appended
	 * @private
	 */
	mergePunctuations(words, tokens, indices, prepended, appended) {
		const newWords = structuredClone(words);
		const newTokens = structuredClone(tokens);
		const newIndices = structuredClone(indices);

		// prepend punctuations
		let i = newWords.length - 2;
		let j = newWords.length - 1;

		while (i >= 0) {
			if (
				newWords[i].startsWith(' ') &&
				prepended.includes(newWords[i].trim())
			) {
				newWords[j] = newWords[i] + newWords[j];
				newTokens[j] = mergeArrays(newTokens[i], newTokens[j]);
				newIndices[j] = mergeArrays(newIndices[i], newIndices[j]);
				newWords[i] = '';
				newTokens[i] = [];
				newIndices[i] = [];
			} else {
				j = i;
			}

			--i;
		}

		// append punctuations
		i = 0;
		j = 1;
		while (j < newWords.length) {
			if (!newWords[i].endsWith(' ') && appended.includes(newWords[j])) {
				newWords[i] += newWords[j];
				newTokens[i] = mergeArrays(newTokens[i], newTokens[j]);
				newIndices[i] = mergeArrays(newIndices[i], newIndices[j]);
				newWords[j] = '';
				newTokens[j] = [];
				newIndices[j] = [];
			} else {
				i = j;
			}

			++j;
		}

		return [
			newWords.filter((x) => x),
			newTokens.filter((x) => x.length > 0),
			newIndices.filter((x) => x.length > 0),
		];
	}

	/**
	 * Helper function to build translation inputs for a `WhisperTokenizer`,
	 * depending on the language, task, and whether to predict timestamp tokens.
	 *
	 * Used to override the prefix tokens appended to the start of the label sequence.
	 *
	 * **Example: Get ids for a language**
	 * ```javascript
	 * // instantiate the tokenizer and set the prefix token to Spanish
	 * const tokenizer = await WhisperTokenizer.from_pretrained('Xenova/whisper-tiny');
	 * const forced_decoder_ids = tokenizer.get_decoder_prompt_ids({ language: 'spanish' });
	 * // [(1, 50262), (2, 50363)]
	 * ```
	 *
	 * @param {Object} options Options to generate the decoder prompt.
	 * @param {string} [options.language] The language of the transcription text.
	 * The corresponding language id token is appended to the start of the sequence for multilingual
	 * speech recognition and speech translation tasks, e.g. for "Spanish" the token "<|es|>" is appended
	 * to the start of sequence.
	 * @param {string} [options.task] Task identifier to append at the start of sequence (if any).
	 * This should be used for mulitlingual fine-tuning, with "transcribe" for speech recognition and
	 * "translate" for speech translation.
	 * @param {boolean} [options.no_timestamps] Whether to add the <|notimestamps|> token at the start of the sequence.
	 * @returns {number[][]} The decoder prompt ids.
	 */
	get_decoder_prompt_ids({
		language = null,
		task = null,
		no_timestamps = true,
	}: {
		language: string | null;
		task: string | null;
		no_timestamps: boolean;
	}) {
		// <|lang_id|> <|task|> <|notimestamps|>

		const forced_decoder_ids = [];

		if (language) {
			// User wishes to specify the language
			const language_code = whisper_language_to_code(language);
			const language_token_id = this.model.tokens_to_ids.get(
				`<|${language_code}|>`,
			);
			if (language_token_id === undefined) {
				throw new Error(
					`Unable to find language "${language_code}" in model vocabulary.`,
				);
			}

			forced_decoder_ids.push(language_token_id);
		} else {
			// No token will be forced, which leaves the model to predict the language
			forced_decoder_ids.push(null);
		}

		if (task) {
			task = task.toLowerCase();
			if (task !== 'transcribe' && task !== 'translate') {
				throw new Error(
					`Task "${task}" is not supported. Must be one of: ["transcribe", "translate"]`,
				);
			}

			const task_token_id = this.model.tokens_to_ids.get(`<|${task}|>`);
			if (task_token_id === undefined) {
				throw new Error(`Unable to find task "${task}" in model vocabulary.`);
			}

			forced_decoder_ids.push(task_token_id);
		} else {
			// No token will be forced, which leaves the model to predict the task
			forced_decoder_ids.push(null);
		}

		if (no_timestamps) {
			const no_timestamps_id = this.model.tokens_to_ids.get(`<|notimestamps|>`);
			if (no_timestamps_id === undefined) {
				throw new Error(
					`Unable to find "<|notimestamps|>" in model vocabulary. Please report this issue at ${GITHUB_ISSUE_URL}.`,
				);
			}

			forced_decoder_ids.push(no_timestamps_id);
		}

		return forced_decoder_ids
			.map((x, i) => [i + 1, x])
			.filter((x) => x[1] !== null);
	}
}
