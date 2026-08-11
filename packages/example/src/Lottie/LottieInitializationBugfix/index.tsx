import {Lottie} from '@remotion/lottie';
import {AbsoluteFill, useVideoConfig} from 'remotion';

const lottie = {
	v: '5.9.0',
	fr: 25,
	ip: 0,
	op: 212,
	w: 3840,
	h: 2160,
	nm: 'Alfa-Media Abbinder Test 04 + Alphamask for Logo - Text Expression',
	ddd: 0,
	assets: [],
	fonts: {
		list: [
			{
				origin: 0,
				fPath: '',
				fClass: '',
				fFamily: 'New Order',
				fWeight: '',
				fStyle: 'Bold',
				fName: 'NewOrder-Bold',
				ascent: 77.2994995117188,
			},
		],
	},
	layers: [
		{
			ddd: 0,
			ind: 1,
			ty: 4,
			nm: 'Square BG 2',
			td: 1,
			sr: 1,
			ks: {
				o: {
					a: 0,
					k: 100,
					ix: 11,
				},
				r: {
					a: 0,
					k: 0,
					ix: 10,
				},
				p: {
					a: 1,
					k: [
						{
							i: {
								x: 0.667,
								y: 1,
							},
							o: {
								x: 0.167,
								y: 0.167,
							},
							t: 51,
							s: [2092, 1080, 0],
							to: [-28.667, 0, 0],
							ti: [28.667, 0, 0],
						},
						{
							t: 57,
							s: [1920, 1080, 0],
						},
					],
					ix: 2,
					l: 2,
				},
				a: {
					a: 0,
					k: [-76, 0, 0],
					ix: 1,
					l: 2,
				},
				s: {
					a: 0,
					k: [100, 100, 100],
					ix: 6,
					l: 2,
				},
			},
			ao: 0,
			shapes: [
				{
					ty: 'gr',
					it: [
						{
							ty: 'rc',
							d: 1,
							s: {
								a: 0,
								k: [1576, 1576],
								ix: 2,
							},
							p: {
								a: 0,
								k: [0, 0],
								ix: 3,
							},
							r: {
								a: 0,
								k: 0,
								ix: 4,
							},
							nm: 'Rectangle Path 1',
							mn: 'ADBE Vector Shape - Rect',
							hd: false,
						},
						{
							ty: 'st',
							c: {
								a: 0,
								k: [1, 1, 1, 1],
								ix: 3,
							},
							o: {
								a: 0,
								k: 100,
								ix: 4,
							},
							w: {
								a: 0,
								k: 0,
								ix: 5,
							},
							lc: 1,
							lj: 1,
							ml: 4,
							bm: 0,
							nm: 'Stroke 1',
							mn: 'ADBE Vector Graphic - Stroke',
							hd: false,
						},
						{
							ty: 'fl',
							c: {
								a: 0,
								k: [1, 1, 1, 1],
								ix: 4,
							},
							o: {
								a: 0,
								k: 100,
								ix: 5,
							},
							r: 1,
							bm: 0,
							nm: 'Fill 1',
							mn: 'ADBE Vector Graphic - Fill',
							hd: false,
						},
						{
							ty: 'tr',
							p: {
								a: 0,
								k: [-76, 0],
								ix: 2,
							},
							a: {
								a: 0,
								k: [0, 0],
								ix: 1,
							},
							s: {
								a: 0,
								k: [100, 100],
								ix: 3,
							},
							r: {
								a: 0,
								k: 0,
								ix: 6,
							},
							o: {
								a: 0,
								k: 100,
								ix: 7,
							},
							sk: {
								a: 0,
								k: 0,
								ix: 4,
							},
							sa: {
								a: 0,
								k: 0,
								ix: 5,
							},
							nm: 'Transformieren',
						},
					],
					nm: 'Rectangle 1',
					np: 3,
					cix: 2,
					bm: 0,
					ix: 1,
					mn: 'ADBE Vector Group',
					hd: false,
				},
			],
			ip: 51,
			op: 263,
			st: 51,
			bm: 0,
		},

		{
			ddd: 0,
			ind: 3,
			ty: 5,
			nm: 'Dynamisch',
			sr: 1,
			ks: {
				o: {
					a: 0,
					k: 100,
					ix: 11,
				},
				r: {
					a: 0,
					k: 0,
					ix: 10,
				},
				p: {
					a: 1,
					k: [
						{
							i: {
								x: 0,
								y: 1,
							},
							o: {
								x: 0.167,
								y: 0.167,
							},
							t: 53,
							s: [235, 1444, 0],
							to: [280.833, 0, 0],
							ti: [-280.833, 0, 0],
						},
						{
							t: 70,
							s: [1920, 1444, 0],
						},
					],
					ix: 2,
					l: 2,
				},
				a: {
					a: 0,
					k: [727.49, -47.03, 0],
					ix: 1,
					l: 2,
					x: 'var $bm_rt;\nvar x, y;\nx = $bm_sum(sourceRectAtTime().left, $bm_div(sourceRectAtTime().width, 2));\ny = $bm_sum(sourceRectAtTime().top, $bm_div(sourceRectAtTime().height, 2));\n$bm_rt = [\n    x,\n    y\n];',
				},
				s: {
					a: 0,
					k: [264.514, 1352.181, 100],
					ix: 6,
					l: 2,
					x: "var $bm_rt;\nvar xsize, ysize, x, y, smallestValue;\nxsize = effect('x size')(1).value;\nysize = effect('y size')(1).value;\nx = $bm_mul($bm_div(xsize, sourceRectAtTime().width), 100);\ny = $bm_mul($bm_div(ysize, sourceRectAtTime().height), 100);\nsmallestValue = Math.min(x, y);\n$bm_rt = [\n    smallestValue,\n    smallestValue\n];",
				},
			},
			ao: 0,
			ef: [
				{
					ty: 5,
					nm: 'x size',
					np: 3,
					mn: 'ADBE Slider Control',
					ix: 1,
					en: 1,
					ef: [
						{
							ty: 0,
							nm: 'Schieberegler',
							mn: 'ADBE Slider Control-0001',
							ix: 1,
							v: {
								a: 0,
								k: 687,
								ix: 1,
								x: "var $bm_rt;\n$bm_rt = thisComp.layer('Dynimscher Text Controller').effect('x size')(1).value;",
							},
						},
					],
				},
				{
					ty: 5,
					nm: 'y size',
					np: 3,
					mn: 'ADBE Slider Control',
					ix: 2,
					en: 1,
					ef: [
						{
							ty: 0,
							nm: 'Schieberegler',
							mn: 'ADBE Slider Control-0001',
							ix: 1,
							v: {
								a: 0,
								k: 100,
								ix: 1,
								x: "var $bm_rt;\n$bm_rt = thisComp.layer('Dynimscher Text Controller').effect('y size ')(1).value;",
							},
						},
					],
				},
			],
			t: {
				d: {
					k: [
						{
							s: {
								s: 163,
								f: 'NewOrder-Bold',
								t: '#title1#',
								ca: 0,
								j: 0,
								tr: 0,
								lh: 199,
								ls: 0,
								fc: [0.188, 0.208, 0.427],
								sc: [0, 0, 0],
								sw: 0.00999999977648,
								of: true,
							},
							t: 0,
						},
					],
				},
				p: {},
				m: {
					g: 1,
					a: {
						a: 0,
						k: [0, 0],
						ix: 2,
					},
				},
				a: [],
			},
			ip: 53,
			op: 265,
			st: 53,
			bm: 0,
		},
		{
			ddd: 0,
			ind: 4,
			ty: 5,
			nm: 'Wir  können  helfen!',
			sr: 1,
			ks: {
				o: {
					a: 0,
					k: 100,
					ix: 11,
				},
				r: {
					a: 0,
					k: 0,
					ix: 10,
				},
				p: {
					a: 1,
					k: [
						{
							i: {
								x: 0,
								y: 1,
							},
							o: {
								x: 0,
								y: 0,
							},
							t: 51,
							s: [399, 704, 0],
							to: [133.167, 0, 0],
							ti: [-133.167, 0, 0],
						},
						{
							t: 68,
							s: [1198, 704, 0],
						},
					],
					ix: 2,
					l: 2,
				},
				a: {
					a: 0,
					k: [0, 0, 0],
					ix: 1,
					l: 2,
				},
				s: {
					a: 0,
					k: [100, 100, 100],
					ix: 6,
					l: 2,
				},
			},
			ao: 0,
			t: {
				d: {
					k: [
						{
							s: {
								s: 470,
								f: 'NewOrder-Bold',
								t: 'Wir \rkönnen \rhelfen!',
								ca: 0,
								j: 0,
								tr: 0,
								lh: 199,
								ls: 0,
								fc: [0.188, 0.208, 0.427],
								sc: [0, 0, 0],
								sw: 0.00999999977648,
								of: true,
							},
							t: 0,
						},
					],
				},
				p: {},
				m: {
					g: 1,
					a: {
						a: 0,
						k: [0, 0],
						ix: 2,
					},
				},
				a: [],
			},
			ip: 51,
			op: 263,
			st: 51,
			bm: 0,
		},
		{
			ddd: 0,
			ind: 5,
			ty: 4,
			nm: 'Square BG',
			sr: 1,
			ks: {
				o: {
					a: 0,
					k: 100,
					ix: 11,
				},
				r: {
					a: 0,
					k: 0,
					ix: 10,
				},
				p: {
					a: 1,
					k: [
						{
							i: {
								x: 0.667,
								y: 1,
							},
							o: {
								x: 0.167,
								y: 0.167,
							},
							t: 51,
							s: [2092, 1080, 0],
							to: [-28.667, 0, 0],
							ti: [28.667, 0, 0],
						},
						{
							t: 57,
							s: [1920, 1080, 0],
						},
					],
					ix: 2,
					l: 2,
				},
				a: {
					a: 0,
					k: [-76, 0, 0],
					ix: 1,
					l: 2,
				},
				s: {
					a: 0,
					k: [100, 100, 100],
					ix: 6,
					l: 2,
				},
			},
			ao: 0,
			shapes: [
				{
					ty: 'gr',
					it: [
						{
							ty: 'rc',
							d: 1,
							s: {
								a: 0,
								k: [1576, 1576],
								ix: 2,
							},
							p: {
								a: 0,
								k: [0, 0],
								ix: 3,
							},
							r: {
								a: 0,
								k: 0,
								ix: 4,
							},
							nm: 'Rectangle Path 1',
							mn: 'ADBE Vector Shape - Rect',
							hd: false,
						},
						{
							ty: 'st',
							c: {
								a: 0,
								k: [1, 1, 1, 1],
								ix: 3,
							},
							o: {
								a: 0,
								k: 100,
								ix: 4,
							},
							w: {
								a: 0,
								k: 0,
								ix: 5,
							},
							lc: 1,
							lj: 1,
							ml: 4,
							bm: 0,
							nm: 'Stroke 1',
							mn: 'ADBE Vector Graphic - Stroke',
							hd: false,
						},
						{
							ty: 'fl',
							c: {
								a: 0,
								k: [1, 1, 1, 1],
								ix: 4,
							},
							o: {
								a: 0,
								k: 100,
								ix: 5,
							},
							r: 1,
							bm: 0,
							nm: 'Fill 1',
							mn: 'ADBE Vector Graphic - Fill',
							hd: false,
						},
						{
							ty: 'tr',
							p: {
								a: 0,
								k: [-76, 0],
								ix: 2,
							},
							a: {
								a: 0,
								k: [0, 0],
								ix: 1,
							},
							s: {
								a: 0,
								k: [100, 100],
								ix: 3,
							},
							r: {
								a: 0,
								k: 0,
								ix: 6,
							},
							o: {
								a: 0,
								k: 100,
								ix: 7,
							},
							sk: {
								a: 0,
								k: 0,
								ix: 4,
							},
							sa: {
								a: 0,
								k: 0,
								ix: 5,
							},
							nm: 'Transformieren',
						},
					],
					nm: 'Rectangle 1',
					np: 3,
					cix: 2,
					bm: 0,
					ix: 1,
					mn: 'ADBE Vector Group',
					hd: false,
				},
			],
			ip: 51,
			op: 263,
			st: 51,
			bm: 0,
		},
		{
			ddd: 0,
			ind: 6,
			ty: 4,
			nm: 'Base BG',
			sr: 1,
			ks: {
				o: {
					a: 0,
					k: 100,
					ix: 11,
				},
				r: {
					a: 0,
					k: 0,
					ix: 10,
				},
				p: {
					a: 1,
					k: [
						{
							i: {
								x: 0.667,
								y: 1,
							},
							o: {
								x: 0.167,
								y: 0.167,
							},
							t: 46,
							s: [-2748, 1080, 0],
							to: [778, 0, 0],
							ti: [-778, 0, 0],
						},
						{
							t: 57,
							s: [1920, 1080, 0],
						},
					],
					ix: 2,
					l: 2,
				},
				a: {
					a: 0,
					k: [0, 0, 0],
					ix: 1,
					l: 2,
				},
				s: {
					a: 0,
					k: [138.791, 100, 100],
					ix: 6,
					l: 2,
				},
			},
			ao: 0,
			shapes: [
				{
					ty: 'gr',
					it: [
						{
							ty: 'rc',
							d: 1,
							s: {
								a: 0,
								k: [4040, 2304],
								ix: 2,
							},
							p: {
								a: 0,
								k: [0, 0],
								ix: 3,
							},
							r: {
								a: 0,
								k: 0,
								ix: 4,
							},
							nm: 'Rectangle Path 1',
							mn: 'ADBE Vector Shape - Rect',
							hd: false,
						},
						{
							ty: 'st',
							c: {
								a: 0,
								k: [1, 1, 1, 1],
								ix: 3,
							},
							o: {
								a: 0,
								k: 100,
								ix: 4,
							},
							w: {
								a: 0,
								k: 0,
								ix: 5,
							},
							lc: 1,
							lj: 1,
							ml: 4,
							bm: 0,
							nm: 'Stroke 1',
							mn: 'ADBE Vector Graphic - Stroke',
							hd: false,
						},
						{
							ty: 'fl',
							c: {
								a: 0,
								k: [0.188235309077, 0.207843152214, 0.427451010311, 1],
								ix: 4,
							},
							o: {
								a: 0,
								k: 100,
								ix: 5,
							},
							r: 1,
							bm: 0,
							nm: 'Fill 1',
							mn: 'ADBE Vector Graphic - Fill',
							hd: false,
						},
						{
							ty: 'tr',
							p: {
								a: 0,
								k: [-32, -8],
								ix: 2,
							},
							a: {
								a: 0,
								k: [0, 0],
								ix: 1,
							},
							s: {
								a: 0,
								k: [100, 100],
								ix: 3,
							},
							r: {
								a: 0,
								k: 0,
								ix: 6,
							},
							o: {
								a: 0,
								k: 100,
								ix: 7,
							},
							sk: {
								a: 0,
								k: 0,
								ix: 4,
							},
							sa: {
								a: 0,
								k: 0,
								ix: 5,
							},
							nm: 'Transformieren',
						},
					],
					nm: 'Rectangle 1',
					np: 3,
					cix: 2,
					bm: 0,
					ix: 1,
					mn: 'ADBE Vector Group',
					hd: false,
				},
			],
			ip: 46,
			op: 258,
			st: 46,
			bm: 0,
		},
		{
			ddd: 0,
			ind: 7,
			ty: 4,
			nm: 'Dynimscher Text Controller',
			sr: 1,
			ks: {
				o: {
					a: 0,
					k: 100,
					ix: 11,
				},
				r: {
					a: 0,
					k: 0,
					ix: 10,
				},
				p: {
					a: 0,
					k: [1920, 1404, 0],
					ix: 2,
					l: 2,
				},
				a: {
					a: 0,
					k: [0, 0, 0],
					ix: 1,
					l: 2,
				},
				s: {
					a: 0,
					k: [100, 100, 100],
					ix: 6,
					l: 2,
				},
			},
			ao: 0,
			ef: [
				{
					ty: 5,
					nm: 'x size',
					np: 3,
					mn: 'ADBE Slider Control',
					ix: 1,
					en: 1,
					ef: [
						{
							ty: 0,
							nm: 'Schieberegler',
							mn: 'ADBE Slider Control-0001',
							ix: 1,
							v: {
								a: 0,
								k: 1450,
								ix: 1,
							},
						},
					],
				},
				{
					ty: 5,
					nm: 'y size ',
					np: 3,
					mn: 'ADBE Slider Control',
					ix: 2,
					en: 1,
					ef: [
						{
							ty: 0,
							nm: 'Schieberegler',
							mn: 'ADBE Slider Control-0001',
							ix: 1,
							v: {
								a: 0,
								k: 603,
								ix: 1,
							},
						},
					],
				},
			],
			shapes: [
				{
					ty: 'gr',
					it: [
						{
							ty: 'rc',
							d: 1,
							s: {
								a: 0,
								k: [3840, 2160],
								ix: 2,
								x: "var $bm_rt;\n$bm_rt = [\n    effect('x size')(1).value,\n    effect('y size ')(1).value\n];",
							},
							p: {
								a: 0,
								k: [0, 0],
								ix: 3,
							},
							r: {
								a: 0,
								k: 0,
								ix: 4,
							},
							nm: 'Rectangle Path 1',
							mn: 'ADBE Vector Shape - Rect',
							hd: false,
						},
						{
							ty: 'st',
							c: {
								a: 0,
								k: [1, 1, 1, 1],
								ix: 3,
							},
							o: {
								a: 0,
								k: 100,
								ix: 4,
							},
							w: {
								a: 0,
								k: 0,
								ix: 5,
							},
							lc: 1,
							lj: 1,
							ml: 4,
							bm: 0,
							nm: 'Stroke 1',
							mn: 'ADBE Vector Graphic - Stroke',
							hd: false,
						},
						{
							ty: 'fl',
							c: {
								a: 0,
								k: [0.172548540901, 1, 0, 1],
								ix: 4,
							},
							o: {
								a: 0,
								k: 100,
								ix: 5,
							},
							r: 1,
							bm: 0,
							nm: 'Fill 1',
							mn: 'ADBE Vector Graphic - Fill',
							hd: false,
						},
						{
							ty: 'tr',
							p: {
								a: 0,
								k: [0, 0],
								ix: 2,
							},
							a: {
								a: 0,
								k: [0, 0],
								ix: 1,
							},
							s: {
								a: 0,
								k: [100, 100],
								ix: 3,
							},
							r: {
								a: 0,
								k: 0,
								ix: 6,
							},
							o: {
								a: 0,
								k: 100,
								ix: 7,
							},
							sk: {
								a: 0,
								k: 0,
								ix: 4,
							},
							sa: {
								a: 0,
								k: 0,
								ix: 5,
							},
							nm: 'Transformieren',
						},
					],
					nm: 'Rectangle 1',
					np: 3,
					cix: 2,
					bm: 0,
					ix: 1,
					mn: 'ADBE Vector Group',
					hd: false,
				},
			],
			ip: 53,
			op: 212,
			st: 0,
			bm: 0,
		},
	],
	markers: [],
};

const LottieInitializationBugfix = () => {
	const {height, width} = useVideoConfig();

	return (
		<AbsoluteFill style={{height, width}}>
			<Lottie
				loop
				animationData={lottie}
				playbackRate={1}
				style={{height: 500}}
			/>
		</AbsoluteFill>
	);
};

export default LottieInitializationBugfix;
