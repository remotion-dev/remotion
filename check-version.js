const semver = require('semver');

const current = process.version;
const supported = require('./package.json').engines.node;

if (!semver.satisfies(current, supported)) {
  console.warn(`Required node version ${supported} not satisfied with current version ${current}.`);
  console.warn(`Update your node version to ${supported}`);
}