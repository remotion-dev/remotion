import {makeTransform, matrix3d} from '@remotion/animation-utils';
import {visualControl} from '@remotion/studio';
import {zColor, zMatrix, zTextarea} from '@remotion/zod-types';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';

const Card: React.FC<{
	title: string;
	type: string;
	children: React.ReactNode;
}> = ({title, type, children}) => (
	<div
		style={{
			background: 'rgba(255,255,255,0.08)',
			borderRadius: 12,
			padding: 20,
			display: 'flex',
			flexDirection: 'column',
			gap: 10,
		}}
	>
		<div
			style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'baseline',
			}}
		>
			<span style={{fontSize: 18, fontWeight: 700, color: '#fff'}}>
				{title}
			</span>
			<span style={{fontSize: 12, color: '#888', fontFamily: 'monospace'}}>
				{type}
			</span>
		</div>
		<div
			style={{
				flex: 1,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: 60,
			}}
		>
			{children}
		</div>
	</div>
);

export const VisualControls = () => {
	// Number (auto-detected)
	const rotation = visualControl('rotation', 90);

	// String (auto-detected)
	const label = visualControl('label', 'Hello Remotion');

	// Boolean
	const showBorder = visualControl('show-border', true, z.boolean());

	// Color (custom zod type)
	const bgColor = visualControl('bg-color', '#e06060', zColor());
	const textColor = visualControl('text-color', '#ffffff', zColor());

	// Textarea (multi-line text)
	const description = visualControl(
		'description',
		'Line 1\nLine 2\nLine 3',
		zTextarea(),
	);

	// Number with step
	const opacity = visualControl(
		'opacity',
		0.8,
		z.number().min(0).max(1).step(0.01),
	);
	const fontSize = visualControl(
		'font-size',
		146,
		z.number().min(8).max(200).step(1),
	);
	const borderRadius = visualControl(
		'border-radius',
		20,
		z.number().min(0).max(100).step(1),
	);

	// Enum
	const alignment = visualControl(
		'alignment',
		'center' as 'left' | 'center' | 'right',
		z.enum(['left', 'center', 'right']),
	);

	// Object
	const padding = visualControl(
		'padding',
		{top: 20, right: 40, bottom: 20, left: 40},
		z.object({
			top: z.number().min(0).max(200),
			right: z.number().min(0).max(200),
			bottom: z.number().min(0).max(200),
			left: z.number().min(0).max(200),
		}),
	);

	// Array of strings
	const tags = visualControl(
		'tags',
		['remotion', 'visual', 'controls'],
		z.array(z.string()),
	);

	// Array of numbers
	const dashArray = visualControl(
		'dash-array',
		[10, 5, 50],
		z.array(z.number().min(0).max(50)),
	);

	// Nested object
	const shadow = visualControl(
		'shadow',
		{x: 4, y: 4, blur: 10, color: '#00000066'},
		z.object({
			x: z.number().min(-50).max(50),
			y: z.number().min(-50).max(50),
			blur: z.number().min(0).max(100),
			color: zColor(),
		}),
	);

	// Matrix (4x4)
	const matrix = visualControl(
		'my-matrix',
		[11.77, 1.49, 1.3, 0, 0, 2.79, 0, 0, 1.26, 1.27, 1, 0, 0, 0, 0, 1] as const,
		zMatrix(),
	);

	// Nullable
	const subtitle = visualControl(
		'subtitle',
		'A subtitle',
		z.string().nullable(),
	);

	// Optional number
	const extraRotation = visualControl(
		'extra-rotation',
		undefined as number | undefined,
		z.number().optional(),
	);

	// Tuple
	const position = visualControl(
		'position',
		[292, 200],
		z.tuple([z.number(), z.number()]),
	);

	// Date
	const date = visualControl('date', new Date('2025-01-01'), z.date());

	// Discriminated union
	const shape = visualControl(
		'shape',
		{type: 'rectangle', width: 1, height: 1} as
			| {type: 'circle'; radius: number}
			| {type: 'rectangle'; width: number; height: number},
		z.discriminatedUnion('type', [
			z.object({
				type: z.literal('circle'),
				radius: z.number().min(1).max(200),
			}),
			z.object({
				type: z.literal('rectangle'),
				width: z.number().min(1).max(400),
				height: z.number().min(1).max(400),
			}),
		]),
	);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#1a1a2e',
				fontFamily: 'sans-serif',
				padding: 40,
				overflow: 'auto',
			}}
		>
			<h1
				style={{
					color: '#fff',
					fontSize: 36,
					margin: '0 0 30px 0',
					textAlign: 'center',
				}}
			>
				Visual Controls Test
			</h1>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr 1fr',
					gap: 20,
				}}
			>
				{/* Number (auto-detected) */}
				<Card title="rotation" type="number (auto)">
					<div
						style={{
							width: 80,
							height: 80,
							border: '3px solid #4ecdc4',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							transform: `rotate(${rotation}deg)`,
							color: '#4ecdc4',
							fontSize: 14,
						}}
					>
						{rotation}°
					</div>
				</Card>

				{/* String (auto-detected) */}
				<Card title="label" type="string (auto)">
					<span style={{color: '#fff', fontSize: 24}}>{label}</span>
				</Card>

				{/* Boolean */}
				<Card title="show-border" type="z.boolean()">
					<div
						style={{
							width: 100,
							height: 60,
							border: showBorder ? '3px solid #ff6b6b' : '3px dashed #444',
							borderRadius: 8,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: showBorder ? '#ff6b6b' : '#444',
							fontSize: 14,
						}}
					>
						{showBorder ? 'ON' : 'OFF'}
					</div>
				</Card>

				{/* Colors */}
				<Card title="bg-color" type="zColor()">
					<div
						style={{
							width: 120,
							height: 60,
							backgroundColor: bgColor,
							borderRadius: 8,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: '#fff',
							fontSize: 12,
							fontFamily: 'monospace',
						}}
					>
						{bgColor}
					</div>
				</Card>

				<Card title="text-color" type="zColor()">
					<span
						style={{
							color: textColor,
							fontSize: 24,
							fontWeight: 700,
						}}
					>
						Aa
					</span>
					<span
						style={{
							color: '#888',
							fontSize: 12,
							fontFamily: 'monospace',
							marginLeft: 10,
						}}
					>
						{textColor}
					</span>
				</Card>

				{/* Textarea */}
				<Card title="description" type="zTextarea()">
					<pre
						style={{
							color: '#c8d6e5',
							fontSize: 13,
							fontFamily: 'monospace',
							whiteSpace: 'pre-wrap',
							margin: 0,
							lineHeight: 1.5,
						}}
					>
						{description}
					</pre>
				</Card>

				{/* Number with constraints */}
				<Card title="opacity" type="z.number().min(0).max(1)">
					<div style={{width: '100%'}}>
						<div
							style={{
								height: 20,
								background: '#333',
								borderRadius: 10,
								overflow: 'hidden',
							}}
						>
							<div
								style={{
									height: '100%',
									width: `${opacity * 100}%`,
									background: '#4ecdc4',
									borderRadius: 10,
								}}
							/>
						</div>
						<div
							style={{
								color: '#888',
								fontSize: 12,
								textAlign: 'center',
								marginTop: 4,
							}}
						>
							{opacity.toFixed(2)}
						</div>
					</div>
				</Card>

				<Card title="font-size" type="z.number().step(1)">
					<span style={{color: '#fff', fontSize: Math.min(fontSize, 60)}}>
						{fontSize}px
					</span>
				</Card>

				<Card title="border-radius" type="z.number().step(1)">
					<div
						style={{
							width: 80,
							height: 80,
							background: '#4ecdc4',
							borderRadius,
						}}
					/>
				</Card>

				{/* Enum */}
				<Card title="alignment" type="z.enum()">
					<div
						style={{
							width: '100%',
							textAlign:
								alignment === 'left'
									? 'left'
									: alignment === 'right'
										? 'right'
										: 'center',
							color: '#fff',
							fontSize: 18,
						}}
					>
						Aligned {alignment}
					</div>
				</Card>

				{/* Object */}
				<Card title="padding" type="z.object()">
					<div
						style={{
							border: '1px dashed #666',
							padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
						}}
					>
						<div
							style={{
								background: '#4ecdc4',
								width: 40,
								height: 40,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontSize: 10,
								color: '#000',
								borderRadius: 4,
							}}
						>
							content
						</div>
					</div>
				</Card>

				{/* Array of strings */}
				<Card title="tags" type="z.array(z.string())">
					<div
						style={{
							display: 'flex',
							gap: 6,
							flexWrap: 'wrap',
							justifyContent: 'center',
						}}
					>
						{tags.map((tag) => (
							<span
								key={tag}
								style={{
									background: '#4ecdc4',
									color: '#000',
									fontSize: 13,
									borderRadius: 4,
									padding: '2px 8px',
									fontWeight: 600,
								}}
							>
								{tag}
							</span>
						))}
					</div>
				</Card>

				{/* Array of numbers */}
				<Card title="dash-array" type="z.array(z.number())">
					<svg width={160} height={40}>
						<line
							x1={10}
							y1={20}
							x2={150}
							y2={20}
							stroke="#4ecdc4"
							strokeWidth={4}
							strokeDasharray={dashArray.join(' ')}
						/>
					</svg>
					<div style={{color: '#888', fontSize: 11, fontFamily: 'monospace'}}>
						[{dashArray.join(', ')}]
					</div>
				</Card>

				{/* Nested object with color */}
				<Card title="shadow" type="z.object() + zColor()">
					<div
						style={{
							width: 80,
							height: 80,
							background: '#fff',
							borderRadius: 8,
							boxShadow: `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.color}`,
						}}
					/>
				</Card>

				{/* Matrix */}
				<Card title="my-matrix" type="zMatrix()">
					<div
						style={{
							width: 60,
							height: 60,
							background: '#ff6b6b',
							transform: makeTransform([matrix3d(...matrix)]),
						}}
					/>
				</Card>

				{/* Nullable */}
				<Card title="subtitle" type="z.string().nullable()">
					<span
						style={{
							color: subtitle !== null ? '#fff' : '#666',
							fontSize: 16,
							fontStyle: subtitle !== null ? 'normal' : 'italic',
						}}
					>
						{subtitle !== null ? subtitle : 'null'}
					</span>
				</Card>

				{/* Optional number */}
				<Card title="extra-rotation" type="z.number().optional()">
					<div
						style={{
							width: 60,
							height: 60,
							border: '2px solid #ff6b6b',
							borderRadius: 4,
							transform:
								extraRotation !== undefined
									? `rotate(${extraRotation}deg)`
									: undefined,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: '#ff6b6b',
							fontSize: 12,
						}}
					>
						{extraRotation !== undefined ? `${extraRotation}°` : 'undef'}
					</div>
				</Card>

				{/* Tuple */}
				<Card title="position" type="z.tuple()">
					<svg width={160} height={80}>
						<circle
							cx={Math.min(Math.max(position[0] / 5, 5), 155)}
							cy={Math.min(Math.max(position[1] / 5, 5), 75)}
							r={8}
							fill="#4ecdc4"
						/>
						<text
							x={80}
							y={75}
							fill="#888"
							fontSize={10}
							textAnchor="middle"
							fontFamily="monospace"
						>
							({position[0]}, {position[1]})
						</text>
					</svg>
				</Card>

				{/* Date */}
				<Card title="date" type="z.date()">
					<span style={{color: '#fff', fontSize: 18, fontFamily: 'monospace'}}>
						{date.toISOString().split('T')[0]}
					</span>
				</Card>

				{/* Discriminated union */}
				<Card title="shape" type="z.discriminatedUnion()">
					<svg width={160} height={80}>
						{shape.type === 'circle' ? (
							<circle
								cx={80}
								cy={40}
								r={Math.min(shape.radius, 35)}
								fill="none"
								stroke="#ff6b6b"
								strokeWidth={2}
							/>
						) : (
							<rect
								x={80 - Math.min(shape.width, 70) / 2}
								y={40 - Math.min(shape.height, 35) / 2}
								width={Math.min(shape.width, 70)}
								height={Math.min(shape.height, 35)}
								fill="none"
								stroke="#ff6b6b"
								strokeWidth={2}
							/>
						)}
						<text
							x={80}
							y={78}
							fill="#888"
							fontSize={10}
							textAnchor="middle"
							fontFamily="monospace"
						>
							{shape.type}
						</text>
					</svg>
				</Card>
			</div>
		</AbsoluteFill>
	);
};
