import fs from 'fs';
import {calculateAssetPositions} from '../assets/calculate-asset-positions';
const frames = fs.readFileSync(require.resolve('./asset-crash.json'), 'utf-8');

expect(() => calculateAssetPositions(JSON.parse(frames))).not.toThrow();
