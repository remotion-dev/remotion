import type {TranscriptionJson} from '../transcribe';

export const examplePayload: TranscriptionJson<true> = {
	systeminfo:
		'AVX = 0 | AVX2 = 0 | AVX512 = 0 | FMA = 0 | NEON = 1 | ARM_FMA = 1 | METAL = 1 | F16C = 0 | FP16_VA = 1 | WASM_SIMD = 0 | BLAS = 1 | SSE3 = 0 | SSSE3 = 0 | VSX = 0 | CUDA = 0 | COREML = 0 | OPENVINO = 0',
	model: {
		type: 'medium',
		multilingual: false,
		vocab: 51864,
		audio: {
			ctx: 1500,
			state: 1024,
			head: 16,
			layer: 24,
		},
		text: {
			ctx: 448,
			state: 1024,
			head: 16,
			layer: 24,
		},
		mels: 80,
		ftype: 1,
	},
	params: {
		model:
			'/Users/jonathanburger/template-tiktok/whisper.cpp/ggml-medium.en.bin',
		language: 'en',
		translate: false,
	},
	result: {
		language: 'en',
	},
	transcription: [
		{
			timestamps: {
				from: '00:00:00,000',
				to: '00:00:00,040',
			},
			offsets: {
				from: 0,
				to: 40,
			},
			text: '',
			tokens: [
				{
					text: '[_BEG_]',
					timestamps: {
						from: '00:00:00,000',
						to: '00:00:00,000',
					},
					offsets: {
						from: 0,
						to: 0,
					},
					id: 50363,
					p: 0.985677,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:00,040',
				to: '00:00:00,420',
			},
			offsets: {
				from: 40,
				to: 420,
			},
			text: ' William',
			tokens: [
				{
					text: ' William',
					timestamps: {
						from: '00:00:00,040',
						to: '00:00:00,400',
					},
					offsets: {
						from: 40,
						to: 400,
					},
					id: 3977,
					p: 0.813602,
					t_dtw: 24,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:00,420',
				to: '00:00:00,650',
			},
			offsets: {
				from: 420,
				to: 650,
			},
			text: ' just',
			tokens: [
				{
					text: ' just',
					timestamps: {
						from: '00:00:00,420',
						to: '00:00:00,640',
					},
					offsets: {
						from: 420,
						to: 640,
					},
					id: 655,
					p: 0.990905,
					t_dtw: 48,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:00,650',
				to: '00:00:00,810',
			},
			offsets: {
				from: 650,
				to: 810,
			},
			text: ' hit',
			tokens: [
				{
					text: ' hit',
					timestamps: {
						from: '00:00:00,650',
						to: '00:00:00,810',
					},
					offsets: {
						from: 650,
						to: 810,
					},
					id: 2277,
					p: 0.981798,
					t_dtw: 70,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:00,810',
				to: '00:00:01,330',
			},
			offsets: {
				from: 810,
				to: 1330,
			},
			text: ' 100',
			tokens: [
				{
					text: ' 100',
					timestamps: {
						from: '00:00:00,810',
						to: '00:00:01,330',
					},
					offsets: {
						from: 810,
						to: 1330,
					},
					id: 1802,
					p: 0.905842,
					t_dtw: 130,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:01,330',
				to: '00:00:01,440',
			},
			offsets: {
				from: 1330,
				to: 1440,
			},
			text: ',',
			tokens: [
				{
					text: ',',
					timestamps: {
						from: '00:00:01,330',
						to: '00:00:01,440',
					},
					offsets: {
						from: 1330,
						to: 1440,
					},
					id: 11,
					p: 0.618664,
					t_dtw: 130,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:01,440',
				to: '00:00:01,950',
			},
			offsets: {
				from: 1440,
				to: 1950,
			},
			text: '000',
			tokens: [
				{
					text: '000',
					timestamps: {
						from: '00:00:01,440',
						to: '00:00:01,950',
					},
					offsets: {
						from: 1440,
						to: 1950,
					},
					id: 830,
					p: 0.995966,
					t_dtw: 186,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:01,950',
				to: '00:00:02,370',
			},
			offsets: {
				from: 1950,
				to: 2370,
			},
			text: ' YouTube',
			tokens: [
				{
					text: ' YouTube',
					timestamps: {
						from: '00:00:01,950',
						to: '00:00:02,370',
					},
					offsets: {
						from: 1950,
						to: 2370,
					},
					id: 7444,
					p: 0.698392,
					t_dtw: 222,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:02,370',
				to: '00:00:03,060',
			},
			offsets: {
				from: 2370,
				to: 3060,
			},
			text: ' subscribers',
			tokens: [
				{
					text: ' subscribers',
					timestamps: {
						from: '00:00:02,370',
						to: '00:00:03,040',
					},
					offsets: {
						from: 2370,
						to: 3040,
					},
					id: 18327,
					p: 0.927405,
					t_dtw: 294,
				},
				{
					text: '[_TT_153]',
					timestamps: {
						from: '00:00:03,060',
						to: '00:00:03,060',
					},
					offsets: {
						from: 3060,
						to: 3060,
					},
					id: 50516,
					p: 0.0263562,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:03,060',
				to: '00:00:03,190',
			},
			offsets: {
				from: 3060,
				to: 3190,
			},
			text: ' And',
			tokens: [
				{
					text: ' And',
					timestamps: {
						from: '00:00:03,070',
						to: '00:00:03,190',
					},
					offsets: {
						from: 3070,
						to: 3190,
					},
					id: 843,
					p: 0.435101,
					t_dtw: 324,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:03,190',
				to: '00:00:03,280',
			},
			offsets: {
				from: 3190,
				to: 3280,
			},
			text: ' we',
			tokens: [
				{
					text: ' we',
					timestamps: {
						from: '00:00:03,190',
						to: '00:00:03,280',
					},
					offsets: {
						from: 3190,
						to: 3280,
					},
					id: 356,
					p: 0.994909,
					t_dtw: 332,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:03,280',
				to: '00:00:03,410',
			},
			offsets: {
				from: 3280,
				to: 3410,
			},
			text: ' are',
			tokens: [
				{
					text: ' are',
					timestamps: {
						from: '00:00:03,280',
						to: '00:00:03,400',
					},
					offsets: {
						from: 3280,
						to: 3400,
					},
					id: 389,
					p: 0.785304,
					t_dtw: 342,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:03,410',
				to: '00:00:03,630',
			},
			offsets: {
				from: 3410,
				to: 3630,
			},
			text: ' going',
			tokens: [
				{
					text: ' going',
					timestamps: {
						from: '00:00:03,410',
						to: '00:00:03,630',
					},
					offsets: {
						from: 3410,
						to: 3630,
					},
					id: 1016,
					p: 0.992839,
					t_dtw: 358,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:03,630',
				to: '00:00:03,710',
			},
			offsets: {
				from: 3630,
				to: 3710,
			},
			text: ' to',
			tokens: [
				{
					text: ' to',
					timestamps: {
						from: '00:00:03,630',
						to: '00:00:03,700',
					},
					offsets: {
						from: 3630,
						to: 3700,
					},
					id: 284,
					p: 0.995103,
					t_dtw: 376,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:03,710',
				to: '00:00:04,130',
			},
			offsets: {
				from: 3710,
				to: 4130,
			},
			text: ' celebrate',
			tokens: [
				{
					text: ' celebrate',
					timestamps: {
						from: '00:00:03,710',
						to: '00:00:04,130',
					},
					offsets: {
						from: 3710,
						to: 4130,
					},
					id: 10648,
					p: 0.997354,
					t_dtw: 410,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:04,130',
				to: '00:00:04,340',
			},
			offsets: {
				from: 4130,
				to: 4340,
			},
			text: ' that',
			tokens: [
				{
					text: ' that',
					timestamps: {
						from: '00:00:04,130',
						to: '00:00:04,330',
					},
					offsets: {
						from: 4130,
						to: 4330,
					},
					id: 326,
					p: 0.972099,
					t_dtw: 434,
				},
				{
					text: '[_TT_217]',
					timestamps: {
						from: '00:00:04,340',
						to: '00:00:04,340',
					},
					offsets: {
						from: 4340,
						to: 4340,
					},
					id: 50580,
					p: 0.0399704,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:04,340',
				to: '00:00:04,500',
			},
			offsets: {
				from: 4340,
				to: 4500,
			},
			text: ' We',
			tokens: [
				{
					text: ' We',
					timestamps: {
						from: '00:00:04,340',
						to: '00:00:04,500',
					},
					offsets: {
						from: 4340,
						to: 4500,
					},
					id: 775,
					p: 0.925618,
					t_dtw: 450,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:04,500',
				to: '00:00:05,140',
			},
			offsets: {
				from: 4500,
				to: 5140,
			},
			text: ' thought',
			tokens: [
				{
					text: ' thought',
					timestamps: {
						from: '00:00:04,500',
						to: '00:00:05,020',
					},
					offsets: {
						from: 4500,
						to: 5020,
					},
					id: 1807,
					p: 0.986568,
					t_dtw: 470,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:05,140',
				to: '00:00:05,480',
			},
			offsets: {
				from: 5140,
				to: 5480,
			},
			text: ' about',
			tokens: [
				{
					text: ' about',
					timestamps: {
						from: '00:00:05,140',
						to: '00:00:05,480',
					},
					offsets: {
						from: 5140,
						to: 5480,
					},
					id: 546,
					p: 0.991344,
					t_dtw: 510,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:05,480',
				to: '00:00:05,660',
			},
			offsets: {
				from: 5480,
				to: 5660,
			},
			text: ' to',
			tokens: [
				{
					text: ' to',
					timestamps: {
						from: '00:00:05,480',
						to: '00:00:05,660',
					},
					offsets: {
						from: 5480,
						to: 5660,
					},
					id: 284,
					p: 0.670054,
					t_dtw: 542,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:05,660',
				to: '00:00:05,980',
			},
			offsets: {
				from: 5660,
				to: 5980,
			},
			text: ' bake',
			tokens: [
				{
					text: ' bake',
					timestamps: {
						from: '00:00:05,660',
						to: '00:00:05,980',
					},
					offsets: {
						from: 5660,
						to: 5980,
					},
					id: 28450,
					p: 0.773721,
					t_dtw: 592,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:05,980',
				to: '00:00:06,080',
			},
			offsets: {
				from: 5980,
				to: 6080,
			},
			text: ' a',
			tokens: [
				{
					text: ' a',
					timestamps: {
						from: '00:00:05,980',
						to: '00:00:06,000',
					},
					offsets: {
						from: 5980,
						to: 6000,
					},
					id: 257,
					p: 0.997394,
					t_dtw: 614,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:06,080',
				to: '00:00:06,400',
			},
			offsets: {
				from: 6080,
				to: 6400,
			},
			text: ' cake',
			tokens: [
				{
					text: ' cake',
					timestamps: {
						from: '00:00:06,080',
						to: '00:00:06,390',
					},
					offsets: {
						from: 6080,
						to: 6390,
					},
					id: 12187,
					p: 0.99874,
					t_dtw: 640,
				},
				{
					text: '[_TT_320]',
					timestamps: {
						from: '00:00:06,400',
						to: '00:00:06,400',
					},
					offsets: {
						from: 6400,
						to: 6400,
					},
					id: 50683,
					p: 0.108575,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:06,400',
				to: '00:00:06,540',
			},
			offsets: {
				from: 6400,
				to: 6540,
			},
			text: ' We',
			tokens: [
				{
					text: ' We',
					timestamps: {
						from: '00:00:06,470',
						to: '00:00:06,540',
					},
					offsets: {
						from: 6470,
						to: 6540,
					},
					id: 775,
					p: 0.98349,
					t_dtw: 656,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:06,540',
				to: '00:00:06,900',
			},
			offsets: {
				from: 6540,
				to: 6900,
			},
			text: ' found',
			tokens: [
				{
					text: ' found',
					timestamps: {
						from: '00:00:06,540',
						to: '00:00:06,820',
					},
					offsets: {
						from: 6540,
						to: 6820,
					},
					id: 1043,
					p: 0.645891,
					t_dtw: 680,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:06,900',
				to: '00:00:07,200',
			},
			offsets: {
				from: 6900,
				to: 7200,
			},
			text: ' this',
			tokens: [
				{
					text: ' this',
					timestamps: {
						from: '00:00:06,900',
						to: '00:00:07,200',
					},
					offsets: {
						from: 6900,
						to: 7200,
					},
					id: 428,
					p: 0.995186,
					t_dtw: 712,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:07,200',
				to: '00:00:07,390',
			},
			offsets: {
				from: 7200,
				to: 7390,
			},
			text: ' and',
			tokens: [
				{
					text: ' and',
					timestamps: {
						from: '00:00:07,200',
						to: '00:00:07,390',
					},
					offsets: {
						from: 7200,
						to: 7390,
					},
					id: 290,
					p: 0.734184,
					t_dtw: 736,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:07,390',
				to: '00:00:07,510',
			},
			offsets: {
				from: 7390,
				to: 7510,
			},
			text: ' it',
			tokens: [
				{
					text: ' it',
					timestamps: {
						from: '00:00:07,390',
						to: '00:00:07,510',
					},
					offsets: {
						from: 7390,
						to: 7510,
					},
					id: 340,
					p: 0.985816,
					t_dtw: 750,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:07,510',
				to: '00:00:08,030',
			},
			offsets: {
				from: 7510,
				to: 8030,
			},
			text: ' reminded',
			tokens: [
				{
					text: ' reminded',
					timestamps: {
						from: '00:00:07,510',
						to: '00:00:07,970',
					},
					offsets: {
						from: 7510,
						to: 7970,
					},
					id: 14516,
					p: 0.991611,
					t_dtw: 778,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:08,030',
				to: '00:00:08,170',
			},
			offsets: {
				from: 8030,
				to: 8170,
			},
			text: ' us',
			tokens: [
				{
					text: ' us',
					timestamps: {
						from: '00:00:08,030',
						to: '00:00:08,100',
					},
					offsets: {
						from: 8030,
						to: 8100,
					},
					id: 514,
					p: 0.979679,
					t_dtw: 804,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:08,170',
				to: '00:00:08,260',
			},
			offsets: {
				from: 8170,
				to: 8260,
			},
			text: ' of',
			tokens: [
				{
					text: ' of',
					timestamps: {
						from: '00:00:08,170',
						to: '00:00:08,260',
					},
					offsets: {
						from: 8170,
						to: 8260,
					},
					id: 286,
					p: 0.991291,
					t_dtw: 824,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:08,260',
				to: '00:00:08,740',
			},
			offsets: {
				from: 8260,
				to: 8740,
			},
			text: ' William',
			tokens: [
				{
					text: ' William',
					timestamps: {
						from: '00:00:08,260',
						to: '00:00:08,680',
					},
					offsets: {
						from: 8260,
						to: 8680,
					},
					id: 3977,
					p: 0.988061,
					t_dtw: 852,
				},
				{
					text: '[_TT_437]',
					timestamps: {
						from: '00:00:08,740',
						to: '00:00:08,740',
					},
					offsets: {
						from: 8740,
						to: 8740,
					},
					id: 50800,
					p: 0.13584,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:08,740',
				to: '00:00:08,850',
			},
			offsets: {
				from: 8740,
				to: 8850,
			},
			text: ' We',
			tokens: [
				{
					text: ' We',
					timestamps: {
						from: '00:00:08,740',
						to: '00:00:08,850',
					},
					offsets: {
						from: 8740,
						to: 8850,
					},
					id: 775,
					p: 0.97587,
					t_dtw: 894,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:08,850',
				to: '00:00:09,080',
			},
			offsets: {
				from: 8850,
				to: 9080,
			},
			text: ' hope',
			tokens: [
				{
					text: ' hope',
					timestamps: {
						from: '00:00:08,850',
						to: '00:00:09,080',
					},
					offsets: {
						from: 8850,
						to: 9080,
					},
					id: 2911,
					p: 0.980928,
					t_dtw: 922,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:09,080',
				to: '00:00:09,190',
			},
			offsets: {
				from: 9080,
				to: 9190,
			},
			text: ' he',
			tokens: [
				{
					text: ' he',
					timestamps: {
						from: '00:00:09,080',
						to: '00:00:09,190',
					},
					offsets: {
						from: 9080,
						to: 9190,
					},
					id: 339,
					p: 0.980759,
					t_dtw: 942,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:09,190',
				to: '00:00:09,420',
			},
			offsets: {
				from: 9190,
				to: 9420,
			},
			text: ' will',
			tokens: [
				{
					text: ' will',
					timestamps: {
						from: '00:00:09,190',
						to: '00:00:09,420',
					},
					offsets: {
						from: 9190,
						to: 9420,
					},
					id: 481,
					p: 0.966704,
					t_dtw: 956,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:09,420',
				to: '00:00:09,650',
			},
			offsets: {
				from: 9420,
				to: 9650,
			},
			text: ' like',
			tokens: [
				{
					text: ' like',
					timestamps: {
						from: '00:00:09,420',
						to: '00:00:09,650',
					},
					offsets: {
						from: 9420,
						to: 9650,
					},
					id: 588,
					p: 0.998513,
					t_dtw: 968,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:09,650',
				to: '00:00:09,820',
			},
			offsets: {
				from: 9650,
				to: 9820,
			},
			text: ' the',
			tokens: [
				{
					text: ' the',
					timestamps: {
						from: '00:00:09,650',
						to: '00:00:09,820',
					},
					offsets: {
						from: 9650,
						to: 9820,
					},
					id: 262,
					p: 0.992256,
					t_dtw: 986,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:09,820',
				to: '00:00:10,100',
			},
			offsets: {
				from: 9820,
				to: 10100,
			},
			text: ' cake',
			tokens: [
				{
					text: ' cake',
					timestamps: {
						from: '00:00:09,820',
						to: '00:00:10,050',
					},
					offsets: {
						from: 9820,
						to: 10050,
					},
					id: 12187,
					p: 0.998913,
					t_dtw: 1008,
				},
				{
					text: '[_TT_505]',
					timestamps: {
						from: '00:00:10,100',
						to: '00:00:10,100',
					},
					offsets: {
						from: 10100,
						to: 10100,
					},
					id: 50868,
					p: 0.173181,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:10,100',
				to: '00:00:10,220',
			},
			offsets: {
				from: 10100,
				to: 10220,
			},
			text: ' Let',
			tokens: [
				{
					text: ' Let',
					timestamps: {
						from: '00:00:10,150',
						to: '00:00:10,220',
					},
					offsets: {
						from: 10150,
						to: 10220,
					},
					id: 3914,
					p: 0.839139,
					t_dtw: 1028,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:10,220',
				to: '00:00:10,300',
			},
			offsets: {
				from: 10220,
				to: 10300,
			},
			text: "'s",
			tokens: [
				{
					text: "'s",
					timestamps: {
						from: '00:00:10,220',
						to: '00:00:10,300',
					},
					offsets: {
						from: 10220,
						to: 10300,
					},
					id: 338,
					p: 0.986745,
					t_dtw: 1030,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:10,300',
				to: '00:00:10,570',
			},
			offsets: {
				from: 10300,
				to: 10570,
			},
			text: ' start',
			tokens: [
				{
					text: ' start',
					timestamps: {
						from: '00:00:10,300',
						to: '00:00:10,490',
					},
					offsets: {
						from: 10300,
						to: 10490,
					},
					id: 923,
					p: 0.998723,
					t_dtw: 1046,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:10,570',
				to: '00:00:10,700',
			},
			offsets: {
				from: 10570,
				to: 10700,
			},
			text: ' with',
			tokens: [
				{
					text: ' with',
					timestamps: {
						from: '00:00:10,570',
						to: '00:00:10,650',
					},
					offsets: {
						from: 10570,
						to: 10650,
					},
					id: 351,
					p: 0.979182,
					t_dtw: 1058,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:10,700',
				to: '00:00:10,780',
			},
			offsets: {
				from: 10700,
				to: 10780,
			},
			text: ' the',
			tokens: [
				{
					text: ' the',
					timestamps: {
						from: '00:00:10,700',
						to: '00:00:10,780',
					},
					offsets: {
						from: 10700,
						to: 10780,
					},
					id: 262,
					p: 0.783687,
					t_dtw: 1068,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:10,780',
				to: '00:00:11,000',
			},
			offsets: {
				from: 10780,
				to: 11000,
			},
			text: ' dough',
			tokens: [
				{
					text: ' dough',
					timestamps: {
						from: '00:00:10,780',
						to: '00:00:10,960',
					},
					offsets: {
						from: 10780,
						to: 10960,
					},
					id: 15756,
					p: 0.999567,
					t_dtw: 1096,
				},
				{
					text: '[_TT_550]',
					timestamps: {
						from: '00:00:11,000',
						to: '00:00:11,000',
					},
					offsets: {
						from: 11000,
						to: 11000,
					},
					id: 50913,
					p: 0.112675,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:11,000',
				to: '00:00:11,120',
			},
			offsets: {
				from: 11000,
				to: 11120,
			},
			text: ' By',
			tokens: [
				{
					text: ' By',
					timestamps: {
						from: '00:00:11,020',
						to: '00:00:11,120',
					},
					offsets: {
						from: 11020,
						to: 11120,
					},
					id: 2750,
					p: 0.702289,
					t_dtw: 1120,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:11,120',
				to: '00:00:11,550',
			},
			offsets: {
				from: 11120,
				to: 11550,
			},
			text: ' putting',
			tokens: [
				{
					text: ' putting',
					timestamps: {
						from: '00:00:11,120',
						to: '00:00:11,550',
					},
					offsets: {
						from: 11120,
						to: 11550,
					},
					id: 5137,
					p: 0.993055,
					t_dtw: 1144,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:11,550',
				to: '00:00:11,790',
			},
			offsets: {
				from: 11550,
				to: 11790,
			},
			text: ' some',
			tokens: [
				{
					text: ' some',
					timestamps: {
						from: '00:00:11,550',
						to: '00:00:11,790',
					},
					offsets: {
						from: 11550,
						to: 11790,
					},
					id: 617,
					p: 0.961067,
					t_dtw: 1164,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:11,790',
				to: '00:00:12,180',
			},
			offsets: {
				from: 11790,
				to: 12180,
			},
			text: ' butter',
			tokens: [
				{
					text: ' butter',
					timestamps: {
						from: '00:00:11,790',
						to: '00:00:12,130',
					},
					offsets: {
						from: 11790,
						to: 12130,
					},
					id: 9215,
					p: 0.997908,
					t_dtw: 1206,
				},
				{
					text: '[_TT_609]',
					timestamps: {
						from: '00:00:12,180',
						to: '00:00:12,180',
					},
					offsets: {
						from: 12180,
						to: 12180,
					},
					id: 50972,
					p: 0.0746723,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:12,180',
				to: '00:00:12,750',
			},
			offsets: {
				from: 12180,
				to: 12750,
			},
			text: ' Some',
			tokens: [
				{
					text: ' Some',
					timestamps: {
						from: '00:00:12,180',
						to: '00:00:12,710',
					},
					offsets: {
						from: 12180,
						to: 12710,
					},
					id: 2773,
					p: 0.960155,
					t_dtw: 1286,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:12,750',
				to: '00:00:13,380',
			},
			offsets: {
				from: 12750,
				to: 13380,
			},
			text: ' sugar',
			tokens: [
				{
					text: ' sugar',
					timestamps: {
						from: '00:00:12,750',
						to: '00:00:13,310',
					},
					offsets: {
						from: 12750,
						to: 13310,
					},
					id: 7543,
					p: 0.998098,
					t_dtw: 1330,
				},
				{
					text: '[_TT_669]',
					timestamps: {
						from: '00:00:13,380',
						to: '00:00:13,380',
					},
					offsets: {
						from: 13380,
						to: 13380,
					},
					id: 51032,
					p: 0.222226,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:13,380',
				to: '00:00:14,580',
			},
			offsets: {
				from: 13380,
				to: 14580,
			},
			text: ' Eggs',
			tokens: [
				{
					text: ' Eggs',
					timestamps: {
						from: '00:00:13,410',
						to: '00:00:14,580',
					},
					offsets: {
						from: 13410,
						to: 14580,
					},
					id: 40433,
					p: 0.980398,
					t_dtw: 1436,
				},
				{
					text: '[_TT_729]',
					timestamps: {
						from: '00:00:14,580',
						to: '00:00:14,580',
					},
					offsets: {
						from: 14580,
						to: 14580,
					},
					id: 51092,
					p: 0.255994,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:14,580',
				to: '00:00:14,720',
			},
			offsets: {
				from: 14580,
				to: 14720,
			},
			text: ' No',
			tokens: [
				{
					text: ' No',
					timestamps: {
						from: '00:00:14,580',
						to: '00:00:14,720',
					},
					offsets: {
						from: 14580,
						to: 14720,
					},
					id: 1400,
					p: 0.991206,
					t_dtw: 1478,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:14,720',
				to: '00:00:15,440',
			},
			offsets: {
				from: 14720,
				to: 15440,
			},
			text: ' frameworks',
			tokens: [
				{
					text: ' frameworks',
					timestamps: {
						from: '00:00:14,720',
						to: '00:00:15,350',
					},
					offsets: {
						from: 14720,
						to: 15350,
					},
					id: 29251,
					p: 0.896345,
					t_dtw: 1528,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:15,440',
				to: '00:00:15,550',
			},
			offsets: {
				from: 15440,
				to: 15550,
			},
			text: ',',
			tokens: [
				{
					text: ',',
					timestamps: {
						from: '00:00:15,440',
						to: '00:00:15,550',
					},
					offsets: {
						from: 15440,
						to: 15550,
					},
					id: 11,
					p: 0.706056,
					t_dtw: 1540,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:15,550',
				to: '00:00:15,790',
			},
			offsets: {
				from: 15550,
				to: 15790,
			},
			text: ' just',
			tokens: [
				{
					text: ' just',
					timestamps: {
						from: '00:00:15,550',
						to: '00:00:15,790',
					},
					offsets: {
						from: 15550,
						to: 15790,
					},
					id: 655,
					p: 0.996797,
					t_dtw: 1568,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:15,790',
				to: '00:00:16,220',
			},
			offsets: {
				from: 15790,
				to: 16220,
			},
			text: ' vanilla',
			tokens: [
				{
					text: ' vanilla',
					timestamps: {
						from: '00:00:15,790',
						to: '00:00:16,220',
					},
					offsets: {
						from: 15790,
						to: 16220,
					},
					id: 16858,
					p: 0.997364,
					t_dtw: 1610,
				},
				{
					text: '[_TT_811]',
					timestamps: {
						from: '00:00:16,220',
						to: '00:00:16,220',
					},
					offsets: {
						from: 16220,
						to: 16220,
					},
					id: 51174,
					p: 0.26567,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:16,220',
				to: '00:00:16,300',
			},
			offsets: {
				from: 16220,
				to: 16300,
			},
			text: ' P',
			tokens: [
				{
					text: ' P',
					timestamps: {
						from: '00:00:16,220',
						to: '00:00:16,300',
					},
					offsets: {
						from: 16220,
						to: 16300,
					},
					id: 350,
					p: 0.805697,
					t_dtw: 1638,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:16,300',
				to: '00:00:16,640',
			},
			offsets: {
				from: 16300,
				to: 16640,
			},
			text: 'inch',
			tokens: [
				{
					text: 'inch',
					timestamps: {
						from: '00:00:16,300',
						to: '00:00:16,640',
					},
					offsets: {
						from: 16300,
						to: 16640,
					},
					id: 8589,
					p: 0.9998,
					t_dtw: 1644,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:16,640',
				to: '00:00:16,810',
			},
			offsets: {
				from: 16640,
				to: 16810,
			},
			text: ' of',
			tokens: [
				{
					text: ' of',
					timestamps: {
						from: '00:00:16,640',
						to: '00:00:16,810',
					},
					offsets: {
						from: 16640,
						to: 16810,
					},
					id: 286,
					p: 0.999039,
					t_dtw: 1658,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:16,810',
				to: '00:00:17,180',
			},
			offsets: {
				from: 16810,
				to: 17180,
			},
			text: ' salt',
			tokens: [
				{
					text: ' salt',
					timestamps: {
						from: '00:00:16,810',
						to: '00:00:17,180',
					},
					offsets: {
						from: 16810,
						to: 17180,
					},
					id: 8268,
					p: 0.998296,
					t_dtw: 1708,
				},
				{
					text: '[_TT_859]',
					timestamps: {
						from: '00:00:17,180',
						to: '00:00:17,180',
					},
					offsets: {
						from: 17180,
						to: 17180,
					},
					id: 51222,
					p: 0.201491,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:17,180',
				to: '00:00:17,480',
			},
			offsets: {
				from: 17180,
				to: 17480,
			},
			text: ' Some',
			tokens: [
				{
					text: ' Some',
					timestamps: {
						from: '00:00:17,180',
						to: '00:00:17,480',
					},
					offsets: {
						from: 17180,
						to: 17480,
					},
					id: 2773,
					p: 0.990495,
					t_dtw: 1744,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:17,480',
				to: '00:00:17,700',
			},
			offsets: {
				from: 17480,
				to: 17700,
			},
			text: ' Nut',
			tokens: [
				{
					text: ' Nut',
					timestamps: {
						from: '00:00:17,480',
						to: '00:00:17,700',
					},
					offsets: {
						from: 17480,
						to: 17700,
					},
					id: 11959,
					p: 0.849301,
					t_dtw: 1778,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:17,700',
				to: '00:00:18,020',
			},
			offsets: {
				from: 17700,
				to: 18020,
			},
			text: 'ella',
			tokens: [
				{
					text: 'ella',
					timestamps: {
						from: '00:00:17,700',
						to: '00:00:18,010',
					},
					offsets: {
						from: 17700,
						to: 18010,
					},
					id: 12627,
					p: 0.99975,
					t_dtw: 1792,
				},
				{
					text: '[_TT_901]',
					timestamps: {
						from: '00:00:18,020',
						to: '00:00:18,020',
					},
					offsets: {
						from: 18020,
						to: 18020,
					},
					id: 51264,
					p: 0.231096,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:18,020',
				to: '00:00:18,280',
			},
			offsets: {
				from: 18020,
				to: 18280,
			},
			text: ' Some',
			tokens: [
				{
					text: ' Some',
					timestamps: {
						from: '00:00:18,020',
						to: '00:00:18,280',
					},
					offsets: {
						from: 18020,
						to: 18280,
					},
					id: 2773,
					p: 0.997075,
					t_dtw: 1830,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:18,280',
				to: '00:00:18,880',
			},
			offsets: {
				from: 18280,
				to: 18880,
			},
			text: ' chocolate',
			tokens: [
				{
					text: ' chocolate',
					timestamps: {
						from: '00:00:18,280',
						to: '00:00:18,850',
					},
					offsets: {
						from: 18280,
						to: 18850,
					},
					id: 11311,
					p: 0.997333,
					t_dtw: 1868,
				},
				{
					text: '[_TT_944]',
					timestamps: {
						from: '00:00:18,880',
						to: '00:00:18,880',
					},
					offsets: {
						from: 18880,
						to: 18880,
					},
					id: 51307,
					p: 0.316681,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:18,880',
				to: '00:00:18,980',
			},
			offsets: {
				from: 18880,
				to: 18980,
			},
			text: ' B',
			tokens: [
				{
					text: ' B',
					timestamps: {
						from: '00:00:18,890',
						to: '00:00:18,890',
					},
					offsets: {
						from: 18890,
						to: 18890,
					},
					id: 347,
					p: 0.989352,
					t_dtw: 1912,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:18,980',
				to: '00:00:19,420',
			},
			offsets: {
				from: 18980,
				to: 19420,
			},
			text: 'aking',
			tokens: [
				{
					text: 'aking',
					timestamps: {
						from: '00:00:18,980',
						to: '00:00:19,420',
					},
					offsets: {
						from: 18980,
						to: 19420,
					},
					id: 868,
					p: 0.999874,
					t_dtw: 1928,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:19,420',
				to: '00:00:19,980',
			},
			offsets: {
				from: 19420,
				to: 19980,
			},
			text: ' powder',
			tokens: [
				{
					text: ' powder',
					timestamps: {
						from: '00:00:19,420',
						to: '00:00:19,850',
					},
					offsets: {
						from: 19420,
						to: 19850,
					},
					id: 11913,
					p: 0.988638,
					t_dtw: 1976,
				},
				{
					text: '[_TT_999]',
					timestamps: {
						from: '00:00:19,980',
						to: '00:00:19,980',
					},
					offsets: {
						from: 19980,
						to: 19980,
					},
					id: 51362,
					p: 0.0635509,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:19,980',
				to: '00:00:20,500',
			},
			offsets: {
				from: 19980,
				to: 20500,
			},
			text: ' And',
			tokens: [
				{
					text: ' And',
					timestamps: {
						from: '00:00:19,980',
						to: '00:00:20,500',
					},
					offsets: {
						from: 19980,
						to: 20500,
					},
					id: 843,
					p: 0.879935,
					t_dtw: 2068,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:20,500',
				to: '00:00:21,380',
			},
			offsets: {
				from: 20500,
				to: 21380,
			},
			text: ' flour',
			tokens: [
				{
					text: ' flour',
					timestamps: {
						from: '00:00:20,500',
						to: '00:00:21,380',
					},
					offsets: {
						from: 20500,
						to: 21380,
					},
					id: 10601,
					p: 0.99791,
					t_dtw: 2114,
				},
				{
					text: '[_TT_1069]',
					timestamps: {
						from: '00:00:21,380',
						to: '00:00:21,380',
					},
					offsets: {
						from: 21380,
						to: 21380,
					},
					id: 51432,
					p: 0.121151,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:21,380',
				to: '00:00:21,690',
			},
			offsets: {
				from: 21380,
				to: 21690,
			},
			text: ' Just',
			tokens: [
				{
					text: ' Just',
					timestamps: {
						from: '00:00:21,380',
						to: '00:00:21,620',
					},
					offsets: {
						from: 21380,
						to: 21620,
					},
					id: 2329,
					p: 0.997954,
					t_dtw: 2166,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:21,690',
				to: '00:00:22,120',
			},
			offsets: {
				from: 21690,
				to: 22120,
			},
			text: ' massage',
			tokens: [
				{
					text: ' massage',
					timestamps: {
						from: '00:00:21,690',
						to: '00:00:22,120',
					},
					offsets: {
						from: 21690,
						to: 22120,
					},
					id: 26900,
					p: 0.872665,
					t_dtw: 2206,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:22,120',
				to: '00:00:22,250',
			},
			offsets: {
				from: 22120,
				to: 22250,
			},
			text: ' in',
			tokens: [
				{
					text: ' in',
					timestamps: {
						from: '00:00:22,120',
						to: '00:00:22,250',
					},
					offsets: {
						from: 22120,
						to: 22250,
					},
					id: 287,
					p: 0.977942,
					t_dtw: 2238,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:22,250',
				to: '00:00:22,450',
			},
			offsets: {
				from: 22250,
				to: 22450,
			},
			text: ' the',
			tokens: [
				{
					text: ' the',
					timestamps: {
						from: '00:00:22,250',
						to: '00:00:22,450',
					},
					offsets: {
						from: 22250,
						to: 22450,
					},
					id: 262,
					p: 0.998631,
					t_dtw: 2250,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:22,450',
				to: '00:00:22,880',
			},
			offsets: {
				from: 22450,
				to: 22880,
			},
			text: ' butter',
			tokens: [
				{
					text: ' butter',
					timestamps: {
						from: '00:00:22,450',
						to: '00:00:22,880',
					},
					offsets: {
						from: 22450,
						to: 22880,
					},
					id: 9215,
					p: 0.990766,
					t_dtw: 2284,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:22,880',
				to: '00:00:23,000',
			},
			offsets: {
				from: 22880,
				to: 23000,
			},
			text: ' to',
			tokens: [
				{
					text: ' to',
					timestamps: {
						from: '00:00:22,880',
						to: '00:00:23,000',
					},
					offsets: {
						from: 22880,
						to: 23000,
					},
					id: 284,
					p: 0.8243,
					t_dtw: 2308,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:23,000',
				to: '00:00:23,250',
			},
			offsets: {
				from: 23000,
				to: 23250,
			},
			text: ' give',
			tokens: [
				{
					text: ' give',
					timestamps: {
						from: '00:00:23,000',
						to: '00:00:23,250',
					},
					offsets: {
						from: 23000,
						to: 23250,
					},
					id: 1577,
					p: 0.995406,
					t_dtw: 2318,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:23,250',
				to: '00:00:23,380',
			},
			offsets: {
				from: 23250,
				to: 23380,
			},
			text: ' it',
			tokens: [
				{
					text: ' it',
					timestamps: {
						from: '00:00:23,250',
						to: '00:00:23,370',
					},
					offsets: {
						from: 23250,
						to: 23370,
					},
					id: 340,
					p: 0.98815,
					t_dtw: 2332,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:23,380',
				to: '00:00:23,590',
			},
			offsets: {
				from: 23380,
				to: 23590,
			},
			text: ' the',
			tokens: [
				{
					text: ' the',
					timestamps: {
						from: '00:00:23,380',
						to: '00:00:23,450',
					},
					offsets: {
						from: 23380,
						to: 23450,
					},
					id: 262,
					p: 0.971258,
					t_dtw: 2342,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:23,590',
				to: '00:00:23,890',
			},
			offsets: {
				from: 23590,
				to: 23890,
			},
			text: ' full',
			tokens: [
				{
					text: ' full',
					timestamps: {
						from: '00:00:23,590',
						to: '00:00:23,760',
					},
					offsets: {
						from: 23590,
						to: 23760,
					},
					id: 1336,
					p: 0.997196,
					t_dtw: 2376,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:23,890',
				to: '00:00:24,380',
			},
			offsets: {
				from: 23890,
				to: 24380,
			},
			text: ' treatment',
			tokens: [
				{
					text: ' treatment',
					timestamps: {
						from: '00:00:23,890',
						to: '00:00:24,330',
					},
					offsets: {
						from: 23890,
						to: 24330,
					},
					id: 3513,
					p: 0.995463,
					t_dtw: 2428,
				},
				{
					text: '[_TT_1219]',
					timestamps: {
						from: '00:00:24,380',
						to: '00:00:24,380',
					},
					offsets: {
						from: 24380,
						to: 24380,
					},
					id: 51582,
					p: 0.326777,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:24,380',
				to: '00:00:24,740',
			},
			offsets: {
				from: 24380,
				to: 24740,
			},
			text: ' Fill',
			tokens: [
				{
					text: ' Fill',
					timestamps: {
						from: '00:00:24,460',
						to: '00:00:24,740',
					},
					offsets: {
						from: 24460,
						to: 24740,
					},
					id: 27845,
					p: 0.687774,
					t_dtw: 2454,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:24,740',
				to: '00:00:24,920',
			},
			offsets: {
				from: 24740,
				to: 24920,
			},
			text: ' it',
			tokens: [
				{
					text: ' it',
					timestamps: {
						from: '00:00:24,740',
						to: '00:00:24,900',
					},
					offsets: {
						from: 24740,
						to: 24900,
					},
					id: 340,
					p: 0.997333,
					t_dtw: 2470,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:24,920',
				to: '00:00:25,120',
			},
			offsets: {
				from: 24920,
				to: 25120,
			},
			text: ' in',
			tokens: [
				{
					text: ' in',
					timestamps: {
						from: '00:00:24,920',
						to: '00:00:25,110',
					},
					offsets: {
						from: 24920,
						to: 25110,
					},
					id: 287,
					p: 0.999275,
					t_dtw: 2532,
				},
				{
					text: '[_TT_1256]',
					timestamps: {
						from: '00:00:25,120',
						to: '00:00:25,120',
					},
					offsets: {
						from: 25120,
						to: 25120,
					},
					id: 51619,
					p: 0.20432,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:25,120',
				to: '00:00:25,570',
			},
			offsets: {
				from: 25120,
				to: 25570,
			},
			text: ' Bake',
			tokens: [
				{
					text: ' Bake',
					timestamps: {
						from: '00:00:25,120',
						to: '00:00:25,520',
					},
					offsets: {
						from: 25120,
						to: 25520,
					},
					id: 38493,
					p: 0.989514,
					t_dtw: 2610,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:25,570',
				to: '00:00:25,770',
			},
			offsets: {
				from: 25570,
				to: 25770,
			},
			text: ' it',
			tokens: [
				{
					text: ' it',
					timestamps: {
						from: '00:00:25,570',
						to: '00:00:25,750',
					},
					offsets: {
						from: 25570,
						to: 25750,
					},
					id: 340,
					p: 0.992267,
					t_dtw: 2630,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:25,770',
				to: '00:00:26,060',
			},
			offsets: {
				from: 25770,
				to: 26060,
			},
			text: ' for',
			tokens: [
				{
					text: ' for',
					timestamps: {
						from: '00:00:25,770',
						to: '00:00:26,060',
					},
					offsets: {
						from: 25770,
						to: 26060,
					},
					id: 329,
					p: 0.997626,
					t_dtw: 2648,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:26,060',
				to: '00:00:26,480',
			},
			offsets: {
				from: 26060,
				to: 26480,
			},
			text: ' half',
			tokens: [
				{
					text: ' half',
					timestamps: {
						from: '00:00:26,060',
						to: '00:00:26,480',
					},
					offsets: {
						from: 26060,
						to: 26480,
					},
					id: 2063,
					p: 0.986421,
					t_dtw: 2664,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:26,480',
				to: '00:00:26,690',
			},
			offsets: {
				from: 26480,
				to: 26690,
			},
			text: ' an',
			tokens: [
				{
					text: ' an',
					timestamps: {
						from: '00:00:26,480',
						to: '00:00:26,690',
					},
					offsets: {
						from: 26480,
						to: 26690,
					},
					id: 281,
					p: 0.976526,
					t_dtw: 2686,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:26,690',
				to: '00:00:27,110',
			},
			offsets: {
				from: 26690,
				to: 27110,
			},
			text: ' hour',
			tokens: [
				{
					text: ' hour',
					timestamps: {
						from: '00:00:26,690',
						to: '00:00:27,100',
					},
					offsets: {
						from: 26690,
						to: 27100,
					},
					id: 1711,
					p: 0.999798,
					t_dtw: 2706,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:27,110',
				to: '00:00:27,300',
			},
			offsets: {
				from: 27110,
				to: 27300,
			},
			text: ' at',
			tokens: [
				{
					text: ' at',
					timestamps: {
						from: '00:00:27,110',
						to: '00:00:27,300',
					},
					offsets: {
						from: 27110,
						to: 27300,
					},
					id: 379,
					p: 0.705765,
					t_dtw: 2740,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:27,300',
				to: '00:00:28,170',
			},
			offsets: {
				from: 27300,
				to: 28170,
			},
			text: ' 170',
			tokens: [
				{
					text: ' 170',
					timestamps: {
						from: '00:00:27,300',
						to: '00:00:28,100',
					},
					offsets: {
						from: 27300,
						to: 28100,
					},
					id: 16677,
					p: 0.996531,
					t_dtw: 2814,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:28,170',
				to: '00:00:28,800',
			},
			offsets: {
				from: 28170,
				to: 28800,
			},
			text: ' degrees',
			tokens: [
				{
					text: ' degrees',
					timestamps: {
						from: '00:00:28,170',
						to: '00:00:28,660',
					},
					offsets: {
						from: 28170,
						to: 28660,
					},
					id: 7370,
					p: 0.771685,
					t_dtw: 2860,
				},
				{
					text: '[_TT_1440]',
					timestamps: {
						from: '00:00:28,800',
						to: '00:00:28,800',
					},
					offsets: {
						from: 28800,
						to: 28800,
					},
					id: 51803,
					p: 0.37311,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:28,800',
				to: '00:00:28,850',
			},
			offsets: {
				from: 28800,
				to: 28850,
			},
			text: '',
			tokens: [
				{
					text: '[_BEG_]',
					timestamps: {
						from: '00:00:28,800',
						to: '00:00:28,800',
					},
					offsets: {
						from: 28800,
						to: 28800,
					},
					id: 50363,
					p: 0.999977,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:28,850',
				to: '00:00:28,900',
			},
			offsets: {
				from: 28850,
				to: 28900,
			},
			text: ' It',
			tokens: [
				{
					text: ' It',
					timestamps: {
						from: '00:00:28,850',
						to: '00:00:28,900',
					},
					offsets: {
						from: 28850,
						to: 28900,
					},
					id: 632,
					p: 0.527086,
					t_dtw: 2884,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:28,900',
				to: '00:00:29,000',
			},
			offsets: {
				from: 28900,
				to: 29000,
			},
			text: "'s",
			tokens: [
				{
					text: "'s",
					timestamps: {
						from: '00:00:28,900',
						to: '00:00:29,000',
					},
					offsets: {
						from: 28900,
						to: 29000,
					},
					id: 338,
					p: 0.985744,
					t_dtw: 2884,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:29,000',
				to: '00:00:29,210',
			},
			offsets: {
				from: 29000,
				to: 29210,
			},
			text: ' time',
			tokens: [
				{
					text: ' time',
					timestamps: {
						from: '00:00:29,000',
						to: '00:00:29,210',
					},
					offsets: {
						from: 29000,
						to: 29210,
					},
					id: 640,
					p: 0.9972,
					t_dtw: 2904,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:29,210',
				to: '00:00:29,400',
			},
			offsets: {
				from: 29210,
				to: 29400,
			},
			text: ' for',
			tokens: [
				{
					text: ' for',
					timestamps: {
						from: '00:00:29,210',
						to: '00:00:29,360',
					},
					offsets: {
						from: 29210,
						to: 29360,
					},
					id: 329,
					p: 0.997189,
					t_dtw: 2928,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:29,400',
				to: '00:00:29,530',
			},
			offsets: {
				from: 29400,
				to: 29530,
			},
			text: ' the',
			tokens: [
				{
					text: ' the',
					timestamps: {
						from: '00:00:29,400',
						to: '00:00:29,530',
					},
					offsets: {
						from: 29400,
						to: 29530,
					},
					id: 262,
					p: 0.939044,
					t_dtw: 2942,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:29,530',
				to: '00:00:29,800',
			},
			offsets: {
				from: 29530,
				to: 29800,
			},
			text: ' icing',
			tokens: [
				{
					text: ' icing',
					timestamps: {
						from: '00:00:29,530',
						to: '00:00:29,800',
					},
					offsets: {
						from: 29530,
						to: 29800,
					},
					id: 41567,
					p: 0.999487,
					t_dtw: 2970,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:29,800',
				to: '00:00:29,900',
			},
			offsets: {
				from: 29800,
				to: 29900,
			},
			text: ' on',
			tokens: [
				{
					text: ' on',
					timestamps: {
						from: '00:00:29,800',
						to: '00:00:29,900',
					},
					offsets: {
						from: 29800,
						to: 29900,
					},
					id: 319,
					p: 0.99083,
					t_dtw: 2988,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:29,900',
				to: '00:00:30,060',
			},
			offsets: {
				from: 29900,
				to: 30060,
			},
			text: ' the',
			tokens: [
				{
					text: ' the',
					timestamps: {
						from: '00:00:29,900',
						to: '00:00:30,060',
					},
					offsets: {
						from: 29900,
						to: 30060,
					},
					id: 262,
					p: 0.998026,
					t_dtw: 3000,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:30,060',
				to: '00:00:30,320',
			},
			offsets: {
				from: 30060,
				to: 30320,
			},
			text: ' cake',
			tokens: [
				{
					text: ' cake',
					timestamps: {
						from: '00:00:30,060',
						to: '00:00:30,310',
					},
					offsets: {
						from: 30060,
						to: 30310,
					},
					id: 12187,
					p: 0.999603,
					t_dtw: 3056,
				},
				{
					text: '[_TT_76]',
					timestamps: {
						from: '00:00:30,320',
						to: '00:00:30,320',
					},
					offsets: {
						from: 30320,
						to: 30320,
					},
					id: 50439,
					p: 0.0688483,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:30,320',
				to: '00:00:30,940',
			},
			offsets: {
				from: 30320,
				to: 30940,
			},
			text: ' Time',
			tokens: [
				{
					text: ' Time',
					timestamps: {
						from: '00:00:30,320',
						to: '00:00:30,940',
					},
					offsets: {
						from: 30320,
						to: 30940,
					},
					id: 3862,
					p: 0.960646,
					t_dtw: 3314,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:30,940',
				to: '00:00:31,410',
			},
			offsets: {
				from: 30940,
				to: 31410,
			},
			text: ' for',
			tokens: [
				{
					text: ' for',
					timestamps: {
						from: '00:00:30,940',
						to: '00:00:31,400',
					},
					offsets: {
						from: 30940,
						to: 31400,
					},
					id: 329,
					p: 0.998479,
					t_dtw: 3334,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:31,410',
				to: '00:00:31,880',
			},
			offsets: {
				from: 31410,
				to: 31880,
			},
			text: ' the',
			tokens: [
				{
					text: ' the',
					timestamps: {
						from: '00:00:31,410',
						to: '00:00:31,880',
					},
					offsets: {
						from: 31410,
						to: 31880,
					},
					id: 262,
					p: 0.997771,
					t_dtw: 3346,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:31,880',
				to: '00:00:32,500',
			},
			offsets: {
				from: 31880,
				to: 32500,
			},
			text: ' most',
			tokens: [
				{
					text: ' most',
					timestamps: {
						from: '00:00:31,880',
						to: '00:00:32,500',
					},
					offsets: {
						from: 31880,
						to: 32500,
					},
					id: 749,
					p: 0.994025,
					t_dtw: 3362,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:32,500',
				to: '00:00:33,750',
			},
			offsets: {
				from: 32500,
				to: 33750,
			},
			text: ' critical',
			tokens: [
				{
					text: ' critical',
					timestamps: {
						from: '00:00:32,500',
						to: '00:00:33,750',
					},
					offsets: {
						from: 32500,
						to: 33750,
					},
					id: 4688,
					p: 0.995492,
					t_dtw: 3400,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:33,750',
				to: '00:00:34,400',
			},
			offsets: {
				from: 33750,
				to: 34400,
			},
			text: ' part',
			tokens: [
				{
					text: ' part',
					timestamps: {
						from: '00:00:33,750',
						to: '00:00:34,350',
					},
					offsets: {
						from: 33750,
						to: 34350,
					},
					id: 636,
					p: 0.996058,
					t_dtw: 3476,
				},
				{
					text: '[_TT_280]',
					timestamps: {
						from: '00:00:34,400',
						to: '00:00:34,400',
					},
					offsets: {
						from: 34400,
						to: 34400,
					},
					id: 50643,
					p: 0.137197,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:34,400',
				to: '00:00:35,840',
			},
			offsets: {
				from: 34400,
				to: 35840,
			},
			text: ' This',
			tokens: [
				{
					text: ' This',
					timestamps: {
						from: '00:00:34,410',
						to: '00:00:35,820',
					},
					offsets: {
						from: 34410,
						to: 35820,
					},
					id: 770,
					p: 0.990973,
					t_dtw: 4074,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:35,840',
				to: '00:00:36,580',
			},
			offsets: {
				from: 35840,
				to: 36580,
			},
			text: ' is',
			tokens: [
				{
					text: ' is',
					timestamps: {
						from: '00:00:35,840',
						to: '00:00:36,570',
					},
					offsets: {
						from: 35840,
						to: 36570,
					},
					id: 318,
					p: 0.983412,
					t_dtw: 4086,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:36,580',
				to: '00:00:37,670',
			},
			offsets: {
				from: 36580,
				to: 37670,
			},
			text: ' how',
			tokens: [
				{
					text: ' how',
					timestamps: {
						from: '00:00:36,580',
						to: '00:00:37,670',
					},
					offsets: {
						from: 36580,
						to: 37670,
					},
					id: 703,
					p: 0.999081,
					t_dtw: 4100,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:37,670',
				to: '00:00:38,420',
			},
			offsets: {
				from: 37670,
				to: 38420,
			},
			text: ' it',
			tokens: [
				{
					text: ' it',
					timestamps: {
						from: '00:00:37,670',
						to: '00:00:38,350',
					},
					offsets: {
						from: 37670,
						to: 38350,
					},
					id: 340,
					p: 0.985289,
					t_dtw: 4110,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:38,420',
				to: '00:00:40,580',
			},
			offsets: {
				from: 38420,
				to: 40580,
			},
			text: ' turned',
			tokens: [
				{
					text: ' turned',
					timestamps: {
						from: '00:00:38,420',
						to: '00:00:40,580',
					},
					offsets: {
						from: 38420,
						to: 40580,
					},
					id: 2900,
					p: 0.991647,
					t_dtw: 4132,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:40,580',
				to: '00:00:41,700',
			},
			offsets: {
				from: 40580,
				to: 41700,
			},
			text: ' out',
			tokens: [
				{
					text: ' out',
					timestamps: {
						from: '00:00:40,580',
						to: '00:00:41,620',
					},
					offsets: {
						from: 40580,
						to: 41620,
					},
					id: 503,
					p: 0.99891,
					t_dtw: 4202,
				},
				{
					text: '[_TT_645]',
					timestamps: {
						from: '00:00:41,700',
						to: '00:00:41,700',
					},
					offsets: {
						from: 41700,
						to: 41700,
					},
					id: 51008,
					p: 0.0964719,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:41,700',
				to: '00:00:42,750',
			},
			offsets: {
				from: 41700,
				to: 42750,
			},
			text: ' Stupid',
			tokens: [
				{
					text: ' Stupid',
					timestamps: {
						from: '00:00:41,700',
						to: '00:00:42,740',
					},
					offsets: {
						from: 41700,
						to: 42740,
					},
					id: 42930,
					p: 0.940365,
					t_dtw: 4278,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:42,750',
				to: '00:00:43,440',
			},
			offsets: {
				from: 42750,
				to: 43440,
			},
			text: ' idea',
			tokens: [
				{
					text: ' idea',
					timestamps: {
						from: '00:00:42,750',
						to: '00:00:43,440',
					},
					offsets: {
						from: 42750,
						to: 43440,
					},
					id: 2126,
					p: 0.981042,
					t_dtw: 4336,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:43,440',
				to: '00:00:43,590',
			},
			offsets: {
				from: 43440,
				to: 43590,
			},
			text: ',',
			tokens: [
				{
					text: ',',
					timestamps: {
						from: '00:00:43,440',
						to: '00:00:43,590',
					},
					offsets: {
						from: 43440,
						to: 43590,
					},
					id: 11,
					p: 0.5058,
					t_dtw: 4352,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:43,590',
				to: '00:00:44,070',
			},
			offsets: {
				from: 43590,
				to: 44070,
			},
			text: ' pretty',
			tokens: [
				{
					text: ' pretty',
					timestamps: {
						from: '00:00:43,590',
						to: '00:00:44,070',
					},
					offsets: {
						from: 43590,
						to: 44070,
					},
					id: 2495,
					p: 0.975026,
					t_dtw: 4370,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:44,070',
				to: '00:00:44,310',
			},
			offsets: {
				from: 44070,
				to: 44310,
			},
			text: ' bad',
			tokens: [
				{
					text: ' bad',
					timestamps: {
						from: '00:00:44,070',
						to: '00:00:44,310',
					},
					offsets: {
						from: 44070,
						to: 44310,
					},
					id: 2089,
					p: 0.999607,
					t_dtw: 4402,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:44,310',
				to: '00:00:45,040',
			},
			offsets: {
				from: 44310,
				to: 45040,
			},
			text: ' execution',
			tokens: [
				{
					text: ' execution',
					timestamps: {
						from: '00:00:44,310',
						to: '00:00:45,010',
					},
					offsets: {
						from: 44310,
						to: 45010,
					},
					id: 9706,
					p: 0.985233,
					t_dtw: 4472,
				},
				{
					text: '[_TT_812]',
					timestamps: {
						from: '00:00:45,040',
						to: '00:00:45,040',
					},
					offsets: {
						from: 45040,
						to: 45040,
					},
					id: 51175,
					p: 0.124543,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:45,040',
				to: '00:00:45,140',
			},
			offsets: {
				from: 45040,
				to: 45140,
			},
			text: ' I',
			tokens: [
				{
					text: ' I',
					timestamps: {
						from: '00:00:45,040',
						to: '00:00:45,140',
					},
					offsets: {
						from: 45040,
						to: 45140,
					},
					id: 314,
					p: 0.997965,
					t_dtw: 4588,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:45,140',
				to: '00:00:45,530',
			},
			offsets: {
				from: 45140,
				to: 45530,
			},
			text: ' hope',
			tokens: [
				{
					text: ' hope',
					timestamps: {
						from: '00:00:45,140',
						to: '00:00:45,530',
					},
					offsets: {
						from: 45140,
						to: 45530,
					},
					id: 2911,
					p: 0.999199,
					t_dtw: 4606,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:45,530',
				to: '00:00:45,730',
			},
			offsets: {
				from: 45530,
				to: 45730,
			},
			text: ' he',
			tokens: [
				{
					text: ' he',
					timestamps: {
						from: '00:00:45,530',
						to: '00:00:45,730',
					},
					offsets: {
						from: 45530,
						to: 45730,
					},
					id: 339,
					p: 0.997006,
					t_dtw: 4620,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:45,730',
				to: '00:00:46,220',
			},
			offsets: {
				from: 45730,
				to: 46220,
			},
			text: ' likes',
			tokens: [
				{
					text: ' likes',
					timestamps: {
						from: '00:00:45,730',
						to: '00:00:46,220',
					},
					offsets: {
						from: 45730,
						to: 46220,
					},
					id: 7832,
					p: 0.973227,
					t_dtw: 4638,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:46,220',
				to: '00:00:46,420',
			},
			offsets: {
				from: 46220,
				to: 46420,
			},
			text: ' it',
			tokens: [
				{
					text: ' it',
					timestamps: {
						from: '00:00:46,220',
						to: '00:00:46,380',
					},
					offsets: {
						from: 46220,
						to: 46380,
					},
					id: 340,
					p: 0.998491,
					t_dtw: 4658,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:46,420',
				to: '00:00:47,040',
			},
			offsets: {
				from: 46420,
				to: 47040,
			},
			text: ' anyway',
			tokens: [
				{
					text: ' anyway',
					timestamps: {
						from: '00:00:46,420',
						to: '00:00:47,040',
					},
					offsets: {
						from: 46420,
						to: 47040,
					},
					id: 6949,
					p: 0.952196,
					t_dtw: 4756,
				},
				{
					text: '[_TT_912]',
					timestamps: {
						from: '00:00:47,040',
						to: '00:00:47,040',
					},
					offsets: {
						from: 47040,
						to: 47040,
					},
					id: 51275,
					p: 0.164079,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:47,040',
				to: '00:00:48,030',
			},
			offsets: {
				from: 47040,
				to: 48030,
			},
			text: ' Hey',
			tokens: [
				{
					text: ' Hey',
					timestamps: {
						from: '00:00:47,040',
						to: '00:00:48,030',
					},
					offsets: {
						from: 47040,
						to: 48030,
					},
					id: 14690,
					p: 0.602923,
					t_dtw: 4952,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:48,030',
				to: '00:00:50,340',
			},
			offsets: {
				from: 48030,
				to: 50340,
			},
			text: ' William',
			tokens: [
				{
					text: ' William',
					timestamps: {
						from: '00:00:48,030',
						to: '00:00:50,330',
					},
					offsets: {
						from: 48030,
						to: 50330,
					},
					id: 3977,
					p: 0.83491,
					t_dtw: 5006,
				},
				{
					text: '[_TT_1077]',
					timestamps: {
						from: '00:00:50,340',
						to: '00:00:50,340',
					},
					offsets: {
						from: 50340,
						to: 50340,
					},
					id: 51440,
					p: 0.0862705,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:50,340',
				to: '00:00:51,970',
			},
			offsets: {
				from: 50340,
				to: 51970,
			},
			text: ' Cong',
			tokens: [
				{
					text: ' Cong',
					timestamps: {
						from: '00:00:50,340',
						to: '00:00:51,960',
					},
					offsets: {
						from: 50340,
						to: 51960,
					},
					id: 2908,
					p: 0.976923,
					t_dtw: 5232,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:51,970',
				to: '00:00:53,580',
			},
			offsets: {
				from: 51970,
				to: 53580,
			},
			text: 'rats',
			tokens: [
				{
					text: 'rats',
					timestamps: {
						from: '00:00:51,970',
						to: '00:00:53,560',
					},
					offsets: {
						from: 51970,
						to: 53560,
					},
					id: 46714,
					p: 0.993292,
					t_dtw: 5296,
				},
				{
					text: '[_TT_1239]',
					timestamps: {
						from: '00:00:53,580',
						to: '00:00:53,580',
					},
					offsets: {
						from: 53580,
						to: 53580,
					},
					id: 51602,
					p: 0.072177,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:53,580',
				to: '00:00:53,790',
			},
			offsets: {
				from: 53580,
				to: 53790,
			},
			text: ' We',
			tokens: [
				{
					text: ' We',
					timestamps: {
						from: '00:00:53,580',
						to: '00:00:53,790',
					},
					offsets: {
						from: 53580,
						to: 53790,
					},
					id: 775,
					p: 0.94271,
					t_dtw: 5456,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:53,790',
				to: '00:00:54,440',
			},
			offsets: {
				from: 53790,
				to: 54440,
			},
			text: ' wanted',
			tokens: [
				{
					text: ' wanted',
					timestamps: {
						from: '00:00:53,790',
						to: '00:00:54,430',
					},
					offsets: {
						from: 53790,
						to: 54430,
					},
					id: 2227,
					p: 0.914374,
					t_dtw: 5486,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:54,440',
				to: '00:00:54,640',
			},
			offsets: {
				from: 54440,
				to: 54640,
			},
			text: ' to',
			tokens: [
				{
					text: ' to',
					timestamps: {
						from: '00:00:54,440',
						to: '00:00:54,640',
					},
					offsets: {
						from: 54440,
						to: 54640,
					},
					id: 284,
					p: 0.997847,
					t_dtw: 5500,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:54,640',
				to: '00:00:55,930',
			},
			offsets: {
				from: 54640,
				to: 55930,
			},
			text: ' congratulate',
			tokens: [
				{
					text: ' congratulate',
					timestamps: {
						from: '00:00:54,640',
						to: '00:00:55,930',
					},
					offsets: {
						from: 54640,
						to: 55930,
					},
					id: 43647,
					p: 0.988382,
					t_dtw: 5558,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:55,930',
				to: '00:00:56,280',
			},
			offsets: {
				from: 55930,
				to: 56280,
			},
			text: ' you',
			tokens: [
				{
					text: ' you',
					timestamps: {
						from: '00:00:55,930',
						to: '00:00:56,280',
					},
					offsets: {
						from: 55930,
						to: 56280,
					},
					id: 345,
					p: 0.996569,
					t_dtw: 5622,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:56,280',
				to: '00:00:56,520',
			},
			offsets: {
				from: 56280,
				to: 56520,
			},
			text: ' on',
			tokens: [
				{
					text: ' on',
					timestamps: {
						from: '00:00:56,280',
						to: '00:00:56,520',
					},
					offsets: {
						from: 56280,
						to: 56520,
					},
					id: 319,
					p: 0.606633,
					t_dtw: 5654,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:56,520',
				to: '00:00:56,880',
			},
			offsets: {
				from: 56520,
				to: 56880,
			},
			text: ' the',
			tokens: [
				{
					text: ' the',
					timestamps: {
						from: '00:00:56,520',
						to: '00:00:56,880',
					},
					offsets: {
						from: 56520,
						to: 56880,
					},
					id: 262,
					p: 0.470472,
					t_dtw: 5668,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:56,880',
				to: '00:00:57,980',
			},
			offsets: {
				from: 56880,
				to: 57980,
			},
			text: ' 100',
			tokens: [
				{
					text: ' 100',
					timestamps: {
						from: '00:00:56,880',
						to: '00:00:57,980',
					},
					offsets: {
						from: 56880,
						to: 57980,
					},
					id: 1802,
					p: 0.747908,
					t_dtw: 5714,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:57,980',
				to: '00:00:58,010',
			},
			offsets: {
				from: 57980,
				to: 58010,
			},
			text: ',',
			tokens: [
				{
					text: ',',
					timestamps: {
						from: '00:00:57,980',
						to: '00:00:58,010',
					},
					offsets: {
						from: 57980,
						to: 58010,
					},
					id: 11,
					p: 0.260015,
					t_dtw: 5714,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:58,010',
				to: '00:00:58,180',
			},
			offsets: {
				from: 58010,
				to: 58180,
			},
			text: '000',
			tokens: [
				{
					text: '000',
					timestamps: {
						from: '00:00:58,010',
						to: '00:00:58,180',
					},
					offsets: {
						from: 58010,
						to: 58180,
					},
					id: 830,
					p: 0.985706,
					t_dtw: 5794,
				},
				{
					text: '[_TT_1469]',
					timestamps: {
						from: '00:00:58,180',
						to: '00:00:58,180',
					},
					offsets: {
						from: 58180,
						to: 58180,
					},
					id: 51832,
					p: 0.034253,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:58,660',
				to: '00:00:58,690',
			},
			offsets: {
				from: 58660,
				to: 58690,
			},
			text: '',
			tokens: [
				{
					text: '[_BEG_]',
					timestamps: {
						from: '00:00:58,660',
						to: '00:00:58,660',
					},
					offsets: {
						from: 58660,
						to: 58660,
					},
					id: 50363,
					p: 0.999928,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:58,690',
				to: '00:00:58,870',
			},
			offsets: {
				from: 58690,
				to: 58870,
			},
			text: ' You',
			tokens: [
				{
					text: ' You',
					timestamps: {
						from: '00:00:58,690',
						to: '00:00:58,870',
					},
					offsets: {
						from: 58690,
						to: 58870,
					},
					id: 921,
					p: 0.50334,
					t_dtw: 5886,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:58,870',
				to: '00:00:59,150',
			},
			offsets: {
				from: 58870,
				to: 59150,
			},
			text: ' hear',
			tokens: [
				{
					text: ' hear',
					timestamps: {
						from: '00:00:58,870',
						to: '00:00:59,150',
					},
					offsets: {
						from: 58870,
						to: 59150,
					},
					id: 3285,
					p: 0.15515,
					t_dtw: 5906,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:59,150',
				to: '00:00:59,570',
			},
			offsets: {
				from: 59150,
				to: 59570,
			},
			text: ' Joseph',
			tokens: [
				{
					text: ' Joseph',
					timestamps: {
						from: '00:00:59,150',
						to: '00:00:59,560',
					},
					offsets: {
						from: 59150,
						to: 59560,
					},
					id: 7212,
					p: 0.954238,
					t_dtw: 5940,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:59,570',
				to: '00:00:59,990',
			},
			offsets: {
				from: 59570,
				to: 59990,
			},
			text: ' crying',
			tokens: [
				{
					text: ' crying',
					timestamps: {
						from: '00:00:59,570',
						to: '00:00:59,990',
					},
					offsets: {
						from: 59570,
						to: 59990,
					},
					id: 13774,
					p: 0.493842,
					t_dtw: 5974,
				},
			],
		},
		{
			timestamps: {
				from: '00:00:59,990',
				to: '00:01:00,220',
			},
			offsets: {
				from: 59990,
				to: 60220,
			},
			text: '?',
			tokens: [
				{
					text: '?',
					timestamps: {
						from: '00:00:59,990',
						to: '00:01:00,210',
					},
					offsets: {
						from: 59990,
						to: 60210,
					},
					id: 30,
					p: 0.72096,
					t_dtw: 6042,
				},
				{
					text: '[_TT_78]',
					timestamps: {
						from: '00:01:00,220',
						to: '00:01:00,220',
					},
					offsets: {
						from: 60220,
						to: 60220,
					},
					id: 50441,
					p: 0.0702247,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:01:00,220',
				to: '00:01:00,820',
			},
			offsets: {
				from: 60220,
				to: 60820,
			},
			text: ' Thank',
			tokens: [
				{
					text: ' Thank',
					timestamps: {
						from: '00:01:00,220',
						to: '00:01:00,820',
					},
					offsets: {
						from: 60220,
						to: 60820,
					},
					id: 6952,
					p: 0.929792,
					t_dtw: 6104,
				},
			],
		},
		{
			timestamps: {
				from: '00:01:00,820',
				to: '00:01:01,180',
			},
			offsets: {
				from: 60820,
				to: 61180,
			},
			text: ' you',
			tokens: [
				{
					text: ' you',
					timestamps: {
						from: '00:01:00,820',
						to: '00:01:01,180',
					},
					offsets: {
						from: 60820,
						to: 61180,
					},
					id: 345,
					p: 0.997885,
					t_dtw: 6118,
				},
			],
		},
		{
			timestamps: {
				from: '00:01:01,180',
				to: '00:01:01,420',
			},
			offsets: {
				from: 61180,
				to: 61420,
			},
			text: ' so',
			tokens: [
				{
					text: ' so',
					timestamps: {
						from: '00:01:01,180',
						to: '00:01:01,420',
					},
					offsets: {
						from: 61180,
						to: 61420,
					},
					id: 523,
					p: 0.970071,
					t_dtw: 6144,
				},
			],
		},
		{
			timestamps: {
				from: '00:01:01,420',
				to: '00:01:01,920',
			},
			offsets: {
				from: 61420,
				to: 61920,
			},
			text: ' much',
			tokens: [
				{
					text: ' much',
					timestamps: {
						from: '00:01:01,420',
						to: '00:01:01,920',
					},
					offsets: {
						from: 61420,
						to: 61920,
					},
					id: 881,
					p: 0.999336,
					t_dtw: 6176,
				},
				{
					text: '[_TT_163]',
					timestamps: {
						from: '00:01:01,920',
						to: '00:01:01,920',
					},
					offsets: {
						from: 61920,
						to: 61920,
					},
					id: 50526,
					p: 0.0619802,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:01:01,920',
				to: '00:01:01,920',
			},
			offsets: {
				from: 61920,
				to: 61920,
			},
			text: '',
			tokens: [
				{
					text: '[_BEG_]',
					timestamps: {
						from: '00:01:01,920',
						to: '00:01:01,920',
					},
					offsets: {
						from: 61920,
						to: 61920,
					},
					id: 50363,
					p: 0.523572,
					t_dtw: -1,
				},
			],
		},
		{
			timestamps: {
				from: '00:01:01,920',
				to: '00:01:02,080',
			},
			offsets: {
				from: 61920,
				to: 62080,
			},
			text: ' (',
			tokens: [
				{
					text: ' (',
					timestamps: {
						from: '00:01:01,920',
						to: '00:01:02,080',
					},
					offsets: {
						from: 61920,
						to: 62080,
					},
					id: 357,
					p: 0.377591,
					t_dtw: 6288,
				},
			],
		},
		{
			timestamps: {
				from: '00:01:02,080',
				to: '00:01:02,880',
			},
			offsets: {
				from: 62080,
				to: 62880,
			},
			text: 'elect',
			tokens: [
				{
					text: 'elect',
					timestamps: {
						from: '00:01:02,080',
						to: '00:01:02,860',
					},
					offsets: {
						from: 62080,
						to: 62860,
					},
					id: 9509,
					p: 0.0816942,
					t_dtw: 6296,
				},
			],
		},
		{
			timestamps: {
				from: '00:01:02,880',
				to: '00:01:03,680',
			},
			offsets: {
				from: 62880,
				to: 63680,
			},
			text: 'ronic',
			tokens: [
				{
					text: 'ronic',
					timestamps: {
						from: '00:01:02,880',
						to: '00:01:03,680',
					},
					offsets: {
						from: 62880,
						to: 63680,
					},
					id: 4565,
					p: 0.998677,
					t_dtw: 6296,
				},
			],
		},
		{
			timestamps: {
				from: '00:01:03,680',
				to: '00:01:03,890',
			},
			offsets: {
				from: 63680,
				to: 63890,
			},
			text: ' be',
			tokens: [
				{
					text: ' be',
					timestamps: {
						from: '00:01:03,680',
						to: '00:01:03,890',
					},
					offsets: {
						from: 63680,
						to: 63890,
					},
					id: 307,
					p: 0.110629,
					t_dtw: 6302,
				},
			],
		},
		{
			timestamps: {
				from: '00:01:03,890',
				to: '00:01:04,800',
			},
			offsets: {
				from: 63890,
				to: 64800,
			},
			text: 'eping',
			tokens: [
				{
					text: 'eping',
					timestamps: {
						from: '00:01:03,890',
						to: '00:01:04,100',
					},
					offsets: {
						from: 63890,
						to: 64100,
					},
					id: 7213,
					p: 0.767711,
					t_dtw: 6302,
				},
			],
		},
		{
			timestamps: {
				from: '00:01:04,800',
				to: '00:01:05,000',
			},
			offsets: {
				from: 64800,
				to: 65000,
			},
			text: ')',
			tokens: [
				{
					text: ')',
					timestamps: {
						from: '00:01:04,800',
						to: '00:01:05,000',
					},
					offsets: {
						from: 64800,
						to: 65000,
					},
					id: 8,
					p: 0.963095,
					t_dtw: 6302,
				},
				{
					text: '[_TT_154]',
					timestamps: {
						from: '00:01:05,000',
						to: '00:01:05,000',
					},
					offsets: {
						from: 65000,
						to: 65000,
					},
					id: 50517,
					p: 0.571558,
					t_dtw: -1,
				},
			],
		},
	],
};
