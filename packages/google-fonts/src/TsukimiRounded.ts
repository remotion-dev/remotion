import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Tsukimi Rounded',
	importName: 'TsukimiRounded',
	version: 'v13',
	url: 'https://fonts.googleapis.com/css2?family=Tsukimi+Rounded:ital,wght@0,300;0,400;0,500;0,600;0,700',
	unicodeRanges: {
		'[3]':
			'U+fa10, U+fa12-fa6d, U+fb00-fb04, U+fe10-fe19, U+fe30-fe42, U+fe44-fe52, U+fe54-fe66, U+fe68-fe6b, U+ff02, U+ff04, U+ff07, U+ff51, U+ff5b, U+ff5d, U+ff5f-ff60, U+ff66, U+ff69, U+ff87, U+ffa1-ffbe, U+ffc2-ffc7, U+ffca-ffcf, U+ffd2-ffd6',
		'[54]':
			'U+3028-303f, U+3094-3096, U+309f-30a0, U+30ee, U+30f7-30fa, U+30ff, U+3105-312f, U+3131-3163, U+3165-318e, U+3190-31bb, U+31c0-31c7',
		'[58]':
			'U+2105, U+2109-210a, U+210f, U+2116, U+2121, U+2126-2127, U+212b, U+212e, U+2135, U+213b, U+2194-2199, U+21b8-21b9, U+21c4-21c6, U+21cb-21cc, U+21d0, U+21e6-21e9, U+21f5, U+2202-2203, U+2205-2206, U+2208-220b, U+220f, U+2211, U+2213, U+2215, U+221a, U+221d, U+2220, U+2223, U+2225-2226, U+2228, U+222a-222e, U+2234-2237, U+223d, U+2243, U+2245, U+2248, U+224c, U+2260, U+2262, U+2264-2265, U+226e-226f, U+2272-2273, U+2276-2277, U+2283-2287, U+228a-228b, U+2295-2299, U+22a0, U+22a5, U+22bf, U+22da-22db, U+22ef, U+2305-2307, U+2318, U+2329-232a, U+23b0-23b1, U+23be-23cc, U+23ce, U+23da-23db, U+2423, U+2469-24d0',
		'[59]':
			'U+a1-a4, U+a6-a7, U+aa, U+ac-ad, U+b5-b6, U+b8-ba, U+bc-c8, U+ca-cc, U+ce-d5, U+d9-db, U+dd-df, U+e6, U+ee, U+f0, U+f5, U+f7, U+f9, U+fb, U+fe-102, U+110-113, U+11a-11b, U+128-12b, U+143-144, U+147-148, U+14c, U+14e-14f, U+152-153, U+168-16d, U+192, U+1a0-1a1, U+1af, U+1cd-1dc, U+1f8-1f9, U+251, U+261, U+2bb, U+2c7, U+2c9, U+2ea-2eb, U+304, U+307, U+30c, U+1e3e-1e3f, U+1ea0-1ebe, U+1ec0-1ec6, U+1ec8-1ef9, U+2011-2012, U+2016, U+2018-201a, U+201e, U+2021, U+2030, U+2033, U+2035, U+2042, U+2047, U+2051, U+2074, U+20a9, U+20ab-20ac, U+20dd-20de, U+2100',
		'[61]':
			'U+a8, U+2032, U+2261, U+2282, U+3090, U+30f1, U+339c, U+535c, U+53d9, U+56a2, U+56c1, U+5806, U+589f, U+59d0, U+5a7f, U+60e0, U+639f, U+65af, U+68fa, U+69ae, U+6d1b, U+6ef2, U+71fb, U+725d, U+7262, U+75bc, U+7768, U+7940, U+79bf, U+7bed, U+7d68, U+7dfb, U+814b, U+8207, U+83e9, U+8494, U+8526, U+8568, U+85ea, U+86d9, U+87ba, U+8861, U+887f, U+8fe6, U+9059, U+9061, U+916a, U+976d, U+97ad, U+9ece',
		'[65]':
			'U+b1, U+309b, U+4e5e, U+51f1, U+5506, U+55c5, U+58cc, U+59d1, U+5c51, U+5ef7, U+6284, U+62d7, U+6689, U+673d, U+6a2b, U+6a8e, U+6a9c, U+6d63, U+6dd1, U+70b8, U+7235, U+72db, U+72f8, U+7560, U+7c9b, U+7ce7, U+7e1e, U+80af, U+82eb, U+8463, U+8499, U+85dd, U+86ee, U+8a60, U+8a6e, U+8c79, U+8e87, U+8e8a, U+8f5f, U+9010, U+918d, U+9190, U+965b, U+97fb, U+9ab8, U+9bad, U+9d3b, U+9d5c, U+9dfa, U+9e93',
		'[70]':
			'U+266b, U+3006, U+5176, U+5197, U+51a8, U+51c6, U+52f2, U+5614, U+5875, U+5a2f, U+5b54, U+5ce0, U+5dba, U+5deb, U+5e63, U+5f59, U+5fcc, U+6068, U+6367, U+68b6, U+6a0b, U+6b64, U+6e15, U+6eba, U+7272, U+72a0, U+7947, U+7985, U+79e6, U+79e9, U+7a3d, U+7a9f, U+7aaf, U+7b95, U+7f60, U+7f9e, U+7fe0, U+8098, U+80ba, U+8106, U+82d4, U+831c, U+87f9, U+8a1f, U+8acf, U+90c1, U+920d, U+9756, U+fe43, U+ff94',
		'[71]':
			'U+af, U+2465, U+2517, U+33a1, U+4f10, U+50c5, U+51b4, U+5384, U+5606, U+5bb0, U+5cac, U+5ee3, U+618e, U+61f2, U+62c9, U+66ab, U+66f9, U+6816, U+6960, U+6b3e, U+6f20, U+7078, U+72d0, U+73ed, U+7ad9, U+7b1b, U+7be4, U+7d62, U+7f51, U+80b4, U+80f4, U+8154, U+85fb, U+865c, U+8702, U+895f, U+8aed, U+8b90, U+8ced, U+8fbf, U+91d8, U+9418, U+9583, U+9591, U+9813, U+982c, U+9bd6, U+ff46, U+ff7f, U+ff88',
		'[79]':
			'U+25b3, U+30f5, U+4eae, U+4f46, U+4f51, U+5203, U+52ff, U+55a7, U+564c, U+565b, U+57f9, U+5805, U+5b64, U+5e06, U+5f70, U+5f90, U+60e8, U+6182, U+62f3, U+62fe, U+63aa, U+64a4, U+65d7, U+673a, U+6851, U+68cb, U+68df, U+6d1e, U+6e58, U+6e9d, U+77b3, U+7832, U+7c3f, U+7db4, U+7f70, U+80aa, U+80c6, U+8105, U+819d, U+8276, U+8679, U+8986, U+8c9d, U+8fc5, U+916c, U+9665, U+9699, U+96c0, U+9a19, U+ff8b',
		'[82]':
			'U+2103, U+5049, U+52b1, U+5320, U+5553, U+572d, U+58c7, U+5b5d, U+5bc2, U+5de3, U+5e61, U+5f80, U+61a9, U+67d0, U+67f4, U+6c88, U+6ca1, U+6ce5, U+6d78, U+6e9c, U+6f54, U+731b, U+73b2, U+74a7, U+74f6, U+75e9, U+7b20, U+7c8b, U+7f72, U+809d, U+8108, U+82b3, U+82bd, U+84b8, U+84c4, U+88c2, U+8ae6, U+8ef8, U+902e, U+9065, U+9326, U+935b, U+938c, U+9676, U+9694, U+96f7, U+9ed9, U+ff48, U+ff4c, U+ff81',
		'[83]':
			'U+2500, U+3008-3009, U+4ead, U+4f0f, U+4fca, U+53eb, U+543e, U+57a2, U+5cf0, U+5e8f, U+5fe0, U+61b2, U+62d8, U+6442, U+64b2, U+6589, U+659c, U+67f1, U+68c4, U+6cb8, U+6d12, U+6de1, U+6fe1, U+70c8, U+723d, U+73e0, U+7656, U+773a, U+7948, U+7b87, U+7c92, U+7d3a, U+7e1b, U+7e4a, U+819a, U+8358, U+83c5, U+84bc, U+864e, U+8912, U+8c9e, U+8d05, U+92fc, U+9396, U+98fd, U+99d2, U+ff64, U+ff7a, U+ff83',
		'[84]':
			'U+3014-3015, U+4e3c, U+5036, U+5075, U+533f, U+53e9, U+5531, U+5642, U+5984, U+59e6, U+5a01, U+5b6b, U+5c0b, U+5f25, U+6069, U+60a0, U+614e, U+62b5, U+62d2-62d3, U+6597, U+660c, U+674f, U+67cf, U+6841, U+6905, U+6cf3, U+6d32, U+6d69, U+6f64, U+716e, U+7761, U+7b52, U+7be0, U+7dbf, U+7de9, U+7f36, U+81d3, U+8302, U+8389, U+846c, U+84ee, U+8a69, U+9038, U+9d8f, U+ff47, U+ff4b, U+ff76, U+ff9b',
		'[86]':
			'U+24, U+2022, U+2212, U+221f, U+2665, U+4ecf, U+5100, U+51cd, U+52d8, U+5378, U+53f6, U+574a, U+5982, U+5996, U+5c1a, U+5e1d, U+5f84, U+609f, U+61a7, U+61f8, U+6398, U+63ee, U+6676, U+6691, U+6eb6, U+7126, U+71e5, U+7687, U+7965, U+7d17, U+80a1, U+8107, U+8266, U+85a6, U+8987, U+8ca2, U+8cab, U+8e0a, U+9042, U+95c7, U+9810, U+9867, U+98fc, U+ff52-ff54, U+ff61, U+ff77, U+ff98-ff99',
		'[87]':
			'U+b0, U+226a, U+2462, U+4e39, U+4fc3, U+4fd7, U+50be, U+50da, U+5200, U+5211, U+54f2, U+5618, U+596a, U+5b22, U+5bb4, U+5d50, U+60a3, U+63fa, U+658e, U+65e8, U+6669, U+6795, U+679d, U+67a0, U+6b3a, U+6e09, U+757f, U+7cd6, U+7dbe, U+7ffb, U+83cc, U+83f1, U+840c, U+845b, U+8846, U+8972, U+8a34, U+8a50, U+8a87, U+8edf, U+8ff0, U+90a6, U+9154, U+95a3, U+9663, U+9686, U+96c7, U+ff3c, U+ff7c, U+ff8a',
		'[89]':
			'U+a5, U+4e80, U+4f34, U+4f73, U+4f75, U+511f, U+5192, U+52aa, U+53c8, U+570f, U+57cb, U+596e, U+5d8b, U+5f66, U+5fd9, U+62db, U+62f6, U+6328, U+633f, U+63a7, U+6469, U+6bbf, U+6c41, U+6c57, U+6d44, U+6dbc, U+706f, U+72c2, U+72ed, U+7551, U+75f4, U+7949, U+7e26, U+7fd4, U+8150, U+8af8, U+8b0e, U+8b72, U+8ca7, U+934b, U+9a0e, U+9a12, U+9b42, U+ff41, U+ff43, U+ff45, U+ff49, U+ff4f, U+ff62-ff63',
		'[91]':
			'U+60, U+2200, U+226b, U+2461, U+517c, U+526f, U+5800, U+5b97, U+5bf8, U+5c01, U+5d29, U+5e4c, U+5e81, U+6065, U+61d0, U+667a, U+6696, U+6843, U+6c99, U+6d99, U+6ec5, U+6f22, U+6f6e, U+6fa4, U+6fef, U+71c3, U+72d9, U+7384, U+78e8, U+7a1a, U+7a32, U+7a3c, U+7adc, U+7ca7, U+7d2b, U+7dad, U+7e4b, U+80a9, U+8170, U+81ed, U+820e, U+8a17, U+8afe, U+90aa, U+914e, U+963f, U+99c4, U+9eba, U+9f3b, U+ff38',
		'[93]':
			'U+21d2, U+25ce, U+300a-300b, U+4e89, U+4e9c, U+4ea1, U+5263, U+53cc, U+5426, U+5869, U+5947, U+598a, U+5999, U+5e55, U+5e72, U+5e79, U+5fae, U+5fb9, U+602a, U+6163, U+624d, U+6749, U+6c5a, U+6cbf, U+6d45, U+6dfb, U+6e7e, U+708e, U+725b, U+7763, U+79c0, U+7bc4, U+7c89, U+7e01, U+7e2e, U+8010, U+8033, U+8c6a, U+8cc3, U+8f1d, U+8f9b, U+8fb2, U+907f, U+90f7, U+9707, U+9818, U+9b3c, U+ff0a, U+ff4d',
		'[95]':
			'U+2193, U+25b2, U+4e4b, U+516d, U+51c4, U+529f, U+52c9, U+5360, U+5442, U+5857, U+5915, U+59eb, U+5a9b, U+5c3b, U+6012, U+61b6, U+62b1, U+6311, U+6577, U+65e2, U+65ec, U+6613, U+6790, U+6cb9, U+7372, U+76ae, U+7d5e, U+7fcc, U+88ab, U+88d5, U+8caf, U+8ddd, U+8ecd, U+8f38, U+8f9e, U+8feb, U+9063, U+90f5, U+93e1, U+968a, U+968f, U+98fe, U+9ec4, U+ff1d, U+ff27, U+ff2a, U+ff36, U+ff3b, U+ff3d, U+ffe5',
		'[97]':
			'U+7e, U+b4, U+25c6, U+2661, U+4e92, U+4eee, U+4ffa, U+5144, U+5237, U+5287, U+52b4, U+58c1, U+5bff, U+5c04, U+5c06, U+5e95, U+5f31, U+5f93, U+63c3, U+640d, U+6557, U+6614, U+662f, U+67d3, U+690d, U+6bba, U+6e6f, U+72af, U+732b, U+7518, U+7ae0, U+7ae5, U+7af6, U+822a, U+89e6, U+8a3a, U+8a98, U+8cb8, U+8de1, U+8e8d, U+95d8, U+961c, U+96a3, U+96ea, U+9bae, U+ff20, U+ff22, U+ff29, U+ff2b-ff2c',
		'[99]':
			'U+2191, U+505c, U+52e4, U+5305, U+535a, U+56e0, U+59bb, U+5acc, U+5b09, U+5b87, U+5c90, U+5df1, U+5e2d, U+5e33, U+5f3e, U+6298, U+6383, U+653b, U+6697, U+6804, U+6a39, U+6cca, U+6e90, U+6f2b, U+702c, U+7206, U+7236, U+7559, U+7565, U+7591, U+75c7, U+75db, U+7b4b, U+7bb1, U+7d99, U+7fbd, U+8131, U+885b, U+8b1d, U+8ff7, U+9003, U+9045, U+96a0, U+9732, U+990a, U+99d0, U+9e97, U+9f62, U+ff25, U+ff2d',
		'[102]':
			'U+3d, U+5e, U+25cf, U+4e0e, U+4e5d, U+4e73, U+4e94, U+4f3c, U+5009, U+5145, U+51ac, U+5238, U+524a, U+53f3, U+547c, U+5802, U+5922, U+5a66, U+5c0e, U+5de6, U+5fd8, U+5feb, U+6797, U+685c, U+6b7b, U+6c5f-6c60, U+6cc9, U+6ce2, U+6d17, U+6e21, U+7167, U+7642, U+76db, U+8001, U+821e, U+8857, U+89d2, U+8b1b, U+8b70, U+8cb4, U+8cde, U+8f03, U+8f2a, U+968e, U+9b54, U+9e7f, U+9ebb, U+ff05, U+ff33',
		'[103]':
			'U+500d, U+5074, U+50cd, U+5175, U+52e2, U+5352, U+5354, U+53f2, U+5409, U+56fa, U+5a18, U+5b88, U+5bdd, U+5ca9, U+5f92, U+5fa9, U+60a9, U+623f, U+6483, U+653f, U+666f, U+66ae, U+66f2, U+6a21, U+6b66, U+6bcd, U+6d5c, U+796d, U+7a4d, U+7aef, U+7b56, U+7b97, U+7c4d, U+7e04, U+7fa9, U+8377, U+83dc, U+83ef, U+8535, U+8863, U+88cf, U+88dc, U+8907, U+8acb, U+90ce, U+91dd, U+ff0b, U+ff0d, U+ff19, U+ff65',
		'[104]':
			'U+4e01, U+4e21, U+4e38, U+52a9, U+547d, U+592e, U+5931, U+5b63, U+5c40, U+5dde, U+5e78, U+5efa, U+5fa1, U+604b, U+6075, U+62c5, U+632f, U+6a19, U+6c0f, U+6c11, U+6c96, U+6e05, U+70ba, U+71b1, U+7387, U+7403, U+75c5, U+77ed, U+795d, U+7b54, U+7cbe, U+7d19, U+7fa4, U+8089, U+81f4, U+8208, U+8336, U+8457, U+8a33, U+8c4a, U+8ca0, U+8ca8, U+8cc0, U+9014, U+964d, U+9803, U+983c, U+98db, U+ff17, U+ff21',
		'[105]':
			'U+25, U+25a0, U+4e26, U+4f4e, U+5341, U+56f2, U+5bbf, U+5c45, U+5c55, U+5c5e, U+5dee, U+5e9c, U+5f7c, U+6255, U+627f, U+62bc, U+65cf, U+661f, U+666e, U+66dc, U+67fb, U+6975, U+6a4b, U+6b32, U+6df1, U+6e29, U+6fc0, U+738b, U+7686, U+7a76, U+7a81, U+7c73, U+7d75, U+7dd2, U+82e5, U+82f1, U+85ac, U+888b, U+899a, U+8a31, U+8a8c, U+8ab0, U+8b58, U+904a, U+9060, U+9280, U+95b2, U+984d, U+9ce5, U+ff18',
		'[106]':
			'U+30f6, U+50ac, U+5178, U+51e6, U+5224, U+52dd, U+5883, U+5897, U+590f, U+5a5a, U+5bb3, U+5c65, U+5e03, U+5e2b, U+5e30, U+5eb7, U+6271, U+63f4, U+64ae, U+6574, U+672b, U+679a, U+6a29-6a2a, U+6ca2, U+6cc1, U+6d0b, U+713c, U+74b0, U+7981, U+7a0b, U+7bc0, U+7d1a, U+7d61, U+7fd2, U+822c, U+8996, U+89aa, U+8cac, U+8cbb, U+8d77, U+8def, U+9020, U+9152, U+9244, U+9662, U+967a, U+96e3, U+9759, U+ff16',
		'[107]':
			'U+23, U+3c, U+2192, U+4e45, U+4efb, U+4f50, U+4f8b, U+4fc2, U+5024, U+5150, U+5272, U+5370, U+53bb, U+542b, U+56db, U+56e3, U+57ce, U+5bc4, U+5bcc, U+5f71, U+60aa, U+6238, U+6280, U+629c, U+6539, U+66ff, U+670d, U+677e-677f, U+6839, U+69cb, U+6b4c, U+6bb5, U+6e96, U+6f14, U+72ec, U+7389, U+7814, U+79cb, U+79d1, U+79fb, U+7a0e, U+7d0d, U+85e4, U+8d64, U+9632, U+96e2, U+9805, U+99ac, U+ff1e',
		'[109]':
			'U+266a, U+4f11, U+533a, U+5343, U+534a, U+53cd, U+5404, U+56f3, U+5b57-5b58, U+5bae, U+5c4a, U+5e0c, U+5e2f, U+5eab, U+5f35, U+5f79, U+614b, U+6226, U+629e, U+65c5, U+6625, U+6751, U+6821, U+6b69, U+6b8b, U+6bce, U+6c42, U+706b, U+7c21, U+7cfb, U+805e, U+80b2, U+82b8, U+843d, U+8853, U+88c5, U+8a3c, U+8a66, U+8d8a, U+8fba, U+9069, U+91cf, U+9752, U+975e, U+9999, U+ff0f-ff10, U+ff14-ff15',
		'[110]':
			'U+40, U+4e86, U+4e95, U+4f01, U+4f1d, U+4fbf, U+5099, U+5171, U+5177, U+53cb, U+53ce, U+53f0, U+5668, U+5712, U+5ba4, U+5ca1, U+5f85, U+60f3, U+653e, U+65ad, U+65e9, U+6620, U+6750, U+6761, U+6b62, U+6b74, U+6e08, U+6e80, U+7248, U+7531, U+7533, U+753a, U+77f3, U+798f, U+7f6e, U+8449, U+88fd, U+89b3, U+8a55, U+8ac7, U+8b77, U+8db3, U+8efd, U+8fd4, U+9031-9032, U+9580, U+9589, U+96d1, U+985e',
		'[111]':
			'U+2b, U+d7, U+300e-300f, U+4e07, U+4e8c, U+512a, U+5149, U+518d, U+5236, U+52b9, U+52d9, U+5468, U+578b, U+57fa, U+5b8c, U+5ba2, U+5c02, U+5de5, U+5f37, U+5f62, U+623b, U+63d0, U+652f, U+672a, U+6848, U+6d41, U+7136, U+7537, U+754c, U+76f4, U+79c1, U+7ba1, U+7d44, U+7d4c, U+7dcf, U+7dda, U+7de8, U+82b1, U+897f, U+8ca9, U+8cfc, U+904e, U+9664, U+982d, U+9858, U+98a8, U+9a13, U+ff13, U+ff5c',
		'[113]':
			'U+26, U+5f, U+2026, U+203b, U+4e09, U+4eac, U+4ed5, U+4fa1, U+5143, U+5199, U+5207, U+539f, U+53e3, U+53f7, U+5411, U+5473, U+5546, U+55b6, U+5929, U+597d, U+5bb9, U+5c11, U+5c4b, U+5ddd, U+5f97, U+5fc5, U+6295, U+6301, U+6307, U+671b, U+76f8, U+78ba, U+795e, U+7d30, U+7d39, U+7d9a, U+89e3, U+8a00, U+8a73, U+8a8d, U+8a9e, U+8aad, U+8abf, U+8cea, U+8eca, U+8ffd, U+904b, U+9650, U+ff11-ff12',
		'[114]':
			'U+3e, U+3005, U+4e0d, U+4e88, U+4ecb, U+4ee3, U+4ef6, U+4fdd, U+4fe1, U+500b, U+50cf, U+5186, U+5316, U+53d7, U+540c, U+544a, U+54e1, U+5728, U+58f2, U+5973, U+5b89, U+5c71, U+5e02, U+5e97, U+5f15, U+5fc3, U+5fdc, U+601d, U+611b, U+611f, U+671f, U+6728, U+6765, U+683c, U+6b21, U+6ce8, U+6d3b, U+6d77, U+7530, U+7740, U+7acb, U+7d50, U+826f, U+8f09, U+8fbc, U+9001, U+9053, U+91ce, U+9762, U+98df',
		'[115]':
			'U+7c, U+3080, U+4ee5, U+5148, U+516c, U+521d, U+5225, U+529b, U+52a0, U+53ef, U+56de, U+56fd, U+5909, U+591a, U+5b66, U+5b9f, U+5bb6, U+5bfe, U+5e73, U+5e83, U+5ea6, U+5f53, U+6027, U+610f, U+6210, U+6240, U+660e, U+66f4, U+66f8, U+6709, U+6771, U+697d, U+69d8, U+6a5f, U+6c34, U+6cbb, U+73fe, U+756a, U+7684, U+771f, U+793a, U+7f8e, U+898f, U+8a2d, U+8a71, U+8fd1, U+9078, U+9577, U+96fb, U+ff5e',
		'[116]':
			'U+a9, U+3010-3011, U+30e2, U+4e0b, U+4eca, U+4ed6, U+4ed8, U+4f53, U+4f5c, U+4f7f, U+53d6, U+540d, U+54c1, U+5730, U+5916, U+5b50, U+5c0f, U+5f8c, U+624b, U+6570, U+6587, U+6599, U+691c, U+696d, U+6cd5, U+7269, U+7279, U+7406, U+767a-767b, U+77e5, U+7d04, U+7d22, U+8005, U+80fd, U+81ea, U+8868, U+8981, U+89a7, U+901a, U+9023, U+90e8, U+91d1, U+9332, U+958b, U+96c6, U+9ad8, U+ff1a, U+ff1f',
		'[117]':
			'U+4e, U+a0, U+3000, U+300c-300d, U+4e00, U+4e0a, U+4e2d, U+4e8b, U+4eba, U+4f1a, U+5165, U+5168, U+5185, U+51fa, U+5206, U+5229, U+524d, U+52d5, U+5408, U+554f, U+5831, U+5834, U+5927, U+5b9a, U+5e74, U+5f0f, U+60c5, U+65b0, U+65b9, U+6642, U+6700, U+672c, U+682a, U+6b63, U+6c17, U+7121, U+751f, U+7528, U+753b, U+76ee, U+793e, U+884c, U+898b, U+8a18, U+9593, U+95a2, U+ff01, U+ff08-ff09',
		'[118]':
			'U+21-22, U+27-2a, U+2c-3b, U+3f, U+41-4d, U+4f-5d, U+61-7b, U+7d, U+ab, U+ae, U+b2-b3, U+b7, U+bb, U+c9, U+cd, U+d6, U+d8, U+dc, U+e0-e5, U+e7-ed, U+ef, U+f1-f4, U+f6, U+f8, U+fa, U+fc-fd, U+103, U+14d, U+1b0, U+300-301, U+1ebf, U+1ec7, U+2013-2014, U+201c-201d, U+2039-203a, U+203c, U+2048-2049, U+2113, U+2122, U+65e5, U+6708, U+70b9',
		'[119]':
			'U+20, U+2027, U+3001-3002, U+3041-307f, U+3081-308f, U+3091-3093, U+3099-309a, U+309d-309e, U+30a1-30e1, U+30e3-30ed, U+30ef-30f0, U+30f2-30f4, U+30fb-30fe, U+ff0c, U+ff0e',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'300': {
				'[3]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.3.woff2',
				'[54]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.54.woff2',
				'[58]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.58.woff2',
				'[59]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.59.woff2',
				'[61]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.61.woff2',
				'[65]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.65.woff2',
				'[70]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.70.woff2',
				'[71]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.71.woff2',
				'[79]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.79.woff2',
				'[82]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.82.woff2',
				'[83]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.83.woff2',
				'[84]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.84.woff2',
				'[86]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.86.woff2',
				'[87]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.87.woff2',
				'[89]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.89.woff2',
				'[91]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.91.woff2',
				'[93]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.93.woff2',
				'[95]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.95.woff2',
				'[97]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.97.woff2',
				'[99]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.99.woff2',
				'[102]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.102.woff2',
				'[103]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.103.woff2',
				'[104]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.104.woff2',
				'[105]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.105.woff2',
				'[106]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.106.woff2',
				'[107]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.107.woff2',
				'[109]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.109.woff2',
				'[110]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.110.woff2',
				'[111]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.111.woff2',
				'[113]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.113.woff2',
				'[114]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.114.woff2',
				'[115]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.115.woff2',
				'[116]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.116.woff2',
				'[117]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.117.woff2',
				'[118]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.118.woff2',
				'[119]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.119.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsaPrkS7T8.woff2',
				latin:
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VkVsaMLkS.woff2',
			},
			'400': {
				'[3]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.3.woff2',
				'[54]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.54.woff2',
				'[58]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.58.woff2',
				'[59]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.59.woff2',
				'[61]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.61.woff2',
				'[65]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.65.woff2',
				'[70]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.70.woff2',
				'[71]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.71.woff2',
				'[79]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.79.woff2',
				'[82]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.82.woff2',
				'[83]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.83.woff2',
				'[84]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.84.woff2',
				'[86]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.86.woff2',
				'[87]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.87.woff2',
				'[89]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.89.woff2',
				'[91]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.91.woff2',
				'[93]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.93.woff2',
				'[95]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.95.woff2',
				'[97]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.97.woff2',
				'[99]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.99.woff2',
				'[102]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.102.woff2',
				'[103]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.103.woff2',
				'[104]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.104.woff2',
				'[105]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.105.woff2',
				'[106]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.106.woff2',
				'[107]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.107.woff2',
				'[109]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.109.woff2',
				'[110]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.110.woff2',
				'[111]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.111.woff2',
				'[113]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.113.woff2',
				'[114]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.114.woff2',
				'[115]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.115.woff2',
				'[116]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.116.woff2',
				'[117]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.117.woff2',
				'[118]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.118.woff2',
				'[119]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7tOBsePYl9tE4unb6zDxeJE5P6vlm-9aQ.119.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7dNHkPD5g.woff2',
				latin:
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoc3LJNksWZO0LvnZwkF3HtoB7dOnkP.woff2',
			},
			'500': {
				'[3]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.3.woff2',
				'[54]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.54.woff2',
				'[58]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.58.woff2',
				'[59]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.59.woff2',
				'[61]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.61.woff2',
				'[65]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.65.woff2',
				'[70]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.70.woff2',
				'[71]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.71.woff2',
				'[79]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.79.woff2',
				'[82]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.82.woff2',
				'[83]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.83.woff2',
				'[84]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.84.woff2',
				'[86]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.86.woff2',
				'[87]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.87.woff2',
				'[89]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.89.woff2',
				'[91]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.91.woff2',
				'[93]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.93.woff2',
				'[95]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.95.woff2',
				'[97]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.97.woff2',
				'[99]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.99.woff2',
				'[102]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.102.woff2',
				'[103]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.103.woff2',
				'[104]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.104.woff2',
				'[105]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.105.woff2',
				'[106]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.106.woff2',
				'[107]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.107.woff2',
				'[109]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.109.woff2',
				'[110]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.110.woff2',
				'[111]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.111.woff2',
				'[113]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.113.woff2',
				'[114]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.114.woff2',
				'[115]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.115.woff2',
				'[116]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.116.woff2',
				'[117]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.117.woff2',
				'[118]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.118.woff2',
				'[119]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.119.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoaPrkS7T8.woff2',
				latin:
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VyVoaMLkS.woff2',
			},
			'600': {
				'[3]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.3.woff2',
				'[54]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.54.woff2',
				'[58]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.58.woff2',
				'[59]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.59.woff2',
				'[61]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.61.woff2',
				'[65]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.65.woff2',
				'[70]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.70.woff2',
				'[71]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.71.woff2',
				'[79]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.79.woff2',
				'[82]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.82.woff2',
				'[83]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.83.woff2',
				'[84]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.84.woff2',
				'[86]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.86.woff2',
				'[87]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.87.woff2',
				'[89]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.89.woff2',
				'[91]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.91.woff2',
				'[93]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.93.woff2',
				'[95]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.95.woff2',
				'[97]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.97.woff2',
				'[99]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.99.woff2',
				'[102]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.102.woff2',
				'[103]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.103.woff2',
				'[104]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.104.woff2',
				'[105]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.105.woff2',
				'[106]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.106.woff2',
				'[107]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.107.woff2',
				'[109]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.109.woff2',
				'[110]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.110.woff2',
				'[111]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.111.woff2',
				'[113]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.113.woff2',
				'[114]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.114.woff2',
				'[115]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.115.woff2',
				'[116]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.116.woff2',
				'[117]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.117.woff2',
				'[118]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.118.woff2',
				'[119]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0qMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.119.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0aPrkS7T8.woff2',
				latin:
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7V5V0aMLkS.woff2',
			},
			'700': {
				'[3]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.3.woff2',
				'[54]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.54.woff2',
				'[58]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.58.woff2',
				'[59]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.59.woff2',
				'[61]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.61.woff2',
				'[65]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.65.woff2',
				'[70]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.70.woff2',
				'[71]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.71.woff2',
				'[79]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.79.woff2',
				'[82]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.82.woff2',
				'[83]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.83.woff2',
				'[84]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.84.woff2',
				'[86]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.86.woff2',
				'[87]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.87.woff2',
				'[89]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.89.woff2',
				'[91]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.91.woff2',
				'[93]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.93.woff2',
				'[95]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.95.woff2',
				'[97]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.97.woff2',
				'[99]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.99.woff2',
				'[102]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.102.woff2',
				'[103]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.103.woff2',
				'[104]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.104.woff2',
				'[105]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.105.woff2',
				'[106]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.106.woff2',
				'[107]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.107.woff2',
				'[109]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.109.woff2',
				'[110]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.110.woff2',
				'[111]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.111.woff2',
				'[113]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.113.woff2',
				'[114]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.114.woff2',
				'[115]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.115.woff2',
				'[116]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.116.woff2',
				'[117]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.117.woff2',
				'[118]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.118.woff2',
				'[119]':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwqMtsD3y4lkquhBC2eE6r_rlOrkMh-t88.119.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwaPrkS7T8.woff2',
				latin:
					'https://fonts.gstatic.com/s/tsukimirounded/v13/sJoZ3LJNksWZO0LvnZwkF3HtoB7VgVwaMLkS.woff2',
			},
		},
	},
	subsets: ['japanese', 'latin', 'latin-ext'],
});

export const fontFamily = 'Tsukimi Rounded' as const;

type Variants = {
	normal: {
		weights: '300' | '400' | '500' | '600' | '700';
		subsets: 'japanese' | 'latin' | 'latin-ext';
	};
};

export const loadFont = <T extends keyof Variants>(
	style?: T,
	options?: {
		weights?: Variants[T]['weights'][];
		subsets?: Variants[T]['subsets'][];
		document?: Document;
		ignoreTooManyRequestsWarning?: boolean;
	},
) => {
	return loadFonts(getInfo(), style, options);
};
