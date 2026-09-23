/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { bundlerOverride } from "./bundler-override.mjs";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Shared with scripts/renderer-apis.mjs, which calls bundle() directly.
Config.overrideBundlerConfig(bundlerOverride);
