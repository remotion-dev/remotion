import {vi} from 'vitest';

vi.mock('../api/get-buckets', () =>
	vi.importActual('../api/__mocks__/get-buckets')
);
vi.mock('../cli/helpers/quit', () =>
	vi.importActual('../cli/helpers/__mocks__/quit')
);
vi.mock('../functions/helpers/io', () =>
	vi.importActual('../functions/helpers/__mocks__/io')
);
vi.mock('../functions/helpers/timer', () =>
	vi.importActual('../functions/helpers/__mocks__/timer')
);
vi.mock('../functions/helpers/print-cloudwatch-helper', () =>
	vi.importActual('../functions/helpers/__mocks__/print-cloudwatch-helper')
);
vi.mock('../functions/helpers/get-current-region', () =>
	vi.importActual('../functions/helpers/__mocks__/get-current-region')
);
vi.mock('../functions/helpers/get-current-architecture', () =>
	vi.importActual('../functions/helpers/__mocks__/get-current-architecture')
);
vi.mock('../functions/helpers/get-browser-instance', () =>
	vi.importActual('../functions/helpers/__mocks__/get-browser-instance')
);
vi.mock('../functions/helpers/check-if-render-exists', () =>
	vi.importActual('../functions/helpers/__mocks__/check-if-render-exists')
);
vi.mock('../functions/helpers/get-files-in-folder', () =>
	vi.importActual('../functions/helpers/__mocks__/get-files-in-folder')
);
vi.mock('../functions/helpers/get-chromium-executable-path', () =>
	vi.importActual('../functions/helpers/__mocks__/get-chromium-executable-path')
);
vi.mock('../shared/bundle-site', () =>
	vi.importActual('../shared/__mocks__/bundle-site')
);
vi.mock('../shared/get-account-id', () =>
	vi.importActual('../shared/__mocks__/get-account-id')
);
vi.mock('../shared/aws-clients', () =>
	vi.importActual('../shared/__mocks__/aws-clients')
);
vi.mock('../api/enable-s3-website', () =>
	vi.importActual('../api/__mocks__/enable-s3-website')
);
vi.mock('../api/create-bucket', () =>
	vi.importActual('../api/__mocks__/create-bucket')
);
vi.mock('../api/upload-dir', () =>
	vi.importActual('../api/__mocks__/upload-dir')
);
vi.mock('../api/bucket-exists', () =>
	vi.importActual('../api/__mocks__/bucket-exists')
);
vi.mock('../api/clean-items', () =>
	vi.importActual('../api/__mocks__/clean-items')
);
vi.mock('../api/create-function', () =>
	vi.importActual('../api/__mocks__/create-function')
);
vi.mock('../api/get-functions', () =>
	vi.importActual('../api/__mocks__/get-functions')
);
vi.mock('../api/delete-function', () =>
	vi.importActual('../api/__mocks__/delete-function')
);
vi.mock('../shared/random-hash', () =>
	vi.importActual('../shared/__mocks__/random-hash')
);
vi.mock('../shared/check-credentials', () =>
	vi.importActual('../shared/__mocks__/check-credentials')
);
