import {getProfileDuration} from '../chunk-optimization/get-profile-duration';
import {demoProfiles} from './demo-profile';

test('Should measure demo profile correctly', () => {
	expect(getProfileDuration(demoProfiles)).toEqual(24440);
});
