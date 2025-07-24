import {getPrivateExampleVideo} from '@remotion/example-videos';
import {beforeAll, expect, test} from 'bun:test';
import {calculateJumpMarks} from '../containers/iso-base-media/mdat/calculate-jump-marks';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';
import type {MinimalFlatSampleForTesting} from '../state/iso-base-media/cached-sample-positions';
import {WEBCODECS_TIMESCALE} from '../webcodecs-timescale';

const flatSamples: MinimalFlatSampleForTesting[][] = [
	[
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 0, offset: 3232},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1500, offset: 60352},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3000, offset: 93936},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 4500, offset: 116422},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 6000, offset: 185896},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 7500, offset: 272957},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 9000, offset: 380471},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 10500, offset: 460186},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 12000, offset: 529783},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 13500, offset: 577278},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 15000, offset: 623207},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 16500, offset: 661884},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 18000, offset: 730419},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 19500, offset: 752459},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 21000, offset: 778768},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 22500, offset: 845036},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 24000, offset: 918257},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 25500, offset: 981643},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 27000, offset: 1050496},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 28500, offset: 1101255},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 30000, offset: 1157922},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 31500, offset: 1201170},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 33000, offset: 1276128},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 34500, offset: 1295304},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 36000, offset: 1319458},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 37500, offset: 1379021},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 39000, offset: 1446711},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 40500, offset: 1504636},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 42000, offset: 1567779},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 43500, offset: 1629951},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 45000, offset: 1697892},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 46500, offset: 1934936},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 48000, offset: 2011476},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 49500, offset: 2028835},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 51000, offset: 2056189},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 52500, offset: 2125120},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 54000, offset: 2191972},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 55500, offset: 2250300},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 57000, offset: 2305847},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 58500, offset: 2375099},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 60000, offset: 2443335},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 61500, offset: 2461439},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 63000, offset: 2504626},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 64500, offset: 2561753},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 66000, offset: 2617365},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 67500, offset: 2665785},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 69000, offset: 2717836},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 70500, offset: 2764495},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 72000, offset: 2821569},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 73500, offset: 2845222},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 75000, offset: 2879062},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 76500, offset: 2953204},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 78000, offset: 3048224},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 79500, offset: 3093644},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 81000, offset: 3138649},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 82500, offset: 3180784},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 84000, offset: 3236400},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 85500, offset: 3259997},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 87000, offset: 3292926},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 88500, offset: 3367839},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 90000, offset: 3441975},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 91500, offset: 3682461},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 93000, offset: 3755769},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 94500, offset: 3804985},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 96000, offset: 3857428},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 97500, offset: 3895041},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 99000, offset: 3935533},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 100500, offset: 3976852},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 102000, offset: 4026394},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 103500, offset: 4078293},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 105000, offset: 4131041},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 106500, offset: 4184810},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 108000, offset: 4260561},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 109500, offset: 4278563},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 111000, offset: 4298788},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 112500, offset: 4386895},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 114000, offset: 4479450},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 115500, offset: 4561865},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 117000, offset: 4632374},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 118500, offset: 4695507},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 120000, offset: 4751522},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 121500, offset: 4782665},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 123000, offset: 4841594},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 124500, offset: 4858747},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 126000, offset: 4880580},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 127500, offset: 4975878},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 129000, offset: 5075245},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 130500, offset: 5125930},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 132000, offset: 5174518},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 133500, offset: 5237091},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 135000, offset: 5297949},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 136500, offset: 5454865},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 138000, offset: 5495650},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 139500, offset: 5511854},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 141000, offset: 5529496},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 142500, offset: 5598297},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 144000, offset: 5673225},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 145500, offset: 5691733},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 147000, offset: 5713964},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 148500, offset: 5770220},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 150000, offset: 5836246},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 151500, offset: 5919455},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 153000, offset: 6014507},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 154500, offset: 6053114},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 156000, offset: 6088130},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 157500, offset: 6136773},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 159000, offset: 6192524},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 160500, offset: 6212377},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 162000, offset: 6241270},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 163500, offset: 6311133},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 165000, offset: 6383661},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 166500, offset: 6467290},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 168000, offset: 6553307},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 169500, offset: 6595940},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 171000, offset: 6639691},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 172500, offset: 6674066},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 174000, offset: 6719435},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 175500, offset: 6741603},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 177000, offset: 6771359},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 178500, offset: 6853727},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 180000, offset: 6937669},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 181500, offset: 7173303},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 183000, offset: 7242784},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 184500, offset: 7290507},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 186000, offset: 7349126},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 187500, offset: 7403084},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 189000, offset: 7453333},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 190500, offset: 7470596},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 192000, offset: 7492798},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 193500, offset: 7571095},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 195000, offset: 7654215},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 196500, offset: 7698182},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 198000, offset: 7762412},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 199500, offset: 7816932},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 201000, offset: 7865998},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 202500, offset: 7899024},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 204000, offset: 7934638},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 205500, offset: 7975763},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 207000, offset: 8026997},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 208500, offset: 8047549},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 210000, offset: 8077523},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 211500, offset: 8567263},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 213000, offset: 8689502},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 214500, offset: 8714473},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 216000, offset: 8746207},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 217500, offset: 8777775},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 219000, offset: 8808887},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 220500, offset: 8837479},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 222000, offset: 8866701},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 223500, offset: 8885878},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 225000, offset: 8917980},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 226500, offset: 9058286},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 228000, offset: 9108775},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 229500, offset: 9137179},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 231000, offset: 9168261},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 232500, offset: 9200523},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 234000, offset: 9240773},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 235500, offset: 9281483},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 237000, offset: 9323304},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 238500, offset: 9360708},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 240000, offset: 9408510},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 241500, offset: 9433015},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 243000, offset: 9491604},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 244500, offset: 9548761},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 246000, offset: 9604932},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 247500, offset: 9649973},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 249000, offset: 9700905},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 250500, offset: 9724267},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 252000, offset: 9755702},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 253500, offset: 9816666},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 255000, offset: 9881540},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 256500, offset: 9944421},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 258000, offset: 10034080},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 259500, offset: 10080642},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 261000, offset: 10125402},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 262500, offset: 10146772},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 264000, offset: 10175735},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 265500, offset: 10246137},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 267000, offset: 10319452},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 268500, offset: 10381868},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 270000, offset: 10445719},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 271500, offset: 10702772},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 273000, offset: 10774432},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 274500, offset: 10817252},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 276000, offset: 10868007},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 277500, offset: 10901061},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 279000, offset: 10935888},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 280500, offset: 10972549},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 282000, offset: 11014431},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 283500, offset: 11051779},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 285000, offset: 11096320},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 286500, offset: 11119510},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 288000, offset: 11178021},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 289500, offset: 11231641},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 291000, offset: 11282088},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 292500, offset: 11332028},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 294000, offset: 11389005},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 295500, offset: 11434572},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 297000, offset: 11488671},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 298500, offset: 11530014},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 300000, offset: 11575888},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 301500, offset: 11600294},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 303000, offset: 11661783},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 304500, offset: 11716853},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 306000, offset: 11774547},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 307500, offset: 11814889},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 309000, offset: 11862389},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 310500, offset: 11903825},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 312000, offset: 11957088},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 313500, offset: 12007530},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 315000, offset: 12063293},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 316500, offset: 12337366},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 318000, offset: 12386848},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 319500, offset: 12440849},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 321000, offset: 12492821},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 322500, offset: 12511377},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 324000, offset: 12539435},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 325500, offset: 12607379},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 327000, offset: 12679254},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 328500, offset: 12737151},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 330000, offset: 12796836},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 331500, offset: 12817928},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 333000, offset: 12873776},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 334500, offset: 12923054},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 336000, offset: 12971374},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 337500, offset: 13021730},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 339000, offset: 13081266},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 340500, offset: 13107042},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 342000, offset: 13140732},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 343500, offset: 13209144},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 345000, offset: 13279527},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 346500, offset: 13343469},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 348000, offset: 13427895},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 349500, offset: 13469159},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 351000, offset: 13508505},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 352500, offset: 13544386},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 354000, offset: 13592284},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 355500, offset: 13615337},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 357000, offset: 13647099},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 358500, offset: 13723011},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 360000, offset: 13800305},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 361500, offset: 14120155},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 363000, offset: 14201111},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 364500, offset: 14238612},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 366000, offset: 14286371},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 367500, offset: 14319485},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 369000, offset: 14356852},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 370500, offset: 14377435},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 372000, offset: 14404742},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 373500, offset: 14461630},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 375000, offset: 14517916},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 376500, offset: 14568204},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 378000, offset: 14648186},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 379500, offset: 14689786},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 381000, offset: 14729796},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 382500, offset: 14768275},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 384000, offset: 14811184},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 385500, offset: 14832124},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 387000, offset: 14860956},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 388500, offset: 14930617},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 390000, offset: 15008031},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 391500, offset: 15062225},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 393000, offset: 15151332},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 394500, offset: 15199091},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 396000, offset: 15243948},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 397500, offset: 15283800},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 399000, offset: 15330550},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 400500, offset: 15356674},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 402000, offset: 15392086},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 403500, offset: 15456536},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 405000, offset: 15524987},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 406500, offset: 15814175},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 408000, offset: 15891678},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 409500, offset: 15929896},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 411000, offset: 15968347},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 412500, offset: 16003756},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 414000, offset: 16044243},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 415500, offset: 16065098},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 417000, offset: 16092420},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 418500, offset: 16149693},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 420000, offset: 16208523},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 421500, offset: 16259883},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 423000, offset: 16337214},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 424500, offset: 16381477},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 426000, offset: 16425554},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 427500, offset: 16466584},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 429000, offset: 16512831},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 430500, offset: 16536274},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 432000, offset: 16571686},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 433500, offset: 16632631},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 435000, offset: 16697156},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 436500, offset: 16762209},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 438000, offset: 16849971},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 439500, offset: 16896485},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 441000, offset: 16942713},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 442500, offset: 16988398},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 444000, offset: 17042244},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 445500, offset: 17068040},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 447000, offset: 17104011},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 448500, offset: 17172771},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 450000, offset: 17241631},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 451500, offset: 17493353},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 453000, offset: 17574559},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 454500, offset: 17620523},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 456000, offset: 17672041},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 457500, offset: 17705303},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 459000, offset: 17739254},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 460500, offset: 17759631},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 462000, offset: 17788740},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 463500, offset: 17847506},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 465000, offset: 17907679},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 466500, offset: 17967104},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 468000, offset: 18042969},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 469500, offset: 18084516},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 471000, offset: 18124234},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 472500, offset: 18142171},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 474000, offset: 18173712},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 475500, offset: 18233761},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 477000, offset: 18298267},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 478500, offset: 18345795},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 480000, offset: 18399694},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 481500, offset: 18427590},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 483000, offset: 18490603},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 484500, offset: 18550113},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 486000, offset: 18607222},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 487500, offset: 18653562},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 489000, offset: 18707007},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 490500, offset: 18735927},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 492000, offset: 18775587},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 493500, offset: 18854493},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 495000, offset: 18932798},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 496500, offset: 19193112},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 498000, offset: 19246226},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 499500, offset: 19299489},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 501000, offset: 19353559},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 502500, offset: 19394699},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 504000, offset: 19440186},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 505500, offset: 19490573},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 507000, offset: 19540686},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 508500, offset: 19583508},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 510000, offset: 19631169},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 511500, offset: 19653293},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 513000, offset: 19706612},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 514500, offset: 19759175},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 516000, offset: 19809175},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 517500, offset: 19856810},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 519000, offset: 19909607},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 520500, offset: 19934867},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 522000, offset: 19969122},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 523500, offset: 20037161},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 525000, offset: 20108215},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 526500, offset: 20176684},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 528000, offset: 20258212},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 529500, offset: 20303535},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 531000, offset: 20346688},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 532500, offset: 20386224},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 534000, offset: 20428327},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 535500, offset: 20455043},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 537000, offset: 20491818},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 538500, offset: 20562861},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 540000, offset: 20630472},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 541500, offset: 20865052},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 543000, offset: 20942441},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 544500, offset: 20976104},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 546000, offset: 21012457},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 547500, offset: 21041860},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 549000, offset: 21076982},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 550500, offset: 21113267},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 552000, offset: 21156903},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 553500, offset: 21186345},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 555000, offset: 21226613},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 556500, offset: 21289128},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 558000, offset: 21380658},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 559500, offset: 21429609},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 561000, offset: 21476694},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 562500, offset: 21521729},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 564000, offset: 21572668},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 565500, offset: 21623334},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 567000, offset: 21679007},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 568500, offset: 21729298},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 570000, offset: 21783171},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 571500, offset: 21808776},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 573000, offset: 21868654},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 574500, offset: 21926846},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 576000, offset: 21987037},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 577500, offset: 22010939},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 579000, offset: 22042003},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 580500, offset: 22247362},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 582000, offset: 22370448},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 583500, offset: 22406889},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 585000, offset: 22442290},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 586500, offset: 22576062},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 588000, offset: 22625225},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 589500, offset: 22661357},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 591000, offset: 22697752},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 592500, offset: 22728477},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 594000, offset: 22771732},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 595500, offset: 22805559},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 597000, offset: 22843982},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 598500, offset: 22888082},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 600000, offset: 22940405},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 601500, offset: 22966583},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 603000, offset: 23027941},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 604500, offset: 23090262},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 606000, offset: 23148601},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 607500, offset: 23173828},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 609000, offset: 23209033},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 610500, offset: 23284405},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 612000, offset: 23361974},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 613500, offset: 23433531},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 615000, offset: 23499794},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 616500, offset: 23547440},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 618000, offset: 23617868},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 619500, offset: 23656823},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 621000, offset: 23694345},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 622500, offset: 23728845},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 624000, offset: 23776166},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 625500, offset: 23804477},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 627000, offset: 23842470},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 628500, offset: 23917501},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 630000, offset: 23992593},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 631500, offset: 24251313},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 633000, offset: 24334132},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 634500, offset: 24377343},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 636000, offset: 24426347},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 637500, offset: 24463033},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 639000, offset: 24501434},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 640500, offset: 24537721},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 642000, offset: 24577970},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 643500, offset: 24603565},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 645000, offset: 24639394},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 646500, offset: 24710782},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 648000, offset: 24805900},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 649500, offset: 24852213},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 651000, offset: 24896788},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 652500, offset: 24936260},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 654000, offset: 24981118},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 655500, offset: 25026630},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 657000, offset: 25075356},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 658500, offset: 25120964},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 660000, offset: 25169935},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 661500, offset: 25213171},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 663000, offset: 25286032},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 664500, offset: 25312527},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 666000, offset: 25343622},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 667500, offset: 25369040},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 669000, offset: 25404403},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 670500, offset: 25514833},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 672000, offset: 25625790},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 673500, offset: 25691732},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 675000, offset: 25754210},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 676500, offset: 25980068},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 678000, offset: 26053276},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 679500, offset: 26070611},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 681000, offset: 26094606},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 682500, offset: 26144358},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 684000, offset: 26204481},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 685500, offset: 26247671},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 687000, offset: 26290962},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 688500, offset: 26317178},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 690000, offset: 26350213},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 691500, offset: 26421833},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 693000, offset: 26517822},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 694500, offset: 26544831},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 696000, offset: 26576824},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 697500, offset: 26635078},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 699000, offset: 26696083},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 700500, offset: 26757911},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 702000, offset: 26817490},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 703500, offset: 26875734},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 705000, offset: 26930458},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 706500, offset: 26978541},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 708000, offset: 27048067},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 709500, offset: 27072555},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 711000, offset: 27101314},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 712500, offset: 27171935},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 714000, offset: 27243759},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 715500, offset: 27307647},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 717000, offset: 27367351},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 718500, offset: 27416335},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 720000, offset: 27465335},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 721500, offset: 27655256},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 723000, offset: 27718418},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 724500, offset: 27754846},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 726000, offset: 27794095},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 727500, offset: 27813896},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 729000, offset: 27841282},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 730500, offset: 27890887},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 732000, offset: 27945782},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 733500, offset: 27998041},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 735000, offset: 28051108},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 736500, offset: 28109731},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 738000, offset: 28192754},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 739500, offset: 28238215},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 741000, offset: 28280025},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 742500, offset: 28319045},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 744000, offset: 28361227},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 745500, offset: 28411356},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 747000, offset: 28465506},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 748500, offset: 28491313},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 750000, offset: 28523486},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 751500, offset: 28590979},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 753000, offset: 28679984},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 754500, offset: 28739848},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 756000, offset: 28791958},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 757500, offset: 28813240},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 759000, offset: 28844456},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 760500, offset: 28915784},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 762000, offset: 28988215},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 763500, offset: 29050832},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 765000, offset: 29107664},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 766500, offset: 29315510},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 768000, offset: 29382060},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 769500, offset: 29426326},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 771000, offset: 29469528},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 772500, offset: 29509915},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 774000, offset: 29553013},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 775500, offset: 29598870},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 777000, offset: 29646564},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 778500, offset: 29669902},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 780000, offset: 29704212},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 781500, offset: 29781921},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 783000, offset: 29872455},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 784500, offset: 29897851},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 786000, offset: 29927238},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 787500, offset: 29989459},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 789000, offset: 30053979},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 790500, offset: 30116904},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 792000, offset: 30176311},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 793500, offset: 30231488},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 795000, offset: 30287442},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 796500, offset: 30336002},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 798000, offset: 30408425},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 799500, offset: 30435669},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 801000, offset: 30463113},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 802500, offset: 30529425},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 804000, offset: 30598019},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 805500, offset: 30669174},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 807000, offset: 30740172},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 808500, offset: 30790521},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 810000, offset: 30843314},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 811500, offset: 31017035},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 813000, offset: 31081089},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 814500, offset: 31104171},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 816000, offset: 31138475},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 817500, offset: 31183794},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 819000, offset: 31229805},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 820500, offset: 31281861},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 822000, offset: 31336015},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 823500, offset: 31359967},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 825000, offset: 31393199},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 826500, offset: 31460158},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 828000, offset: 31546413},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 829500, offset: 31592861},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 831000, offset: 31637561},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 832500, offset: 31679338},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 834000, offset: 31724692},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 835500, offset: 31779180},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 837000, offset: 31837423},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 838500, offset: 31859867},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 840000, offset: 31887094},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 841500, offset: 31974311},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 843000, offset: 32077743},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 844500, offset: 32140322},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 846000, offset: 32198417},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 847500, offset: 32218177},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 849000, offset: 32247569},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 850500, offset: 32345404},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 852000, offset: 32429656},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 853500, offset: 32448674},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 855000, offset: 32473179},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 856500, offset: 32680531},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 858000, offset: 32756453},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 859500, offset: 32803484},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 861000, offset: 32851392},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 862500, offset: 32892085},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 864000, offset: 32936841},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 865500, offset: 32975079},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 867000, offset: 33020366},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 868500, offset: 33044548},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 870000, offset: 33081310},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 871500, offset: 33159406},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 873000, offset: 33252285},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 874500, offset: 33278504},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 876000, offset: 33308270},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 877500, offset: 33367044},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 879000, offset: 33430893},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 880500, offset: 33502955},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 882000, offset: 33575144},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 883500, offset: 33625903},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 885000, offset: 33680082},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 886500, offset: 33726597},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 888000, offset: 33799061},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 889500, offset: 33823096},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 891000, offset: 33851832},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 892500, offset: 33926308},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 894000, offset: 33997501},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 895500, offset: 34020499},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 897000, offset: 34054070},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 898500, offset: 34124544},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 900000, offset: 34198166},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 901500, offset: 34444159},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 903000, offset: 34521550},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 904500, offset: 34544467},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 906000, offset: 34581258},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 907500, offset: 34640180},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 909000, offset: 34693165},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 910500, offset: 34732246},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 912000, offset: 34774640},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 913500, offset: 34797178},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 915000, offset: 34830275},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 916500, offset: 34901308},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 918000, offset: 34993550},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 919500, offset: 35046318},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 921000, offset: 35098324},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 922500, offset: 35143657},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 924000, offset: 35194640},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 925500, offset: 35242117},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 927000, offset: 35296132},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 928500, offset: 35320365},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 930000, offset: 35350010},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 931500, offset: 35421359},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 933000, offset: 35518769},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 934500, offset: 35573704},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 936000, offset: 35629010},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 937500, offset: 35675278},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 939000, offset: 35732058},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 940500, offset: 35782533},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 942000, offset: 35838637},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 943500, offset: 35865209},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 945000, offset: 35896367},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 946500, offset: 36139705},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 948000, offset: 36213612},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 949500, offset: 36254021},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 951000, offset: 36297614},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 952500, offset: 36333825},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 954000, offset: 36372583},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 955500, offset: 36411464},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 957000, offset: 36459157},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 958500, offset: 36506973},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 960000, offset: 36556046},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 961500, offset: 36580119},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 963000, offset: 36639876},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 964500, offset: 36702237},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 966000, offset: 36763849},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 967500, offset: 36785760},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 969000, offset: 36817159},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 970500, offset: 36892335},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 972000, offset: 36971640},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 973500, offset: 37038490},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 975000, offset: 37098956},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 976500, offset: 37152947},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 978000, offset: 37230309},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 979500, offset: 37255032},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 981000, offset: 37280256},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 982500, offset: 37350737},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 984000, offset: 37424873},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 985500, offset: 37493882},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 987000, offset: 37555182},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 988500, offset: 37603097},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 990000, offset: 37654869},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 991500, offset: 37813740},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 993000, offset: 37867102},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 994500, offset: 37903312},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 996000, offset: 37941217},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 997500, offset: 37959421},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 999000, offset: 37991705},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1000500, offset: 38049922},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1002000, offset: 38112719},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1003500, offset: 38177373},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1005000, offset: 38238792},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1006500, offset: 38260405},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1008000, offset: 38316911},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1009500, offset: 38378884},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1011000, offset: 38439555},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1012500, offset: 38491571},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1014000, offset: 38549880},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1015500, offset: 38606554},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1017000, offset: 38667313},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1018500, offset: 38719759},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1020000, offset: 38773837},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1021500, offset: 38798170},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1023000, offset: 38857335},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1024500, offset: 38927894},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1026000, offset: 38993828},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1027500, offset: 39056384},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1029000, offset: 39117541},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1030500, offset: 39167668},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1032000, offset: 39220959},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1033500, offset: 39244914},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1035000, offset: 39276210},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1036500, offset: 39498002},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1038000, offset: 39567007},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1039500, offset: 39610650},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1041000, offset: 39653904},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1042500, offset: 39690602},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1044000, offset: 39730528},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1045500, offset: 39775480},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1047000, offset: 39823389},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1048500, offset: 39845903},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1050000, offset: 39876509},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1051500, offset: 39959629},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1053000, offset: 40061368},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1054500, offset: 40120116},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1056000, offset: 40172186},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1057500, offset: 40192403},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1059000, offset: 40220210},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1060500, offset: 40296656},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1062000, offset: 40378280},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1063500, offset: 40443652},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1065000, offset: 40502950},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1066500, offset: 40553200},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1068000, offset: 40625478},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1069500, offset: 40686364},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1071000, offset: 40746807},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1072500, offset: 40766682},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1074000, offset: 40795918},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1075500, offset: 40865378},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1077000, offset: 40941363},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1078500, offset: 40995105},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1080000, offset: 41051744},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1081500, offset: 41259152},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1083000, offset: 41329241},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1084500, offset: 41365201},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1086000, offset: 41406826},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1087500, offset: 41426084},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1089000, offset: 41452002},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1090500, offset: 41511904},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1092000, offset: 41572104},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1093500, offset: 41598562},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1095000, offset: 41630846},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1096500, offset: 41695567},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1098000, offset: 41793703},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1099500, offset: 41846907},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1101000, offset: 41902530},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1102500, offset: 41920112},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1104000, offset: 41943112},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1105500, offset: 42028809},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1107000, offset: 42112482},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1108500, offset: 42134730},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1110000, offset: 42160621},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1111500, offset: 42226056},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1113000, offset: 42325584},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1114500, offset: 42381272},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1116000, offset: 42441061},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1117500, offset: 42459989},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1119000, offset: 42485340},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1120500, offset: 42558491},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1122000, offset: 42636090},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1123500, offset: 42655968},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1125000, offset: 42678147},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1126500, offset: 42996566},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1128000, offset: 43071033},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1129500, offset: 43107022},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1131000, offset: 43143842},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1132500, offset: 43158797},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1134000, offset: 43179978},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1135500, offset: 43231940},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1137000, offset: 43298578},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1138500, offset: 43330397},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1140000, offset: 43369456},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1141500, offset: 43404572},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1143000, offset: 43488016},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1144500, offset: 43530523},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1146000, offset: 43575797},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1147500, offset: 43590625},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1149000, offset: 43606631},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1150500, offset: 44241224},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1152000, offset: 44390638},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1153500, offset: 44423924},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1155000, offset: 44461357},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1156500, offset: 44489070},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1158000, offset: 44545373},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1159500, offset: 44568395},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1161000, offset: 44592287},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1162500, offset: 44608353},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1164000, offset: 44629112},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1165500, offset: 44668949},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1167000, offset: 44713329},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1168500, offset: 44753078},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1170000, offset: 44795772},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1171500, offset: 44941277},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1173000, offset: 44988388},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1174500, offset: 45016363},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1176000, offset: 45045918},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1177500, offset: 45057236},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1179000, offset: 45080968},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1180500, offset: 45132522},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1182000, offset: 45184633},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1183500, offset: 45228776},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1185000, offset: 45277766},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1186500, offset: 45331055},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1188000, offset: 45398355},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1189500, offset: 45431704},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1191000, offset: 45465664},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1192500, offset: 45479503},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1194000, offset: 45503680},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1195500, offset: 45574768},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1197000, offset: 45646239},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1198500, offset: 45703255},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1200000, offset: 45762669},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1201500, offset: 45804760},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1203000, offset: 45871968},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1204500, offset: 45905300},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1206000, offset: 45940374},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1207500, offset: 45957295},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1209000, offset: 45983502},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1210500, offset: 46048533},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1212000, offset: 46116917},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1213500, offset: 46184287},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1215000, offset: 46251298},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1216500, offset: 46507354},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1218000, offset: 46583056},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1219500, offset: 46618645},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1221000, offset: 46654872},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1222500, offset: 46668246},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1224000, offset: 46685632},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1225500, offset: 46737646},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1227000, offset: 46791654},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1228500, offset: 46839050},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1230000, offset: 46892180},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1231500, offset: 46943035},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1233000, offset: 47013897},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1234500, offset: 47051289},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1236000, offset: 47090590},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1237500, offset: 47106296},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1239000, offset: 47133865},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1240500, offset: 47194241},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1242000, offset: 47255695},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1243500, offset: 47302785},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1245000, offset: 47358840},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1246500, offset: 47409013},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1248000, offset: 47495191},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1249500, offset: 47536975},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1251000, offset: 47582258},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1252500, offset: 47598361},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1254000, offset: 47623659},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1255500, offset: 47679455},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1257000, offset: 47738264},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1258500, offset: 47800397},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1260000, offset: 47870101},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1261500, offset: 48164128},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1263000, offset: 48247878},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1264500, offset: 48295230},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1266000, offset: 48352797},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1267500, offset: 48368387},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1269000, offset: 48389842},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1270500, offset: 48447374},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1272000, offset: 48506588},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1273500, offset: 48563324},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1275000, offset: 48620733},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1276500, offset: 48669604},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1278000, offset: 48743041},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1279500, offset: 48782795},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1281000, offset: 48822266},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1282500, offset: 48855418},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1284000, offset: 48899089},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1285500, offset: 48937359},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1287000, offset: 48986541},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1288500, offset: 49003769},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1290000, offset: 49030809},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1291500, offset: 49101691},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1293000, offset: 49198538},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1294500, offset: 49251946},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1296000, offset: 49303957},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1297500, offset: 49321271},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1299000, offset: 49349488},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1300500, offset: 49435141},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1302000, offset: 49519764},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1303500, offset: 49544203},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1305000, offset: 49578328},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1306500, offset: 49828947},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1308000, offset: 49905085},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1309500, offset: 49946785},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1311000, offset: 49988831},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1312500, offset: 50027827},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1314000, offset: 50070114},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1315500, offset: 50112386},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1317000, offset: 50157982},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1318500, offset: 50177825},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1320000, offset: 50208922},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1321500, offset: 50279602},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1323000, offset: 50367171},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1324500, offset: 50415656},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1326000, offset: 50467760},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1327500, offset: 50484868},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1329000, offset: 50509722},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1330500, offset: 50585118},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1332000, offset: 50663335},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1333500, offset: 50727755},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1335000, offset: 50788795},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1336500, offset: 50835053},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1338000, offset: 50904823},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1339500, offset: 50948235},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1341000, offset: 50992946},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1342500, offset: 51010189},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1344000, offset: 51042024},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1345500, offset: 51110256},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1347000, offset: 51181001},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1348500, offset: 51241146},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1350000, offset: 51301099},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1351500, offset: 51500862},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1353000, offset: 51566025},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1354500, offset: 51609593},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1356000, offset: 51657384},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1357500, offset: 51676229},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1359000, offset: 51703235},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1360500, offset: 51758216},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1362000, offset: 51815044},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1363500, offset: 51872885},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1365000, offset: 51933032},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1366500, offset: 51981179},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1368000, offset: 52052000},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1369500, offset: 52091833},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1371000, offset: 52131997},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1372500, offset: 52149612},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1374000, offset: 52179837},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1375500, offset: 52242741},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1377000, offset: 52309962},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1378500, offset: 52363776},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1380000, offset: 52424039},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1381500, offset: 52481012},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1383000, offset: 52566830},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1384500, offset: 52618285},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1386000, offset: 52668731},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1387500, offset: 52685680},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1389000, offset: 52710795},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1390500, offset: 52789371},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1392000, offset: 52865952},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1393500, offset: 52933152},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1395000, offset: 52999433},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1396500, offset: 53218552},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1398000, offset: 53288604},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1399500, offset: 53326904},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1401000, offset: 53367221},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1402500, offset: 53382672},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1404000, offset: 53405170},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1405500, offset: 53474064},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1407000, offset: 53543513},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1408500, offset: 53606519},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1410000, offset: 53666282},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1411500, offset: 53720831},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1413000, offset: 53789562},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1414500, offset: 53826544},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1416000, offset: 53864579},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1417500, offset: 53881072},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1419000, offset: 53909647},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1420500, offset: 53971839},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1422000, offset: 54034473},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1423500, offset: 54090179},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1425000, offset: 54151549},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1426500, offset: 54198957},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1428000, offset: 54271148},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1429500, offset: 54315039},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1431000, offset: 54358521},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1432500, offset: 54378148},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1434000, offset: 54411292},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1435500, offset: 54473407},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1437000, offset: 54541721},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1438500, offset: 54599138},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1440000, offset: 54665530},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1441500, offset: 54906612},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1443000, offset: 54972025},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1444500, offset: 55012227},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1446000, offset: 55063301},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1447500, offset: 55081863},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1449000, offset: 55105637},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1450500, offset: 55166599},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1452000, offset: 55231467},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1453500, offset: 55251992},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1455000, offset: 55281855},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1456500, offset: 55335205},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1458000, offset: 55429617},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1459500, offset: 55478927},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1461000, offset: 55530463},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1462500, offset: 55544600},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1464000, offset: 55566330},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1465500, offset: 55621223},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1467000, offset: 55684917},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1468500, offset: 55733841},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1470000, offset: 55791822},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1471500, offset: 55840336},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1473000, offset: 55929811},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1474500, offset: 55988084},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1476000, offset: 56047584},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1477500, offset: 56058835},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1479000, offset: 56074704},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1480500, offset: 56141040},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1482000, offset: 56212827},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1483500, offset: 56301500},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1485000, offset: 56382548},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1486500, offset: 56636327},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1488000, offset: 56680528},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1489500, offset: 56738910},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1491000, offset: 56792962},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1492500, offset: 56834666},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1494000, offset: 56883523},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1495500, offset: 56926896},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1497000, offset: 56975089},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1498500, offset: 57022577},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1500000, offset: 57075362},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1501500, offset: 57093355},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1503000, offset: 57145936},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1504500, offset: 57208325},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1506000, offset: 57271021},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1507500, offset: 57289522},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1509000, offset: 57320810},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1510500, offset: 57392447},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1512000, offset: 57462175},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1513500, offset: 57518746},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1515000, offset: 57571850},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1516500, offset: 57625887},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1518000, offset: 57701861},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1519500, offset: 57741596},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1521000, offset: 57782126},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1522500, offset: 57799734},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1524000, offset: 57826620},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1525500, offset: 57901125},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1527000, offset: 57977242},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1528500, offset: 58051041},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1530000, offset: 58118021},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1531500, offset: 58320553},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1533000, offset: 58390765},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1534500, offset: 58433249},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1536000, offset: 58480403},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1537500, offset: 58497719},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1539000, offset: 58524200},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1540500, offset: 58586574},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1542000, offset: 58649630},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1543500, offset: 58713770},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1545000, offset: 58774891},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1546500, offset: 58794643},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1548000, offset: 58846396},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1549500, offset: 58899825},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1551000, offset: 58951503},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1552500, offset: 59005697},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1554000, offset: 59063516},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1555500, offset: 59113833},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1557000, offset: 59167702},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1558500, offset: 59229399},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1560000, offset: 59290284},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1561500, offset: 59309554},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1563000, offset: 59359705},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1564500, offset: 59415575},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1566000, offset: 59470438},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1567500, offset: 59528264},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1569000, offset: 59587061},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1570500, offset: 59642001},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1572000, offset: 59699550},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1573500, offset: 59756341},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1575000, offset: 59814798},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1576500, offset: 59981770},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1578000, offset: 60017730},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1579500, offset: 60062301},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1581000, offset: 60108232},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1582500, offset: 60149537},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1584000, offset: 60193187},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1585500, offset: 60238528},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1587000, offset: 60287412},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1588500, offset: 60333177},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1590000, offset: 60380744},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1591500, offset: 60398878},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1593000, offset: 60443430},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1594500, offset: 60517267},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1596000, offset: 60589015},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1597500, offset: 60606675},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1599000, offset: 60630226},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1600500, offset: 60728093},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1602000, offset: 60818353},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1603500, offset: 60884510},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1605000, offset: 60941780},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1606500, offset: 60960049},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1608000, offset: 61009459},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1609500, offset: 61077070},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1611000, offset: 61147241},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1612500, offset: 61197859},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1614000, offset: 61250491},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1615500, offset: 61301722},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1617000, offset: 61357041},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1618500, offset: 61408040},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1620000, offset: 61462554},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1621500, offset: 61648929},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1623000, offset: 61712277},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1624500, offset: 61731095},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1626000, offset: 61762797},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1627500, offset: 61808393},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1629000, offset: 61858586},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1630500, offset: 61906842},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1632000, offset: 61958460},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1633500, offset: 62005100},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1635000, offset: 62055294},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1636500, offset: 62105859},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1638000, offset: 62181241},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1639500, offset: 62278997},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1641000, offset: 62358888},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1642500, offset: 62383559},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1644000, offset: 62421066},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1645500, offset: 62449373},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1647000, offset: 62490150},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1648500, offset: 62511028},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1650000, offset: 62549666},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1651500, offset: 62627087},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1653000, offset: 62723877},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1654500, offset: 62781528},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1656000, offset: 62839101},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1657500, offset: 62897037},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1659000, offset: 62957746},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1660500, offset: 63012420},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1662000, offset: 63070334},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1663500, offset: 63093772},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1665000, offset: 63127197},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1666500, offset: 63326344},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1668000, offset: 63403152},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1669500, offset: 63454047},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1671000, offset: 63504376},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1672500, offset: 63549816},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1674000, offset: 63596107},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1675500, offset: 63615166},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1677000, offset: 63644718},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1678500, offset: 63713321},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1680000, offset: 63783980},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1681500, offset: 63850335},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1683000, offset: 63928570},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1684500, offset: 63969575},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1686000, offset: 64010007},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1687500, offset: 64029111},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1689000, offset: 64062082},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1690500, offset: 64123860},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1692000, offset: 64186919},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1693500, offset: 64240336},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1695000, offset: 64297373},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1696500, offset: 64318655},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1698000, offset: 64380991},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1699500, offset: 64454417},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1701000, offset: 64526810},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1702500, offset: 64546710},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1704000, offset: 64574239},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1705500, offset: 64657703},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1707000, offset: 64739782},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1708500, offset: 64814065},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1710000, offset: 64880028},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1711500, offset: 65108611},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1713000, offset: 65150234},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1714500, offset: 65221989},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1716000, offset: 65281121},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1717500, offset: 65296799},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1719000, offset: 65320030},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1720500, offset: 65376409},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1722000, offset: 65436873},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1723500, offset: 65498162},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1725000, offset: 65555777},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1726500, offset: 65605342},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1728000, offset: 65675781},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1729500, offset: 65722412},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1731000, offset: 65769021},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1732500, offset: 65811356},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1734000, offset: 65856823},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1735500, offset: 65875481},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1737000, offset: 65904536},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1738500, offset: 65986341},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1740000, offset: 66062957},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1741500, offset: 66131455},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1743000, offset: 66210272},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1744500, offset: 66249409},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1746000, offset: 66288706},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1747500, offset: 66324674},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1749000, offset: 66375574},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1750500, offset: 66395684},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1752000, offset: 66426608},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1753500, offset: 66508174},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1755000, offset: 66588220},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1756500, offset: 66835307},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1758000, offset: 66923902},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1759500, offset: 66964214},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1761000, offset: 67003585},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1762500, offset: 67042042},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1764000, offset: 67087535},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1765500, offset: 67106364},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1767000, offset: 67132716},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1768500, offset: 67192422},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1770000, offset: 67255585},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1771500, offset: 67317286},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1773000, offset: 67397367},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1774500, offset: 67440057},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1776000, offset: 67486569},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1777500, offset: 67503022},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1779000, offset: 67527139},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1780500, offset: 67604676},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1782000, offset: 67687951},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1783500, offset: 67750407},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1785000, offset: 67807971},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1786500, offset: 67823835},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1788000, offset: 67873868},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1789500, offset: 67933440},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1791000, offset: 67997091},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1792500, offset: 68055926},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1794000, offset: 68115081},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1795500, offset: 68167094},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1797000, offset: 68225879},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1798500, offset: 68272239},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1800000, offset: 68322042},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1801500, offset: 68479466},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1803000, offset: 68532190},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1804500, offset: 68554709},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1806000, offset: 68585122},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1807500, offset: 68626952},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1809000, offset: 68676860},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1810500, offset: 68721641},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1812000, offset: 68775712},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1813500, offset: 68819075},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1815000, offset: 68871402},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1816500, offset: 68920471},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1818000, offset: 68999363},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1819500, offset: 69045733},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1821000, offset: 69093506},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1822500, offset: 69141732},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1824000, offset: 69195860},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1825500, offset: 69217971},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1827000, offset: 69249719},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1828500, offset: 69318846},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1830000, offset: 69388185},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1831500, offset: 69456006},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1833000, offset: 69543648},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1834500, offset: 69592740},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1836000, offset: 69641978},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1837500, offset: 69689255},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1839000, offset: 69740946},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1840500, offset: 69761810},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1842000, offset: 69796183},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1843500, offset: 69865888},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1845000, offset: 69938120},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1846500, offset: 70201267},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1848000, offset: 70273818},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1849500, offset: 70309847},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1851000, offset: 70347283},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1852500, offset: 70386243},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1854000, offset: 70432416},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1855500, offset: 70450165},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1857000, offset: 70476382},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1858500, offset: 70548611},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1860000, offset: 70619775},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1861500, offset: 70685897},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1863000, offset: 70769970},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1864500, offset: 70821031},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1866000, offset: 70872228},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1867500, offset: 70894336},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1869000, offset: 70926980},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1870500, offset: 71000285},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1872000, offset: 71070032},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1873500, offset: 71128788},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1875000, offset: 71185212},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1876500, offset: 71205495},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1878000, offset: 71261535},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1879500, offset: 71327666},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1881000, offset: 71395603},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1882500, offset: 71438992},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1884000, offset: 71491004},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1885500, offset: 71535830},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1887000, offset: 71583256},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1888500, offset: 71629061},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1890000, offset: 71684567},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1891500, offset: 71870237},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1893000, offset: 71908526},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1894500, offset: 71949729},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1896000, offset: 71997844},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1897500, offset: 72038229},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1899000, offset: 72079888},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1900500, offset: 72126272},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1902000, offset: 72177316},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1903500, offset: 72225638},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1905000, offset: 72275787},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1906500, offset: 72324061},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1908000, offset: 72398673},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1909500, offset: 72445111},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1911000, offset: 72491297},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1912500, offset: 72527726},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1914000, offset: 72579639},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1915500, offset: 72601872},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1917000, offset: 72635746},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1918500, offset: 72699334},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1920000, offset: 72770585},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1921500, offset: 72841396},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1923000, offset: 72941016},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1924500, offset: 72990771},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1926000, offset: 73044993},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1927500, offset: 73094596},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1929000, offset: 73151254},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1930500, offset: 73173458},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1932000, offset: 73205234},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1933500, offset: 73267981},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1935000, offset: 73335400},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1936500, offset: 73619187},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1938000, offset: 73697726},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1939500, offset: 73740313},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1941000, offset: 73784079},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1942500, offset: 73824216},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1944000, offset: 73869482},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1945500, offset: 73889063},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1947000, offset: 73916834},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1948500, offset: 73982221},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1950000, offset: 74049648},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1951500, offset: 74112282},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1953000, offset: 74198215},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1954500, offset: 74251069},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1956000, offset: 74306970},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1957500, offset: 74323861},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1959000, offset: 74350886},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1960500, offset: 74425520},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1962000, offset: 74498226},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1963500, offset: 74554441},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1965000, offset: 74611993},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1966500, offset: 74628814},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1968000, offset: 74683353},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1969500, offset: 74744578},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1971000, offset: 74804362},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1972500, offset: 74861520},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1974000, offset: 74924787},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1975500, offset: 74943563},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1977000, offset: 74973249},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1978500, offset: 75035745},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1980000, offset: 75110226},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1981500, offset: 75365694},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1983000, offset: 75436520},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1984500, offset: 75459926},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1986000, offset: 75495176},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1987500, offset: 75530286},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1989000, offset: 75569489},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1990500, offset: 75609794},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1992000, offset: 75658990},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1993500, offset: 76123102},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1995000, offset: 76230585},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1996500, offset: 76247363},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1998000, offset: 76291169},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 1999500, offset: 76308473},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2001000, offset: 76333901},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2002500, offset: 76359885},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2004000, offset: 76385564},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2005500, offset: 76408806},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2007000, offset: 76439864},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2008500, offset: 76486254},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2010000, offset: 76528392},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2011500, offset: 76567967},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2013000, offset: 76634508},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2014500, offset: 76669350},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2016000, offset: 76701872},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2017500, offset: 76735321},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2019000, offset: 76777547},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2020500, offset: 76825349},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2022000, offset: 76875690},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2023500, offset: 76900022},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2025000, offset: 76930133},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2026500, offset: 77152052},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2028000, offset: 77213997},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2029500, offset: 77246573},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2031000, offset: 77279794},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2032500, offset: 77311590},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2034000, offset: 77346213},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2035500, offset: 77368868},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2037000, offset: 77400057},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2038500, offset: 77452954},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2040000, offset: 77512829},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2041500, offset: 77574386},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2043000, offset: 77660222},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2044500, offset: 77710582},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2046000, offset: 77759463},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2047500, offset: 77781448},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2049000, offset: 77808984},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2050500, offset: 77873043},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2052000, offset: 77939372},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2053500, offset: 77996905},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2055000, offset: 78052891},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2056500, offset: 78106104},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2058000, offset: 78186526},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2059500, offset: 78212893},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2061000, offset: 78241655},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2062500, offset: 78289081},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2064000, offset: 78348974},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2065500, offset: 78406980},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2067000, offset: 78468101},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2068500, offset: 78521674},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2070000, offset: 78579071},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2071500, offset: 78821222},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2073000, offset: 78885354},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2074500, offset: 78910878},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2076000, offset: 78947508},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2077500, offset: 78989965},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2079000, offset: 79035716},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2080500, offset: 79080548},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2082000, offset: 79129978},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2083500, offset: 79172488},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2085000, offset: 79219805},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2086500, offset: 79265530},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2088000, offset: 79340553},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2089500, offset: 79367879},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2091000, offset: 79395946},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2092500, offset: 79449536},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2094000, offset: 79507265},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2095500, offset: 79560169},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2097000, offset: 79614500},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2098500, offset: 79661670},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2100000, offset: 79713317},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2101500, offset: 79760096},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2103000, offset: 79835211},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2104500, offset: 79861645},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2106000, offset: 79891234},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2107500, offset: 79945635},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2109000, offset: 80006214},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2110500, offset: 80055758},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2112000, offset: 80113224},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2113500, offset: 80163021},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2115000, offset: 80221398},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2116500, offset: 80477747},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2118000, offset: 80545066},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2119500, offset: 80562563},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2121000, offset: 80583832},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2122500, offset: 80628611},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2124000, offset: 80679478},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2125500, offset: 80728168},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2127000, offset: 80779642},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2128500, offset: 80825731},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2130000, offset: 80875123},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2131500, offset: 80914247},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2133000, offset: 80987609},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2134500, offset: 81013675},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2136000, offset: 81045522},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2137500, offset: 81094350},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2139000, offset: 81154777},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2140500, offset: 81209888},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2142000, offset: 81271822},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2143500, offset: 81328410},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2145000, offset: 81392882},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2146500, offset: 81444183},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2148000, offset: 81532219},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2149500, offset: 81561187},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2151000, offset: 81599441},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2152500, offset: 81653754},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2154000, offset: 81715088},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2155500, offset: 81777046},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2157000, offset: 81839584},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2158500, offset: 81895756},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2160000, offset: 81958565},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2161500, offset: 82216971},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2163000, offset: 82288651},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2164500, offset: 82313219},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2166000, offset: 82348917},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2167500, offset: 82387606},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2169000, offset: 82430246},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2170500, offset: 82474248},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2172000, offset: 82520858},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2173500, offset: 82563051},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2175000, offset: 82609483},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2176500, offset: 82654313},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2178000, offset: 82729203},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2179500, offset: 82773416},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2181000, offset: 82815885},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2182500, offset: 82836597},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2184000, offset: 82868279},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2185500, offset: 82926617},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2187000, offset: 82992506},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2188500, offset: 83049945},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2190000, offset: 83113035},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2191500, offset: 83161749},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2193000, offset: 83242614},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2194500, offset: 83282323},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2196000, offset: 83320982},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2197500, offset: 83358558},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2199000, offset: 83401466},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2200500, offset: 83449387},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2202000, offset: 83506205},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2203500, offset: 83532480},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2205000, offset: 83568636},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2206500, offset: 83857105},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2208000, offset: 83930902},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2209500, offset: 83966487},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2211000, offset: 84001361},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2212500, offset: 84035244},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2214000, offset: 84073149},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2215500, offset: 84099069},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2217000, offset: 84133336},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2218500, offset: 84178319},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2220000, offset: 84230104},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2221500, offset: 84279484},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2223000, offset: 84370405},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2224500, offset: 84417013},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2226000, offset: 84467876},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2227500, offset: 84511512},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2229000, offset: 84564817},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2230500, offset: 84587898},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2232000, offset: 84619012},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2233500, offset: 84686014},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2235000, offset: 84762387},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2236500, offset: 84821983},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2238000, offset: 84917673},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2239500, offset: 84941754},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2241000, offset: 84968820},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2242500, offset: 85026533},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2244000, offset: 85091665},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2245500, offset: 85160342},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2247000, offset: 85226523},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2248500, offset: 85287752},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2250000, offset: 85349260},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2251500, offset: 85605754},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2253000, offset: 85673871},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2254500, offset: 85698076},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2256000, offset: 85733112},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2257500, offset: 85771260},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2259000, offset: 85811930},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2260500, offset: 85852917},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2262000, offset: 85902096},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2263500, offset: 85942379},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2265000, offset: 85991884},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2266500, offset: 86032161},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2268000, offset: 86109036},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2269500, offset: 86157446},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2271000, offset: 86202163},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2272500, offset: 86244398},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2274000, offset: 86291174},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2275500, offset: 86318442},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2277000, offset: 86358858},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2278500, offset: 86426126},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2280000, offset: 86492944},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2281500, offset: 86553805},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2283000, offset: 86637380},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2284500, offset: 86682911},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2286000, offset: 86728002},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2287500, offset: 86765816},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2289000, offset: 86812768},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2290500, offset: 86837940},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2292000, offset: 86874591},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2293500, offset: 86939727},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2295000, offset: 87008027},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2296500, offset: 87306943},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2298000, offset: 87383264},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2299500, offset: 87405117},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2301000, offset: 87431340},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2302500, offset: 87475721},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2304000, offset: 87528244},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2305500, offset: 87578001},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2307000, offset: 87633693},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2308500, offset: 87682356},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2310000, offset: 87737686},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2311500, offset: 87788139},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2313000, offset: 87863548},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2314500, offset: 87887507},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2316000, offset: 87913928},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2317500, offset: 87968325},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2319000, offset: 88030650},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2320500, offset: 88078815},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2322000, offset: 88128650},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2323500, offset: 88171080},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2325000, offset: 88219216},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2326500, offset: 88264748},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2328000, offset: 88340703},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2329500, offset: 88365027},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2331000, offset: 88392257},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2332500, offset: 88451001},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2334000, offset: 88512548},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2335500, offset: 88568109},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2337000, offset: 88630966},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2338500, offset: 88689306},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2340000, offset: 88754313},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2341500, offset: 89029476},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2343000, offset: 89077106},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2344500, offset: 89125887},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2346000, offset: 89184138},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2347500, offset: 89218440},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2349000, offset: 89255036},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2350500, offset: 89290686},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2352000, offset: 89336314},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2353500, offset: 89374843},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2355000, offset: 89422113},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2356500, offset: 89466556},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2358000, offset: 89544359},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2359500, offset: 89567234},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2361000, offset: 89593084},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2362500, offset: 89650015},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2364000, offset: 89714349},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2365500, offset: 89773174},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2367000, offset: 89838585},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2368500, offset: 89900494},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2370000, offset: 89964227},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2371500, offset: 90016938},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2373000, offset: 90098552},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2374500, offset: 90124132},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2376000, offset: 90152140},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2377500, offset: 90202354},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2379000, offset: 90259172},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2380500, offset: 90726659},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2382000, offset: 90827827},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2383500, offset: 90849994},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2385000, offset: 90875178},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2386500, offset: 90961529},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2388000, offset: 90991335},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2389500, offset: 91005754},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2391000, offset: 91021478},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2392500, offset: 91052799},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2394000, offset: 91092809},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2395500, offset: 91135457},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2397000, offset: 91180575},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2398500, offset: 91218678},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2400000, offset: 91263085},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2401500, offset: 91310383},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2403000, offset: 91374503},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2404500, offset: 91392292},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2406000, offset: 91416306},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2407500, offset: 91476871},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2409000, offset: 91535761},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2410500, offset: 91596882},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2412000, offset: 91654110},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2413500, offset: 91708846},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2415000, offset: 91759810},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2416500, offset: 91802739},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2418000, offset: 91864123},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2419500, offset: 91880888},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2421000, offset: 91906110},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2422500, offset: 91962660},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2424000, offset: 92019493},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2425500, offset: 92077517},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2427000, offset: 92136586},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2428500, offset: 92183895},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2430000, offset: 92238308},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2431500, offset: 92387165},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2433000, offset: 92443861},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2434500, offset: 92464938},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2436000, offset: 92499859},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2437500, offset: 92547378},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2439000, offset: 92595638},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2440500, offset: 92645083},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2442000, offset: 92699620},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2443500, offset: 92734832},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2445000, offset: 92779065},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2446500, offset: 92824438},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2448000, offset: 92894335},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2449500, offset: 92930094},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2451000, offset: 92963459},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2452500, offset: 92998067},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2454000, offset: 93044966},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2455500, offset: 93107421},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2457000, offset: 93168580},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2458500, offset: 93188613},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2460000, offset: 93218044},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2461500, offset: 93284700},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2463000, offset: 93375398},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2464500, offset: 93455783},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2466000, offset: 93526141},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2467500, offset: 93555694},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2469000, offset: 93591165},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2470500, offset: 93611851},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2472000, offset: 93643056},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2473500, offset: 93735419},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2475000, offset: 93835766},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2476500, offset: 94087183},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2478000, offset: 94161509},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2479500, offset: 94208352},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2481000, offset: 94258446},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2482500, offset: 94275280},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2484000, offset: 94297797},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2485500, offset: 94363496},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2487000, offset: 94426293},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2488500, offset: 94483510},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2490000, offset: 94539089},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2491500, offset: 94592921},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2493000, offset: 94656229},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2494500, offset: 94700026},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2496000, offset: 94744736},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2497500, offset: 94762468},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2499000, offset: 94791125},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2500500, offset: 94859578},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2502000, offset: 94919702},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2503500, offset: 94941270},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2505000, offset: 94971336},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2506500, offset: 95055722},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2508000, offset: 95154945},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2509500, offset: 95177316},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2511000, offset: 95206017},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2512500, offset: 95256671},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2514000, offset: 95312283},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2515500, offset: 95360231},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2517000, offset: 95412367},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2518500, offset: 95437027},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2520000, offset: 95474568},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2521500, offset: 95732207},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2523000, offset: 95803186},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2524500, offset: 95855784},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2526000, offset: 95913403},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2527500, offset: 95959766},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2529000, offset: 96006615},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2530500, offset: 96053502},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2532000, offset: 96103551},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2533500, offset: 96152968},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2535000, offset: 96204382},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2536500, offset: 96257418},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2538000, offset: 96328233},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2539500, offset: 96376853},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2541000, offset: 96423485},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2542500, offset: 96443135},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2544000, offset: 96473960},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2545500, offset: 96544748},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2547000, offset: 96607393},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2548500, offset: 96673743},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2550000, offset: 96733233},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2551500, offset: 96786839},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2553000, offset: 96855954},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2554500, offset: 96905533},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2556000, offset: 96952073},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2557500, offset: 96971324},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2559000, offset: 97001566},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2560500, offset: 97078426},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2562000, offset: 97147854},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2563500, offset: 97209185},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2565000, offset: 97266260},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2566500, offset: 97437781},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2568000, offset: 97504778},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2569500, offset: 97545370},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2571000, offset: 97585265},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2572500, offset: 97602281},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2574000, offset: 97625913},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2575500, offset: 97709258},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2577000, offset: 97788024},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2578500, offset: 97838954},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2580000, offset: 97888301},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2581500, offset: 97949278},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2583000, offset: 98023209},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2584500, offset: 98053524},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2586000, offset: 98092788},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2587500, offset: 98114404},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2589000, offset: 98145016},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2590500, offset: 98224010},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2592000, offset: 98301981},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2593500, offset: 98327234},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2595000, offset: 98360741},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2596500, offset: 98455200},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2598000, offset: 98552472},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2599500, offset: 98620259},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2601000, offset: 98677967},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2602500, offset: 98723505},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2604000, offset: 98769298},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2605500, offset: 98812337},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2607000, offset: 98857205},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2608500, offset: 98881675},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2610000, offset: 98917146},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2611500, offset: 99102490},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2613000, offset: 99168765},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2614500, offset: 99210960},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2616000, offset: 99259345},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2617500, offset: 99297030},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2619000, offset: 99339522},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2620500, offset: 99385362},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2622000, offset: 99432874},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2623500, offset: 99456862},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2625000, offset: 99490621},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2626500, offset: 99571658},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2628000, offset: 99676894},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2629500, offset: 99722014},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2631000, offset: 99767840},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2632500, offset: 99787816},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2634000, offset: 99815978},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2635500, offset: 99885330},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2637000, offset: 99961121},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2638500, offset: 100009855},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2640000, offset: 100063504},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2641500, offset: 100105949},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2643000, offset: 100188920},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2644500, offset: 100231683},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2646000, offset: 100276384},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2647500, offset: 100294834},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2649000, offset: 100323018},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2650500, offset: 100405222},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2652000, offset: 100495891},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2653500, offset: 100554474},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2655000, offset: 100615911},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2656500, offset: 100893760},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2658000, offset: 100973785},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2659500, offset: 101011009},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2661000, offset: 101049555},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2662500, offset: 101063851},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2664000, offset: 101082882},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2665500, offset: 101143568},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2667000, offset: 101209659},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2668500, offset: 101259715},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2670000, offset: 101315287},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2671500, offset: 101375960},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2673000, offset: 101458291},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2674500, offset: 101501082},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2676000, offset: 101544734},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2677500, offset: 101564750},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2679000, offset: 101591695},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2680500, offset: 101660922},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2682000, offset: 101731456},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2683500, offset: 101753724},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2685000, offset: 101785835},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2686500, offset: 101866256},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2688000, offset: 101970303},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2689500, offset: 102031200},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2691000, offset: 102091023},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2692500, offset: 102136026},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2694000, offset: 102186841},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2695500, offset: 102240797},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2697000, offset: 102300666},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2698500, offset: 102322553},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2700000, offset: 102351302},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2701500, offset: 102582042},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2703000, offset: 102649461},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2704500, offset: 102695930},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2706000, offset: 102752226},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2707500, offset: 102790184},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2709000, offset: 102829770},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2710500, offset: 102870298},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2712000, offset: 102913974},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2713500, offset: 102935497},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2715000, offset: 102965633},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2716500, offset: 103043277},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2718000, offset: 103137215},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2719500, offset: 103187416},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2721000, offset: 103240139},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2722500, offset: 103259415},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2724000, offset: 103287821},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2725500, offset: 103364038},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2727000, offset: 103437878},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2728500, offset: 103503940},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2730000, offset: 103567038},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2731500, offset: 103617277},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2733000, offset: 103688449},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2734500, offset: 103727363},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2736000, offset: 103763904},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2737500, offset: 103783252},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2739000, offset: 103812703},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2740500, offset: 103883654},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2742000, offset: 103955995},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2743500, offset: 104016558},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2745000, offset: 104077812},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2746500, offset: 104306935},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2748000, offset: 104376055},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2749500, offset: 104411123},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2751000, offset: 104447107},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2752500, offset: 104461637},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2754000, offset: 104481309},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2755500, offset: 104544209},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2757000, offset: 104612023},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2758500, offset: 104672523},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2760000, offset: 104735478},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2761500, offset: 104792465},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2763000, offset: 104864959},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2764500, offset: 104902974},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2766000, offset: 104941075},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2767500, offset: 104957216},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2769000, offset: 104981606},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2770500, offset: 105061048},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2772000, offset: 105139295},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2773500, offset: 105156800},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2775000, offset: 105183241},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2776500, offset: 105274768},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2778000, offset: 105378724},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2779500, offset: 105444201},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2781000, offset: 105502124},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2782500, offset: 105548729},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2784000, offset: 105598999},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2785500, offset: 105645175},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2787000, offset: 105696175},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2788500, offset: 105716004},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2790000, offset: 105747049},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2791500, offset: 105962469},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2793000, offset: 106028390},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2794500, offset: 106071471},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2796000, offset: 106122721},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2797500, offset: 106163663},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2799000, offset: 106206410},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2800500, offset: 106252113},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2802000, offset: 106301887},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2803500, offset: 106322482},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2805000, offset: 106352899},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2806500, offset: 106434111},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2808000, offset: 106529614},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2809500, offset: 106588204},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2811000, offset: 106642111},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2812500, offset: 106686290},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2814000, offset: 106733756},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2815500, offset: 106775502},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2817000, offset: 106821160},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2818500, offset: 106863765},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2820000, offset: 106915536},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2821500, offset: 106961380},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2823000, offset: 107040455},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2824500, offset: 107090882},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2826000, offset: 107140766},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2827500, offset: 107159204},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2829000, offset: 107186895},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2830500, offset: 107272628},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2832000, offset: 107356864},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2833500, offset: 107417699},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2835000, offset: 107478081},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2836500, offset: 107681011},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2838000, offset: 107745973},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2839500, offset: 107786582},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2841000, offset: 107828216},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2842500, offset: 107844548},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2844000, offset: 107865250},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2845500, offset: 107939699},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2847000, offset: 108011213},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2848500, offset: 108081456},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2850000, offset: 108139553},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2851500, offset: 108196540},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2853000, offset: 108265628},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2854500, offset: 108305235},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2856000, offset: 108346087},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2857500, offset: 108363875},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2859000, offset: 108390541},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2860500, offset: 108457541},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2862000, offset: 108523050},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2863500, offset: 108543890},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2865000, offset: 108570581},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2866500, offset: 108654292},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2868000, offset: 108759033},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2869500, offset: 108829887},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2871000, offset: 108892804},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2872500, offset: 108968674},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2874000, offset: 109033865},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2875500, offset: 109074777},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2877000, offset: 109114543},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2878500, offset: 109136723},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2880000, offset: 109171535},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2881500, offset: 109383554},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2883000, offset: 109449554},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2884500, offset: 109497626},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2886000, offset: 109550962},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2887500, offset: 109588801},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2889000, offset: 109627399},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2890500, offset: 109666699},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2892000, offset: 109712569},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2893500, offset: 109732929},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2895000, offset: 109763211},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2896500, offset: 109832878},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2898000, offset: 109924840},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2899500, offset: 109980246},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2901000, offset: 110036285},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2902500, offset: 110094174},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2904000, offset: 110149193},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2905500, offset: 110205967},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2907000, offset: 110257911},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2908500, offset: 110276271},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2910000, offset: 110303385},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2911500, offset: 110380575},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2913000, offset: 110480699},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2914500, offset: 110544273},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2916000, offset: 110600888},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2917500, offset: 110644681},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2919000, offset: 110688724},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2920500, offset: 110734309},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2922000, offset: 110783528},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2923500, offset: 110827681},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2925000, offset: 110880665},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2926500, offset: 111068955},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2928000, offset: 111128223},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2929500, offset: 111146127},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2931000, offset: 111170945},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2932500, offset: 111220508},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2934000, offset: 111276410},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2935500, offset: 111322101},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2937000, offset: 111372268},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2938500, offset: 111398283},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2940000, offset: 111440662},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2941500, offset: 111518247},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2943000, offset: 111616761},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2944500, offset: 111638293},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2946000, offset: 111668121},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2947500, offset: 111715401},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2949000, offset: 111776862},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2950500, offset: 111834996},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2952000, offset: 111898728},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2953500, offset: 111920004},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2955000, offset: 111949032},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2956500, offset: 112030201},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2958000, offset: 112141565},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2959500, offset: 112207233},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2961000, offset: 112264437},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2962500, offset: 112323421},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2964000, offset: 112381669},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2965500, offset: 112434986},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2967000, offset: 112489265},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2968500, offset: 112509059},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2970000, offset: 112538104},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2971500, offset: 112757648},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2973000, offset: 112833351},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2974500, offset: 112879200},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2976000, offset: 112927614},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2977500, offset: 112972830},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2979000, offset: 113018965},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2980500, offset: 113062319},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2982000, offset: 113109933},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2983500, offset: 113129522},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2985000, offset: 113163238},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2986500, offset: 113243807},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2988000, offset: 113337295},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2989500, offset: 113360402},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2991000, offset: 113395717},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2992500, offset: 113454248},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2994000, offset: 113517065},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2995500, offset: 113567160},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2997000, offset: 113622489},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 2998500, offset: 113649418},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3000000, offset: 113687040},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3001500, offset: 113765854},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3003000, offset: 113859032},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3004500, offset: 113879082},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3006000, offset: 113900642},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3007500, offset: 113951629},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3009000, offset: 114010450},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3010500, offset: 114032996},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3012000, offset: 114064914},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3013500, offset: 114131371},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3015000, offset: 114205211},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3016500, offset: 114497840},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3018000, offset: 114601398},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3019500, offset: 114618852},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3021000, offset: 114645347},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3022500, offset: 114704476},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3024000, offset: 114761997},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3025500, offset: 114800241},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3027000, offset: 114843462},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3028500, offset: 114875778},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3030000, offset: 114916347},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3031500, offset: 114969146},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3033000, offset: 115047314},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3034500, offset: 115066952},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3036000, offset: 115089421},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3037500, offset: 115151156},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3039000, offset: 115211197},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3040500, offset: 115266094},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3042000, offset: 115323457},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3043500, offset: 115342519},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3045000, offset: 115371622},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3046500, offset: 115444419},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3048000, offset: 115547685},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3049500, offset: 115620638},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3051000, offset: 115680938},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3052500, offset: 115734763},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3054000, offset: 115794724},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3055500, offset: 115845892},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3057000, offset: 115899359},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3058500, offset: 115922120},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3060000, offset: 115953324},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3061500, offset: 116153028},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3063000, offset: 116224488},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3064500, offset: 116270921},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3066000, offset: 116319553},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3067500, offset: 116360122},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3069000, offset: 116400700},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3070500, offset: 116443028},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3072000, offset: 116494533},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3073500, offset: 116515065},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3075000, offset: 116548704},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3076500, offset: 116622378},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3078000, offset: 116708809},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3079500, offset: 116760139},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3081000, offset: 116812096},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3082500, offset: 116853310},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3084000, offset: 116896617},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3085500, offset: 116941411},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3087000, offset: 116998294},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3088500, offset: 117046963},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3090000, offset: 117099188},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3091500, offset: 117119671},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3093000, offset: 117176482},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3094500, offset: 117247023},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3096000, offset: 117320970},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3097500, offset: 117371325},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3099000, offset: 117428943},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3100500, offset: 117483177},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3102000, offset: 117544764},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3103500, offset: 117602643},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3105000, offset: 117663411},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3106500, offset: 117883681},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3108000, offset: 117924911},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3109500, offset: 117978962},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3111000, offset: 118589626},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3112500, offset: 118636423},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3114000, offset: 118687888},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3115500, offset: 118735941},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3117000, offset: 118788143},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3118500, offset: 118810732},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3120000, offset: 118840901},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3121500, offset: 118912415},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3123000, offset: 119003693},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3124500, offset: 119057370},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3126000, offset: 119114803},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3127500, offset: 119154486},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3129000, offset: 119197533},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3130500, offset: 119238951},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3132000, offset: 119289699},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3133500, offset: 119339561},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3135000, offset: 119392473},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3136500, offset: 119414003},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3138000, offset: 119474987},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3139500, offset: 119544743},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3141000, offset: 119612163},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3142500, offset: 119663701},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3144000, offset: 119723070},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3145500, offset: 119744500},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3147000, offset: 119778914},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3148500, offset: 119847859},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3150000, offset: 119921558},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3151500, offset: 120185773},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3153000, offset: 120259534},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3154500, offset: 120296776},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3156000, offset: 120341486},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3157500, offset: 120377024},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3159000, offset: 120414372},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3160500, offset: 120451971},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3162000, offset: 120495060},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3163500, offset: 120542614},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3165000, offset: 120596619},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3166500, offset: 120614387},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3168000, offset: 120667872},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3169500, offset: 120729810},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3171000, offset: 120797070},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3172500, offset: 120853146},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3174000, offset: 120917217},
		},
		{
			track: {trackId: 2, originalTimescale: 90000, type: 'video'},
			samplePosition: {decodingTimestamp: 3175500, offset: 120972391},
		},
	],
	[
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 0, offset: 118034714},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1024, offset: 118035041},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 2048, offset: 118035376},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 3072, offset: 118035724},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 4096, offset: 118036091},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 5120, offset: 118036466},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 6144, offset: 118036845},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 7168, offset: 118037199},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 8192, offset: 118037591},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 9216, offset: 118038016},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 10240, offset: 118038408},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 11264, offset: 118038745},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 12288, offset: 118039122},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 13312, offset: 118039471},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 14336, offset: 118039893},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 15360, offset: 118040251},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 16384, offset: 118040596},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 17408, offset: 118040956},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 18432, offset: 118041339},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 19456, offset: 118041690},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 20480, offset: 118042112},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 21504, offset: 118042533},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 22528, offset: 118042935},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 23552, offset: 118043246},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 24576, offset: 118043585},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 25600, offset: 118043908},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 26624, offset: 118044299},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 27648, offset: 118044660},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 28672, offset: 118045025},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 29696, offset: 118045399},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 30720, offset: 118045766},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 31744, offset: 118046144},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 32768, offset: 118046528},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 33792, offset: 118046935},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 34816, offset: 118047393},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 35840, offset: 118047815},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 36864, offset: 118048175},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 37888, offset: 118048510},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 38912, offset: 118048886},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 39936, offset: 118049256},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 40960, offset: 118049575},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 41984, offset: 118049964},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 43008, offset: 118050363},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 44032, offset: 118050707},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 45056, offset: 118051121},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 46080, offset: 118051493},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 47104, offset: 118051877},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 48128, offset: 118052231},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 49152, offset: 118052611},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 50176, offset: 118052968},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 51200, offset: 118053366},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 52224, offset: 118053822},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 53248, offset: 118054114},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 54272, offset: 118054424},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 55296, offset: 118054783},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 56320, offset: 118055102},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 57344, offset: 118055545},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 58368, offset: 118055869},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 59392, offset: 118056294},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 60416, offset: 118056645},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 61440, offset: 118057058},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 62464, offset: 118057419},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 63488, offset: 118057739},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 64512, offset: 118058162},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 65536, offset: 118058567},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 66560, offset: 118059005},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 67584, offset: 118059378},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 68608, offset: 118059691},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 69632, offset: 118060125},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 70656, offset: 118060555},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 71680, offset: 118060836},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 72704, offset: 118061187},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 73728, offset: 118061537},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 74752, offset: 118061943},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 75776, offset: 118062321},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 76800, offset: 118062677},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 77824, offset: 118063011},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 78848, offset: 118063349},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 79872, offset: 118063746},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 80896, offset: 118064138},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 81920, offset: 118064532},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 82944, offset: 118064957},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 83968, offset: 118065359},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 84992, offset: 118065727},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 86016, offset: 118066106},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 87040, offset: 118066432},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 88064, offset: 118066798},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 89088, offset: 118067139},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 90112, offset: 118067606},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 91136, offset: 118067936},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 92160, offset: 118068337},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 93184, offset: 118068691},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 94208, offset: 118069053},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 95232, offset: 118069430},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 96256, offset: 118069803},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 97280, offset: 118070175},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 98304, offset: 118070519},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 99328, offset: 118070909},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 100352, offset: 118071293},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 101376, offset: 118071663},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 102400, offset: 118072035},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 103424, offset: 118072394},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 104448, offset: 118072800},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 105472, offset: 118073152},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 106496, offset: 118073526},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 107520, offset: 118073920},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 108544, offset: 118074269},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 109568, offset: 118074635},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 110592, offset: 118075019},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 111616, offset: 118075366},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 112640, offset: 118075776},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 113664, offset: 118076157},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 114688, offset: 118076479},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 115712, offset: 118076929},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 116736, offset: 118077249},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 117760, offset: 118077609},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 118784, offset: 118077999},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 119808, offset: 118078365},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 120832, offset: 118078710},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 121856, offset: 118079157},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 122880, offset: 118079580},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 123904, offset: 118079889},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 124928, offset: 118080271},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 125952, offset: 118080602},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 126976, offset: 118080935},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 128000, offset: 118081328},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 129024, offset: 118081715},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 130048, offset: 118082044},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 131072, offset: 118082480},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 132096, offset: 118082860},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 133120, offset: 118083203},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 134144, offset: 118083582},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 135168, offset: 118083939},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 136192, offset: 118084384},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 137216, offset: 118084777},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 138240, offset: 118085161},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 139264, offset: 118085450},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 140288, offset: 118085792},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 141312, offset: 118086108},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 142336, offset: 118086559},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 143360, offset: 118086959},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 144384, offset: 118087347},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 145408, offset: 118087777},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 146432, offset: 118088099},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 147456, offset: 118088461},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 148480, offset: 118088817},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 149504, offset: 118089187},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 150528, offset: 118089645},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 151552, offset: 118089967},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 152576, offset: 118090299},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 153600, offset: 118090692},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 154624, offset: 118091069},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 155648, offset: 118091414},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 156672, offset: 118091773},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 157696, offset: 118092129},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 158720, offset: 118092512},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 159744, offset: 118092891},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 160768, offset: 118093286},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 161792, offset: 118093666},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 162816, offset: 118094044},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 163840, offset: 118094442},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 164864, offset: 118094816},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 165888, offset: 118095132},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 166912, offset: 118095573},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 167936, offset: 118095882},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 168960, offset: 118096230},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 169984, offset: 118096573},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 171008, offset: 118096917},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 172032, offset: 118097284},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 173056, offset: 118097691},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 174080, offset: 118098101},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 175104, offset: 118098420},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 176128, offset: 118098795},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 177152, offset: 118099172},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 178176, offset: 118099531},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 179200, offset: 118099901},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 180224, offset: 118100275},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 181248, offset: 118100657},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 182272, offset: 118100984},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 183296, offset: 118101436},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 184320, offset: 118101771},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 185344, offset: 118102139},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 186368, offset: 118102578},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 187392, offset: 118102901},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 188416, offset: 118103245},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 189440, offset: 118103566},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 190464, offset: 118103927},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 191488, offset: 118104297},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 192512, offset: 118104671},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 193536, offset: 118105055},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 194560, offset: 118105418},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 195584, offset: 118105801},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 196608, offset: 118106156},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 197632, offset: 118106526},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 198656, offset: 118106906},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 199680, offset: 118107275},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 200704, offset: 118107694},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 201728, offset: 118108087},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 202752, offset: 118108450},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 203776, offset: 118108793},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 204800, offset: 118109156},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 205824, offset: 118109552},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 206848, offset: 118109895},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 207872, offset: 118110278},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 208896, offset: 118110673},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 209920, offset: 118111004},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 210944, offset: 118111362},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 211968, offset: 118111760},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 212992, offset: 118112149},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 214016, offset: 118112507},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 215040, offset: 118112894},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 216064, offset: 118113257},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 217088, offset: 118113645},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 218112, offset: 118114002},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 219136, offset: 118114443},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 220160, offset: 118114874},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 221184, offset: 118115254},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 222208, offset: 118115643},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 223232, offset: 118115972},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 224256, offset: 118116299},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 225280, offset: 118116646},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 226304, offset: 118117007},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 227328, offset: 118117449},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 228352, offset: 118117745},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 229376, offset: 118118060},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 230400, offset: 118118410},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 231424, offset: 118118794},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 232448, offset: 118119162},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 233472, offset: 118119533},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 234496, offset: 118119987},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 235520, offset: 118120382},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 236544, offset: 118120753},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 237568, offset: 118121063},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 238592, offset: 118121377},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 239616, offset: 118121763},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 240640, offset: 118122114},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 241664, offset: 118122495},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 242688, offset: 118122919},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 243712, offset: 118123230},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 244736, offset: 118123567},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 245760, offset: 118123921},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 246784, offset: 118124253},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 247808, offset: 118124580},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 248832, offset: 118125034},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 249856, offset: 118125410},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 250880, offset: 118125772},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 251904, offset: 118126130},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 252928, offset: 118126467},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 253952, offset: 118126894},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 254976, offset: 118127330},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 256000, offset: 118127629},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 257024, offset: 118127955},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 258048, offset: 118128287},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 259072, offset: 118128597},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 260096, offset: 118128956},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 261120, offset: 118129322},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 262144, offset: 118129676},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 263168, offset: 118130028},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 264192, offset: 118130376},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 265216, offset: 118130797},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 266240, offset: 118131181},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 267264, offset: 118131535},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 268288, offset: 118131908},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 269312, offset: 118132252},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 270336, offset: 118132643},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 271360, offset: 118132973},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 272384, offset: 118133423},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 273408, offset: 118133782},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 274432, offset: 118134143},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 275456, offset: 118134514},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 276480, offset: 118134890},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 277504, offset: 118135332},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 278528, offset: 118135744},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 279552, offset: 118136048},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 280576, offset: 118136390},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 281600, offset: 118136737},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 282624, offset: 118137081},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 283648, offset: 118137459},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 284672, offset: 118137811},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 285696, offset: 118138200},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 286720, offset: 118138555},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 287744, offset: 118138940},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 288768, offset: 118139298},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 289792, offset: 118139684},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 290816, offset: 118140039},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 291840, offset: 118140413},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 292864, offset: 118140811},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 293888, offset: 118141181},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 294912, offset: 118141539},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 295936, offset: 118141912},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 296960, offset: 118142262},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 297984, offset: 118142647},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 299008, offset: 118143042},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 300032, offset: 118143419},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 301056, offset: 118143832},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 302080, offset: 118144252},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 303104, offset: 118144639},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 304128, offset: 118145052},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 305152, offset: 118145489},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 306176, offset: 118145798},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 307200, offset: 118146131},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 308224, offset: 118146483},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 309248, offset: 118146855},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 310272, offset: 118147250},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 311296, offset: 118147634},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 312320, offset: 118147983},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 313344, offset: 118148364},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 314368, offset: 118148742},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 315392, offset: 118149122},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 316416, offset: 118149459},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 317440, offset: 118149830},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 318464, offset: 118150204},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 319488, offset: 118150594},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 320512, offset: 118150955},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 321536, offset: 118151329},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 322560, offset: 118151679},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 323584, offset: 118152036},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 324608, offset: 118152380},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 325632, offset: 118152740},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 326656, offset: 118153178},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 327680, offset: 118153486},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 328704, offset: 118153800},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 329728, offset: 118154240},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 330752, offset: 118154638},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 331776, offset: 118155001},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 332800, offset: 118155409},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 333824, offset: 118155718},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 334848, offset: 118156049},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 335872, offset: 118156394},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 336896, offset: 118156731},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 337920, offset: 118157156},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 338944, offset: 118157523},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 339968, offset: 118157851},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 340992, offset: 118158299},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 342016, offset: 118158723},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 343040, offset: 118159103},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 344064, offset: 118159427},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 345088, offset: 118159792},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 346112, offset: 118160150},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 347136, offset: 118160522},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 348160, offset: 118160876},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 349184, offset: 118161250},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 350208, offset: 118161684},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 351232, offset: 118162060},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 352256, offset: 118162486},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 353280, offset: 118162878},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 354304, offset: 118163187},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 355328, offset: 118163540},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 356352, offset: 118163887},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 357376, offset: 118164251},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 358400, offset: 118164653},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 359424, offset: 118164997},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 360448, offset: 118165363},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 361472, offset: 118165711},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 362496, offset: 118166092},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 363520, offset: 118166470},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 364544, offset: 118166867},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 365568, offset: 118167215},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 366592, offset: 118167659},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 367616, offset: 118168003},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 368640, offset: 118168404},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 369664, offset: 118168717},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 370688, offset: 118169071},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 371712, offset: 118169406},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 372736, offset: 118169753},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 373760, offset: 118170121},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 374784, offset: 118170480},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 375808, offset: 118170883},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 376832, offset: 118171257},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 377856, offset: 118171624},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 378880, offset: 118171977},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 379904, offset: 118172339},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 380928, offset: 118172691},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 381952, offset: 118173127},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 382976, offset: 118173494},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 384000, offset: 118173855},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 385024, offset: 118174207},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 386048, offset: 118174588},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 387072, offset: 118174955},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 388096, offset: 118175338},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 389120, offset: 118175700},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 390144, offset: 118176067},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 391168, offset: 118176441},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 392192, offset: 118176803},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 393216, offset: 118177260},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 394240, offset: 118177569},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 395264, offset: 118177949},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 396288, offset: 118178379},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 397312, offset: 118178779},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 398336, offset: 118179100},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 399360, offset: 118179480},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 400384, offset: 118179818},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 401408, offset: 118180168},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 402432, offset: 118180514},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 403456, offset: 118180861},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 404480, offset: 118181215},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 405504, offset: 118181607},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 406528, offset: 118181966},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 407552, offset: 118182348},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 408576, offset: 118182673},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 409600, offset: 118183096},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 410624, offset: 118183454},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 411648, offset: 118183819},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 412672, offset: 118184182},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 413696, offset: 118184572},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 414720, offset: 118184925},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 415744, offset: 118185290},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 416768, offset: 118185680},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 417792, offset: 118186056},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 418816, offset: 118186395},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 419840, offset: 118186804},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 420864, offset: 118187188},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 421888, offset: 118187568},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 422912, offset: 118187952},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 423936, offset: 118188371},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 424960, offset: 118188765},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 425984, offset: 118189177},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 427008, offset: 118189527},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 428032, offset: 118189893},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 429056, offset: 118190226},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 430080, offset: 118190562},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 431104, offset: 118190942},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 432128, offset: 118191365},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 433152, offset: 118191773},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 434176, offset: 118192152},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 435200, offset: 118192538},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 436224, offset: 118192924},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 437248, offset: 118193295},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 438272, offset: 118193608},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 439296, offset: 118193922},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 440320, offset: 118194289},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 441344, offset: 118194650},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 442368, offset: 118195009},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 443392, offset: 118195403},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 444416, offset: 118195749},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 445440, offset: 118196077},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 446464, offset: 118196463},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 447488, offset: 118196814},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 448512, offset: 118197212},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 449536, offset: 118197665},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 450560, offset: 118197975},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 451584, offset: 118198290},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 452608, offset: 118198604},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 453632, offset: 118199053},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 454656, offset: 118199405},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 455680, offset: 118199774},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 456704, offset: 118200128},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 457728, offset: 118200555},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 458752, offset: 118200892},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 459776, offset: 118201207},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 460800, offset: 118201611},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 461824, offset: 118202027},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 462848, offset: 118202447},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 463872, offset: 118202726},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 464896, offset: 118203056},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 465920, offset: 118203420},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 466944, offset: 118203832},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 467968, offset: 118204162},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 468992, offset: 118204485},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 470016, offset: 118204921},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 471040, offset: 118205334},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 472064, offset: 118205719},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 473088, offset: 118206029},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 474112, offset: 118206345},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 475136, offset: 118206788},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 476160, offset: 118207210},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 477184, offset: 118207578},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 478208, offset: 118207956},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 479232, offset: 118208288},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 480256, offset: 118208641},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 481280, offset: 118209093},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 482304, offset: 118209376},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 483328, offset: 118209692},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 484352, offset: 118210045},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 485376, offset: 118210405},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 486400, offset: 118210794},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 487424, offset: 118211179},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 488448, offset: 118211605},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 489472, offset: 118211950},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 490496, offset: 118212306},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 491520, offset: 118212679},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 492544, offset: 118213037},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 493568, offset: 118213404},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 494592, offset: 118213856},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 495616, offset: 118214178},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 496640, offset: 118214500},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 497664, offset: 118214843},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 498688, offset: 118215183},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 499712, offset: 118215578},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 500736, offset: 118215953},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 501760, offset: 118216323},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 502784, offset: 118216658},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 503808, offset: 118217063},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 504832, offset: 118217437},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 505856, offset: 118217811},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 506880, offset: 118218178},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 507904, offset: 118218538},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 508928, offset: 118218975},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 509952, offset: 118219284},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 510976, offset: 118219600},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 512000, offset: 118219954},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 513024, offset: 118220315},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 514048, offset: 118220661},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 515072, offset: 118221063},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 516096, offset: 118221436},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 517120, offset: 118221804},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 518144, offset: 118222177},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 519168, offset: 118222549},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 520192, offset: 118222881},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 521216, offset: 118223229},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 522240, offset: 118223547},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 523264, offset: 118223898},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 524288, offset: 118224262},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 525312, offset: 118224631},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 526336, offset: 118225012},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 527360, offset: 118225439},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 528384, offset: 118225772},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 529408, offset: 118226105},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 530432, offset: 118226479},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 531456, offset: 118226930},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 532480, offset: 118227342},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 533504, offset: 118227704},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 534528, offset: 118228114},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 535552, offset: 118228433},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 536576, offset: 118228747},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 537600, offset: 118229080},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 538624, offset: 118229405},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 539648, offset: 118229836},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 540672, offset: 118230263},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 541696, offset: 118230701},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 542720, offset: 118231052},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 543744, offset: 118231421},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 544768, offset: 118231725},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 545792, offset: 118232068},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 546816, offset: 118232423},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 547840, offset: 118232812},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 548864, offset: 118233243},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 549888, offset: 118233608},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 550912, offset: 118233969},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 551936, offset: 118234335},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 552960, offset: 118234708},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 553984, offset: 118235067},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 555008, offset: 118235440},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 556032, offset: 118235782},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 557056, offset: 118236140},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 558080, offset: 118236503},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 559104, offset: 118236874},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 560128, offset: 118237241},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 561152, offset: 118237611},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 562176, offset: 118237978},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 563200, offset: 118238356},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 564224, offset: 118238785},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 565248, offset: 118239165},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 566272, offset: 118239601},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 567296, offset: 118239971},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 568320, offset: 118240343},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 569344, offset: 118240654},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 570368, offset: 118240997},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 571392, offset: 118241366},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 572416, offset: 118241711},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 573440, offset: 118242106},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 574464, offset: 118242521},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 575488, offset: 118242924},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 576512, offset: 118243237},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 577536, offset: 118243628},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 578560, offset: 118243999},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 579584, offset: 118244356},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 580608, offset: 118244699},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 581632, offset: 118245013},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 582656, offset: 118245460},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 583680, offset: 118245778},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 584704, offset: 118246162},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 585728, offset: 118246508},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 586752, offset: 118246911},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 587776, offset: 118247259},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 588800, offset: 118247624},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 589824, offset: 118247989},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 590848, offset: 118248386},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 591872, offset: 118248729},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 592896, offset: 118249102},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 593920, offset: 118249537},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 594944, offset: 118249933},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 595968, offset: 118250245},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 596992, offset: 118250565},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 598016, offset: 118250897},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 599040, offset: 118251301},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 600064, offset: 118251715},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 601088, offset: 118252024},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 602112, offset: 118252410},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 603136, offset: 118252757},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 604160, offset: 118253210},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 605184, offset: 118253559},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 606208, offset: 118253894},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 607232, offset: 118254270},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 608256, offset: 118254717},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 609280, offset: 118255029},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 610304, offset: 118255389},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 611328, offset: 118255737},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 612352, offset: 118256125},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 613376, offset: 118256535},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 614400, offset: 118256877},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 615424, offset: 118257238},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 616448, offset: 118257566},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 617472, offset: 118257976},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 618496, offset: 118258333},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 619520, offset: 118258673},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 620544, offset: 118259056},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 621568, offset: 118259469},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 622592, offset: 118259859},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 623616, offset: 118260260},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 624640, offset: 118260658},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 625664, offset: 118260989},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 626688, offset: 118261383},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 627712, offset: 118261773},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 628736, offset: 118262141},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 629760, offset: 118262502},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 630784, offset: 118262835},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 631808, offset: 118263212},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 632832, offset: 118263594},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 633856, offset: 118263919},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 634880, offset: 118264250},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 635904, offset: 118264601},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 636928, offset: 118264970},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 637952, offset: 118265355},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 638976, offset: 118265764},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 640000, offset: 118266182},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 641024, offset: 118266554},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 642048, offset: 118266924},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 643072, offset: 118267267},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 644096, offset: 118267617},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 645120, offset: 118268000},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 646144, offset: 118268374},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 647168, offset: 118268764},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 648192, offset: 118269174},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 649216, offset: 118269528},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 650240, offset: 118269848},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 651264, offset: 118270272},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 652288, offset: 118270728},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 653312, offset: 118271120},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 654336, offset: 118271521},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 655360, offset: 118271832},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 656384, offset: 118272160},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 657408, offset: 118272481},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 658432, offset: 118272928},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 659456, offset: 118273266},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 660480, offset: 118273613},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 661504, offset: 118273968},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 662528, offset: 118274356},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 663552, offset: 118274719},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 664576, offset: 118275091},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 665600, offset: 118275438},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 666624, offset: 118275775},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 667648, offset: 118276206},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 668672, offset: 118276606},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 669696, offset: 118276994},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 670720, offset: 118277363},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 671744, offset: 118277713},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 672768, offset: 118278123},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 673792, offset: 118278464},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 674816, offset: 118278841},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 675840, offset: 118279210},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 676864, offset: 118279574},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 677888, offset: 118279949},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 678912, offset: 118280313},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 679936, offset: 118280702},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 680960, offset: 118281071},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 681984, offset: 118281444},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 683008, offset: 118281816},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 684032, offset: 118282196},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 685056, offset: 118282564},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 686080, offset: 118282950},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 687104, offset: 118283305},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 688128, offset: 118283699},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 689152, offset: 118284123},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 690176, offset: 118284437},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 691200, offset: 118284806},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 692224, offset: 118285222},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 693248, offset: 118285603},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 694272, offset: 118285969},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 695296, offset: 118286344},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 696320, offset: 118286747},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 697344, offset: 118287124},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 698368, offset: 118287514},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 699392, offset: 118287861},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 700416, offset: 118288174},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 701440, offset: 118288531},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 702464, offset: 118288944},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 703488, offset: 118289269},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 704512, offset: 118289626},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 705536, offset: 118290071},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 706560, offset: 118290414},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 707584, offset: 118290729},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 708608, offset: 118291103},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 709632, offset: 118291429},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 710656, offset: 118291874},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 711680, offset: 118292252},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 712704, offset: 118292631},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 713728, offset: 118293014},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 714752, offset: 118293375},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 715776, offset: 118293759},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 716800, offset: 118294083},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 717824, offset: 118294395},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 718848, offset: 118294776},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 719872, offset: 118295094},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 720896, offset: 118295487},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 721920, offset: 118295870},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 722944, offset: 118296237},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 723968, offset: 118296607},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 724992, offset: 118296970},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 726016, offset: 118297348},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 727040, offset: 118297717},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 728064, offset: 118298085},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 729088, offset: 118298467},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 730112, offset: 118298841},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 731136, offset: 118299213},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 732160, offset: 118299600},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 733184, offset: 118299990},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 734208, offset: 118300358},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 735232, offset: 118300685},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 736256, offset: 118301075},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 737280, offset: 118301443},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 738304, offset: 118301812},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 739328, offset: 118302189},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 740352, offset: 118302551},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 741376, offset: 118302978},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 742400, offset: 118303373},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 743424, offset: 118303754},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 744448, offset: 118304143},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 745472, offset: 118304508},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 746496, offset: 118304826},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 747520, offset: 118305143},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 748544, offset: 118305493},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 749568, offset: 118305858},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 750592, offset: 118306244},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 751616, offset: 118306689},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 752640, offset: 118307102},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 753664, offset: 118307437},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 754688, offset: 118307751},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 755712, offset: 118308111},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 756736, offset: 118308463},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 757760, offset: 118308831},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 758784, offset: 118309239},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 759808, offset: 118309634},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 760832, offset: 118309969},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 761856, offset: 118310325},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 762880, offset: 118310769},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 763904, offset: 118311191},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 764928, offset: 118311515},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 765952, offset: 118311878},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 766976, offset: 118312208},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 768000, offset: 118312594},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 769024, offset: 118313014},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 770048, offset: 118313428},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 771072, offset: 118313837},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 772096, offset: 118314195},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 773120, offset: 118314505},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 774144, offset: 118314873},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 775168, offset: 118315224},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 776192, offset: 118315676},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 777216, offset: 118316091},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 778240, offset: 118316502},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 779264, offset: 118316800},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 780288, offset: 118317154},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 781312, offset: 118317478},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 782336, offset: 118317875},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 783360, offset: 118318240},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 784384, offset: 118318573},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 785408, offset: 118318921},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 786432, offset: 118319270},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 787456, offset: 118319716},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 788480, offset: 118320034},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 789504, offset: 118320347},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 790528, offset: 118320723},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 791552, offset: 118321080},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 792576, offset: 118321458},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 793600, offset: 118321851},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 794624, offset: 118322227},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 795648, offset: 118322680},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 796672, offset: 118323092},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 797696, offset: 118323474},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 798720, offset: 118323850},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 799744, offset: 118324159},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 800768, offset: 118324536},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 801792, offset: 118324852},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 802816, offset: 118325237},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 803840, offset: 118325580},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 804864, offset: 118325972},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 805888, offset: 118326327},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 806912, offset: 118326696},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 807936, offset: 118327069},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 808960, offset: 118327429},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 809984, offset: 118327872},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 811008, offset: 118328320},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 812032, offset: 118328686},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 813056, offset: 118329056},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 814080, offset: 118329437},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 815104, offset: 118329771},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 816128, offset: 118330187},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 817152, offset: 118330511},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 818176, offset: 118330864},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 819200, offset: 118331191},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 820224, offset: 118331567},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 821248, offset: 118331978},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 822272, offset: 118332385},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 823296, offset: 118332699},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 824320, offset: 118333039},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 825344, offset: 118333382},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 826368, offset: 118333714},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 827392, offset: 118334142},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 828416, offset: 118334566},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 829440, offset: 118334903},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 830464, offset: 118335265},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 831488, offset: 118335600},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 832512, offset: 118335961},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 833536, offset: 118336320},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 834560, offset: 118336691},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 835584, offset: 118337058},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 836608, offset: 118337444},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 837632, offset: 118337862},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 838656, offset: 118338252},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 839680, offset: 118338584},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 840704, offset: 118338940},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 841728, offset: 118339331},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 842752, offset: 118339673},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 843776, offset: 118340127},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 844800, offset: 118340518},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 845824, offset: 118340879},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 846848, offset: 118341201},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 847872, offset: 118341571},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 848896, offset: 118342030},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 849920, offset: 118342437},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 850944, offset: 118342747},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 851968, offset: 118343093},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 852992, offset: 118343418},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 854016, offset: 118343769},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 855040, offset: 118344138},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 856064, offset: 118344501},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 857088, offset: 118344851},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 858112, offset: 118345233},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 859136, offset: 118345632},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 860160, offset: 118346001},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 861184, offset: 118346369},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 862208, offset: 118346729},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 863232, offset: 118347094},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 864256, offset: 118347475},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 865280, offset: 118347907},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 866304, offset: 118348294},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 867328, offset: 118348702},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 868352, offset: 118349015},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 869376, offset: 118349350},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 870400, offset: 118349680},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 871424, offset: 118350090},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 872448, offset: 118350450},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 873472, offset: 118350775},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 874496, offset: 118351180},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 875520, offset: 118351512},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 876544, offset: 118351937},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 877568, offset: 118352261},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 878592, offset: 118352622},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 879616, offset: 118352990},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 880640, offset: 118353375},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 881664, offset: 118353731},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 882688, offset: 118354151},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 883712, offset: 118354529},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 884736, offset: 118354917},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 885760, offset: 118355286},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 886784, offset: 118355675},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 887808, offset: 118356064},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 888832, offset: 118356416},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 889856, offset: 118356732},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 890880, offset: 118357166},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 891904, offset: 118357516},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 892928, offset: 118357851},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 893952, offset: 118358219},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 894976, offset: 118358607},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 896000, offset: 118359026},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 897024, offset: 118359401},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 898048, offset: 118359778},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 899072, offset: 118360132},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 900096, offset: 118360454},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 901120, offset: 118360857},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 902144, offset: 118361193},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 903168, offset: 118361597},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 904192, offset: 118361976},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 905216, offset: 118362306},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 906240, offset: 118362682},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 907264, offset: 118363020},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 908288, offset: 118363438},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 909312, offset: 118363785},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 910336, offset: 118364184},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 911360, offset: 118364593},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 912384, offset: 118364995},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 913408, offset: 118365402},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 914432, offset: 118365786},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 915456, offset: 118366170},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 916480, offset: 118366548},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 917504, offset: 118366894},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 918528, offset: 118367206},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 919552, offset: 118367517},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 920576, offset: 118367975},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 921600, offset: 118368371},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 922624, offset: 118368681},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 923648, offset: 118369089},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 924672, offset: 118369498},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 925696, offset: 118369780},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 926720, offset: 118370093},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 927744, offset: 118370411},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 928768, offset: 118370861},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 929792, offset: 118371262},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 930816, offset: 118371682},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 931840, offset: 118372004},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 932864, offset: 118372339},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 933888, offset: 118372680},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 934912, offset: 118373030},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 935936, offset: 118373423},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 936960, offset: 118373805},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 937984, offset: 118374209},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 939008, offset: 118374571},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 940032, offset: 118374941},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 941056, offset: 118375293},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 942080, offset: 118375670},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 943104, offset: 118376010},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 944128, offset: 118376389},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 945152, offset: 118376786},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 946176, offset: 118377164},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 947200, offset: 118377566},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 948224, offset: 118377959},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 949248, offset: 118378309},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 950272, offset: 118378674},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 951296, offset: 118379053},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 952320, offset: 118379418},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 953344, offset: 118379784},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 954368, offset: 118380166},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 955392, offset: 118380619},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 956416, offset: 118380914},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 957440, offset: 118381260},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 958464, offset: 118381582},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 959488, offset: 118382014},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 960512, offset: 118382432},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 961536, offset: 118382800},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 962560, offset: 118383167},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 963584, offset: 118383556},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 964608, offset: 118383911},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 965632, offset: 118384271},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 966656, offset: 118384719},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 967680, offset: 118385106},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 968704, offset: 118385419},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 969728, offset: 118385752},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 970752, offset: 118386108},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 971776, offset: 118386420},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 972800, offset: 118386764},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 973824, offset: 118387105},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 974848, offset: 118387480},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 975872, offset: 118387814},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 976896, offset: 118388223},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 977920, offset: 118388567},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 978944, offset: 118388973},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 979968, offset: 118389328},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 980992, offset: 118389704},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 982016, offset: 118390119},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 983040, offset: 118390531},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 984064, offset: 118390912},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 985088, offset: 118391222},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 986112, offset: 118391569},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 987136, offset: 118391930},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 988160, offset: 118392335},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 989184, offset: 118392783},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 990208, offset: 118393094},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 991232, offset: 118393458},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 992256, offset: 118393810},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 993280, offset: 118394171},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 994304, offset: 118394479},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 995328, offset: 118394845},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 996352, offset: 118395177},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 997376, offset: 118395545},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 998400, offset: 118395908},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 999424, offset: 118396295},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1000448, offset: 118396696},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1001472, offset: 118397125},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1002496, offset: 118397563},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1003520, offset: 118397895},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1004544, offset: 118398206},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1005568, offset: 118398515},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1006592, offset: 118398969},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1007616, offset: 118399366},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1008640, offset: 118399681},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1009664, offset: 118400033},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1010688, offset: 118400473},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1011712, offset: 118400789},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1012736, offset: 118401117},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1013760, offset: 118401491},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1014784, offset: 118401826},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1015808, offset: 118402223},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1016832, offset: 118402582},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1017856, offset: 118402954},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1018880, offset: 118403320},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1019904, offset: 118403705},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1020928, offset: 118404049},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1021952, offset: 118404437},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1022976, offset: 118404782},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1024000, offset: 118405190},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1025024, offset: 118405554},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1026048, offset: 118405913},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1027072, offset: 118406280},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1028096, offset: 118406656},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1029120, offset: 118407024},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1030144, offset: 118407400},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1031168, offset: 118407796},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1032192, offset: 118408146},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1033216, offset: 118408539},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1034240, offset: 118408897},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1035264, offset: 118409261},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1036288, offset: 118409627},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1037312, offset: 118409998},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1038336, offset: 118410385},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1039360, offset: 118410747},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1040384, offset: 118411188},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1041408, offset: 118411598},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1042432, offset: 118411982},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1043456, offset: 118412298},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1044480, offset: 118412652},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1045504, offset: 118413007},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1046528, offset: 118413378},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1047552, offset: 118413750},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1048576, offset: 118414109},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1049600, offset: 118414495},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1050624, offset: 118414825},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1051648, offset: 118415268},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1052672, offset: 118415679},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1053696, offset: 118416015},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1054720, offset: 118416340},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1055744, offset: 118416780},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1056768, offset: 118417101},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1057792, offset: 118417479},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1058816, offset: 118417911},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1059840, offset: 118418289},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1060864, offset: 118418691},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1061888, offset: 118419011},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1062912, offset: 118419335},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1063936, offset: 118419702},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1064960, offset: 118420060},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1065984, offset: 118420492},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1067008, offset: 118420806},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1068032, offset: 118421148},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1069056, offset: 118421491},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1070080, offset: 118421887},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1071104, offset: 118422248},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1072128, offset: 118422615},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1073152, offset: 118422975},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1074176, offset: 118423354},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1075200, offset: 118423728},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1076224, offset: 118424087},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1077248, offset: 118424472},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1078272, offset: 118424877},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1079296, offset: 118425220},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1080320, offset: 118425605},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1081344, offset: 118425966},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1082368, offset: 118426343},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1083392, offset: 118426703},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1084416, offset: 118427077},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1085440, offset: 118427450},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1086464, offset: 118427823},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1087488, offset: 118428176},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1088512, offset: 118428580},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1089536, offset: 118429031},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1090560, offset: 118429344},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1091584, offset: 118429718},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1092608, offset: 118430066},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1093632, offset: 118430436},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1094656, offset: 118430789},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1095680, offset: 118431157},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1096704, offset: 118431507},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1097728, offset: 118431906},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1098752, offset: 118432290},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1099776, offset: 118432674},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1100800, offset: 118433018},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1101824, offset: 118433411},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1102848, offset: 118433850},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1103872, offset: 118434235},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1104896, offset: 118434543},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1105920, offset: 118434897},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1106944, offset: 118435246},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1107968, offset: 118435617},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1108992, offset: 118435975},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1110016, offset: 118436344},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1111040, offset: 118436796},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1112064, offset: 118437122},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1113088, offset: 118437465},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1114112, offset: 118437837},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1115136, offset: 118438236},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1116160, offset: 118438585},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1117184, offset: 118438925},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1118208, offset: 118439244},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1119232, offset: 118439621},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1120256, offset: 118439996},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1121280, offset: 118440348},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1122304, offset: 118440704},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1123328, offset: 118441154},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1124352, offset: 118441550},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1125376, offset: 118441945},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1126400, offset: 118442308},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1127424, offset: 118442629},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1128448, offset: 118442989},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1129472, offset: 118443330},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1130496, offset: 118443695},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1131520, offset: 118444046},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1132544, offset: 118444425},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1133568, offset: 118444789},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1134592, offset: 118445178},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1135616, offset: 118445568},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1136640, offset: 118445993},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1137664, offset: 118446372},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1138688, offset: 118446711},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1139712, offset: 118447092},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1140736, offset: 118447432},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1141760, offset: 118447861},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1142784, offset: 118448169},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1143808, offset: 118448486},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1144832, offset: 118448900},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1145856, offset: 118449266},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1146880, offset: 118449596},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1147904, offset: 118449997},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1148928, offset: 118450363},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1149952, offset: 118450720},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1150976, offset: 118451097},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1152000, offset: 118451500},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1153024, offset: 118451862},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1154048, offset: 118452186},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1155072, offset: 118452560},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1156096, offset: 118452936},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1157120, offset: 118453316},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1158144, offset: 118453693},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1159168, offset: 118454054},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1160192, offset: 118454439},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1161216, offset: 118454829},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1162240, offset: 118455177},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1163264, offset: 118455579},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1164288, offset: 118455956},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1165312, offset: 118456296},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1166336, offset: 118456685},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1167360, offset: 118457070},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1168384, offset: 118457423},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1169408, offset: 118457788},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1170432, offset: 118458152},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1171456, offset: 118458539},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1172480, offset: 118458920},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1173504, offset: 118459291},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1174528, offset: 118459673},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1175552, offset: 118460027},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1176576, offset: 118460389},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1177600, offset: 118460760},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1178624, offset: 118461151},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1179648, offset: 118461593},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1180672, offset: 118461993},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1181696, offset: 118462426},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1182720, offset: 118462739},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1183744, offset: 118463048},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1184768, offset: 118463473},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1185792, offset: 118463886},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1186816, offset: 118464207},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1187840, offset: 118464518},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1188864, offset: 118464888},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1189888, offset: 118465308},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1190912, offset: 118465716},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1191936, offset: 118466031},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1192960, offset: 118466398},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1193984, offset: 118466771},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1195008, offset: 118467159},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1196032, offset: 118467526},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1197056, offset: 118467960},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1198080, offset: 118468347},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1199104, offset: 118468659},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1200128, offset: 118468976},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1201152, offset: 118469326},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1202176, offset: 118469764},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1203200, offset: 118470182},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1204224, offset: 118470581},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1205248, offset: 118470892},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1206272, offset: 118471228},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1207296, offset: 118471680},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1208320, offset: 118472052},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1209344, offset: 118472364},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1210368, offset: 118472675},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1211392, offset: 118473022},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1212416, offset: 118473375},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1213440, offset: 118473735},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1214464, offset: 118474134},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1215488, offset: 118474556},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1216512, offset: 118474864},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1217536, offset: 118475193},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1218560, offset: 118475510},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1219584, offset: 118475836},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1220608, offset: 118476211},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1221632, offset: 118476654},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1222656, offset: 118476972},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1223680, offset: 118477339},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1224704, offset: 118477664},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1225728, offset: 118478068},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1226752, offset: 118478407},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1227776, offset: 118478748},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1228800, offset: 118479124},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1229824, offset: 118479490},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1230848, offset: 118479927},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1231872, offset: 118480335},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1232896, offset: 118480710},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1233920, offset: 118481026},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1234944, offset: 118481345},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1235968, offset: 118481734},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1236992, offset: 118482073},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1238016, offset: 118482433},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1239040, offset: 118482781},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1240064, offset: 118483206},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1241088, offset: 118483613},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1242112, offset: 118484022},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1243136, offset: 118484341},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1244160, offset: 118484688},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1245184, offset: 118485134},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1246208, offset: 118485519},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1247232, offset: 118485899},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1248256, offset: 118486182},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1249280, offset: 118486525},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1250304, offset: 118486850},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1251328, offset: 118487280},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1252352, offset: 118487689},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1253376, offset: 118488098},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1254400, offset: 118488507},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1255424, offset: 118488825},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1256448, offset: 118489169},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1257472, offset: 118489547},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1258496, offset: 118489914},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1259520, offset: 118490239},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1260544, offset: 118490636},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1261568, offset: 118490986},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1262592, offset: 118491374},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1263616, offset: 118491773},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1264640, offset: 118492177},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1265664, offset: 118492627},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1266688, offset: 118493001},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1267712, offset: 118493377},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1268736, offset: 118493745},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1269760, offset: 118494055},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1270784, offset: 118494434},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1271808, offset: 118494878},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1272832, offset: 118495192},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1273856, offset: 118495550},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1274880, offset: 118495915},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1275904, offset: 118496288},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1276928, offset: 118496741},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1277952, offset: 118497150},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1278976, offset: 118497454},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1280000, offset: 118497765},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1281024, offset: 118498111},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1282048, offset: 118498459},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1283072, offset: 118498827},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1284096, offset: 118499195},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1285120, offset: 118499575},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1286144, offset: 118499936},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1287168, offset: 118500316},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1288192, offset: 118500711},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1289216, offset: 118501096},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1290240, offset: 118501485},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1291264, offset: 118501882},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1292288, offset: 118502234},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1293312, offset: 118502595},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1294336, offset: 118503032},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1295360, offset: 118503424},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1296384, offset: 118503820},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1297408, offset: 118504146},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1298432, offset: 118504469},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1299456, offset: 118504828},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1300480, offset: 118505143},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1301504, offset: 118505552},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1302528, offset: 118505889},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1303552, offset: 118506270},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1304576, offset: 118506678},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1305600, offset: 118507042},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1306624, offset: 118507355},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1307648, offset: 118507692},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1308672, offset: 118508042},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1309696, offset: 118508400},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1310720, offset: 118508845},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1311744, offset: 118509153},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1312768, offset: 118509508},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1313792, offset: 118509822},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1314816, offset: 118510276},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1315840, offset: 118510689},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1316864, offset: 118511082},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1317888, offset: 118511392},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1318912, offset: 118511711},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1319936, offset: 118512105},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1320960, offset: 118512434},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1321984, offset: 118512855},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1323008, offset: 118513213},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1324032, offset: 118513578},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1325056, offset: 118513921},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1326080, offset: 118514307},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1327104, offset: 118514682},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1328128, offset: 118515064},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1329152, offset: 118515405},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1330176, offset: 118515795},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1331200, offset: 118516133},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1332224, offset: 118516541},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1333248, offset: 118516932},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1334272, offset: 118517314},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1335296, offset: 118517680},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1336320, offset: 118518001},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1337344, offset: 118518421},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1338368, offset: 118518757},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1339392, offset: 118519158},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1340416, offset: 118519489},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1341440, offset: 118519906},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1342464, offset: 118520233},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1343488, offset: 118520632},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1344512, offset: 118520993},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1345536, offset: 118521427},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1346560, offset: 118521822},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1347584, offset: 118522212},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1348608, offset: 118522574},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1349632, offset: 118522915},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1350656, offset: 118523253},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1351680, offset: 118523614},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1352704, offset: 118523962},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1353728, offset: 118524341},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1354752, offset: 118524714},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1355776, offset: 118525093},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1356800, offset: 118525550},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1357824, offset: 118525956},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1358848, offset: 118526240},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1359872, offset: 118526573},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1360896, offset: 118526959},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1361920, offset: 118527300},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1362944, offset: 118527692},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1363968, offset: 118528040},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1364992, offset: 118528425},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1366016, offset: 118528828},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1367040, offset: 118529214},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1368064, offset: 118529534},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1369088, offset: 118529866},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1370112, offset: 118530249},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1371136, offset: 118530608},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1372160, offset: 118530986},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1373184, offset: 118531331},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1374208, offset: 118531733},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1375232, offset: 118532125},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1376256, offset: 118532482},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1377280, offset: 118532867},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1378304, offset: 118533297},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1379328, offset: 118533698},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1380352, offset: 118534015},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1381376, offset: 118534334},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1382400, offset: 118534674},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1383424, offset: 118534986},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1384448, offset: 118535370},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1385472, offset: 118535716},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1386496, offset: 118536096},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1387520, offset: 118536551},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1388544, offset: 118536962},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1389568, offset: 118537278},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1390592, offset: 118537611},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1391616, offset: 118537927},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1392640, offset: 118538260},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1393664, offset: 118538702},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1394688, offset: 118539095},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1395712, offset: 118539402},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1396736, offset: 118539720},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1397760, offset: 118540170},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1398784, offset: 118540590},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1399808, offset: 118540959},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1400832, offset: 118541299},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1401856, offset: 118541666},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1402880, offset: 118542010},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1403904, offset: 118542345},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1404928, offset: 118542724},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1405952, offset: 118543080},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1406976, offset: 118543448},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1408000, offset: 118543821},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1409024, offset: 118544181},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1410048, offset: 118544568},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1411072, offset: 118544929},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1412096, offset: 118545297},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1413120, offset: 118545681},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1414144, offset: 118546040},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1415168, offset: 118546414},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1416192, offset: 118546781},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1417216, offset: 118547164},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1418240, offset: 118547529},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1419264, offset: 118547920},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1420288, offset: 118548276},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1421312, offset: 118548668},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1422336, offset: 118549014},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1423360, offset: 118549411},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1424384, offset: 118549766},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1425408, offset: 118550148},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1426432, offset: 118550513},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1427456, offset: 118550885},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1428480, offset: 118551257},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1429504, offset: 118551632},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1430528, offset: 118551998},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1431552, offset: 118552364},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1432576, offset: 118552739},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1433600, offset: 118553111},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1434624, offset: 118553482},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1435648, offset: 118553842},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1436672, offset: 118554227},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1437696, offset: 118554581},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1438720, offset: 118554997},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1439744, offset: 118555338},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1440768, offset: 118555721},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1441792, offset: 118556082},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1442816, offset: 118556453},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1443840, offset: 118556823},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1444864, offset: 118557190},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1445888, offset: 118557562},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1446912, offset: 118557946},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1447936, offset: 118558319},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1448960, offset: 118558674},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1449984, offset: 118559059},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1451008, offset: 118559417},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1452032, offset: 118559796},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1453056, offset: 118560169},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1454080, offset: 118560547},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1455104, offset: 118560925},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1456128, offset: 118561290},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1457152, offset: 118561732},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1458176, offset: 118562104},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1459200, offset: 118562514},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1460224, offset: 118562855},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1461248, offset: 118563236},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1462272, offset: 118563619},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1463296, offset: 118564013},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1464320, offset: 118564364},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1465344, offset: 118564689},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1466368, offset: 118565044},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1467392, offset: 118565456},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1468416, offset: 118565891},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1469440, offset: 118566296},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1470464, offset: 118566699},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1471488, offset: 118567068},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1472512, offset: 118567421},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1473536, offset: 118567738},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1474560, offset: 118568052},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1475584, offset: 118568437},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1476608, offset: 118568767},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1477632, offset: 118569169},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1478656, offset: 118569526},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1479680, offset: 118569964},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1480704, offset: 118570363},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1481728, offset: 118570759},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1482752, offset: 118571078},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1483776, offset: 118571451},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1484800, offset: 118571790},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1485824, offset: 118572160},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1486848, offset: 118572474},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1487872, offset: 118572896},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1488896, offset: 118573252},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1489920, offset: 118573585},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1490944, offset: 118573989},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1491968, offset: 118574343},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1492992, offset: 118574749},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1494016, offset: 118575095},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1495040, offset: 118575447},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1496064, offset: 118575830},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1497088, offset: 118576180},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1498112, offset: 118576579},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1499136, offset: 118576958},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1500160, offset: 118577300},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1501184, offset: 118577734},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1502208, offset: 118578159},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1503232, offset: 118578517},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1504256, offset: 118578888},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1505280, offset: 118579224},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1506304, offset: 118579644},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1507328, offset: 118580002},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1508352, offset: 118580354},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1509376, offset: 118580703},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1510400, offset: 118581065},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1511424, offset: 118581512},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1512448, offset: 118581912},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1513472, offset: 118582299},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1514496, offset: 118582695},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1515520, offset: 118583046},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1516544, offset: 118583385},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1517568, offset: 118583770},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1518592, offset: 118584119},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1519616, offset: 118584483},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1520640, offset: 118584861},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1521664, offset: 118585199},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1522688, offset: 118585586},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1523712, offset: 118585953},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1524736, offset: 118586320},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1525760, offset: 118586663},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1526784, offset: 118587048},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1527808, offset: 118587389},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1528832, offset: 118587804},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1529856, offset: 118588142},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1530880, offset: 118588557},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1531904, offset: 118588883},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1532928, offset: 118589301},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1533952, offset: 120981337},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1534976, offset: 120981754},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1536000, offset: 120982129},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1537024, offset: 120982524},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1538048, offset: 120982917},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1539072, offset: 120983274},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1540096, offset: 120983585},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1541120, offset: 120983998},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1542144, offset: 120984419},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1543168, offset: 120984745},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1544192, offset: 120985059},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1545216, offset: 120985437},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1546240, offset: 120985799},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1547264, offset: 120986157},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1548288, offset: 120986539},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1549312, offset: 120986893},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1550336, offset: 120987253},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1551360, offset: 120987627},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1552384, offset: 120987999},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1553408, offset: 120988371},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1554432, offset: 120988741},
		},
		{
			track: {trackId: 1, originalTimescale: 44100, type: 'audio'},
			samplePosition: {decodingTimestamp: 1555456, offset: 120989117},
		},
	],
];

test('calculate jump marks', () => {
	const offsetsSorted = flatSamples
		.flat(1)
		.map((s) => s.samplePosition.offset)
		.sort((a, b) => a - b);
	const sampleMap = new Map<number, MinimalFlatSampleForTesting>();
	for (const sample of flatSamples.flat(1)) {
		sampleMap.set(sample.samplePosition.offset, sample);
	}

	const jumpMarks = calculateJumpMarks({
		sampleMap,
		offsetsSorted,
		endOfMdat: 120989485,
		trackIds: [1],
	});
	expect(jumpMarks).toEqual([
		{
			afterSampleWithOffset: 27_655_256,
			jumpToOffset: 118_034_714,
		},
		{
			afterSampleWithOffset: 118_290_414,
			jumpToOffset: 27_718_418,
		},
		{
			afterSampleWithOffset: 82_288_651,
			jumpToOffset: 118_290_729,
		},
		{
			afterSampleWithOffset: 118_545_681,
			jumpToOffset: 82_313_219,
		},
		{
			afterSampleWithOffset: 117_978_962,
			jumpToOffset: 118_546_040,
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
		if (spread > 8.5) {
			throw new Error('Progress spread is too high');
		}
	};

	const videoSamples: number[] = [];
	const audioSamples: number[] = [];

	const file = await getPrivateExampleVideo('dispersedFrames');

	if (file === null) {
		// eslint-disable-next-line no-console
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
		onVideoTrack:
			({track}) =>
			(v) => {
				progresses[track.trackId] = v.decodingTimestamp / WEBCODECS_TIMESCALE;
				verifyProgressSpread();
				videoSamples.push(v.decodingTimestamp);
			},
		onAudioTrack:
			({track}) =>
			(a) => {
				progresses[track.trackId] = a.decodingTimestamp / WEBCODECS_TIMESCALE;
				verifyProgressSpread();
				audioSamples.push(a.decodingTimestamp);
			},
	});

	expect(audioSamples.length).toBe(1520);
	expect(videoSamples.length).toBe(2118);
	// unique
	expect(new Set(audioSamples).size).toBe(audioSamples.length);
	expect(new Set(videoSamples).size).toBe(videoSamples.length);
});
