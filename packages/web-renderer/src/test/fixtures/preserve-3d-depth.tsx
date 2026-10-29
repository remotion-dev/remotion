import React from 'react';
const plane = (
	style: React.CSSProperties,
	children?: React.ReactNode,
): React.ReactElement =>
	React.createElement(
		'div',
		{style: {position: 'absolute', ...style}},
		React.Children.toArray(children),
	);
export const size = {width: 640, height: 480};
export function FallbackDepthScene({kind}: {kind: string}): React.ReactElement {
	const tiles = plane(
		{
			left: 160,
			top: 130,
			width: 300,
			height: 220,
			background: '#dd2222',
			transform: 'rotateY(28deg) rotateX(18deg)',
			transformStyle: 'preserve-3d',
		},
		[
			plane({
				left: 30,
				top: 40,
				width: 160,
				height: 120,
				background: '#22dd44',
				transform: 'translateZ(100px)',
			}),
			plane({
				left: 100,
				top: 60,
				width: 160,
				height: 120,
				background: '#2244dd',
			}),
			plane({
				left: 200,
				top: 30,
				width: 70,
				height: 70,
				background: '#dddd22',
				transform: 'translateZ(-60px)',
			}),
			// An invisible sibling must not disable depth ordering of visible planes.
			kind === 'depth'
				? plane({
						left: 5000,
						top: 0,
						width: 100,
						height: 100,
						background: '#ffffff',
					})
				: null,
		],
	);
	let content;
	if (kind === 'zero-flat')
		content = plane(
			{...size, perspective: 700},
			plane(
				{...size, transformStyle: 'preserve-3d', transform: 'rotateY(12deg)'},
				plane(
					{left: 0, top: 0, width: 0, height: 0, overflow: 'visible'},
					plane({
						left: 120,
						top: 100,
						width: 300,
						height: 200,
						background: '#22dd44',
					}),
				),
			),
		);
	if (kind === 'coplanar-delay')
		content = plane(
			{...size, perspective: 700},
			plane({...size, transformStyle: 'preserve-3d'}, [
				plane({
					left: 100,
					top: 100,
					width: 200,
					height: 200,
					background: '#dd2222',
					transform: 'translateZ(20px)',
				}),
				plane({
					left: 220,
					top: 100,
					width: 200,
					height: 200,
					background: '#22dd44',
					transform: 'translateZ(20px)',
				}),
				plane({
					left: 80,
					top: 100,
					width: 80,
					height: 200,
					background: '#2244dd',
				}),
			]),
		);
	if (kind === 'magnified-mask')
		content = plane(
			{...size, perspective: 700},
			plane(
				{
					left: 280,
					top: 220,
					width: 80,
					height: 40,
					transform: 'translateZ(550px) rotateY(15deg)',
					transformStyle: 'preserve-3d',
					background: '#22dd44',
					maskImage:
						'linear-gradient(90deg, transparent, black 25%, black 75%, transparent)',
				},
				plane({left: 5, top: 5, fontSize: 9, color: 'white'}, 'Kino 012345'),
			),
		);
	if (kind === 'perspective')
		content = plane(
			{...size, perspective: 700, perspectiveOrigin: '240px 180px'},
			tiles,
		);
	if (kind === 'depth') content = plane({...size, perspective: 700}, tiles);
	if (kind === 'group')
		content = plane(
			{...size, perspective: 700},
			plane(
				{...size, transformStyle: 'preserve-3d'},
				plane(
					{
						left: 140,
						top: 80,
						width: 320,
						height: 300,
						opacity: 0.6,
						maskImage:
							'radial-gradient(ellipse 70% 75% at 50% 50%, #000 25%, rgba(0,0,0,0.35) 100%)',
						transform: 'rotateY(18deg)',
						background: '#dd2222',
					},
					[
						plane({
							left: 20,
							top: 20,
							width: 200,
							height: 180,
							background: '#22dd44',
						}),
						plane({
							left: 80,
							top: 70,
							width: 200,
							height: 180,
							background: '#2244dd',
						}),
					],
				),
			),
		);
	// The group shadow paints outside its own box, and the leaf after the
	// clipped child paints farther right. Both must survive group capture.
	// A normal 2D subtree must remain atomic without disabling depth ordering
	// of sibling planes inside the flattened opacity group's local 3D scene.
	if (kind === 'local-group-depth')
		content = plane(
			{...size, perspective: 700},
			plane(
				{
					left: 130,
					top: 80,
					width: 360,
					height: 300,
					opacity: 0.6,
					transform: 'translateZ(90px) rotateX(18deg) rotateY(24deg)',
					transformStyle: 'preserve-3d',
				},
				plane(
					{
						left: 0,
						top: 0,
						width: 360,
						height: 300,
						background: '#dd2222',
						transformStyle: 'preserve-3d',
					},
					[
						plane({
							left: 30,
							top: 40,
							width: 170,
							height: 130,
							background: '#22dd44',
							transform: 'translateZ(100px)',
						}),
						plane({
							left: 110,
							top: 70,
							width: 170,
							height: 130,
							background: '#2244dd',
						}),
						plane({
							left: 210,
							top: 20,
							width: 80,
							height: 70,
							background: '#dddd22',
							transform: 'translateZ(-30px)',
						}),
						plane(
							{
								left: 20,
								top: 250,
								width: 320,
								height: 30,
								background: '#2244dd',
							},
							plane({
								left: 10,
								top: 7,
								width: 140,
								height: 16,
								background: '#dddd22',
							}),
						),
					],
				),
			),
		);
	if (kind === 'opacity-paint-bounds')
		content = plane(
			{
				left: 180,
				top: 150,
				width: 100,
				height: 100,
				opacity: 0.5,
				background: '#dd2222',
				boxShadow: '0 0 0 20px #dddd22',
			},
			[
				plane(
					{
						left: 0,
						top: 0,
						width: 50,
						height: 50,
						overflow: 'hidden',
						background: '#22dd44',
					},
					plane({
						left: 30,
						top: 20,
						width: 60,
						height: 60,
						background: '#2244dd',
					}),
				),
				plane({
					left: 180,
					top: 20,
					width: 90,
					height: 100,
					background: '#22dd44',
				}),
			],
		);
	if (kind === 'oversized-opacity')
		content = plane(
			{
				left: -50000,
				top: 100,
				width: 100000,
				height: 200,
				opacity: 0.5,
				background: '#dd2222',
			},
			[
				plane({
					left: 50080,
					top: 20,
					width: 250,
					height: 160,
					background: '#22dd44',
				}),
				plane({
					left: 50200,
					top: 60,
					width: 180,
					height: 100,
					background: '#2244dd',
				}),
			],
		);
	if (kind === 'implicit-gradient-stop')
		content = plane(
			{
				...size,
				background:
					'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,255,255,0.22), rgba(255,255,255,0.06) 70%)',
			},
			plane({left: 10, top: 10, width: 60, height: 60, background: '#22dd44'}),
		);
	if (kind === 'trailing-gradient-stop')
		content = plane(
			{...size, background: 'linear-gradient(90deg, #104060 30%, #60a0c0)'},
			plane({left: 10, top: 10, width: 60, height: 60, background: '#22dd44'}),
		);
	if (kind === 'soft-inset')
		content = plane(
			{
				left: 100,
				top: 100,
				width: 400,
				height: 250,
				background: '#22dd44',
				borderRadius: 35,
				boxShadow: 'inset 8px -5px 24px 12px rgba(0,0,0,.8)',
			},
			plane({
				left: 120,
				top: 80,
				width: 160,
				height: 80,
				background: '#2244dd',
			}),
		);
	if (kind === 'offscreen')
		content = plane(
			{...size, perspective: 700},
			plane({
				left: 160,
				top: 1000,
				width: 300,
				height: 180,
				background: '#22dd44',
				transform: 'translateY(-850px) rotateY(25deg)',
				transformStyle: 'preserve-3d',
			}),
		);
	return plane({...size, background: '#101820'}, content);
}
