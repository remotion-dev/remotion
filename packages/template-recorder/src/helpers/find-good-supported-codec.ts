const MP4_WITH_AUDIO = "video/mp4;codecs=avc1,mp4a.40.2";
const MP4_WITHOUT_AUDIO = "video/mp4;codecs=avc1";
const WEBM_WITH_AUDIO = "video/webm;codecs=vp8,opus";
const WEBM_WITHOUT_AUDIO = "video/webm;codecs=vp8";

export const findGoodSupportedCodec = (withAudio: boolean) => {
  if (withAudio) {
    if (MediaRecorder.isTypeSupported(MP4_WITH_AUDIO)) {
      return MP4_WITH_AUDIO;
    }

    if (MediaRecorder.isTypeSupported(WEBM_WITH_AUDIO)) {
      return WEBM_WITH_AUDIO;
    }

    throw new Error("No supported codec found");
  }

  if (MediaRecorder.isTypeSupported(MP4_WITHOUT_AUDIO)) {
    return MP4_WITHOUT_AUDIO;
  }

  if (MediaRecorder.isTypeSupported(WEBM_WITHOUT_AUDIO)) {
    return WEBM_WITHOUT_AUDIO;
  }

  throw new Error("No supported codec found");
};

export const getExtension = (mimeType: string) => {
  if (mimeType.includes("mp4")) {
    return "mp4";
  }

  if (mimeType.includes("webm")) {
    return "webm";
  }

  throw new Error("Unsupported mime type: " + mimeType);
};
