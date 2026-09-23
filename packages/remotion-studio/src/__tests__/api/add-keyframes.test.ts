import {createMocks} from 'node-mocks-http';
import handler from '../../api/add-keyframes';
import * as applyKeyframeCodemodModule from '../../codemods/apply-keyframe-codemod';
import * as updateSequenceKeypathsModule from '../../codemods/update-sequence-keypaths';
import * as broadcastMutationModule from '../../mutations/broadcast-mutation';

describe('/api/add-keyframes', () => {
	it('returns the updated node path and broadcasts mutation', async () => {
		// Mock the codemod – we don't care about its internals for this test
		jest.spyOn(applyKeyframeCodemodModule, 'applyKeyframeCodemod')
			.mockResolvedValueOnce(undefined);

		// Mock the sequence‑keypath updater to return a fake new path
		const mockUpdatedPath = 'root/children/0';
		jest.spyOn(updateSequenceKeypathsModule, 'updateSequenceKeypaths')
			.mockResolvedValueOnce(mockUpdatedPath);

		const broadcastSpy = jest.spyOn(broadcastMutationModule, 'broadcastMutation')
			.mockImplementation(() => {});

		const {req, res} = createMocks({
			method: 'POST',
			body: {
				filePath: 'src/Video.tsx',
				elementId: 'color-card-1',
				propName: 'color',
				keyframe: {frame: 0, value: '#ff0000'},
			},
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(200);
		const json = JSON.parse(res._getData());
		expect(json.success).toBe(true);
		expect(json.updatedNodePath).toBe(mockUpdatedPath);

		// Verify mutation broadcast
		expect(broadcastSpy).toHaveBeenCalledWith('sequence-node-paths-remapped', {
			filePath: 'src/Video.tsx',
			elementId: 'color-card-1',
			newNodePath: mockUpdatedPath,
		});
	});
});
