import {colorKey} from '@remotion/effects/color-key';
import {dropShadow} from '@remotion/effects/drop-shadow';
import {grayscale} from '@remotion/effects/grayscale';
import {scale} from '@remotion/effects/scale';
import {vignette} from '@remotion/effects/vignette';
import React from 'react';
import {
	Img,
	Interactive,
	interpolate,
	useCurrentFrame,
	Easing,
	CanvasImage,
} from 'remotion';
import {asset} from './assets';

export const ClientSideChad: React.FC = () => {
	const frame = useCurrentFrame();
	const title = 'BEN2-ONNX';
	return (
		<>
			<Img
				src={asset('Screenshot 2026-07-19 at 18.11.15.png')}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[0, 134],
						['1.9px 207.7px', '1.9px 319.2px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					width: 1198,
					height: 1120,
					scale: interpolate(frame, [0, 134], [1.371, 1.57], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
					opacity: 0.6,
				}}
				effects={[
					vignette({
						mode: 'alpha',
						center: [0.457, 0.281],
						amount: 1,
						feather: 1,
						radius: 0.28,
						roundness: 0,
					}),
					grayscale({}),
				]}
			/>
			<Img
				src={asset('images.png')}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[37, 47],
						['164.2px -306px', '147.6px 390.8px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 200,
									mass: 0.1,
									stiffness: 7,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
							],
						},
					),
					width: 300,
					height: 300,
					scale: 1.04,
				}}
				effects={[
					colorKey({
						similarity: 0.45,
						keyColor: '#ffffff',
					}),
					dropShadow({
						radius: 100,
						offsetX: 0,
						offsetY: 0,
						opacity: 1,
						color: '#ffffff',
					}),
					dropShadow({
						radius: 100,
						offsetX: 0,
						offsetY: 0,
						opacity: 1,
						color: '#ffffff',
					}),
				]}
				from={22}
			/>
			<Img
				src={asset('WebGPU_logo.svg.webp')}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[29, 39],
						['-100px -886.4px', '-100px 222.8px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 200,
									mass: 0.1,
									stiffness: 7,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
							],
						},
					),
					width: 1280,
					height: 1280,
					scale: 0.385,
				}}
				effects={[
					scale({
						scale: 0.9,
					}),
					dropShadow({
						color: '#ffffff',
						offsetX: 0,
						offsetY: 0,
						radius: 100,
						opacity: 1,
					}),
					dropShadow({
						color: '#ffffff',
						offsetX: 0,
						offsetY: 0,
						radius: 100,
						opacity: 1,
					}),
				]}
				from={22}
			/>
			<Interactive.Div
				name="BEN2-ONNX typewriter"
				style={{
					color: '#ffffff',
					fontFamily: 'Arial Black, Arial, sans-serif',
					fontSize: 150,
					fontWeight: 900,
					left: 0,
					letterSpacing: -8,
					position: 'absolute',
					textShadow: '0 0 36px rgba(255, 255, 255, 0.75)',
					top: 900,
					WebkitTextStroke: '3px #000000',
					width: '100%',
					translate: interpolate(
						frame,
						[22, 30],
						['0px -1114.7px', '0px 126px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 200,
									mass: 0.1,
									stiffness: 7,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
							],
						},
					),
					scale: 1.03,
					textAlign: 'center',
				}}
				from={22}
			>
				{title}
			</Interactive.Div>
			<CanvasImage
				src={asset('mediabunny-logo (1).svg')}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[43, 53],
						['663.5px -177.3px', '663.5px 470.2px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 200,
									mass: 0.1,
									stiffness: 7,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
							],
						},
					),
					width: 151,
					height: 150,
					scale: 1.364,
				}}
				from={22}
			/>
			<CanvasImage
				src={asset('image.png')}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[48, 58],
						['-3460.5px -2414.8px', '-3460.5px -1888.6px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					width: 8001,
					height: 4501,
					scale: 0.073,
				}}
				from={22}
				effects={[
					dropShadow({
						color: '#ffffff',
						radius: 100,
					}),
				]}
			/>
			<CanvasImage
				src={asset('image-1.png')}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[55, 66],
						['60px -627.4px', '60px -413.7px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					width: 960,
					height: 960,
					scale: 0.307,
				}}
				from={22}
			/>
		</>
	);
};
