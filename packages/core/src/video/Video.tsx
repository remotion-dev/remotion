import React from 'react';
import {Sequence} from '../sequencing';
import {RemotionMainVideoProps, RemotionVideoProps} from './props';
import {VideoForDevelopment} from './VideoForDevelopment';
import {VideoForRendering} from './VideoForRendering';

export const Video: React.FC<RemotionVideoProps & RemotionMainVideoProps> = (
	props
) => {
	const {startAt, endAt, ...otherProps} = props;
	if (typeof startAt !== 'undefined' || typeof endAt !== 'undefined') {
		if (typeof startAt !== 'undefined') {
			if (typeof startAt !== 'number') {
				throw new TypeError(
					`type of startAt prop is a number, instead got type ${typeof startAt}.`
				);
			}
			if (startAt < 0) {
				throw new TypeError(
					`startAt must be greater than equal to 0 instead got ${startAt}.`
				);
			}
			if (isNaN(startAt) || startAt === Infinity) {
				throw new TypeError('startAt prop can not be NaN or Infinity.');
			}
		}
		if (typeof endAt !== 'undefined') {
			if (typeof endAt !== 'number') {
				throw new TypeError(
					`type of endAt prop is a number, instead got type ${typeof endAt}.`
				);
			}
			if (endAt <= 0) {
				throw new TypeError(
					`endAt must be a positive number, instead got ${endAt}.`
				);
			}
			if (isNaN(endAt)) {
				throw new TypeError('startAt propcan not be NaN.');
			}
		}
		if (typeof startAt !== 'undefined' && typeof endAt !== 'undefined') {
			if (endAt < startAt) {
				throw new TypeError('endAt prop must be greater than startAt prop');
			}
		}
		const startAtFrameNo = typeof startAt !== 'undefined' ? startAt : 0;
		const endAtFrameNO = typeof endAt !== 'undefined' ? endAt : Infinity;
		return (
			<Sequence from={0 - startAtFrameNo} durationInFrames={endAtFrameNO}>
				<Video {...otherProps} />
			</Sequence>
		);
	}

	if (process.env.NODE_ENV === 'development') {
		return <VideoForDevelopment {...props} />;
	}
	return <VideoForRendering {...props} />;
};
