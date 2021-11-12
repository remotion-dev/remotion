jest.mock('../api/get-buckets', () =>
	jest.requireActual('../api/__mocks__/get-buckets')
);
jest.mock('../functions/helpers/io', () =>
	jest.requireActual('../functions/helpers/__mocks__/io')
);
jest.mock('../functions/helpers/print-cloudwatch-helper', () =>
	jest.requireActual('../functions/helpers/__mocks__/print-cloudwatch-helper')
);
jest.mock('../shared/bundle-site', () =>
	jest.requireActual('../shared/__mocks__/bundle-site')
);
jest.mock('../shared/get-account-id', () =>
	jest.requireActual('../shared/__mocks__/get-account-id')
);
jest.mock('../api/enable-s3-website', () =>
	jest.requireActual('../api/__mocks__/enable-s3-website')
);
jest.mock('../api/create-bucket', () =>
	jest.requireActual('../api/__mocks__/create-bucket')
);
jest.mock('../api/upload-dir', () =>
	jest.requireActual('../api/__mocks__/upload-dir')
);
jest.mock('../api/bucket-exists', () =>
	jest.requireActual('../api/__mocks__/bucket-exists')
);
jest.mock('../api/clean-items', () =>
	jest.requireActual('../api/__mocks__/clean-items')
);
jest.mock('../api/create-function', () =>
	jest.requireActual('../api/__mocks__/create-function')
);
jest.mock('../api/get-functions', () =>
	jest.requireActual('../api/__mocks__/get-functions')
);
jest.mock('../api/delete-function', () =>
	jest.requireActual('../api/__mocks__/delete-function')
);
jest.mock('../shared/random-hash', () =>
	jest.requireActual('../shared/__mocks__/random-hash')
);
jest.mock('../shared/check-credentials', () =>
	jest.requireActual('../shared/__mocks__/check-credentials')
);
