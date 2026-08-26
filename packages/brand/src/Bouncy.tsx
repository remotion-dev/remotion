import React from 'react';
import {Sequence, Solid} from 'remotion';
import {ProductDiscountCallout} from './product-discount-callout.element';

export const Bouncy: React.FC = () => {
	return (
		<>
			<Solid
				width={1920}
				height={1080}
				color={'#ffffff'}
				style={{
					position: 'absolute',
				}}
			/>
			<Sequence
				name="Product Discount Callout"
				width={900}
				height={650}
				durationInFrames={120}
				style={{
					position: 'absolute',
					translate: '510px 215px',
					scale: 1.619,
				}}
			>
				<ProductDiscountCallout />
			</Sequence>
		</>
	);
};
