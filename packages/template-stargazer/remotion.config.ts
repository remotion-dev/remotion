import { Config } from "@remotion/cli/config";

/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs
 */

Config.setVideoImageFormat("jpeg");
Config.setDelayRenderTimeoutInMilliseconds(1200000);
