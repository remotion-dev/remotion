import React from 'react';
import {Sequence} from '../sequencing';
import {AudioForDevelopment} from './AudioForDevelopment';
import {RemotionAudioProps, RemotionMainAudioProps} from './props';

export const Audio: React.FC<RemotionAudioProps & RemotionMainAudioProps> = (
	props
) => {
	const {startAt, endAt, ...otherProps} = props;
	if (typeof startAt !== 'undefined' || typeof endAt !== 'undefined') {
		if (typeof startAt !== 'undefined') {
			if (typeof startAt !== 'number') {
				throw new TypeError(
					`type of startAt prop must be a number, instead got type ${typeof startAt}.`
				);
			}
			if (isNaN(startAt) || startAt === Infinity) {
				throw new TypeError('startAt prop can not be NaN or Infinity.');
			}
			if (startAt < 0) {
				throw new TypeError(
					`startAt must be greater than equal to 0 instead got ${startAt}.`
				);
			}
		}
		if (typeof endAt !== 'undefined') {
			if (typeof endAt !== 'number') {
				throw new TypeError(
					`type of endAt prop must be a number, instead got type ${typeof endAt}.`
				);
			}
			if (isNaN(endAt)) {
				throw new TypeError('endAt prop can not be NaN.');
			}
			if (endAt <= 0) {
				throw new TypeError(
					`endAt must be a positive number, instead got ${endAt}.`
				);
			}
		}
		if (typeof startAt !== 'undefined' && typeof endAt !== 'undefined') {
			if (endAt < startAt) {
				throw new TypeError('endAt prop must be greater than startAt prop');
			}
		}
		const startAtFrameNo = startAt ?? 0;
		const endAtFrameNo = endAt ?? Infinity;
		return (
			<Sequence from={0 - startAtFrameNo} durationInFrames={endAtFrameNo}>
				<Audio {...otherProps} />
			</Sequence>
		);
	}
	if (process.env.NODE_ENV === 'development') {
		return <AudioForDevelopment {...props} />;
	}
	return null;
};
