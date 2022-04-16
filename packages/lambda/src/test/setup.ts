import {vitest} from 'vitest';

vitest.mock('../api/get-buckets', () =>
	vitest.importActual('../api/__mocks__/get-buckets')
);
vitest.mock('../cli/helpers/quit', () =>
	vitest.importActual('../cli/helpers/__mocks__/quit')
);
vitest.mock('../functions/helpers/io', () =>
	vitest.importActual('../functions/helpers/__mocks__/io')
);
vitest.mock('../functions/helpers/timer', () =>
	vitest.importActual('../functions/helpers/__mocks__/timer')
);
vitest.mock('../functions/helpers/print-cloudwatch-helper', () =>
	vitest.importActual('../functions/helpers/__mocks__/print-cloudwatch-helper')
);
vitest.mock('../functions/helpers/get-current-region', () =>
	vitest.importActual('../functions/helpers/__mocks__/get-current-region')
);
vitest.mock('../functions/helpers/get-current-architecture', () =>
	vitest.importActual('../functions/helpers/__mocks__/get-current-architecture')
);
vitest.mock('../functions/helpers/get-browser-instance', () =>
	vitest.importActual('../functions/helpers/__mocks__/get-browser-instance')
);
vitest.mock('../functions/helpers/get-files-in-folder', () =>
	vitest.importActual('../functions/helpers/__mocks__/get-files-in-folder')
);
vitest.mock('../functions/helpers/get-chromium-executable-path', () =>
	vitest.importActual(
		'../functions/helpers/__mocks__/get-chromium-executable-path'
	)
);
vitest.mock('../shared/bundle-site', () =>
	vitest.importActual('../shared/__mocks__/bundle-site')
);
vitest.mock('../shared/get-account-id', () =>
	vitest.importActual('../shared/__mocks__/get-account-id')
);
vitest.mock('../shared/aws-clients', () =>
	vitest.importActual('../shared/__mocks__/aws-clients')
);
vitest.mock('../api/enable-s3-website', () =>
	vitest.importActual('../api/__mocks__/enable-s3-website')
);
vitest.mock('../api/create-bucket', () =>
	vitest.importActual('../api/__mocks__/create-bucket')
);
vitest.mock('../api/upload-dir', () =>
	vitest.importActual('../api/__mocks__/upload-dir')
);
vitest.mock('../api/bucket-exists', () =>
	vitest.importActual('../api/__mocks__/bucket-exists')
);
vitest.mock('../api/clean-items', () =>
	vitest.importActual('../api/__mocks__/clean-items')
);
vitest.mock('../api/create-function', () =>
	vitest.importActual('../api/__mocks__/create-function')
);
vitest.mock('../api/get-functions', () =>
	vitest.importActual('../api/__mocks__/get-functions')
);
vitest.mock('../api/delete-function', () =>
	vitest.importActual('../api/__mocks__/delete-function')
);
vitest.mock('../shared/random-hash', () =>
	vitest.importActual('../shared/__mocks__/random-hash')
);
vitest.mock('../shared/check-credentials', () =>
	vitest.importActual('../shared/__mocks__/check-credentials')
);
