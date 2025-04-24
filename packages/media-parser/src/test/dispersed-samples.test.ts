import {getPrivateExampleVideo} from '@remotion/example-videos';
import {beforeAll, expect, test} from 'bun:test';
import {calculateJumpMarks} from '../containers/iso-base-media/mdat/calculate-jump-marks';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';
import type {MinimalFlatSampleForTesting} from '../state/iso-base-media/cached-sample-positions';

const flatSamples: MinimalFlatSampleForTesting[][] = [
	[
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 0, offset: 3232},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1500, offset: 60352},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3000, offset: 93936},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 4500, offset: 116422},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 6000, offset: 185896},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 7500, offset: 272957},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 9000, offset: 380471},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 10500, offset: 460186},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 12000, offset: 529783},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 13500, offset: 577278},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 15000, offset: 623207},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 16500, offset: 661884},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 18000, offset: 730419},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 19500, offset: 752459},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 21000, offset: 778768},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 22500, offset: 845036},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 24000, offset: 918257},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 25500, offset: 981643},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 27000, offset: 1050496},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 28500, offset: 1101255},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 30000, offset: 1157922},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 31500, offset: 1201170},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 33000, offset: 1276128},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 34500, offset: 1295304},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 36000, offset: 1319458},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 37500, offset: 1379021},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 39000, offset: 1446711},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 40500, offset: 1504636},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 42000, offset: 1567779},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 43500, offset: 1629951},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 45000, offset: 1697892},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 46500, offset: 1934936},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 48000, offset: 2011476},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 49500, offset: 2028835},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 51000, offset: 2056189},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 52500, offset: 2125120},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 54000, offset: 2191972},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 55500, offset: 2250300},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 57000, offset: 2305847},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 58500, offset: 2375099},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 60000, offset: 2443335},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 61500, offset: 2461439},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 63000, offset: 2504626},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 64500, offset: 2561753},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 66000, offset: 2617365},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 67500, offset: 2665785},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 69000, offset: 2717836},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 70500, offset: 2764495},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 72000, offset: 2821569},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 73500, offset: 2845222},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 75000, offset: 2879062},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 76500, offset: 2953204},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 78000, offset: 3048224},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 79500, offset: 3093644},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 81000, offset: 3138649},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 82500, offset: 3180784},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 84000, offset: 3236400},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 85500, offset: 3259997},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 87000, offset: 3292926},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 88500, offset: 3367839},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 90000, offset: 3441975},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 91500, offset: 3682461},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 93000, offset: 3755769},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 94500, offset: 3804985},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 96000, offset: 3857428},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 97500, offset: 3895041},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 99000, offset: 3935533},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 100500, offset: 3976852},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 102000, offset: 4026394},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 103500, offset: 4078293},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 105000, offset: 4131041},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 106500, offset: 4184810},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 108000, offset: 4260561},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 109500, offset: 4278563},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 111000, offset: 4298788},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 112500, offset: 4386895},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 114000, offset: 4479450},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 115500, offset: 4561865},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 117000, offset: 4632374},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 118500, offset: 4695507},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 120000, offset: 4751522},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 121500, offset: 4782665},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 123000, offset: 4841594},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 124500, offset: 4858747},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 126000, offset: 4880580},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 127500, offset: 4975878},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 129000, offset: 5075245},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 130500, offset: 5125930},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 132000, offset: 5174518},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 133500, offset: 5237091},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 135000, offset: 5297949},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 136500, offset: 5454865},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 138000, offset: 5495650},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 139500, offset: 5511854},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 141000, offset: 5529496},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 142500, offset: 5598297},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 144000, offset: 5673225},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 145500, offset: 5691733},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 147000, offset: 5713964},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 148500, offset: 5770220},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 150000, offset: 5836246},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 151500, offset: 5919455},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 153000, offset: 6014507},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 154500, offset: 6053114},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 156000, offset: 6088130},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 157500, offset: 6136773},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 159000, offset: 6192524},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 160500, offset: 6212377},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 162000, offset: 6241270},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 163500, offset: 6311133},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 165000, offset: 6383661},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 166500, offset: 6467290},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 168000, offset: 6553307},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 169500, offset: 6595940},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 171000, offset: 6639691},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 172500, offset: 6674066},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 174000, offset: 6719435},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 175500, offset: 6741603},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 177000, offset: 6771359},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 178500, offset: 6853727},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 180000, offset: 6937669},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 181500, offset: 7173303},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 183000, offset: 7242784},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 184500, offset: 7290507},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 186000, offset: 7349126},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 187500, offset: 7403084},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 189000, offset: 7453333},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 190500, offset: 7470596},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 192000, offset: 7492798},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 193500, offset: 7571095},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 195000, offset: 7654215},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 196500, offset: 7698182},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 198000, offset: 7762412},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 199500, offset: 7816932},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 201000, offset: 7865998},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 202500, offset: 7899024},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 204000, offset: 7934638},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 205500, offset: 7975763},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 207000, offset: 8026997},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 208500, offset: 8047549},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 210000, offset: 8077523},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 211500, offset: 8567263},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 213000, offset: 8689502},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 214500, offset: 8714473},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 216000, offset: 8746207},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 217500, offset: 8777775},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 219000, offset: 8808887},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 220500, offset: 8837479},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 222000, offset: 8866701},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 223500, offset: 8885878},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 225000, offset: 8917980},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 226500, offset: 9058286},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 228000, offset: 9108775},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 229500, offset: 9137179},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 231000, offset: 9168261},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 232500, offset: 9200523},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 234000, offset: 9240773},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 235500, offset: 9281483},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 237000, offset: 9323304},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 238500, offset: 9360708},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 240000, offset: 9408510},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 241500, offset: 9433015},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 243000, offset: 9491604},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 244500, offset: 9548761},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 246000, offset: 9604932},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 247500, offset: 9649973},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 249000, offset: 9700905},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 250500, offset: 9724267},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 252000, offset: 9755702},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 253500, offset: 9816666},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 255000, offset: 9881540},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 256500, offset: 9944421},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 258000, offset: 10034080},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 259500, offset: 10080642},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 261000, offset: 10125402},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 262500, offset: 10146772},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 264000, offset: 10175735},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 265500, offset: 10246137},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 267000, offset: 10319452},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 268500, offset: 10381868},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 270000, offset: 10445719},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 271500, offset: 10702772},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 273000, offset: 10774432},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 274500, offset: 10817252},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 276000, offset: 10868007},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 277500, offset: 10901061},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 279000, offset: 10935888},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 280500, offset: 10972549},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 282000, offset: 11014431},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 283500, offset: 11051779},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 285000, offset: 11096320},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 286500, offset: 11119510},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 288000, offset: 11178021},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 289500, offset: 11231641},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 291000, offset: 11282088},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 292500, offset: 11332028},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 294000, offset: 11389005},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 295500, offset: 11434572},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 297000, offset: 11488671},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 298500, offset: 11530014},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 300000, offset: 11575888},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 301500, offset: 11600294},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 303000, offset: 11661783},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 304500, offset: 11716853},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 306000, offset: 11774547},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 307500, offset: 11814889},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 309000, offset: 11862389},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 310500, offset: 11903825},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 312000, offset: 11957088},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 313500, offset: 12007530},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 315000, offset: 12063293},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 316500, offset: 12337366},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 318000, offset: 12386848},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 319500, offset: 12440849},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 321000, offset: 12492821},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 322500, offset: 12511377},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 324000, offset: 12539435},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 325500, offset: 12607379},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 327000, offset: 12679254},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 328500, offset: 12737151},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 330000, offset: 12796836},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 331500, offset: 12817928},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 333000, offset: 12873776},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 334500, offset: 12923054},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 336000, offset: 12971374},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 337500, offset: 13021730},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 339000, offset: 13081266},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 340500, offset: 13107042},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 342000, offset: 13140732},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 343500, offset: 13209144},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 345000, offset: 13279527},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 346500, offset: 13343469},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 348000, offset: 13427895},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 349500, offset: 13469159},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 351000, offset: 13508505},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 352500, offset: 13544386},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 354000, offset: 13592284},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 355500, offset: 13615337},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 357000, offset: 13647099},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 358500, offset: 13723011},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 360000, offset: 13800305},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 361500, offset: 14120155},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 363000, offset: 14201111},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 364500, offset: 14238612},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 366000, offset: 14286371},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 367500, offset: 14319485},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 369000, offset: 14356852},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 370500, offset: 14377435},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 372000, offset: 14404742},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 373500, offset: 14461630},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 375000, offset: 14517916},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 376500, offset: 14568204},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 378000, offset: 14648186},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 379500, offset: 14689786},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 381000, offset: 14729796},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 382500, offset: 14768275},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 384000, offset: 14811184},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 385500, offset: 14832124},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 387000, offset: 14860956},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 388500, offset: 14930617},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 390000, offset: 15008031},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 391500, offset: 15062225},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 393000, offset: 15151332},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 394500, offset: 15199091},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 396000, offset: 15243948},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 397500, offset: 15283800},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 399000, offset: 15330550},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 400500, offset: 15356674},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 402000, offset: 15392086},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 403500, offset: 15456536},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 405000, offset: 15524987},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 406500, offset: 15814175},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 408000, offset: 15891678},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 409500, offset: 15929896},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 411000, offset: 15968347},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 412500, offset: 16003756},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 414000, offset: 16044243},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 415500, offset: 16065098},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 417000, offset: 16092420},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 418500, offset: 16149693},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 420000, offset: 16208523},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 421500, offset: 16259883},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 423000, offset: 16337214},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 424500, offset: 16381477},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 426000, offset: 16425554},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 427500, offset: 16466584},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 429000, offset: 16512831},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 430500, offset: 16536274},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 432000, offset: 16571686},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 433500, offset: 16632631},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 435000, offset: 16697156},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 436500, offset: 16762209},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 438000, offset: 16849971},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 439500, offset: 16896485},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 441000, offset: 16942713},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 442500, offset: 16988398},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 444000, offset: 17042244},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 445500, offset: 17068040},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 447000, offset: 17104011},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 448500, offset: 17172771},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 450000, offset: 17241631},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 451500, offset: 17493353},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 453000, offset: 17574559},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 454500, offset: 17620523},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 456000, offset: 17672041},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 457500, offset: 17705303},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 459000, offset: 17739254},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 460500, offset: 17759631},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 462000, offset: 17788740},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 463500, offset: 17847506},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 465000, offset: 17907679},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 466500, offset: 17967104},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 468000, offset: 18042969},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 469500, offset: 18084516},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 471000, offset: 18124234},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 472500, offset: 18142171},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 474000, offset: 18173712},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 475500, offset: 18233761},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 477000, offset: 18298267},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 478500, offset: 18345795},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 480000, offset: 18399694},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 481500, offset: 18427590},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 483000, offset: 18490603},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 484500, offset: 18550113},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 486000, offset: 18607222},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 487500, offset: 18653562},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 489000, offset: 18707007},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 490500, offset: 18735927},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 492000, offset: 18775587},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 493500, offset: 18854493},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 495000, offset: 18932798},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 496500, offset: 19193112},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 498000, offset: 19246226},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 499500, offset: 19299489},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 501000, offset: 19353559},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 502500, offset: 19394699},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 504000, offset: 19440186},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 505500, offset: 19490573},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 507000, offset: 19540686},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 508500, offset: 19583508},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 510000, offset: 19631169},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 511500, offset: 19653293},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 513000, offset: 19706612},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 514500, offset: 19759175},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 516000, offset: 19809175},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 517500, offset: 19856810},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 519000, offset: 19909607},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 520500, offset: 19934867},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 522000, offset: 19969122},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 523500, offset: 20037161},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 525000, offset: 20108215},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 526500, offset: 20176684},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 528000, offset: 20258212},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 529500, offset: 20303535},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 531000, offset: 20346688},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 532500, offset: 20386224},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 534000, offset: 20428327},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 535500, offset: 20455043},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 537000, offset: 20491818},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 538500, offset: 20562861},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 540000, offset: 20630472},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 541500, offset: 20865052},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 543000, offset: 20942441},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 544500, offset: 20976104},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 546000, offset: 21012457},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 547500, offset: 21041860},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 549000, offset: 21076982},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 550500, offset: 21113267},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 552000, offset: 21156903},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 553500, offset: 21186345},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 555000, offset: 21226613},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 556500, offset: 21289128},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 558000, offset: 21380658},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 559500, offset: 21429609},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 561000, offset: 21476694},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 562500, offset: 21521729},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 564000, offset: 21572668},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 565500, offset: 21623334},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 567000, offset: 21679007},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 568500, offset: 21729298},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 570000, offset: 21783171},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 571500, offset: 21808776},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 573000, offset: 21868654},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 574500, offset: 21926846},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 576000, offset: 21987037},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 577500, offset: 22010939},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 579000, offset: 22042003},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 580500, offset: 22247362},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 582000, offset: 22370448},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 583500, offset: 22406889},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 585000, offset: 22442290},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 586500, offset: 22576062},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 588000, offset: 22625225},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 589500, offset: 22661357},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 591000, offset: 22697752},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 592500, offset: 22728477},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 594000, offset: 22771732},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 595500, offset: 22805559},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 597000, offset: 22843982},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 598500, offset: 22888082},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 600000, offset: 22940405},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 601500, offset: 22966583},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 603000, offset: 23027941},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 604500, offset: 23090262},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 606000, offset: 23148601},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 607500, offset: 23173828},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 609000, offset: 23209033},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 610500, offset: 23284405},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 612000, offset: 23361974},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 613500, offset: 23433531},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 615000, offset: 23499794},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 616500, offset: 23547440},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 618000, offset: 23617868},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 619500, offset: 23656823},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 621000, offset: 23694345},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 622500, offset: 23728845},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 624000, offset: 23776166},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 625500, offset: 23804477},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 627000, offset: 23842470},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 628500, offset: 23917501},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 630000, offset: 23992593},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 631500, offset: 24251313},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 633000, offset: 24334132},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 634500, offset: 24377343},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 636000, offset: 24426347},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 637500, offset: 24463033},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 639000, offset: 24501434},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 640500, offset: 24537721},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 642000, offset: 24577970},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 643500, offset: 24603565},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 645000, offset: 24639394},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 646500, offset: 24710782},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 648000, offset: 24805900},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 649500, offset: 24852213},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 651000, offset: 24896788},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 652500, offset: 24936260},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 654000, offset: 24981118},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 655500, offset: 25026630},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 657000, offset: 25075356},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 658500, offset: 25120964},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 660000, offset: 25169935},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 661500, offset: 25213171},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 663000, offset: 25286032},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 664500, offset: 25312527},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 666000, offset: 25343622},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 667500, offset: 25369040},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 669000, offset: 25404403},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 670500, offset: 25514833},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 672000, offset: 25625790},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 673500, offset: 25691732},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 675000, offset: 25754210},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 676500, offset: 25980068},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 678000, offset: 26053276},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 679500, offset: 26070611},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 681000, offset: 26094606},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 682500, offset: 26144358},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 684000, offset: 26204481},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 685500, offset: 26247671},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 687000, offset: 26290962},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 688500, offset: 26317178},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 690000, offset: 26350213},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 691500, offset: 26421833},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 693000, offset: 26517822},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 694500, offset: 26544831},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 696000, offset: 26576824},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 697500, offset: 26635078},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 699000, offset: 26696083},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 700500, offset: 26757911},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 702000, offset: 26817490},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 703500, offset: 26875734},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 705000, offset: 26930458},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 706500, offset: 26978541},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 708000, offset: 27048067},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 709500, offset: 27072555},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 711000, offset: 27101314},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 712500, offset: 27171935},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 714000, offset: 27243759},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 715500, offset: 27307647},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 717000, offset: 27367351},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 718500, offset: 27416335},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 720000, offset: 27465335},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 721500, offset: 27655256},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 723000, offset: 27718418},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 724500, offset: 27754846},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 726000, offset: 27794095},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 727500, offset: 27813896},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 729000, offset: 27841282},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 730500, offset: 27890887},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 732000, offset: 27945782},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 733500, offset: 27998041},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 735000, offset: 28051108},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 736500, offset: 28109731},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 738000, offset: 28192754},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 739500, offset: 28238215},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 741000, offset: 28280025},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 742500, offset: 28319045},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 744000, offset: 28361227},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 745500, offset: 28411356},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 747000, offset: 28465506},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 748500, offset: 28491313},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 750000, offset: 28523486},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 751500, offset: 28590979},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 753000, offset: 28679984},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 754500, offset: 28739848},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 756000, offset: 28791958},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 757500, offset: 28813240},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 759000, offset: 28844456},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 760500, offset: 28915784},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 762000, offset: 28988215},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 763500, offset: 29050832},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 765000, offset: 29107664},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 766500, offset: 29315510},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 768000, offset: 29382060},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 769500, offset: 29426326},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 771000, offset: 29469528},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 772500, offset: 29509915},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 774000, offset: 29553013},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 775500, offset: 29598870},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 777000, offset: 29646564},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 778500, offset: 29669902},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 780000, offset: 29704212},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 781500, offset: 29781921},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 783000, offset: 29872455},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 784500, offset: 29897851},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 786000, offset: 29927238},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 787500, offset: 29989459},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 789000, offset: 30053979},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 790500, offset: 30116904},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 792000, offset: 30176311},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 793500, offset: 30231488},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 795000, offset: 30287442},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 796500, offset: 30336002},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 798000, offset: 30408425},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 799500, offset: 30435669},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 801000, offset: 30463113},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 802500, offset: 30529425},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 804000, offset: 30598019},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 805500, offset: 30669174},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 807000, offset: 30740172},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 808500, offset: 30790521},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 810000, offset: 30843314},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 811500, offset: 31017035},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 813000, offset: 31081089},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 814500, offset: 31104171},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 816000, offset: 31138475},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 817500, offset: 31183794},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 819000, offset: 31229805},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 820500, offset: 31281861},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 822000, offset: 31336015},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 823500, offset: 31359967},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 825000, offset: 31393199},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 826500, offset: 31460158},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 828000, offset: 31546413},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 829500, offset: 31592861},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 831000, offset: 31637561},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 832500, offset: 31679338},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 834000, offset: 31724692},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 835500, offset: 31779180},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 837000, offset: 31837423},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 838500, offset: 31859867},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 840000, offset: 31887094},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 841500, offset: 31974311},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 843000, offset: 32077743},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 844500, offset: 32140322},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 846000, offset: 32198417},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 847500, offset: 32218177},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 849000, offset: 32247569},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 850500, offset: 32345404},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 852000, offset: 32429656},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 853500, offset: 32448674},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 855000, offset: 32473179},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 856500, offset: 32680531},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 858000, offset: 32756453},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 859500, offset: 32803484},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 861000, offset: 32851392},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 862500, offset: 32892085},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 864000, offset: 32936841},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 865500, offset: 32975079},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 867000, offset: 33020366},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 868500, offset: 33044548},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 870000, offset: 33081310},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 871500, offset: 33159406},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 873000, offset: 33252285},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 874500, offset: 33278504},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 876000, offset: 33308270},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 877500, offset: 33367044},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 879000, offset: 33430893},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 880500, offset: 33502955},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 882000, offset: 33575144},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 883500, offset: 33625903},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 885000, offset: 33680082},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 886500, offset: 33726597},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 888000, offset: 33799061},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 889500, offset: 33823096},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 891000, offset: 33851832},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 892500, offset: 33926308},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 894000, offset: 33997501},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 895500, offset: 34020499},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 897000, offset: 34054070},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 898500, offset: 34124544},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 900000, offset: 34198166},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 901500, offset: 34444159},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 903000, offset: 34521550},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 904500, offset: 34544467},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 906000, offset: 34581258},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 907500, offset: 34640180},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 909000, offset: 34693165},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 910500, offset: 34732246},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 912000, offset: 34774640},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 913500, offset: 34797178},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 915000, offset: 34830275},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 916500, offset: 34901308},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 918000, offset: 34993550},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 919500, offset: 35046318},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 921000, offset: 35098324},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 922500, offset: 35143657},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 924000, offset: 35194640},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 925500, offset: 35242117},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 927000, offset: 35296132},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 928500, offset: 35320365},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 930000, offset: 35350010},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 931500, offset: 35421359},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 933000, offset: 35518769},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 934500, offset: 35573704},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 936000, offset: 35629010},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 937500, offset: 35675278},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 939000, offset: 35732058},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 940500, offset: 35782533},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 942000, offset: 35838637},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 943500, offset: 35865209},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 945000, offset: 35896367},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 946500, offset: 36139705},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 948000, offset: 36213612},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 949500, offset: 36254021},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 951000, offset: 36297614},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 952500, offset: 36333825},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 954000, offset: 36372583},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 955500, offset: 36411464},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 957000, offset: 36459157},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 958500, offset: 36506973},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 960000, offset: 36556046},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 961500, offset: 36580119},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 963000, offset: 36639876},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 964500, offset: 36702237},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 966000, offset: 36763849},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 967500, offset: 36785760},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 969000, offset: 36817159},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 970500, offset: 36892335},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 972000, offset: 36971640},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 973500, offset: 37038490},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 975000, offset: 37098956},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 976500, offset: 37152947},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 978000, offset: 37230309},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 979500, offset: 37255032},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 981000, offset: 37280256},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 982500, offset: 37350737},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 984000, offset: 37424873},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 985500, offset: 37493882},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 987000, offset: 37555182},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 988500, offset: 37603097},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 990000, offset: 37654869},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 991500, offset: 37813740},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 993000, offset: 37867102},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 994500, offset: 37903312},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 996000, offset: 37941217},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 997500, offset: 37959421},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 999000, offset: 37991705},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1000500, offset: 38049922},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1002000, offset: 38112719},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1003500, offset: 38177373},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1005000, offset: 38238792},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1006500, offset: 38260405},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1008000, offset: 38316911},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1009500, offset: 38378884},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1011000, offset: 38439555},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1012500, offset: 38491571},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1014000, offset: 38549880},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1015500, offset: 38606554},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1017000, offset: 38667313},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1018500, offset: 38719759},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1020000, offset: 38773837},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1021500, offset: 38798170},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1023000, offset: 38857335},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1024500, offset: 38927894},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1026000, offset: 38993828},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1027500, offset: 39056384},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1029000, offset: 39117541},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1030500, offset: 39167668},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1032000, offset: 39220959},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1033500, offset: 39244914},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1035000, offset: 39276210},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1036500, offset: 39498002},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1038000, offset: 39567007},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1039500, offset: 39610650},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1041000, offset: 39653904},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1042500, offset: 39690602},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1044000, offset: 39730528},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1045500, offset: 39775480},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1047000, offset: 39823389},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1048500, offset: 39845903},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1050000, offset: 39876509},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1051500, offset: 39959629},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1053000, offset: 40061368},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1054500, offset: 40120116},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1056000, offset: 40172186},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1057500, offset: 40192403},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1059000, offset: 40220210},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1060500, offset: 40296656},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1062000, offset: 40378280},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1063500, offset: 40443652},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1065000, offset: 40502950},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1066500, offset: 40553200},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1068000, offset: 40625478},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1069500, offset: 40686364},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1071000, offset: 40746807},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1072500, offset: 40766682},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1074000, offset: 40795918},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1075500, offset: 40865378},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1077000, offset: 40941363},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1078500, offset: 40995105},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1080000, offset: 41051744},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1081500, offset: 41259152},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1083000, offset: 41329241},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1084500, offset: 41365201},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1086000, offset: 41406826},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1087500, offset: 41426084},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1089000, offset: 41452002},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1090500, offset: 41511904},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1092000, offset: 41572104},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1093500, offset: 41598562},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1095000, offset: 41630846},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1096500, offset: 41695567},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1098000, offset: 41793703},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1099500, offset: 41846907},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1101000, offset: 41902530},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1102500, offset: 41920112},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1104000, offset: 41943112},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1105500, offset: 42028809},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1107000, offset: 42112482},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1108500, offset: 42134730},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1110000, offset: 42160621},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1111500, offset: 42226056},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1113000, offset: 42325584},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1114500, offset: 42381272},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1116000, offset: 42441061},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1117500, offset: 42459989},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1119000, offset: 42485340},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1120500, offset: 42558491},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1122000, offset: 42636090},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1123500, offset: 42655968},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1125000, offset: 42678147},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1126500, offset: 42996566},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1128000, offset: 43071033},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1129500, offset: 43107022},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1131000, offset: 43143842},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1132500, offset: 43158797},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1134000, offset: 43179978},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1135500, offset: 43231940},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1137000, offset: 43298578},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1138500, offset: 43330397},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1140000, offset: 43369456},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1141500, offset: 43404572},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1143000, offset: 43488016},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1144500, offset: 43530523},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1146000, offset: 43575797},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1147500, offset: 43590625},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1149000, offset: 43606631},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1150500, offset: 44241224},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1152000, offset: 44390638},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1153500, offset: 44423924},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1155000, offset: 44461357},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1156500, offset: 44489070},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1158000, offset: 44545373},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1159500, offset: 44568395},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1161000, offset: 44592287},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1162500, offset: 44608353},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1164000, offset: 44629112},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1165500, offset: 44668949},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1167000, offset: 44713329},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1168500, offset: 44753078},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1170000, offset: 44795772},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1171500, offset: 44941277},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1173000, offset: 44988388},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1174500, offset: 45016363},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1176000, offset: 45045918},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1177500, offset: 45057236},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1179000, offset: 45080968},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1180500, offset: 45132522},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1182000, offset: 45184633},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1183500, offset: 45228776},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1185000, offset: 45277766},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1186500, offset: 45331055},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1188000, offset: 45398355},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1189500, offset: 45431704},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1191000, offset: 45465664},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1192500, offset: 45479503},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1194000, offset: 45503680},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1195500, offset: 45574768},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1197000, offset: 45646239},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1198500, offset: 45703255},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1200000, offset: 45762669},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1201500, offset: 45804760},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1203000, offset: 45871968},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1204500, offset: 45905300},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1206000, offset: 45940374},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1207500, offset: 45957295},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1209000, offset: 45983502},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1210500, offset: 46048533},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1212000, offset: 46116917},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1213500, offset: 46184287},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1215000, offset: 46251298},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1216500, offset: 46507354},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1218000, offset: 46583056},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1219500, offset: 46618645},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1221000, offset: 46654872},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1222500, offset: 46668246},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1224000, offset: 46685632},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1225500, offset: 46737646},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1227000, offset: 46791654},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1228500, offset: 46839050},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1230000, offset: 46892180},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1231500, offset: 46943035},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1233000, offset: 47013897},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1234500, offset: 47051289},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1236000, offset: 47090590},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1237500, offset: 47106296},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1239000, offset: 47133865},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1240500, offset: 47194241},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1242000, offset: 47255695},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1243500, offset: 47302785},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1245000, offset: 47358840},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1246500, offset: 47409013},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1248000, offset: 47495191},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1249500, offset: 47536975},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1251000, offset: 47582258},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1252500, offset: 47598361},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1254000, offset: 47623659},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1255500, offset: 47679455},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1257000, offset: 47738264},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1258500, offset: 47800397},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1260000, offset: 47870101},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1261500, offset: 48164128},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1263000, offset: 48247878},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1264500, offset: 48295230},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1266000, offset: 48352797},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1267500, offset: 48368387},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1269000, offset: 48389842},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1270500, offset: 48447374},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1272000, offset: 48506588},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1273500, offset: 48563324},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1275000, offset: 48620733},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1276500, offset: 48669604},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1278000, offset: 48743041},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1279500, offset: 48782795},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1281000, offset: 48822266},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1282500, offset: 48855418},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1284000, offset: 48899089},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1285500, offset: 48937359},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1287000, offset: 48986541},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1288500, offset: 49003769},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1290000, offset: 49030809},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1291500, offset: 49101691},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1293000, offset: 49198538},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1294500, offset: 49251946},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1296000, offset: 49303957},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1297500, offset: 49321271},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1299000, offset: 49349488},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1300500, offset: 49435141},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1302000, offset: 49519764},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1303500, offset: 49544203},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1305000, offset: 49578328},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1306500, offset: 49828947},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1308000, offset: 49905085},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1309500, offset: 49946785},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1311000, offset: 49988831},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1312500, offset: 50027827},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1314000, offset: 50070114},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1315500, offset: 50112386},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1317000, offset: 50157982},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1318500, offset: 50177825},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1320000, offset: 50208922},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1321500, offset: 50279602},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1323000, offset: 50367171},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1324500, offset: 50415656},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1326000, offset: 50467760},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1327500, offset: 50484868},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1329000, offset: 50509722},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1330500, offset: 50585118},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1332000, offset: 50663335},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1333500, offset: 50727755},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1335000, offset: 50788795},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1336500, offset: 50835053},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1338000, offset: 50904823},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1339500, offset: 50948235},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1341000, offset: 50992946},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1342500, offset: 51010189},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1344000, offset: 51042024},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1345500, offset: 51110256},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1347000, offset: 51181001},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1348500, offset: 51241146},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1350000, offset: 51301099},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1351500, offset: 51500862},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1353000, offset: 51566025},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1354500, offset: 51609593},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1356000, offset: 51657384},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1357500, offset: 51676229},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1359000, offset: 51703235},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1360500, offset: 51758216},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1362000, offset: 51815044},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1363500, offset: 51872885},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1365000, offset: 51933032},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1366500, offset: 51981179},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1368000, offset: 52052000},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1369500, offset: 52091833},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1371000, offset: 52131997},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1372500, offset: 52149612},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1374000, offset: 52179837},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1375500, offset: 52242741},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1377000, offset: 52309962},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1378500, offset: 52363776},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1380000, offset: 52424039},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1381500, offset: 52481012},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1383000, offset: 52566830},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1384500, offset: 52618285},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1386000, offset: 52668731},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1387500, offset: 52685680},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1389000, offset: 52710795},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1390500, offset: 52789371},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1392000, offset: 52865952},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1393500, offset: 52933152},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1395000, offset: 52999433},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1396500, offset: 53218552},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1398000, offset: 53288604},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1399500, offset: 53326904},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1401000, offset: 53367221},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1402500, offset: 53382672},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1404000, offset: 53405170},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1405500, offset: 53474064},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1407000, offset: 53543513},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1408500, offset: 53606519},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1410000, offset: 53666282},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1411500, offset: 53720831},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1413000, offset: 53789562},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1414500, offset: 53826544},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1416000, offset: 53864579},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1417500, offset: 53881072},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1419000, offset: 53909647},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1420500, offset: 53971839},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1422000, offset: 54034473},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1423500, offset: 54090179},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1425000, offset: 54151549},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1426500, offset: 54198957},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1428000, offset: 54271148},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1429500, offset: 54315039},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1431000, offset: 54358521},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1432500, offset: 54378148},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1434000, offset: 54411292},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1435500, offset: 54473407},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1437000, offset: 54541721},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1438500, offset: 54599138},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1440000, offset: 54665530},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1441500, offset: 54906612},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1443000, offset: 54972025},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1444500, offset: 55012227},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1446000, offset: 55063301},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1447500, offset: 55081863},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1449000, offset: 55105637},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1450500, offset: 55166599},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1452000, offset: 55231467},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1453500, offset: 55251992},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1455000, offset: 55281855},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1456500, offset: 55335205},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1458000, offset: 55429617},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1459500, offset: 55478927},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1461000, offset: 55530463},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1462500, offset: 55544600},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1464000, offset: 55566330},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1465500, offset: 55621223},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1467000, offset: 55684917},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1468500, offset: 55733841},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1470000, offset: 55791822},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1471500, offset: 55840336},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1473000, offset: 55929811},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1474500, offset: 55988084},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1476000, offset: 56047584},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1477500, offset: 56058835},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1479000, offset: 56074704},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1480500, offset: 56141040},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1482000, offset: 56212827},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1483500, offset: 56301500},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1485000, offset: 56382548},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1486500, offset: 56636327},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1488000, offset: 56680528},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1489500, offset: 56738910},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1491000, offset: 56792962},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1492500, offset: 56834666},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1494000, offset: 56883523},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1495500, offset: 56926896},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1497000, offset: 56975089},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1498500, offset: 57022577},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1500000, offset: 57075362},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1501500, offset: 57093355},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1503000, offset: 57145936},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1504500, offset: 57208325},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1506000, offset: 57271021},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1507500, offset: 57289522},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1509000, offset: 57320810},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1510500, offset: 57392447},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1512000, offset: 57462175},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1513500, offset: 57518746},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1515000, offset: 57571850},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1516500, offset: 57625887},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1518000, offset: 57701861},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1519500, offset: 57741596},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1521000, offset: 57782126},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1522500, offset: 57799734},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1524000, offset: 57826620},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1525500, offset: 57901125},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1527000, offset: 57977242},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1528500, offset: 58051041},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1530000, offset: 58118021},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1531500, offset: 58320553},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1533000, offset: 58390765},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1534500, offset: 58433249},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1536000, offset: 58480403},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1537500, offset: 58497719},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1539000, offset: 58524200},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1540500, offset: 58586574},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1542000, offset: 58649630},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1543500, offset: 58713770},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1545000, offset: 58774891},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1546500, offset: 58794643},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1548000, offset: 58846396},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1549500, offset: 58899825},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1551000, offset: 58951503},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1552500, offset: 59005697},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1554000, offset: 59063516},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1555500, offset: 59113833},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1557000, offset: 59167702},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1558500, offset: 59229399},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1560000, offset: 59290284},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1561500, offset: 59309554},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1563000, offset: 59359705},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1564500, offset: 59415575},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1566000, offset: 59470438},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1567500, offset: 59528264},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1569000, offset: 59587061},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1570500, offset: 59642001},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1572000, offset: 59699550},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1573500, offset: 59756341},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1575000, offset: 59814798},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1576500, offset: 59981770},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1578000, offset: 60017730},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1579500, offset: 60062301},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1581000, offset: 60108232},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1582500, offset: 60149537},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1584000, offset: 60193187},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1585500, offset: 60238528},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1587000, offset: 60287412},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1588500, offset: 60333177},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1590000, offset: 60380744},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1591500, offset: 60398878},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1593000, offset: 60443430},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1594500, offset: 60517267},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1596000, offset: 60589015},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1597500, offset: 60606675},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1599000, offset: 60630226},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1600500, offset: 60728093},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1602000, offset: 60818353},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1603500, offset: 60884510},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1605000, offset: 60941780},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1606500, offset: 60960049},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1608000, offset: 61009459},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1609500, offset: 61077070},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1611000, offset: 61147241},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1612500, offset: 61197859},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1614000, offset: 61250491},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1615500, offset: 61301722},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1617000, offset: 61357041},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1618500, offset: 61408040},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1620000, offset: 61462554},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1621500, offset: 61648929},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1623000, offset: 61712277},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1624500, offset: 61731095},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1626000, offset: 61762797},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1627500, offset: 61808393},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1629000, offset: 61858586},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1630500, offset: 61906842},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1632000, offset: 61958460},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1633500, offset: 62005100},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1635000, offset: 62055294},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1636500, offset: 62105859},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1638000, offset: 62181241},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1639500, offset: 62278997},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1641000, offset: 62358888},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1642500, offset: 62383559},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1644000, offset: 62421066},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1645500, offset: 62449373},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1647000, offset: 62490150},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1648500, offset: 62511028},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1650000, offset: 62549666},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1651500, offset: 62627087},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1653000, offset: 62723877},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1654500, offset: 62781528},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1656000, offset: 62839101},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1657500, offset: 62897037},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1659000, offset: 62957746},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1660500, offset: 63012420},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1662000, offset: 63070334},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1663500, offset: 63093772},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1665000, offset: 63127197},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1666500, offset: 63326344},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1668000, offset: 63403152},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1669500, offset: 63454047},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1671000, offset: 63504376},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1672500, offset: 63549816},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1674000, offset: 63596107},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1675500, offset: 63615166},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1677000, offset: 63644718},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1678500, offset: 63713321},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1680000, offset: 63783980},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1681500, offset: 63850335},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1683000, offset: 63928570},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1684500, offset: 63969575},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1686000, offset: 64010007},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1687500, offset: 64029111},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1689000, offset: 64062082},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1690500, offset: 64123860},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1692000, offset: 64186919},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1693500, offset: 64240336},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1695000, offset: 64297373},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1696500, offset: 64318655},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1698000, offset: 64380991},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1699500, offset: 64454417},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1701000, offset: 64526810},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1702500, offset: 64546710},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1704000, offset: 64574239},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1705500, offset: 64657703},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1707000, offset: 64739782},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1708500, offset: 64814065},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1710000, offset: 64880028},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1711500, offset: 65108611},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1713000, offset: 65150234},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1714500, offset: 65221989},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1716000, offset: 65281121},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1717500, offset: 65296799},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1719000, offset: 65320030},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1720500, offset: 65376409},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1722000, offset: 65436873},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1723500, offset: 65498162},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1725000, offset: 65555777},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1726500, offset: 65605342},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1728000, offset: 65675781},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1729500, offset: 65722412},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1731000, offset: 65769021},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1732500, offset: 65811356},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1734000, offset: 65856823},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1735500, offset: 65875481},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1737000, offset: 65904536},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1738500, offset: 65986341},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1740000, offset: 66062957},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1741500, offset: 66131455},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1743000, offset: 66210272},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1744500, offset: 66249409},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1746000, offset: 66288706},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1747500, offset: 66324674},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1749000, offset: 66375574},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1750500, offset: 66395684},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1752000, offset: 66426608},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1753500, offset: 66508174},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1755000, offset: 66588220},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1756500, offset: 66835307},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1758000, offset: 66923902},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1759500, offset: 66964214},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1761000, offset: 67003585},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1762500, offset: 67042042},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1764000, offset: 67087535},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1765500, offset: 67106364},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1767000, offset: 67132716},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1768500, offset: 67192422},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1770000, offset: 67255585},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1771500, offset: 67317286},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1773000, offset: 67397367},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1774500, offset: 67440057},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1776000, offset: 67486569},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1777500, offset: 67503022},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1779000, offset: 67527139},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1780500, offset: 67604676},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1782000, offset: 67687951},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1783500, offset: 67750407},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1785000, offset: 67807971},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1786500, offset: 67823835},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1788000, offset: 67873868},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1789500, offset: 67933440},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1791000, offset: 67997091},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1792500, offset: 68055926},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1794000, offset: 68115081},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1795500, offset: 68167094},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1797000, offset: 68225879},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1798500, offset: 68272239},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1800000, offset: 68322042},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1801500, offset: 68479466},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1803000, offset: 68532190},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1804500, offset: 68554709},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1806000, offset: 68585122},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1807500, offset: 68626952},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1809000, offset: 68676860},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1810500, offset: 68721641},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1812000, offset: 68775712},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1813500, offset: 68819075},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1815000, offset: 68871402},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1816500, offset: 68920471},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1818000, offset: 68999363},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1819500, offset: 69045733},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1821000, offset: 69093506},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1822500, offset: 69141732},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1824000, offset: 69195860},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1825500, offset: 69217971},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1827000, offset: 69249719},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1828500, offset: 69318846},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1830000, offset: 69388185},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1831500, offset: 69456006},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1833000, offset: 69543648},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1834500, offset: 69592740},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1836000, offset: 69641978},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1837500, offset: 69689255},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1839000, offset: 69740946},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1840500, offset: 69761810},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1842000, offset: 69796183},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1843500, offset: 69865888},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1845000, offset: 69938120},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1846500, offset: 70201267},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1848000, offset: 70273818},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1849500, offset: 70309847},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1851000, offset: 70347283},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1852500, offset: 70386243},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1854000, offset: 70432416},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1855500, offset: 70450165},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1857000, offset: 70476382},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1858500, offset: 70548611},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1860000, offset: 70619775},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1861500, offset: 70685897},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1863000, offset: 70769970},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1864500, offset: 70821031},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1866000, offset: 70872228},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1867500, offset: 70894336},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1869000, offset: 70926980},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1870500, offset: 71000285},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1872000, offset: 71070032},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1873500, offset: 71128788},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1875000, offset: 71185212},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1876500, offset: 71205495},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1878000, offset: 71261535},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1879500, offset: 71327666},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1881000, offset: 71395603},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1882500, offset: 71438992},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1884000, offset: 71491004},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1885500, offset: 71535830},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1887000, offset: 71583256},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1888500, offset: 71629061},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1890000, offset: 71684567},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1891500, offset: 71870237},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1893000, offset: 71908526},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1894500, offset: 71949729},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1896000, offset: 71997844},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1897500, offset: 72038229},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1899000, offset: 72079888},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1900500, offset: 72126272},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1902000, offset: 72177316},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1903500, offset: 72225638},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1905000, offset: 72275787},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1906500, offset: 72324061},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1908000, offset: 72398673},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1909500, offset: 72445111},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1911000, offset: 72491297},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1912500, offset: 72527726},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1914000, offset: 72579639},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1915500, offset: 72601872},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1917000, offset: 72635746},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1918500, offset: 72699334},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1920000, offset: 72770585},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1921500, offset: 72841396},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1923000, offset: 72941016},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1924500, offset: 72990771},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1926000, offset: 73044993},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1927500, offset: 73094596},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1929000, offset: 73151254},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1930500, offset: 73173458},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1932000, offset: 73205234},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1933500, offset: 73267981},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1935000, offset: 73335400},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1936500, offset: 73619187},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1938000, offset: 73697726},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1939500, offset: 73740313},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1941000, offset: 73784079},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1942500, offset: 73824216},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1944000, offset: 73869482},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1945500, offset: 73889063},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1947000, offset: 73916834},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1948500, offset: 73982221},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1950000, offset: 74049648},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1951500, offset: 74112282},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1953000, offset: 74198215},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1954500, offset: 74251069},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1956000, offset: 74306970},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1957500, offset: 74323861},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1959000, offset: 74350886},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1960500, offset: 74425520},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1962000, offset: 74498226},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1963500, offset: 74554441},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1965000, offset: 74611993},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1966500, offset: 74628814},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1968000, offset: 74683353},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1969500, offset: 74744578},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1971000, offset: 74804362},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1972500, offset: 74861520},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1974000, offset: 74924787},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1975500, offset: 74943563},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1977000, offset: 74973249},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1978500, offset: 75035745},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1980000, offset: 75110226},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1981500, offset: 75365694},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1983000, offset: 75436520},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1984500, offset: 75459926},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1986000, offset: 75495176},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1987500, offset: 75530286},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1989000, offset: 75569489},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1990500, offset: 75609794},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1992000, offset: 75658990},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1993500, offset: 76123102},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1995000, offset: 76230585},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1996500, offset: 76247363},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1998000, offset: 76291169},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 1999500, offset: 76308473},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2001000, offset: 76333901},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2002500, offset: 76359885},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2004000, offset: 76385564},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2005500, offset: 76408806},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2007000, offset: 76439864},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2008500, offset: 76486254},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2010000, offset: 76528392},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2011500, offset: 76567967},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2013000, offset: 76634508},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2014500, offset: 76669350},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2016000, offset: 76701872},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2017500, offset: 76735321},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2019000, offset: 76777547},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2020500, offset: 76825349},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2022000, offset: 76875690},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2023500, offset: 76900022},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2025000, offset: 76930133},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2026500, offset: 77152052},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2028000, offset: 77213997},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2029500, offset: 77246573},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2031000, offset: 77279794},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2032500, offset: 77311590},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2034000, offset: 77346213},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2035500, offset: 77368868},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2037000, offset: 77400057},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2038500, offset: 77452954},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2040000, offset: 77512829},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2041500, offset: 77574386},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2043000, offset: 77660222},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2044500, offset: 77710582},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2046000, offset: 77759463},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2047500, offset: 77781448},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2049000, offset: 77808984},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2050500, offset: 77873043},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2052000, offset: 77939372},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2053500, offset: 77996905},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2055000, offset: 78052891},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2056500, offset: 78106104},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2058000, offset: 78186526},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2059500, offset: 78212893},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2061000, offset: 78241655},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2062500, offset: 78289081},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2064000, offset: 78348974},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2065500, offset: 78406980},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2067000, offset: 78468101},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2068500, offset: 78521674},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2070000, offset: 78579071},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2071500, offset: 78821222},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2073000, offset: 78885354},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2074500, offset: 78910878},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2076000, offset: 78947508},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2077500, offset: 78989965},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2079000, offset: 79035716},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2080500, offset: 79080548},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2082000, offset: 79129978},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2083500, offset: 79172488},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2085000, offset: 79219805},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2086500, offset: 79265530},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2088000, offset: 79340553},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2089500, offset: 79367879},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2091000, offset: 79395946},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2092500, offset: 79449536},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2094000, offset: 79507265},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2095500, offset: 79560169},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2097000, offset: 79614500},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2098500, offset: 79661670},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2100000, offset: 79713317},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2101500, offset: 79760096},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2103000, offset: 79835211},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2104500, offset: 79861645},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2106000, offset: 79891234},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2107500, offset: 79945635},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2109000, offset: 80006214},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2110500, offset: 80055758},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2112000, offset: 80113224},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2113500, offset: 80163021},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2115000, offset: 80221398},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2116500, offset: 80477747},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2118000, offset: 80545066},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2119500, offset: 80562563},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2121000, offset: 80583832},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2122500, offset: 80628611},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2124000, offset: 80679478},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2125500, offset: 80728168},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2127000, offset: 80779642},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2128500, offset: 80825731},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2130000, offset: 80875123},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2131500, offset: 80914247},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2133000, offset: 80987609},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2134500, offset: 81013675},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2136000, offset: 81045522},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2137500, offset: 81094350},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2139000, offset: 81154777},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2140500, offset: 81209888},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2142000, offset: 81271822},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2143500, offset: 81328410},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2145000, offset: 81392882},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2146500, offset: 81444183},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2148000, offset: 81532219},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2149500, offset: 81561187},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2151000, offset: 81599441},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2152500, offset: 81653754},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2154000, offset: 81715088},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2155500, offset: 81777046},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2157000, offset: 81839584},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2158500, offset: 81895756},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2160000, offset: 81958565},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2161500, offset: 82216971},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2163000, offset: 82288651},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2164500, offset: 82313219},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2166000, offset: 82348917},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2167500, offset: 82387606},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2169000, offset: 82430246},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2170500, offset: 82474248},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2172000, offset: 82520858},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2173500, offset: 82563051},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2175000, offset: 82609483},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2176500, offset: 82654313},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2178000, offset: 82729203},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2179500, offset: 82773416},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2181000, offset: 82815885},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2182500, offset: 82836597},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2184000, offset: 82868279},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2185500, offset: 82926617},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2187000, offset: 82992506},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2188500, offset: 83049945},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2190000, offset: 83113035},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2191500, offset: 83161749},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2193000, offset: 83242614},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2194500, offset: 83282323},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2196000, offset: 83320982},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2197500, offset: 83358558},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2199000, offset: 83401466},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2200500, offset: 83449387},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2202000, offset: 83506205},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2203500, offset: 83532480},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2205000, offset: 83568636},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2206500, offset: 83857105},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2208000, offset: 83930902},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2209500, offset: 83966487},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2211000, offset: 84001361},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2212500, offset: 84035244},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2214000, offset: 84073149},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2215500, offset: 84099069},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2217000, offset: 84133336},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2218500, offset: 84178319},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2220000, offset: 84230104},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2221500, offset: 84279484},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2223000, offset: 84370405},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2224500, offset: 84417013},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2226000, offset: 84467876},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2227500, offset: 84511512},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2229000, offset: 84564817},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2230500, offset: 84587898},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2232000, offset: 84619012},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2233500, offset: 84686014},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2235000, offset: 84762387},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2236500, offset: 84821983},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2238000, offset: 84917673},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2239500, offset: 84941754},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2241000, offset: 84968820},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2242500, offset: 85026533},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2244000, offset: 85091665},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2245500, offset: 85160342},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2247000, offset: 85226523},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2248500, offset: 85287752},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2250000, offset: 85349260},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2251500, offset: 85605754},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2253000, offset: 85673871},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2254500, offset: 85698076},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2256000, offset: 85733112},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2257500, offset: 85771260},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2259000, offset: 85811930},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2260500, offset: 85852917},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2262000, offset: 85902096},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2263500, offset: 85942379},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2265000, offset: 85991884},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2266500, offset: 86032161},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2268000, offset: 86109036},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2269500, offset: 86157446},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2271000, offset: 86202163},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2272500, offset: 86244398},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2274000, offset: 86291174},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2275500, offset: 86318442},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2277000, offset: 86358858},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2278500, offset: 86426126},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2280000, offset: 86492944},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2281500, offset: 86553805},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2283000, offset: 86637380},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2284500, offset: 86682911},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2286000, offset: 86728002},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2287500, offset: 86765816},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2289000, offset: 86812768},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2290500, offset: 86837940},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2292000, offset: 86874591},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2293500, offset: 86939727},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2295000, offset: 87008027},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2296500, offset: 87306943},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2298000, offset: 87383264},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2299500, offset: 87405117},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2301000, offset: 87431340},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2302500, offset: 87475721},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2304000, offset: 87528244},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2305500, offset: 87578001},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2307000, offset: 87633693},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2308500, offset: 87682356},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2310000, offset: 87737686},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2311500, offset: 87788139},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2313000, offset: 87863548},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2314500, offset: 87887507},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2316000, offset: 87913928},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2317500, offset: 87968325},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2319000, offset: 88030650},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2320500, offset: 88078815},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2322000, offset: 88128650},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2323500, offset: 88171080},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2325000, offset: 88219216},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2326500, offset: 88264748},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2328000, offset: 88340703},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2329500, offset: 88365027},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2331000, offset: 88392257},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2332500, offset: 88451001},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2334000, offset: 88512548},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2335500, offset: 88568109},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2337000, offset: 88630966},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2338500, offset: 88689306},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2340000, offset: 88754313},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2341500, offset: 89029476},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2343000, offset: 89077106},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2344500, offset: 89125887},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2346000, offset: 89184138},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2347500, offset: 89218440},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2349000, offset: 89255036},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2350500, offset: 89290686},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2352000, offset: 89336314},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2353500, offset: 89374843},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2355000, offset: 89422113},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2356500, offset: 89466556},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2358000, offset: 89544359},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2359500, offset: 89567234},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2361000, offset: 89593084},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2362500, offset: 89650015},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2364000, offset: 89714349},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2365500, offset: 89773174},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2367000, offset: 89838585},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2368500, offset: 89900494},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2370000, offset: 89964227},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2371500, offset: 90016938},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2373000, offset: 90098552},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2374500, offset: 90124132},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2376000, offset: 90152140},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2377500, offset: 90202354},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2379000, offset: 90259172},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2380500, offset: 90726659},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2382000, offset: 90827827},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2383500, offset: 90849994},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2385000, offset: 90875178},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2386500, offset: 90961529},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2388000, offset: 90991335},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2389500, offset: 91005754},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2391000, offset: 91021478},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2392500, offset: 91052799},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2394000, offset: 91092809},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2395500, offset: 91135457},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2397000, offset: 91180575},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2398500, offset: 91218678},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2400000, offset: 91263085},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2401500, offset: 91310383},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2403000, offset: 91374503},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2404500, offset: 91392292},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2406000, offset: 91416306},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2407500, offset: 91476871},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2409000, offset: 91535761},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2410500, offset: 91596882},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2412000, offset: 91654110},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2413500, offset: 91708846},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2415000, offset: 91759810},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2416500, offset: 91802739},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2418000, offset: 91864123},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2419500, offset: 91880888},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2421000, offset: 91906110},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2422500, offset: 91962660},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2424000, offset: 92019493},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2425500, offset: 92077517},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2427000, offset: 92136586},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2428500, offset: 92183895},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2430000, offset: 92238308},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2431500, offset: 92387165},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2433000, offset: 92443861},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2434500, offset: 92464938},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2436000, offset: 92499859},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2437500, offset: 92547378},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2439000, offset: 92595638},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2440500, offset: 92645083},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2442000, offset: 92699620},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2443500, offset: 92734832},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2445000, offset: 92779065},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2446500, offset: 92824438},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2448000, offset: 92894335},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2449500, offset: 92930094},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2451000, offset: 92963459},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2452500, offset: 92998067},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2454000, offset: 93044966},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2455500, offset: 93107421},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2457000, offset: 93168580},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2458500, offset: 93188613},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2460000, offset: 93218044},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2461500, offset: 93284700},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2463000, offset: 93375398},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2464500, offset: 93455783},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2466000, offset: 93526141},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2467500, offset: 93555694},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2469000, offset: 93591165},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2470500, offset: 93611851},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2472000, offset: 93643056},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2473500, offset: 93735419},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2475000, offset: 93835766},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2476500, offset: 94087183},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2478000, offset: 94161509},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2479500, offset: 94208352},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2481000, offset: 94258446},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2482500, offset: 94275280},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2484000, offset: 94297797},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2485500, offset: 94363496},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2487000, offset: 94426293},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2488500, offset: 94483510},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2490000, offset: 94539089},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2491500, offset: 94592921},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2493000, offset: 94656229},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2494500, offset: 94700026},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2496000, offset: 94744736},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2497500, offset: 94762468},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2499000, offset: 94791125},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2500500, offset: 94859578},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2502000, offset: 94919702},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2503500, offset: 94941270},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2505000, offset: 94971336},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2506500, offset: 95055722},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2508000, offset: 95154945},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2509500, offset: 95177316},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2511000, offset: 95206017},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2512500, offset: 95256671},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2514000, offset: 95312283},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2515500, offset: 95360231},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2517000, offset: 95412367},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2518500, offset: 95437027},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2520000, offset: 95474568},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2521500, offset: 95732207},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2523000, offset: 95803186},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2524500, offset: 95855784},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2526000, offset: 95913403},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2527500, offset: 95959766},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2529000, offset: 96006615},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2530500, offset: 96053502},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2532000, offset: 96103551},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2533500, offset: 96152968},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2535000, offset: 96204382},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2536500, offset: 96257418},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2538000, offset: 96328233},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2539500, offset: 96376853},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2541000, offset: 96423485},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2542500, offset: 96443135},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2544000, offset: 96473960},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2545500, offset: 96544748},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2547000, offset: 96607393},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2548500, offset: 96673743},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2550000, offset: 96733233},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2551500, offset: 96786839},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2553000, offset: 96855954},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2554500, offset: 96905533},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2556000, offset: 96952073},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2557500, offset: 96971324},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2559000, offset: 97001566},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2560500, offset: 97078426},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2562000, offset: 97147854},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2563500, offset: 97209185},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2565000, offset: 97266260},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2566500, offset: 97437781},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2568000, offset: 97504778},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2569500, offset: 97545370},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2571000, offset: 97585265},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2572500, offset: 97602281},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2574000, offset: 97625913},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2575500, offset: 97709258},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2577000, offset: 97788024},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2578500, offset: 97838954},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2580000, offset: 97888301},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2581500, offset: 97949278},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2583000, offset: 98023209},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2584500, offset: 98053524},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2586000, offset: 98092788},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2587500, offset: 98114404},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2589000, offset: 98145016},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2590500, offset: 98224010},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2592000, offset: 98301981},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2593500, offset: 98327234},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2595000, offset: 98360741},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2596500, offset: 98455200},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2598000, offset: 98552472},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2599500, offset: 98620259},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2601000, offset: 98677967},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2602500, offset: 98723505},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2604000, offset: 98769298},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2605500, offset: 98812337},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2607000, offset: 98857205},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2608500, offset: 98881675},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2610000, offset: 98917146},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2611500, offset: 99102490},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2613000, offset: 99168765},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2614500, offset: 99210960},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2616000, offset: 99259345},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2617500, offset: 99297030},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2619000, offset: 99339522},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2620500, offset: 99385362},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2622000, offset: 99432874},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2623500, offset: 99456862},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2625000, offset: 99490621},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2626500, offset: 99571658},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2628000, offset: 99676894},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2629500, offset: 99722014},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2631000, offset: 99767840},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2632500, offset: 99787816},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2634000, offset: 99815978},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2635500, offset: 99885330},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2637000, offset: 99961121},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2638500, offset: 100009855},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2640000, offset: 100063504},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2641500, offset: 100105949},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2643000, offset: 100188920},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2644500, offset: 100231683},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2646000, offset: 100276384},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2647500, offset: 100294834},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2649000, offset: 100323018},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2650500, offset: 100405222},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2652000, offset: 100495891},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2653500, offset: 100554474},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2655000, offset: 100615911},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2656500, offset: 100893760},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2658000, offset: 100973785},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2659500, offset: 101011009},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2661000, offset: 101049555},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2662500, offset: 101063851},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2664000, offset: 101082882},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2665500, offset: 101143568},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2667000, offset: 101209659},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2668500, offset: 101259715},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2670000, offset: 101315287},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2671500, offset: 101375960},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2673000, offset: 101458291},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2674500, offset: 101501082},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2676000, offset: 101544734},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2677500, offset: 101564750},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2679000, offset: 101591695},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2680500, offset: 101660922},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2682000, offset: 101731456},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2683500, offset: 101753724},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2685000, offset: 101785835},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2686500, offset: 101866256},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2688000, offset: 101970303},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2689500, offset: 102031200},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2691000, offset: 102091023},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2692500, offset: 102136026},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2694000, offset: 102186841},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2695500, offset: 102240797},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2697000, offset: 102300666},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2698500, offset: 102322553},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2700000, offset: 102351302},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2701500, offset: 102582042},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2703000, offset: 102649461},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2704500, offset: 102695930},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2706000, offset: 102752226},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2707500, offset: 102790184},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2709000, offset: 102829770},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2710500, offset: 102870298},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2712000, offset: 102913974},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2713500, offset: 102935497},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2715000, offset: 102965633},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2716500, offset: 103043277},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2718000, offset: 103137215},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2719500, offset: 103187416},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2721000, offset: 103240139},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2722500, offset: 103259415},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2724000, offset: 103287821},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2725500, offset: 103364038},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2727000, offset: 103437878},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2728500, offset: 103503940},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2730000, offset: 103567038},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2731500, offset: 103617277},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2733000, offset: 103688449},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2734500, offset: 103727363},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2736000, offset: 103763904},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2737500, offset: 103783252},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2739000, offset: 103812703},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2740500, offset: 103883654},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2742000, offset: 103955995},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2743500, offset: 104016558},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2745000, offset: 104077812},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2746500, offset: 104306935},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2748000, offset: 104376055},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2749500, offset: 104411123},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2751000, offset: 104447107},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2752500, offset: 104461637},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2754000, offset: 104481309},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2755500, offset: 104544209},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2757000, offset: 104612023},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2758500, offset: 104672523},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2760000, offset: 104735478},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2761500, offset: 104792465},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2763000, offset: 104864959},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2764500, offset: 104902974},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2766000, offset: 104941075},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2767500, offset: 104957216},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2769000, offset: 104981606},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2770500, offset: 105061048},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2772000, offset: 105139295},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2773500, offset: 105156800},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2775000, offset: 105183241},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2776500, offset: 105274768},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2778000, offset: 105378724},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2779500, offset: 105444201},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2781000, offset: 105502124},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2782500, offset: 105548729},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2784000, offset: 105598999},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2785500, offset: 105645175},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2787000, offset: 105696175},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2788500, offset: 105716004},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2790000, offset: 105747049},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2791500, offset: 105962469},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2793000, offset: 106028390},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2794500, offset: 106071471},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2796000, offset: 106122721},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2797500, offset: 106163663},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2799000, offset: 106206410},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2800500, offset: 106252113},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2802000, offset: 106301887},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2803500, offset: 106322482},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2805000, offset: 106352899},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2806500, offset: 106434111},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2808000, offset: 106529614},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2809500, offset: 106588204},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2811000, offset: 106642111},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2812500, offset: 106686290},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2814000, offset: 106733756},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2815500, offset: 106775502},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2817000, offset: 106821160},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2818500, offset: 106863765},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2820000, offset: 106915536},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2821500, offset: 106961380},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2823000, offset: 107040455},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2824500, offset: 107090882},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2826000, offset: 107140766},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2827500, offset: 107159204},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2829000, offset: 107186895},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2830500, offset: 107272628},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2832000, offset: 107356864},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2833500, offset: 107417699},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2835000, offset: 107478081},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2836500, offset: 107681011},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2838000, offset: 107745973},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2839500, offset: 107786582},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2841000, offset: 107828216},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2842500, offset: 107844548},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2844000, offset: 107865250},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2845500, offset: 107939699},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2847000, offset: 108011213},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2848500, offset: 108081456},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2850000, offset: 108139553},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2851500, offset: 108196540},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2853000, offset: 108265628},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2854500, offset: 108305235},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2856000, offset: 108346087},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2857500, offset: 108363875},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2859000, offset: 108390541},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2860500, offset: 108457541},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2862000, offset: 108523050},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2863500, offset: 108543890},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2865000, offset: 108570581},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2866500, offset: 108654292},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2868000, offset: 108759033},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2869500, offset: 108829887},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2871000, offset: 108892804},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2872500, offset: 108968674},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2874000, offset: 109033865},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2875500, offset: 109074777},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2877000, offset: 109114543},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2878500, offset: 109136723},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2880000, offset: 109171535},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2881500, offset: 109383554},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2883000, offset: 109449554},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2884500, offset: 109497626},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2886000, offset: 109550962},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2887500, offset: 109588801},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2889000, offset: 109627399},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2890500, offset: 109666699},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2892000, offset: 109712569},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2893500, offset: 109732929},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2895000, offset: 109763211},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2896500, offset: 109832878},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2898000, offset: 109924840},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2899500, offset: 109980246},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2901000, offset: 110036285},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2902500, offset: 110094174},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2904000, offset: 110149193},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2905500, offset: 110205967},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2907000, offset: 110257911},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2908500, offset: 110276271},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2910000, offset: 110303385},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2911500, offset: 110380575},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2913000, offset: 110480699},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2914500, offset: 110544273},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2916000, offset: 110600888},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2917500, offset: 110644681},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2919000, offset: 110688724},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2920500, offset: 110734309},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2922000, offset: 110783528},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2923500, offset: 110827681},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2925000, offset: 110880665},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2926500, offset: 111068955},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2928000, offset: 111128223},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2929500, offset: 111146127},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2931000, offset: 111170945},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2932500, offset: 111220508},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2934000, offset: 111276410},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2935500, offset: 111322101},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2937000, offset: 111372268},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2938500, offset: 111398283},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2940000, offset: 111440662},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2941500, offset: 111518247},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2943000, offset: 111616761},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2944500, offset: 111638293},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2946000, offset: 111668121},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2947500, offset: 111715401},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2949000, offset: 111776862},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2950500, offset: 111834996},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2952000, offset: 111898728},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2953500, offset: 111920004},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2955000, offset: 111949032},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2956500, offset: 112030201},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2958000, offset: 112141565},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2959500, offset: 112207233},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2961000, offset: 112264437},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2962500, offset: 112323421},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2964000, offset: 112381669},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2965500, offset: 112434986},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2967000, offset: 112489265},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2968500, offset: 112509059},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2970000, offset: 112538104},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2971500, offset: 112757648},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2973000, offset: 112833351},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2974500, offset: 112879200},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2976000, offset: 112927614},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2977500, offset: 112972830},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2979000, offset: 113018965},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2980500, offset: 113062319},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2982000, offset: 113109933},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2983500, offset: 113129522},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2985000, offset: 113163238},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2986500, offset: 113243807},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2988000, offset: 113337295},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2989500, offset: 113360402},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2991000, offset: 113395717},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2992500, offset: 113454248},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2994000, offset: 113517065},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2995500, offset: 113567160},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2997000, offset: 113622489},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 2998500, offset: 113649418},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3000000, offset: 113687040},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3001500, offset: 113765854},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3003000, offset: 113859032},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3004500, offset: 113879082},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3006000, offset: 113900642},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3007500, offset: 113951629},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3009000, offset: 114010450},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3010500, offset: 114032996},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3012000, offset: 114064914},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3013500, offset: 114131371},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3015000, offset: 114205211},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3016500, offset: 114497840},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3018000, offset: 114601398},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3019500, offset: 114618852},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3021000, offset: 114645347},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3022500, offset: 114704476},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3024000, offset: 114761997},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3025500, offset: 114800241},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3027000, offset: 114843462},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3028500, offset: 114875778},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3030000, offset: 114916347},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3031500, offset: 114969146},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3033000, offset: 115047314},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3034500, offset: 115066952},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3036000, offset: 115089421},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3037500, offset: 115151156},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3039000, offset: 115211197},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3040500, offset: 115266094},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3042000, offset: 115323457},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3043500, offset: 115342519},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3045000, offset: 115371622},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3046500, offset: 115444419},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3048000, offset: 115547685},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3049500, offset: 115620638},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3051000, offset: 115680938},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3052500, offset: 115734763},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3054000, offset: 115794724},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3055500, offset: 115845892},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3057000, offset: 115899359},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3058500, offset: 115922120},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3060000, offset: 115953324},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3061500, offset: 116153028},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3063000, offset: 116224488},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3064500, offset: 116270921},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3066000, offset: 116319553},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3067500, offset: 116360122},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3069000, offset: 116400700},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3070500, offset: 116443028},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3072000, offset: 116494533},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3073500, offset: 116515065},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3075000, offset: 116548704},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3076500, offset: 116622378},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3078000, offset: 116708809},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3079500, offset: 116760139},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3081000, offset: 116812096},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3082500, offset: 116853310},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3084000, offset: 116896617},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3085500, offset: 116941411},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3087000, offset: 116998294},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3088500, offset: 117046963},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3090000, offset: 117099188},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3091500, offset: 117119671},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3093000, offset: 117176482},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3094500, offset: 117247023},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3096000, offset: 117320970},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3097500, offset: 117371325},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3099000, offset: 117428943},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3100500, offset: 117483177},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3102000, offset: 117544764},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3103500, offset: 117602643},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3105000, offset: 117663411},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3106500, offset: 117883681},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3108000, offset: 117924911},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3109500, offset: 117978962},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3111000, offset: 118589626},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3112500, offset: 118636423},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3114000, offset: 118687888},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3115500, offset: 118735941},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3117000, offset: 118788143},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3118500, offset: 118810732},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3120000, offset: 118840901},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3121500, offset: 118912415},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3123000, offset: 119003693},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3124500, offset: 119057370},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3126000, offset: 119114803},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3127500, offset: 119154486},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3129000, offset: 119197533},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3130500, offset: 119238951},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3132000, offset: 119289699},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3133500, offset: 119339561},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3135000, offset: 119392473},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3136500, offset: 119414003},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3138000, offset: 119474987},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3139500, offset: 119544743},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3141000, offset: 119612163},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3142500, offset: 119663701},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3144000, offset: 119723070},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3145500, offset: 119744500},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3147000, offset: 119778914},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3148500, offset: 119847859},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3150000, offset: 119921558},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3151500, offset: 120185773},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3153000, offset: 120259534},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3154500, offset: 120296776},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3156000, offset: 120341486},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3157500, offset: 120377024},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3159000, offset: 120414372},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3160500, offset: 120451971},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3162000, offset: 120495060},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3163500, offset: 120542614},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3165000, offset: 120596619},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3166500, offset: 120614387},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3168000, offset: 120667872},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3169500, offset: 120729810},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3171000, offset: 120797070},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3172500, offset: 120853146},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3174000, offset: 120917217},
		},
		{
			track: {trackId: 2, timescale: 90000, type: 'video'},
			samplePosition: {dts: 3175500, offset: 120972391},
		},
	],
	[
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 0, offset: 118034714},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1024, offset: 118035041},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 2048, offset: 118035376},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 3072, offset: 118035724},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 4096, offset: 118036091},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 5120, offset: 118036466},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 6144, offset: 118036845},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 7168, offset: 118037199},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 8192, offset: 118037591},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 9216, offset: 118038016},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 10240, offset: 118038408},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 11264, offset: 118038745},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 12288, offset: 118039122},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 13312, offset: 118039471},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 14336, offset: 118039893},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 15360, offset: 118040251},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 16384, offset: 118040596},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 17408, offset: 118040956},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 18432, offset: 118041339},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 19456, offset: 118041690},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 20480, offset: 118042112},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 21504, offset: 118042533},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 22528, offset: 118042935},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 23552, offset: 118043246},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 24576, offset: 118043585},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 25600, offset: 118043908},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 26624, offset: 118044299},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 27648, offset: 118044660},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 28672, offset: 118045025},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 29696, offset: 118045399},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 30720, offset: 118045766},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 31744, offset: 118046144},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 32768, offset: 118046528},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 33792, offset: 118046935},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 34816, offset: 118047393},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 35840, offset: 118047815},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 36864, offset: 118048175},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 37888, offset: 118048510},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 38912, offset: 118048886},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 39936, offset: 118049256},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 40960, offset: 118049575},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 41984, offset: 118049964},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 43008, offset: 118050363},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 44032, offset: 118050707},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 45056, offset: 118051121},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 46080, offset: 118051493},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 47104, offset: 118051877},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 48128, offset: 118052231},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 49152, offset: 118052611},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 50176, offset: 118052968},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 51200, offset: 118053366},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 52224, offset: 118053822},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 53248, offset: 118054114},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 54272, offset: 118054424},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 55296, offset: 118054783},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 56320, offset: 118055102},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 57344, offset: 118055545},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 58368, offset: 118055869},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 59392, offset: 118056294},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 60416, offset: 118056645},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 61440, offset: 118057058},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 62464, offset: 118057419},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 63488, offset: 118057739},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 64512, offset: 118058162},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 65536, offset: 118058567},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 66560, offset: 118059005},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 67584, offset: 118059378},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 68608, offset: 118059691},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 69632, offset: 118060125},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 70656, offset: 118060555},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 71680, offset: 118060836},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 72704, offset: 118061187},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 73728, offset: 118061537},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 74752, offset: 118061943},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 75776, offset: 118062321},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 76800, offset: 118062677},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 77824, offset: 118063011},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 78848, offset: 118063349},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 79872, offset: 118063746},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 80896, offset: 118064138},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 81920, offset: 118064532},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 82944, offset: 118064957},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 83968, offset: 118065359},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 84992, offset: 118065727},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 86016, offset: 118066106},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 87040, offset: 118066432},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 88064, offset: 118066798},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 89088, offset: 118067139},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 90112, offset: 118067606},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 91136, offset: 118067936},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 92160, offset: 118068337},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 93184, offset: 118068691},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 94208, offset: 118069053},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 95232, offset: 118069430},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 96256, offset: 118069803},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 97280, offset: 118070175},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 98304, offset: 118070519},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 99328, offset: 118070909},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 100352, offset: 118071293},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 101376, offset: 118071663},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 102400, offset: 118072035},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 103424, offset: 118072394},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 104448, offset: 118072800},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 105472, offset: 118073152},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 106496, offset: 118073526},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 107520, offset: 118073920},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 108544, offset: 118074269},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 109568, offset: 118074635},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 110592, offset: 118075019},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 111616, offset: 118075366},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 112640, offset: 118075776},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 113664, offset: 118076157},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 114688, offset: 118076479},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 115712, offset: 118076929},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 116736, offset: 118077249},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 117760, offset: 118077609},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 118784, offset: 118077999},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 119808, offset: 118078365},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 120832, offset: 118078710},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 121856, offset: 118079157},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 122880, offset: 118079580},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 123904, offset: 118079889},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 124928, offset: 118080271},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 125952, offset: 118080602},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 126976, offset: 118080935},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 128000, offset: 118081328},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 129024, offset: 118081715},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 130048, offset: 118082044},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 131072, offset: 118082480},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 132096, offset: 118082860},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 133120, offset: 118083203},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 134144, offset: 118083582},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 135168, offset: 118083939},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 136192, offset: 118084384},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 137216, offset: 118084777},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 138240, offset: 118085161},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 139264, offset: 118085450},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 140288, offset: 118085792},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 141312, offset: 118086108},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 142336, offset: 118086559},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 143360, offset: 118086959},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 144384, offset: 118087347},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 145408, offset: 118087777},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 146432, offset: 118088099},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 147456, offset: 118088461},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 148480, offset: 118088817},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 149504, offset: 118089187},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 150528, offset: 118089645},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 151552, offset: 118089967},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 152576, offset: 118090299},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 153600, offset: 118090692},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 154624, offset: 118091069},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 155648, offset: 118091414},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 156672, offset: 118091773},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 157696, offset: 118092129},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 158720, offset: 118092512},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 159744, offset: 118092891},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 160768, offset: 118093286},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 161792, offset: 118093666},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 162816, offset: 118094044},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 163840, offset: 118094442},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 164864, offset: 118094816},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 165888, offset: 118095132},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 166912, offset: 118095573},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 167936, offset: 118095882},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 168960, offset: 118096230},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 169984, offset: 118096573},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 171008, offset: 118096917},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 172032, offset: 118097284},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 173056, offset: 118097691},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 174080, offset: 118098101},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 175104, offset: 118098420},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 176128, offset: 118098795},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 177152, offset: 118099172},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 178176, offset: 118099531},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 179200, offset: 118099901},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 180224, offset: 118100275},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 181248, offset: 118100657},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 182272, offset: 118100984},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 183296, offset: 118101436},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 184320, offset: 118101771},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 185344, offset: 118102139},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 186368, offset: 118102578},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 187392, offset: 118102901},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 188416, offset: 118103245},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 189440, offset: 118103566},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 190464, offset: 118103927},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 191488, offset: 118104297},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 192512, offset: 118104671},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 193536, offset: 118105055},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 194560, offset: 118105418},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 195584, offset: 118105801},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 196608, offset: 118106156},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 197632, offset: 118106526},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 198656, offset: 118106906},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 199680, offset: 118107275},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 200704, offset: 118107694},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 201728, offset: 118108087},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 202752, offset: 118108450},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 203776, offset: 118108793},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 204800, offset: 118109156},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 205824, offset: 118109552},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 206848, offset: 118109895},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 207872, offset: 118110278},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 208896, offset: 118110673},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 209920, offset: 118111004},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 210944, offset: 118111362},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 211968, offset: 118111760},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 212992, offset: 118112149},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 214016, offset: 118112507},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 215040, offset: 118112894},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 216064, offset: 118113257},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 217088, offset: 118113645},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 218112, offset: 118114002},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 219136, offset: 118114443},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 220160, offset: 118114874},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 221184, offset: 118115254},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 222208, offset: 118115643},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 223232, offset: 118115972},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 224256, offset: 118116299},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 225280, offset: 118116646},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 226304, offset: 118117007},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 227328, offset: 118117449},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 228352, offset: 118117745},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 229376, offset: 118118060},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 230400, offset: 118118410},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 231424, offset: 118118794},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 232448, offset: 118119162},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 233472, offset: 118119533},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 234496, offset: 118119987},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 235520, offset: 118120382},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 236544, offset: 118120753},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 237568, offset: 118121063},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 238592, offset: 118121377},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 239616, offset: 118121763},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 240640, offset: 118122114},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 241664, offset: 118122495},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 242688, offset: 118122919},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 243712, offset: 118123230},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 244736, offset: 118123567},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 245760, offset: 118123921},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 246784, offset: 118124253},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 247808, offset: 118124580},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 248832, offset: 118125034},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 249856, offset: 118125410},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 250880, offset: 118125772},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 251904, offset: 118126130},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 252928, offset: 118126467},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 253952, offset: 118126894},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 254976, offset: 118127330},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 256000, offset: 118127629},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 257024, offset: 118127955},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 258048, offset: 118128287},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 259072, offset: 118128597},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 260096, offset: 118128956},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 261120, offset: 118129322},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 262144, offset: 118129676},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 263168, offset: 118130028},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 264192, offset: 118130376},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 265216, offset: 118130797},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 266240, offset: 118131181},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 267264, offset: 118131535},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 268288, offset: 118131908},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 269312, offset: 118132252},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 270336, offset: 118132643},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 271360, offset: 118132973},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 272384, offset: 118133423},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 273408, offset: 118133782},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 274432, offset: 118134143},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 275456, offset: 118134514},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 276480, offset: 118134890},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 277504, offset: 118135332},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 278528, offset: 118135744},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 279552, offset: 118136048},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 280576, offset: 118136390},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 281600, offset: 118136737},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 282624, offset: 118137081},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 283648, offset: 118137459},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 284672, offset: 118137811},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 285696, offset: 118138200},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 286720, offset: 118138555},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 287744, offset: 118138940},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 288768, offset: 118139298},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 289792, offset: 118139684},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 290816, offset: 118140039},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 291840, offset: 118140413},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 292864, offset: 118140811},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 293888, offset: 118141181},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 294912, offset: 118141539},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 295936, offset: 118141912},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 296960, offset: 118142262},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 297984, offset: 118142647},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 299008, offset: 118143042},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 300032, offset: 118143419},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 301056, offset: 118143832},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 302080, offset: 118144252},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 303104, offset: 118144639},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 304128, offset: 118145052},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 305152, offset: 118145489},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 306176, offset: 118145798},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 307200, offset: 118146131},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 308224, offset: 118146483},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 309248, offset: 118146855},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 310272, offset: 118147250},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 311296, offset: 118147634},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 312320, offset: 118147983},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 313344, offset: 118148364},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 314368, offset: 118148742},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 315392, offset: 118149122},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 316416, offset: 118149459},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 317440, offset: 118149830},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 318464, offset: 118150204},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 319488, offset: 118150594},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 320512, offset: 118150955},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 321536, offset: 118151329},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 322560, offset: 118151679},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 323584, offset: 118152036},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 324608, offset: 118152380},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 325632, offset: 118152740},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 326656, offset: 118153178},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 327680, offset: 118153486},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 328704, offset: 118153800},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 329728, offset: 118154240},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 330752, offset: 118154638},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 331776, offset: 118155001},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 332800, offset: 118155409},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 333824, offset: 118155718},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 334848, offset: 118156049},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 335872, offset: 118156394},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 336896, offset: 118156731},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 337920, offset: 118157156},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 338944, offset: 118157523},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 339968, offset: 118157851},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 340992, offset: 118158299},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 342016, offset: 118158723},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 343040, offset: 118159103},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 344064, offset: 118159427},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 345088, offset: 118159792},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 346112, offset: 118160150},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 347136, offset: 118160522},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 348160, offset: 118160876},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 349184, offset: 118161250},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 350208, offset: 118161684},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 351232, offset: 118162060},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 352256, offset: 118162486},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 353280, offset: 118162878},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 354304, offset: 118163187},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 355328, offset: 118163540},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 356352, offset: 118163887},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 357376, offset: 118164251},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 358400, offset: 118164653},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 359424, offset: 118164997},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 360448, offset: 118165363},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 361472, offset: 118165711},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 362496, offset: 118166092},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 363520, offset: 118166470},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 364544, offset: 118166867},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 365568, offset: 118167215},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 366592, offset: 118167659},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 367616, offset: 118168003},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 368640, offset: 118168404},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 369664, offset: 118168717},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 370688, offset: 118169071},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 371712, offset: 118169406},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 372736, offset: 118169753},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 373760, offset: 118170121},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 374784, offset: 118170480},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 375808, offset: 118170883},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 376832, offset: 118171257},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 377856, offset: 118171624},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 378880, offset: 118171977},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 379904, offset: 118172339},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 380928, offset: 118172691},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 381952, offset: 118173127},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 382976, offset: 118173494},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 384000, offset: 118173855},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 385024, offset: 118174207},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 386048, offset: 118174588},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 387072, offset: 118174955},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 388096, offset: 118175338},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 389120, offset: 118175700},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 390144, offset: 118176067},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 391168, offset: 118176441},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 392192, offset: 118176803},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 393216, offset: 118177260},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 394240, offset: 118177569},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 395264, offset: 118177949},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 396288, offset: 118178379},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 397312, offset: 118178779},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 398336, offset: 118179100},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 399360, offset: 118179480},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 400384, offset: 118179818},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 401408, offset: 118180168},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 402432, offset: 118180514},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 403456, offset: 118180861},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 404480, offset: 118181215},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 405504, offset: 118181607},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 406528, offset: 118181966},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 407552, offset: 118182348},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 408576, offset: 118182673},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 409600, offset: 118183096},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 410624, offset: 118183454},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 411648, offset: 118183819},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 412672, offset: 118184182},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 413696, offset: 118184572},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 414720, offset: 118184925},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 415744, offset: 118185290},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 416768, offset: 118185680},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 417792, offset: 118186056},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 418816, offset: 118186395},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 419840, offset: 118186804},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 420864, offset: 118187188},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 421888, offset: 118187568},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 422912, offset: 118187952},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 423936, offset: 118188371},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 424960, offset: 118188765},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 425984, offset: 118189177},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 427008, offset: 118189527},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 428032, offset: 118189893},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 429056, offset: 118190226},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 430080, offset: 118190562},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 431104, offset: 118190942},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 432128, offset: 118191365},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 433152, offset: 118191773},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 434176, offset: 118192152},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 435200, offset: 118192538},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 436224, offset: 118192924},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 437248, offset: 118193295},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 438272, offset: 118193608},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 439296, offset: 118193922},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 440320, offset: 118194289},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 441344, offset: 118194650},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 442368, offset: 118195009},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 443392, offset: 118195403},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 444416, offset: 118195749},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 445440, offset: 118196077},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 446464, offset: 118196463},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 447488, offset: 118196814},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 448512, offset: 118197212},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 449536, offset: 118197665},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 450560, offset: 118197975},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 451584, offset: 118198290},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 452608, offset: 118198604},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 453632, offset: 118199053},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 454656, offset: 118199405},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 455680, offset: 118199774},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 456704, offset: 118200128},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 457728, offset: 118200555},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 458752, offset: 118200892},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 459776, offset: 118201207},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 460800, offset: 118201611},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 461824, offset: 118202027},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 462848, offset: 118202447},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 463872, offset: 118202726},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 464896, offset: 118203056},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 465920, offset: 118203420},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 466944, offset: 118203832},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 467968, offset: 118204162},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 468992, offset: 118204485},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 470016, offset: 118204921},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 471040, offset: 118205334},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 472064, offset: 118205719},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 473088, offset: 118206029},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 474112, offset: 118206345},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 475136, offset: 118206788},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 476160, offset: 118207210},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 477184, offset: 118207578},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 478208, offset: 118207956},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 479232, offset: 118208288},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 480256, offset: 118208641},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 481280, offset: 118209093},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 482304, offset: 118209376},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 483328, offset: 118209692},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 484352, offset: 118210045},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 485376, offset: 118210405},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 486400, offset: 118210794},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 487424, offset: 118211179},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 488448, offset: 118211605},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 489472, offset: 118211950},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 490496, offset: 118212306},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 491520, offset: 118212679},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 492544, offset: 118213037},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 493568, offset: 118213404},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 494592, offset: 118213856},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 495616, offset: 118214178},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 496640, offset: 118214500},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 497664, offset: 118214843},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 498688, offset: 118215183},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 499712, offset: 118215578},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 500736, offset: 118215953},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 501760, offset: 118216323},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 502784, offset: 118216658},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 503808, offset: 118217063},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 504832, offset: 118217437},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 505856, offset: 118217811},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 506880, offset: 118218178},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 507904, offset: 118218538},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 508928, offset: 118218975},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 509952, offset: 118219284},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 510976, offset: 118219600},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 512000, offset: 118219954},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 513024, offset: 118220315},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 514048, offset: 118220661},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 515072, offset: 118221063},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 516096, offset: 118221436},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 517120, offset: 118221804},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 518144, offset: 118222177},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 519168, offset: 118222549},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 520192, offset: 118222881},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 521216, offset: 118223229},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 522240, offset: 118223547},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 523264, offset: 118223898},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 524288, offset: 118224262},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 525312, offset: 118224631},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 526336, offset: 118225012},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 527360, offset: 118225439},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 528384, offset: 118225772},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 529408, offset: 118226105},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 530432, offset: 118226479},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 531456, offset: 118226930},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 532480, offset: 118227342},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 533504, offset: 118227704},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 534528, offset: 118228114},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 535552, offset: 118228433},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 536576, offset: 118228747},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 537600, offset: 118229080},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 538624, offset: 118229405},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 539648, offset: 118229836},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 540672, offset: 118230263},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 541696, offset: 118230701},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 542720, offset: 118231052},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 543744, offset: 118231421},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 544768, offset: 118231725},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 545792, offset: 118232068},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 546816, offset: 118232423},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 547840, offset: 118232812},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 548864, offset: 118233243},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 549888, offset: 118233608},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 550912, offset: 118233969},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 551936, offset: 118234335},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 552960, offset: 118234708},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 553984, offset: 118235067},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 555008, offset: 118235440},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 556032, offset: 118235782},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 557056, offset: 118236140},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 558080, offset: 118236503},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 559104, offset: 118236874},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 560128, offset: 118237241},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 561152, offset: 118237611},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 562176, offset: 118237978},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 563200, offset: 118238356},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 564224, offset: 118238785},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 565248, offset: 118239165},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 566272, offset: 118239601},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 567296, offset: 118239971},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 568320, offset: 118240343},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 569344, offset: 118240654},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 570368, offset: 118240997},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 571392, offset: 118241366},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 572416, offset: 118241711},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 573440, offset: 118242106},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 574464, offset: 118242521},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 575488, offset: 118242924},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 576512, offset: 118243237},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 577536, offset: 118243628},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 578560, offset: 118243999},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 579584, offset: 118244356},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 580608, offset: 118244699},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 581632, offset: 118245013},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 582656, offset: 118245460},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 583680, offset: 118245778},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 584704, offset: 118246162},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 585728, offset: 118246508},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 586752, offset: 118246911},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 587776, offset: 118247259},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 588800, offset: 118247624},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 589824, offset: 118247989},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 590848, offset: 118248386},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 591872, offset: 118248729},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 592896, offset: 118249102},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 593920, offset: 118249537},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 594944, offset: 118249933},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 595968, offset: 118250245},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 596992, offset: 118250565},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 598016, offset: 118250897},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 599040, offset: 118251301},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 600064, offset: 118251715},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 601088, offset: 118252024},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 602112, offset: 118252410},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 603136, offset: 118252757},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 604160, offset: 118253210},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 605184, offset: 118253559},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 606208, offset: 118253894},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 607232, offset: 118254270},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 608256, offset: 118254717},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 609280, offset: 118255029},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 610304, offset: 118255389},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 611328, offset: 118255737},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 612352, offset: 118256125},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 613376, offset: 118256535},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 614400, offset: 118256877},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 615424, offset: 118257238},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 616448, offset: 118257566},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 617472, offset: 118257976},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 618496, offset: 118258333},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 619520, offset: 118258673},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 620544, offset: 118259056},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 621568, offset: 118259469},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 622592, offset: 118259859},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 623616, offset: 118260260},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 624640, offset: 118260658},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 625664, offset: 118260989},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 626688, offset: 118261383},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 627712, offset: 118261773},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 628736, offset: 118262141},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 629760, offset: 118262502},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 630784, offset: 118262835},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 631808, offset: 118263212},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 632832, offset: 118263594},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 633856, offset: 118263919},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 634880, offset: 118264250},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 635904, offset: 118264601},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 636928, offset: 118264970},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 637952, offset: 118265355},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 638976, offset: 118265764},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 640000, offset: 118266182},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 641024, offset: 118266554},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 642048, offset: 118266924},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 643072, offset: 118267267},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 644096, offset: 118267617},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 645120, offset: 118268000},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 646144, offset: 118268374},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 647168, offset: 118268764},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 648192, offset: 118269174},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 649216, offset: 118269528},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 650240, offset: 118269848},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 651264, offset: 118270272},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 652288, offset: 118270728},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 653312, offset: 118271120},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 654336, offset: 118271521},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 655360, offset: 118271832},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 656384, offset: 118272160},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 657408, offset: 118272481},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 658432, offset: 118272928},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 659456, offset: 118273266},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 660480, offset: 118273613},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 661504, offset: 118273968},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 662528, offset: 118274356},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 663552, offset: 118274719},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 664576, offset: 118275091},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 665600, offset: 118275438},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 666624, offset: 118275775},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 667648, offset: 118276206},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 668672, offset: 118276606},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 669696, offset: 118276994},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 670720, offset: 118277363},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 671744, offset: 118277713},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 672768, offset: 118278123},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 673792, offset: 118278464},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 674816, offset: 118278841},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 675840, offset: 118279210},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 676864, offset: 118279574},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 677888, offset: 118279949},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 678912, offset: 118280313},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 679936, offset: 118280702},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 680960, offset: 118281071},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 681984, offset: 118281444},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 683008, offset: 118281816},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 684032, offset: 118282196},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 685056, offset: 118282564},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 686080, offset: 118282950},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 687104, offset: 118283305},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 688128, offset: 118283699},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 689152, offset: 118284123},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 690176, offset: 118284437},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 691200, offset: 118284806},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 692224, offset: 118285222},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 693248, offset: 118285603},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 694272, offset: 118285969},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 695296, offset: 118286344},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 696320, offset: 118286747},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 697344, offset: 118287124},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 698368, offset: 118287514},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 699392, offset: 118287861},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 700416, offset: 118288174},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 701440, offset: 118288531},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 702464, offset: 118288944},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 703488, offset: 118289269},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 704512, offset: 118289626},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 705536, offset: 118290071},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 706560, offset: 118290414},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 707584, offset: 118290729},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 708608, offset: 118291103},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 709632, offset: 118291429},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 710656, offset: 118291874},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 711680, offset: 118292252},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 712704, offset: 118292631},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 713728, offset: 118293014},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 714752, offset: 118293375},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 715776, offset: 118293759},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 716800, offset: 118294083},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 717824, offset: 118294395},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 718848, offset: 118294776},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 719872, offset: 118295094},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 720896, offset: 118295487},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 721920, offset: 118295870},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 722944, offset: 118296237},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 723968, offset: 118296607},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 724992, offset: 118296970},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 726016, offset: 118297348},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 727040, offset: 118297717},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 728064, offset: 118298085},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 729088, offset: 118298467},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 730112, offset: 118298841},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 731136, offset: 118299213},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 732160, offset: 118299600},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 733184, offset: 118299990},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 734208, offset: 118300358},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 735232, offset: 118300685},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 736256, offset: 118301075},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 737280, offset: 118301443},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 738304, offset: 118301812},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 739328, offset: 118302189},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 740352, offset: 118302551},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 741376, offset: 118302978},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 742400, offset: 118303373},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 743424, offset: 118303754},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 744448, offset: 118304143},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 745472, offset: 118304508},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 746496, offset: 118304826},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 747520, offset: 118305143},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 748544, offset: 118305493},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 749568, offset: 118305858},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 750592, offset: 118306244},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 751616, offset: 118306689},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 752640, offset: 118307102},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 753664, offset: 118307437},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 754688, offset: 118307751},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 755712, offset: 118308111},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 756736, offset: 118308463},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 757760, offset: 118308831},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 758784, offset: 118309239},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 759808, offset: 118309634},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 760832, offset: 118309969},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 761856, offset: 118310325},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 762880, offset: 118310769},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 763904, offset: 118311191},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 764928, offset: 118311515},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 765952, offset: 118311878},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 766976, offset: 118312208},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 768000, offset: 118312594},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 769024, offset: 118313014},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 770048, offset: 118313428},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 771072, offset: 118313837},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 772096, offset: 118314195},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 773120, offset: 118314505},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 774144, offset: 118314873},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 775168, offset: 118315224},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 776192, offset: 118315676},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 777216, offset: 118316091},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 778240, offset: 118316502},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 779264, offset: 118316800},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 780288, offset: 118317154},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 781312, offset: 118317478},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 782336, offset: 118317875},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 783360, offset: 118318240},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 784384, offset: 118318573},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 785408, offset: 118318921},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 786432, offset: 118319270},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 787456, offset: 118319716},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 788480, offset: 118320034},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 789504, offset: 118320347},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 790528, offset: 118320723},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 791552, offset: 118321080},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 792576, offset: 118321458},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 793600, offset: 118321851},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 794624, offset: 118322227},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 795648, offset: 118322680},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 796672, offset: 118323092},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 797696, offset: 118323474},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 798720, offset: 118323850},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 799744, offset: 118324159},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 800768, offset: 118324536},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 801792, offset: 118324852},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 802816, offset: 118325237},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 803840, offset: 118325580},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 804864, offset: 118325972},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 805888, offset: 118326327},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 806912, offset: 118326696},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 807936, offset: 118327069},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 808960, offset: 118327429},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 809984, offset: 118327872},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 811008, offset: 118328320},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 812032, offset: 118328686},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 813056, offset: 118329056},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 814080, offset: 118329437},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 815104, offset: 118329771},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 816128, offset: 118330187},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 817152, offset: 118330511},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 818176, offset: 118330864},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 819200, offset: 118331191},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 820224, offset: 118331567},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 821248, offset: 118331978},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 822272, offset: 118332385},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 823296, offset: 118332699},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 824320, offset: 118333039},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 825344, offset: 118333382},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 826368, offset: 118333714},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 827392, offset: 118334142},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 828416, offset: 118334566},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 829440, offset: 118334903},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 830464, offset: 118335265},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 831488, offset: 118335600},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 832512, offset: 118335961},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 833536, offset: 118336320},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 834560, offset: 118336691},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 835584, offset: 118337058},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 836608, offset: 118337444},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 837632, offset: 118337862},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 838656, offset: 118338252},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 839680, offset: 118338584},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 840704, offset: 118338940},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 841728, offset: 118339331},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 842752, offset: 118339673},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 843776, offset: 118340127},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 844800, offset: 118340518},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 845824, offset: 118340879},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 846848, offset: 118341201},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 847872, offset: 118341571},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 848896, offset: 118342030},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 849920, offset: 118342437},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 850944, offset: 118342747},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 851968, offset: 118343093},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 852992, offset: 118343418},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 854016, offset: 118343769},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 855040, offset: 118344138},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 856064, offset: 118344501},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 857088, offset: 118344851},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 858112, offset: 118345233},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 859136, offset: 118345632},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 860160, offset: 118346001},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 861184, offset: 118346369},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 862208, offset: 118346729},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 863232, offset: 118347094},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 864256, offset: 118347475},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 865280, offset: 118347907},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 866304, offset: 118348294},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 867328, offset: 118348702},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 868352, offset: 118349015},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 869376, offset: 118349350},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 870400, offset: 118349680},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 871424, offset: 118350090},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 872448, offset: 118350450},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 873472, offset: 118350775},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 874496, offset: 118351180},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 875520, offset: 118351512},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 876544, offset: 118351937},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 877568, offset: 118352261},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 878592, offset: 118352622},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 879616, offset: 118352990},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 880640, offset: 118353375},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 881664, offset: 118353731},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 882688, offset: 118354151},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 883712, offset: 118354529},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 884736, offset: 118354917},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 885760, offset: 118355286},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 886784, offset: 118355675},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 887808, offset: 118356064},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 888832, offset: 118356416},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 889856, offset: 118356732},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 890880, offset: 118357166},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 891904, offset: 118357516},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 892928, offset: 118357851},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 893952, offset: 118358219},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 894976, offset: 118358607},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 896000, offset: 118359026},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 897024, offset: 118359401},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 898048, offset: 118359778},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 899072, offset: 118360132},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 900096, offset: 118360454},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 901120, offset: 118360857},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 902144, offset: 118361193},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 903168, offset: 118361597},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 904192, offset: 118361976},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 905216, offset: 118362306},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 906240, offset: 118362682},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 907264, offset: 118363020},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 908288, offset: 118363438},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 909312, offset: 118363785},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 910336, offset: 118364184},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 911360, offset: 118364593},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 912384, offset: 118364995},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 913408, offset: 118365402},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 914432, offset: 118365786},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 915456, offset: 118366170},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 916480, offset: 118366548},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 917504, offset: 118366894},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 918528, offset: 118367206},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 919552, offset: 118367517},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 920576, offset: 118367975},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 921600, offset: 118368371},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 922624, offset: 118368681},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 923648, offset: 118369089},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 924672, offset: 118369498},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 925696, offset: 118369780},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 926720, offset: 118370093},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 927744, offset: 118370411},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 928768, offset: 118370861},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 929792, offset: 118371262},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 930816, offset: 118371682},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 931840, offset: 118372004},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 932864, offset: 118372339},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 933888, offset: 118372680},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 934912, offset: 118373030},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 935936, offset: 118373423},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 936960, offset: 118373805},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 937984, offset: 118374209},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 939008, offset: 118374571},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 940032, offset: 118374941},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 941056, offset: 118375293},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 942080, offset: 118375670},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 943104, offset: 118376010},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 944128, offset: 118376389},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 945152, offset: 118376786},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 946176, offset: 118377164},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 947200, offset: 118377566},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 948224, offset: 118377959},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 949248, offset: 118378309},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 950272, offset: 118378674},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 951296, offset: 118379053},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 952320, offset: 118379418},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 953344, offset: 118379784},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 954368, offset: 118380166},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 955392, offset: 118380619},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 956416, offset: 118380914},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 957440, offset: 118381260},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 958464, offset: 118381582},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 959488, offset: 118382014},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 960512, offset: 118382432},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 961536, offset: 118382800},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 962560, offset: 118383167},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 963584, offset: 118383556},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 964608, offset: 118383911},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 965632, offset: 118384271},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 966656, offset: 118384719},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 967680, offset: 118385106},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 968704, offset: 118385419},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 969728, offset: 118385752},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 970752, offset: 118386108},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 971776, offset: 118386420},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 972800, offset: 118386764},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 973824, offset: 118387105},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 974848, offset: 118387480},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 975872, offset: 118387814},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 976896, offset: 118388223},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 977920, offset: 118388567},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 978944, offset: 118388973},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 979968, offset: 118389328},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 980992, offset: 118389704},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 982016, offset: 118390119},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 983040, offset: 118390531},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 984064, offset: 118390912},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 985088, offset: 118391222},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 986112, offset: 118391569},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 987136, offset: 118391930},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 988160, offset: 118392335},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 989184, offset: 118392783},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 990208, offset: 118393094},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 991232, offset: 118393458},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 992256, offset: 118393810},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 993280, offset: 118394171},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 994304, offset: 118394479},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 995328, offset: 118394845},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 996352, offset: 118395177},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 997376, offset: 118395545},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 998400, offset: 118395908},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 999424, offset: 118396295},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1000448, offset: 118396696},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1001472, offset: 118397125},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1002496, offset: 118397563},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1003520, offset: 118397895},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1004544, offset: 118398206},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1005568, offset: 118398515},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1006592, offset: 118398969},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1007616, offset: 118399366},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1008640, offset: 118399681},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1009664, offset: 118400033},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1010688, offset: 118400473},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1011712, offset: 118400789},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1012736, offset: 118401117},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1013760, offset: 118401491},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1014784, offset: 118401826},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1015808, offset: 118402223},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1016832, offset: 118402582},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1017856, offset: 118402954},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1018880, offset: 118403320},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1019904, offset: 118403705},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1020928, offset: 118404049},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1021952, offset: 118404437},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1022976, offset: 118404782},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1024000, offset: 118405190},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1025024, offset: 118405554},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1026048, offset: 118405913},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1027072, offset: 118406280},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1028096, offset: 118406656},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1029120, offset: 118407024},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1030144, offset: 118407400},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1031168, offset: 118407796},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1032192, offset: 118408146},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1033216, offset: 118408539},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1034240, offset: 118408897},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1035264, offset: 118409261},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1036288, offset: 118409627},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1037312, offset: 118409998},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1038336, offset: 118410385},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1039360, offset: 118410747},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1040384, offset: 118411188},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1041408, offset: 118411598},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1042432, offset: 118411982},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1043456, offset: 118412298},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1044480, offset: 118412652},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1045504, offset: 118413007},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1046528, offset: 118413378},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1047552, offset: 118413750},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1048576, offset: 118414109},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1049600, offset: 118414495},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1050624, offset: 118414825},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1051648, offset: 118415268},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1052672, offset: 118415679},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1053696, offset: 118416015},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1054720, offset: 118416340},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1055744, offset: 118416780},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1056768, offset: 118417101},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1057792, offset: 118417479},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1058816, offset: 118417911},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1059840, offset: 118418289},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1060864, offset: 118418691},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1061888, offset: 118419011},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1062912, offset: 118419335},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1063936, offset: 118419702},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1064960, offset: 118420060},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1065984, offset: 118420492},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1067008, offset: 118420806},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1068032, offset: 118421148},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1069056, offset: 118421491},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1070080, offset: 118421887},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1071104, offset: 118422248},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1072128, offset: 118422615},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1073152, offset: 118422975},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1074176, offset: 118423354},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1075200, offset: 118423728},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1076224, offset: 118424087},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1077248, offset: 118424472},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1078272, offset: 118424877},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1079296, offset: 118425220},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1080320, offset: 118425605},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1081344, offset: 118425966},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1082368, offset: 118426343},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1083392, offset: 118426703},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1084416, offset: 118427077},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1085440, offset: 118427450},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1086464, offset: 118427823},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1087488, offset: 118428176},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1088512, offset: 118428580},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1089536, offset: 118429031},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1090560, offset: 118429344},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1091584, offset: 118429718},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1092608, offset: 118430066},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1093632, offset: 118430436},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1094656, offset: 118430789},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1095680, offset: 118431157},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1096704, offset: 118431507},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1097728, offset: 118431906},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1098752, offset: 118432290},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1099776, offset: 118432674},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1100800, offset: 118433018},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1101824, offset: 118433411},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1102848, offset: 118433850},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1103872, offset: 118434235},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1104896, offset: 118434543},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1105920, offset: 118434897},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1106944, offset: 118435246},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1107968, offset: 118435617},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1108992, offset: 118435975},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1110016, offset: 118436344},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1111040, offset: 118436796},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1112064, offset: 118437122},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1113088, offset: 118437465},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1114112, offset: 118437837},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1115136, offset: 118438236},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1116160, offset: 118438585},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1117184, offset: 118438925},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1118208, offset: 118439244},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1119232, offset: 118439621},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1120256, offset: 118439996},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1121280, offset: 118440348},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1122304, offset: 118440704},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1123328, offset: 118441154},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1124352, offset: 118441550},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1125376, offset: 118441945},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1126400, offset: 118442308},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1127424, offset: 118442629},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1128448, offset: 118442989},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1129472, offset: 118443330},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1130496, offset: 118443695},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1131520, offset: 118444046},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1132544, offset: 118444425},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1133568, offset: 118444789},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1134592, offset: 118445178},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1135616, offset: 118445568},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1136640, offset: 118445993},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1137664, offset: 118446372},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1138688, offset: 118446711},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1139712, offset: 118447092},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1140736, offset: 118447432},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1141760, offset: 118447861},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1142784, offset: 118448169},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1143808, offset: 118448486},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1144832, offset: 118448900},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1145856, offset: 118449266},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1146880, offset: 118449596},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1147904, offset: 118449997},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1148928, offset: 118450363},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1149952, offset: 118450720},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1150976, offset: 118451097},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1152000, offset: 118451500},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1153024, offset: 118451862},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1154048, offset: 118452186},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1155072, offset: 118452560},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1156096, offset: 118452936},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1157120, offset: 118453316},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1158144, offset: 118453693},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1159168, offset: 118454054},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1160192, offset: 118454439},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1161216, offset: 118454829},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1162240, offset: 118455177},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1163264, offset: 118455579},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1164288, offset: 118455956},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1165312, offset: 118456296},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1166336, offset: 118456685},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1167360, offset: 118457070},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1168384, offset: 118457423},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1169408, offset: 118457788},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1170432, offset: 118458152},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1171456, offset: 118458539},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1172480, offset: 118458920},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1173504, offset: 118459291},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1174528, offset: 118459673},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1175552, offset: 118460027},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1176576, offset: 118460389},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1177600, offset: 118460760},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1178624, offset: 118461151},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1179648, offset: 118461593},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1180672, offset: 118461993},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1181696, offset: 118462426},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1182720, offset: 118462739},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1183744, offset: 118463048},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1184768, offset: 118463473},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1185792, offset: 118463886},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1186816, offset: 118464207},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1187840, offset: 118464518},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1188864, offset: 118464888},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1189888, offset: 118465308},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1190912, offset: 118465716},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1191936, offset: 118466031},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1192960, offset: 118466398},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1193984, offset: 118466771},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1195008, offset: 118467159},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1196032, offset: 118467526},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1197056, offset: 118467960},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1198080, offset: 118468347},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1199104, offset: 118468659},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1200128, offset: 118468976},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1201152, offset: 118469326},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1202176, offset: 118469764},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1203200, offset: 118470182},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1204224, offset: 118470581},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1205248, offset: 118470892},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1206272, offset: 118471228},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1207296, offset: 118471680},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1208320, offset: 118472052},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1209344, offset: 118472364},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1210368, offset: 118472675},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1211392, offset: 118473022},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1212416, offset: 118473375},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1213440, offset: 118473735},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1214464, offset: 118474134},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1215488, offset: 118474556},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1216512, offset: 118474864},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1217536, offset: 118475193},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1218560, offset: 118475510},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1219584, offset: 118475836},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1220608, offset: 118476211},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1221632, offset: 118476654},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1222656, offset: 118476972},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1223680, offset: 118477339},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1224704, offset: 118477664},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1225728, offset: 118478068},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1226752, offset: 118478407},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1227776, offset: 118478748},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1228800, offset: 118479124},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1229824, offset: 118479490},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1230848, offset: 118479927},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1231872, offset: 118480335},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1232896, offset: 118480710},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1233920, offset: 118481026},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1234944, offset: 118481345},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1235968, offset: 118481734},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1236992, offset: 118482073},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1238016, offset: 118482433},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1239040, offset: 118482781},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1240064, offset: 118483206},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1241088, offset: 118483613},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1242112, offset: 118484022},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1243136, offset: 118484341},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1244160, offset: 118484688},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1245184, offset: 118485134},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1246208, offset: 118485519},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1247232, offset: 118485899},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1248256, offset: 118486182},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1249280, offset: 118486525},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1250304, offset: 118486850},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1251328, offset: 118487280},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1252352, offset: 118487689},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1253376, offset: 118488098},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1254400, offset: 118488507},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1255424, offset: 118488825},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1256448, offset: 118489169},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1257472, offset: 118489547},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1258496, offset: 118489914},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1259520, offset: 118490239},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1260544, offset: 118490636},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1261568, offset: 118490986},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1262592, offset: 118491374},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1263616, offset: 118491773},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1264640, offset: 118492177},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1265664, offset: 118492627},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1266688, offset: 118493001},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1267712, offset: 118493377},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1268736, offset: 118493745},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1269760, offset: 118494055},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1270784, offset: 118494434},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1271808, offset: 118494878},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1272832, offset: 118495192},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1273856, offset: 118495550},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1274880, offset: 118495915},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1275904, offset: 118496288},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1276928, offset: 118496741},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1277952, offset: 118497150},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1278976, offset: 118497454},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1280000, offset: 118497765},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1281024, offset: 118498111},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1282048, offset: 118498459},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1283072, offset: 118498827},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1284096, offset: 118499195},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1285120, offset: 118499575},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1286144, offset: 118499936},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1287168, offset: 118500316},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1288192, offset: 118500711},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1289216, offset: 118501096},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1290240, offset: 118501485},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1291264, offset: 118501882},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1292288, offset: 118502234},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1293312, offset: 118502595},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1294336, offset: 118503032},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1295360, offset: 118503424},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1296384, offset: 118503820},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1297408, offset: 118504146},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1298432, offset: 118504469},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1299456, offset: 118504828},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1300480, offset: 118505143},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1301504, offset: 118505552},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1302528, offset: 118505889},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1303552, offset: 118506270},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1304576, offset: 118506678},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1305600, offset: 118507042},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1306624, offset: 118507355},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1307648, offset: 118507692},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1308672, offset: 118508042},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1309696, offset: 118508400},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1310720, offset: 118508845},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1311744, offset: 118509153},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1312768, offset: 118509508},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1313792, offset: 118509822},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1314816, offset: 118510276},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1315840, offset: 118510689},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1316864, offset: 118511082},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1317888, offset: 118511392},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1318912, offset: 118511711},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1319936, offset: 118512105},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1320960, offset: 118512434},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1321984, offset: 118512855},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1323008, offset: 118513213},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1324032, offset: 118513578},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1325056, offset: 118513921},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1326080, offset: 118514307},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1327104, offset: 118514682},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1328128, offset: 118515064},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1329152, offset: 118515405},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1330176, offset: 118515795},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1331200, offset: 118516133},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1332224, offset: 118516541},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1333248, offset: 118516932},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1334272, offset: 118517314},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1335296, offset: 118517680},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1336320, offset: 118518001},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1337344, offset: 118518421},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1338368, offset: 118518757},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1339392, offset: 118519158},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1340416, offset: 118519489},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1341440, offset: 118519906},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1342464, offset: 118520233},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1343488, offset: 118520632},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1344512, offset: 118520993},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1345536, offset: 118521427},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1346560, offset: 118521822},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1347584, offset: 118522212},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1348608, offset: 118522574},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1349632, offset: 118522915},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1350656, offset: 118523253},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1351680, offset: 118523614},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1352704, offset: 118523962},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1353728, offset: 118524341},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1354752, offset: 118524714},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1355776, offset: 118525093},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1356800, offset: 118525550},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1357824, offset: 118525956},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1358848, offset: 118526240},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1359872, offset: 118526573},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1360896, offset: 118526959},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1361920, offset: 118527300},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1362944, offset: 118527692},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1363968, offset: 118528040},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1364992, offset: 118528425},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1366016, offset: 118528828},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1367040, offset: 118529214},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1368064, offset: 118529534},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1369088, offset: 118529866},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1370112, offset: 118530249},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1371136, offset: 118530608},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1372160, offset: 118530986},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1373184, offset: 118531331},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1374208, offset: 118531733},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1375232, offset: 118532125},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1376256, offset: 118532482},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1377280, offset: 118532867},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1378304, offset: 118533297},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1379328, offset: 118533698},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1380352, offset: 118534015},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1381376, offset: 118534334},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1382400, offset: 118534674},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1383424, offset: 118534986},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1384448, offset: 118535370},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1385472, offset: 118535716},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1386496, offset: 118536096},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1387520, offset: 118536551},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1388544, offset: 118536962},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1389568, offset: 118537278},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1390592, offset: 118537611},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1391616, offset: 118537927},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1392640, offset: 118538260},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1393664, offset: 118538702},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1394688, offset: 118539095},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1395712, offset: 118539402},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1396736, offset: 118539720},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1397760, offset: 118540170},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1398784, offset: 118540590},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1399808, offset: 118540959},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1400832, offset: 118541299},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1401856, offset: 118541666},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1402880, offset: 118542010},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1403904, offset: 118542345},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1404928, offset: 118542724},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1405952, offset: 118543080},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1406976, offset: 118543448},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1408000, offset: 118543821},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1409024, offset: 118544181},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1410048, offset: 118544568},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1411072, offset: 118544929},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1412096, offset: 118545297},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1413120, offset: 118545681},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1414144, offset: 118546040},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1415168, offset: 118546414},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1416192, offset: 118546781},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1417216, offset: 118547164},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1418240, offset: 118547529},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1419264, offset: 118547920},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1420288, offset: 118548276},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1421312, offset: 118548668},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1422336, offset: 118549014},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1423360, offset: 118549411},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1424384, offset: 118549766},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1425408, offset: 118550148},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1426432, offset: 118550513},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1427456, offset: 118550885},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1428480, offset: 118551257},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1429504, offset: 118551632},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1430528, offset: 118551998},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1431552, offset: 118552364},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1432576, offset: 118552739},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1433600, offset: 118553111},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1434624, offset: 118553482},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1435648, offset: 118553842},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1436672, offset: 118554227},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1437696, offset: 118554581},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1438720, offset: 118554997},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1439744, offset: 118555338},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1440768, offset: 118555721},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1441792, offset: 118556082},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1442816, offset: 118556453},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1443840, offset: 118556823},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1444864, offset: 118557190},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1445888, offset: 118557562},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1446912, offset: 118557946},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1447936, offset: 118558319},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1448960, offset: 118558674},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1449984, offset: 118559059},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1451008, offset: 118559417},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1452032, offset: 118559796},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1453056, offset: 118560169},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1454080, offset: 118560547},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1455104, offset: 118560925},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1456128, offset: 118561290},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1457152, offset: 118561732},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1458176, offset: 118562104},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1459200, offset: 118562514},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1460224, offset: 118562855},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1461248, offset: 118563236},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1462272, offset: 118563619},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1463296, offset: 118564013},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1464320, offset: 118564364},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1465344, offset: 118564689},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1466368, offset: 118565044},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1467392, offset: 118565456},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1468416, offset: 118565891},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1469440, offset: 118566296},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1470464, offset: 118566699},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1471488, offset: 118567068},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1472512, offset: 118567421},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1473536, offset: 118567738},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1474560, offset: 118568052},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1475584, offset: 118568437},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1476608, offset: 118568767},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1477632, offset: 118569169},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1478656, offset: 118569526},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1479680, offset: 118569964},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1480704, offset: 118570363},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1481728, offset: 118570759},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1482752, offset: 118571078},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1483776, offset: 118571451},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1484800, offset: 118571790},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1485824, offset: 118572160},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1486848, offset: 118572474},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1487872, offset: 118572896},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1488896, offset: 118573252},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1489920, offset: 118573585},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1490944, offset: 118573989},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1491968, offset: 118574343},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1492992, offset: 118574749},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1494016, offset: 118575095},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1495040, offset: 118575447},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1496064, offset: 118575830},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1497088, offset: 118576180},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1498112, offset: 118576579},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1499136, offset: 118576958},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1500160, offset: 118577300},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1501184, offset: 118577734},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1502208, offset: 118578159},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1503232, offset: 118578517},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1504256, offset: 118578888},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1505280, offset: 118579224},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1506304, offset: 118579644},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1507328, offset: 118580002},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1508352, offset: 118580354},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1509376, offset: 118580703},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1510400, offset: 118581065},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1511424, offset: 118581512},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1512448, offset: 118581912},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1513472, offset: 118582299},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1514496, offset: 118582695},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1515520, offset: 118583046},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1516544, offset: 118583385},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1517568, offset: 118583770},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1518592, offset: 118584119},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1519616, offset: 118584483},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1520640, offset: 118584861},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1521664, offset: 118585199},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1522688, offset: 118585586},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1523712, offset: 118585953},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1524736, offset: 118586320},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1525760, offset: 118586663},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1526784, offset: 118587048},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1527808, offset: 118587389},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1528832, offset: 118587804},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1529856, offset: 118588142},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1530880, offset: 118588557},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1531904, offset: 118588883},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1532928, offset: 118589301},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1533952, offset: 120981337},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1534976, offset: 120981754},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1536000, offset: 120982129},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1537024, offset: 120982524},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1538048, offset: 120982917},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1539072, offset: 120983274},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1540096, offset: 120983585},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1541120, offset: 120983998},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1542144, offset: 120984419},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1543168, offset: 120984745},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1544192, offset: 120985059},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1545216, offset: 120985437},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1546240, offset: 120985799},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1547264, offset: 120986157},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1548288, offset: 120986539},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1549312, offset: 120986893},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1550336, offset: 120987253},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1551360, offset: 120987627},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1552384, offset: 120987999},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1553408, offset: 120988371},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1554432, offset: 120988741},
		},
		{
			track: {trackId: 1, timescale: 44100, type: 'audio'},
			samplePosition: {dts: 1555456, offset: 120989117},
		},
	],
];

test('calculate jump marks', () => {
	const jumpMarks = calculateJumpMarks(flatSamples, 120989485);
	expect(jumpMarks).toEqual([
		{
			afterSampleWithOffset: 27655256,
			jumpToOffset: 118034714,
		},
		{
			afterSampleWithOffset: 118290414,
			jumpToOffset: 27718418,
		},
		{
			afterSampleWithOffset: 82288651,
			jumpToOffset: 118290729,
		},
		{
			afterSampleWithOffset: 118545681,
			jumpToOffset: 82313219,
		},
		{
			afterSampleWithOffset: 117978962,
			jumpToOffset: 118546040,
		},
	]);
});

beforeAll(async () => {
	await getPrivateExampleVideo('dispersedFrames');
});

test('dispersed samples', async () => {
	const progresses: Record<number, number> = {};

	const verifyProgressSpread = () => {
		const progressValues = Object.values(progresses);
		const minProgress = Math.min(...progressValues);
		const maxProgress = Math.max(...progressValues);
		const spread = maxProgress - minProgress;
		if (spread > 10.5) {
			throw new Error('Progress spread is too high');
		}
	};

	const videoSamples: number[] = [];
	const audioSamples: number[] = [];

	const file = await getPrivateExampleVideo('dispersedFrames');

	if (file === null) {
		console.log('Skipping, no access to private example video');
		return;
	}

	await parseMedia({
		src: file,
		reader: nodeReader,
		fields: {
			tracks: true,
		},
		acknowledgeRemotionLicense: true,
		onVideoTrack: () => (v) => {
			progresses[v.trackId] = v.dts / v.timescale;
			verifyProgressSpread();
			videoSamples.push(v.dts);
		},
		onAudioTrack: () => (a) => {
			progresses[a.trackId] = a.dts / a.timescale;
			verifyProgressSpread();
			audioSamples.push(a.dts);
		},
	});

	expect(audioSamples.length).toBe(1520);
	expect(videoSamples.length).toBe(2118);
	// unique
	expect(new Set(audioSamples).size).toBe(audioSamples.length);
	expect(new Set(videoSamples).size).toBe(videoSamples.length);
});
