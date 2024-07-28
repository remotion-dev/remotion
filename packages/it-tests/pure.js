var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// ../renderer/dist/codec.js
var require_codec = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.DEFAULT_CODEC = exports.validCodecs = undefined;
  exports.validCodecs = [
    "h264",
    "h265",
    "vp8",
    "vp9",
    "mp3",
    "aac",
    "wav",
    "prores",
    "h264-mkv",
    "h264-ts",
    "gif"
  ];
  exports.DEFAULT_CODEC = "h264";
});

// ../renderer/dist/file-extensions.js
var require_file_extensions = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.defaultFileExtensionMap = undefined;
  exports.defaultFileExtensionMap = {
    "h264-mkv": {
      default: "mkv",
      forAudioCodec: {
        "pcm-16": { possible: ["mkv"], default: "mkv" },
        mp3: { possible: ["mkv"], default: "mkv" }
      }
    },
    "h264-ts": {
      default: "ts",
      forAudioCodec: {
        "pcm-16": { possible: ["ts"], default: "ts" },
        aac: { possible: ["ts"], default: "ts" }
      }
    },
    aac: {
      default: "aac",
      forAudioCodec: {
        aac: {
          possible: ["aac", "3gp", "m4a", "m4b", "mpg", "mpeg"],
          default: "aac"
        },
        "pcm-16": {
          possible: ["wav"],
          default: "wav"
        }
      }
    },
    gif: {
      default: "gif",
      forAudioCodec: {}
    },
    h264: {
      default: "mp4",
      forAudioCodec: {
        "pcm-16": { possible: ["mkv", "mov"], default: "mkv" },
        aac: { possible: ["mp4", "mkv", "mov"], default: "mp4" },
        mp3: { possible: ["mp4", "mkv", "mov"], default: "mp4" }
      }
    },
    h265: {
      default: "mp4",
      forAudioCodec: {
        aac: { possible: ["mp4", "mkv", "hevc"], default: "mp4" },
        "pcm-16": { possible: ["mkv"], default: "mkv" }
      }
    },
    mp3: {
      default: "mp3",
      forAudioCodec: {
        mp3: { possible: ["mp3"], default: "mp3" },
        "pcm-16": { possible: ["wav"], default: "wav" }
      }
    },
    prores: {
      default: "mov",
      forAudioCodec: {
        aac: { possible: ["mov", "mkv", "mxf"], default: "mov" },
        "pcm-16": { possible: ["mov", "mkv", "mxf"], default: "mov" }
      }
    },
    vp8: {
      default: "webm",
      forAudioCodec: {
        "pcm-16": { possible: ["mkv"], default: "mkv" },
        opus: { possible: ["webm"], default: "webm" }
      }
    },
    vp9: {
      default: "webm",
      forAudioCodec: {
        "pcm-16": { possible: ["mkv"], default: "mkv" },
        opus: { possible: ["webm"], default: "webm" }
      }
    },
    wav: {
      default: "wav",
      forAudioCodec: {
        "pcm-16": { possible: ["wav"], default: "wav" }
      }
    }
  };
});

// ../renderer/dist/get-extension-from-codec.js
var require_get_extension_from_codec = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.defaultCodecsForFileExtension = exports.makeFileExtensionMap = exports.getFileExtensionFromCodec = undefined;
  var codec_1 = require_codec();
  var file_extensions_1 = require_file_extensions();
  var getFileExtensionFromCodec = (codec, audioCodec) => {
    if (!codec_1.validCodecs.includes(codec)) {
      throw new Error(`Codec must be one of the following: ${codec_1.validCodecs.join(", ")}, but got ${codec}`);
    }
    const map = file_extensions_1.defaultFileExtensionMap[codec];
    if (audioCodec === null) {
      return map.default;
    }
    const typedAudioCodec = audioCodec;
    if (!(typedAudioCodec in map.forAudioCodec)) {
      throw new Error(`Audio codec ${typedAudioCodec} is not supported for codec ${codec}`);
    }
    return map.forAudioCodec[audioCodec].default;
  };
  exports.getFileExtensionFromCodec = getFileExtensionFromCodec;
  var makeFileExtensionMap = () => {
    const map = {};
    Object.keys(file_extensions_1.defaultFileExtensionMap).forEach((_codec) => {
      const codec = _codec;
      const fileExtMap = file_extensions_1.defaultFileExtensionMap[codec];
      const audioCodecs = Object.keys(fileExtMap.forAudioCodec);
      const possibleExtensionsForAudioCodec = audioCodecs.map((audioCodec) => fileExtMap.forAudioCodec[audioCodec].possible);
      const allPossibleExtensions = [
        fileExtMap.default,
        ...possibleExtensionsForAudioCodec.flat(1)
      ];
      for (const extension of allPossibleExtensions) {
        if (!map[extension]) {
          map[extension] = [];
        }
        if (!map[extension].includes(codec)) {
          map[extension].push(codec);
        }
      }
    });
    return map;
  };
  exports.makeFileExtensionMap = makeFileExtensionMap;
  exports.defaultCodecsForFileExtension = {
    "3gp": "aac",
    aac: "aac",
    gif: "gif",
    hevc: "h265",
    m4a: "aac",
    m4b: "aac",
    mkv: "h264-mkv",
    mov: "prores",
    mp3: "mp3",
    mp4: "h264",
    mpeg: "aac",
    mpg: "aac",
    mxf: "prores",
    wav: "wav",
    webm: "vp8",
    ts: "h264-ts"
  };
});

// ../renderer/dist/path-normalize.js
var require_path_normalize = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.pathNormalize = undefined;
  var SLASH = 47;
  var DOT = 46;
  var assertPath = (path) => {
    const t = typeof path;
    if (t !== "string") {
      throw new TypeError(`Expected a string, got a ${t}`);
    }
  };
  var posixNormalize = (path, allowAboveRoot) => {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code;
    for (let i = 0;i <= path.length; ++i) {
      if (i < path.length) {
        code = path.charCodeAt(i);
      } else if (code === SLASH) {
        break;
      } else {
        code = SLASH;
      }
      if (code === SLASH) {
        if (lastSlash === i - 1 || dots === 1) {
        } else if (lastSlash !== i - 1 && dots === 2) {
          if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== DOT || res.charCodeAt(res.length - 2) !== DOT) {
            if (res.length > 2) {
              const lastSlashIndex = res.lastIndexOf("/");
              if (lastSlashIndex !== res.length - 1) {
                if (lastSlashIndex === -1) {
                  res = "";
                  lastSegmentLength = 0;
                } else {
                  res = res.slice(0, lastSlashIndex);
                  lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
                }
                lastSlash = i;
                dots = 0;
                continue;
              }
            } else if (res.length === 2 || res.length === 1) {
              res = "";
              lastSegmentLength = 0;
              lastSlash = i;
              dots = 0;
              continue;
            }
          }
          if (allowAboveRoot) {
            if (res.length > 0) {
              res += "/..";
            } else {
              res = "..";
            }
            lastSegmentLength = 2;
          }
        } else {
          if (res.length > 0) {
            res += "/" + path.slice(lastSlash + 1, i);
          } else {
            res = path.slice(lastSlash + 1, i);
          }
          lastSegmentLength = i - lastSlash - 1;
        }
        lastSlash = i;
        dots = 0;
      } else if (code === DOT && dots !== -1) {
        ++dots;
      } else {
        dots = -1;
      }
    }
    return res;
  };
  var decode = (s) => {
    try {
      return decodeURIComponent(s);
    } catch (_a) {
      return s;
    }
  };
  var pathNormalize = (p) => {
    assertPath(p);
    let path = p;
    if (path.length === 0) {
      return ".";
    }
    const isAbsolute = path.charCodeAt(0) === SLASH;
    const trailingSeparator = path.charCodeAt(path.length - 1) === SLASH;
    path = decode(path);
    path = posixNormalize(path, !isAbsolute);
    if (path.length === 0 && !isAbsolute) {
      path = ".";
    }
    if (path.length > 0 && trailingSeparator) {
      path += "/";
    }
    if (isAbsolute) {
      return "/" + path;
    }
    return path;
  };
  exports.pathNormalize = pathNormalize;
});

// ../renderer/dist/get-extension-of-filename.js
var require_get_extension_of_filename = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.getExtensionOfFilename = undefined;
  var path_normalize_1 = require_path_normalize();
  var getExtensionOfFilename = (filename) => {
    if (filename === null) {
      return null;
    }
    const filenameArr = (0, path_normalize_1.pathNormalize)(filename).split(".");
    const hasExtension = filenameArr.length >= 2;
    const filenameArrLength = filenameArr.length;
    const extension = hasExtension ? filenameArr[filenameArrLength - 1] : null;
    return extension;
  };
  exports.getExtensionOfFilename = getExtensionOfFilename;
});

// ../renderer/dist/options/separate-audio.js
var require_separate_audio = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.separateAudioOption = undefined;
  var DEFAULT = null;
  var cliFlag = "separate-audio-to";
  exports.separateAudioOption = {
    cliFlag,
    description: () => `If set, the audio will not be included in the main output but rendered as a separate file at the location you pass. It is recommended to use an absolute path. If a relative path is passed, it is relative to the Remotion Root.`,
    docLink: "https://remotion.dev/docs/renderer/render-media",
    getValue: ({ commandLine }) => {
      if (commandLine[cliFlag]) {
        return {
          source: "cli",
          value: commandLine[cliFlag]
        };
      }
      return {
        source: "default",
        value: DEFAULT
      };
    },
    name: "Separate audio to",
    setConfig: () => {
      throw new Error("Not implemented");
    },
    ssrName: "separateAudioTo",
    type: "string"
  };
});

// ../renderer/dist/options/audio-codec.js
var require_audio_codec = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.audioCodecOption = exports.getDefaultAudioCodec = exports.resolveAudioCodec = exports.getExtensionFromAudioCodec = exports.defaultAudioCodecs = exports.mapAudioCodecToFfmpegAudioCodecName = exports.supportedAudioCodecs = exports.isAudioCodec = exports.validAudioCodecs = undefined;
  var separate_audio_1 = require_separate_audio();
  exports.validAudioCodecs = ["pcm-16", "aac", "mp3", "opus"];
  var isAudioCodec = (codec) => {
    return codec === "mp3" || codec === "aac" || codec === "wav";
  };
  exports.isAudioCodec = isAudioCodec;
  exports.supportedAudioCodecs = {
    h264: ["aac", "pcm-16", "mp3"],
    "h264-mkv": ["pcm-16", "mp3"],
    "h264-ts": ["pcm-16", "aac"],
    aac: ["aac", "pcm-16"],
    avi: [],
    gif: [],
    h265: ["aac", "pcm-16"],
    mp3: ["mp3", "pcm-16"],
    prores: ["aac", "pcm-16"],
    vp8: ["opus", "pcm-16"],
    vp9: ["opus", "pcm-16"],
    wav: ["pcm-16"]
  };
  var _satisfies = exports.supportedAudioCodecs;
  if (_satisfies) {
  }
  var mapAudioCodecToFfmpegAudioCodecName = (audioCodec) => {
    if (audioCodec === "aac") {
      return "libfdk_aac";
    }
    if (audioCodec === "mp3") {
      return "libmp3lame";
    }
    if (audioCodec === "opus") {
      return "libopus";
    }
    if (audioCodec === "pcm-16") {
      return "pcm_s16le";
    }
    throw new Error("unknown audio codec: " + audioCodec);
  };
  exports.mapAudioCodecToFfmpegAudioCodecName = mapAudioCodecToFfmpegAudioCodecName;
  var cliFlag = "audio-codec";
  var ssrName = "audioCodec";
  exports.defaultAudioCodecs = {
    "h264-mkv": {
      lossless: "pcm-16",
      compressed: "pcm-16"
    },
    "h264-ts": {
      lossless: "pcm-16",
      compressed: "aac"
    },
    aac: {
      lossless: "pcm-16",
      compressed: "aac"
    },
    gif: {
      lossless: null,
      compressed: null
    },
    h264: {
      lossless: "pcm-16",
      compressed: "aac"
    },
    h265: {
      lossless: "pcm-16",
      compressed: "aac"
    },
    mp3: {
      lossless: "pcm-16",
      compressed: "mp3"
    },
    prores: {
      lossless: "pcm-16",
      compressed: "pcm-16"
    },
    vp8: {
      lossless: "pcm-16",
      compressed: "opus"
    },
    vp9: {
      lossless: "pcm-16",
      compressed: "opus"
    },
    wav: {
      lossless: "pcm-16",
      compressed: "pcm-16"
    }
  };
  var extensionMap = {
    aac: "aac",
    mp3: "mp3",
    opus: "opus",
    "pcm-16": "wav"
  };
  var getExtensionFromAudioCodec = (audioCodec) => {
    if (extensionMap[audioCodec]) {
      return extensionMap[audioCodec];
    }
    throw new Error(`Unsupported audio codec: ${audioCodec}`);
  };
  exports.getExtensionFromAudioCodec = getExtensionFromAudioCodec;
  var resolveAudioCodec = ({ codec, setting, preferLossless, separateAudioTo }) => {
    let derivedFromSeparateAudioToExtension = null;
    if (separateAudioTo) {
      const extension = separateAudioTo.split(".").pop();
      for (const [key, value] of Object.entries(extensionMap)) {
        if (value === extension) {
          derivedFromSeparateAudioToExtension = key;
          if (!exports.supportedAudioCodecs[codec].includes(derivedFromSeparateAudioToExtension) && derivedFromSeparateAudioToExtension) {
            throw new Error(`The codec is ${codec} but the audio codec derived from --${separate_audio_1.separateAudioOption.cliFlag} is ${derivedFromSeparateAudioToExtension}. The only supported codecs are: ${exports.supportedAudioCodecs[codec].join(", ")}`);
          }
        }
      }
    }
    if (preferLossless) {
      const selected = (0, exports.getDefaultAudioCodec)({ codec, preferLossless });
      if (derivedFromSeparateAudioToExtension && selected !== derivedFromSeparateAudioToExtension) {
        throw new Error(`The audio codec derived from --${separate_audio_1.separateAudioOption.cliFlag} is ${derivedFromSeparateAudioToExtension}, but does not match the audio codec derived from the "Prefer lossless" option (${selected}). Remove any conflicting options.`);
      }
      return selected;
    }
    if (setting === null) {
      if (derivedFromSeparateAudioToExtension) {
        return derivedFromSeparateAudioToExtension;
      }
      return (0, exports.getDefaultAudioCodec)({ codec, preferLossless });
    }
    if (derivedFromSeparateAudioToExtension !== setting && derivedFromSeparateAudioToExtension) {
      throw new Error(`The audio codec derived from --${separate_audio_1.separateAudioOption.cliFlag} is ${derivedFromSeparateAudioToExtension}, but does not match the audio codec derived from your ${exports.audioCodecOption.name} setting (${setting}). Remove any conflicting options.`);
    }
    return setting;
  };
  exports.resolveAudioCodec = resolveAudioCodec;
  var getDefaultAudioCodec = ({ codec, preferLossless }) => {
    return exports.defaultAudioCodecs[codec][preferLossless ? "lossless" : "compressed"];
  };
  exports.getDefaultAudioCodec = getDefaultAudioCodec;
  var _audioCodec = null;
  exports.audioCodecOption = {
    cliFlag,
    setConfig: (audioCodec) => {
      if (audioCodec === null) {
        _audioCodec = null;
        return;
      }
      if (!exports.validAudioCodecs.includes(audioCodec)) {
        throw new Error(`Audio codec must be one of the following: ${exports.validAudioCodecs.join(", ")}, but got ${audioCodec}`);
      }
      _audioCodec = audioCodec;
    },
    getValue: ({ commandLine }) => {
      if (commandLine[cliFlag]) {
        const codec = commandLine[cliFlag];
        if (!exports.validAudioCodecs.includes(commandLine[cliFlag])) {
          throw new Error(`Audio codec must be one of the following: ${exports.validAudioCodecs.join(", ")}, but got ${codec}`);
        }
        return {
          source: "cli",
          value: commandLine[cliFlag]
        };
      }
      if (_audioCodec !== null) {
        return {
          source: "config",
          value: _audioCodec
        };
      }
      return {
        source: "default",
        value: null
      };
    },
    description: () => `Set the format of the audio that is embedded in the video. Not all codec and audio codec combinations are supported and certain combinations require a certain file extension and container format. See the table in the docs to see possible combinations.`,
    docLink: "https://www.remotion.dev/docs/encoding/#audio-codec",
    name: "Audio Codec",
    ssrName,
    type: "aac"
  };
});

// ../renderer/dist/validate-output-filename.js
var require_validate_output_filename = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.validateOutputFilename = undefined;
  var file_extensions_1 = require_file_extensions();
  var audio_codec_1 = require_audio_codec();
  var validateOutputFilename = ({ codec, audioCodecSetting, extension, preferLossless, separateAudioTo }) => {
    if (!file_extensions_1.defaultFileExtensionMap[codec]) {
      throw new TypeError(`The codec "${codec}" is not supported. Supported codecs are: ${Object.keys(file_extensions_1.defaultFileExtensionMap).join(", ")}`);
    }
    const map = file_extensions_1.defaultFileExtensionMap[codec];
    const resolvedAudioCodec = (0, audio_codec_1.resolveAudioCodec)({
      codec,
      preferLossless,
      setting: audioCodecSetting,
      separateAudioTo
    });
    if (resolvedAudioCodec === null) {
      if (extension !== map.default) {
        throw new TypeError(`When using the ${codec} codec, the output filename must end in .${map.default}.`);
      }
      return;
    }
    if (!(resolvedAudioCodec in map.forAudioCodec)) {
      throw new Error(`Audio codec ${resolvedAudioCodec} is not supported for codec ${codec}`);
    }
    const acceptableExtensions = map.forAudioCodec[resolvedAudioCodec].possible;
    if (!acceptableExtensions.includes(extension) && !separateAudioTo) {
      throw new TypeError(`When using the ${codec} codec with the ${resolvedAudioCodec} audio codec, the output filename must end in one of the following: ${acceptableExtensions.join(", ")}.`);
    }
  };
  exports.validateOutputFilename = validateOutputFilename;
});

// ../renderer/dist/pure.js
var require_pure = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.NoReactAPIs = undefined;
  var get_extension_from_codec_1 = require_get_extension_from_codec();
  var get_extension_of_filename_1 = require_get_extension_of_filename();
  var validate_output_filename_1 = require_validate_output_filename();
  exports.NoReactAPIs = {
    getExtensionOfFilename: get_extension_of_filename_1.getExtensionOfFilename,
    getFileExtensionFromCodec: get_extension_from_codec_1.getFileExtensionFromCodec,
    validateOutputFilename: validate_output_filename_1.validateOutputFilename
  };
});
export default require_pure();
