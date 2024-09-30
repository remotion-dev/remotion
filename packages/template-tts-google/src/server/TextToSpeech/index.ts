import md5 from "md5";
import {
  checkIfAudioHasAlreadyBeenSynthesized as isAudioAlreadySynthesized,
  createFirebaseUrl,
  uploadFileToFirebase,
} from "../../lib/firebase/utils";
import { audioDirectoryInBucket, voices } from "./constants";
import textToSpeech from "@google-cloud/text-to-speech";
import { RequestMetadata } from "../../lib/interfaces";

const client = new textToSpeech.TextToSpeechClient();

export const createTextToSpeechAudio = async (
  props: RequestMetadata,
): Promise<string> => {
  if (!voices[props.voice]) throw new Error("Voice not found");
  const selectedVoice = voices[props.voice];

  const ssml = `
<speak>
<prosody>
<emphasis level="strong">${props.titleText}<break time="250ms"/>${props.subtitleText}</emphasis>
</prosody>
</speak>`;

  /**
   * * Determine directory name from SSML, directory in bucket, and voice name, to make a really unique fileName.
   * * Only hashing the SSML makes it easy to find specific voice audios in Firebase storage.
   */
  const ssmlHash = md5(`${ssml} ${props.speakingRate} ${props.pitch}`);
  const filePathInBucket = `${audioDirectoryInBucket}/${selectedVoice.name}-${ssmlHash}.mp3`;

  // Return URL if already exists
  const fileExists = await isAudioAlreadySynthesized(filePathInBucket);
  if (fileExists) return fileExists;

  // Create the TTS audio
  // https://cloud.google.com/text-to-speech/docs/reference/rest/v1/text/synthesize
  const [response] = await client.synthesizeSpeech({
    input: {
      ssml,
    },
    voice: {
      name: selectedVoice.name,
      languageCode: selectedVoice.languageCode,
    },
    audioConfig: {
      audioEncoding: "LINEAR16", // Higher quality than 'MP3'
      effectsProfileId: ["large-home-entertainment-class-device"], // Sounds better than small-devices
      speakingRate: props.speakingRate,
      pitch: props.pitch,
    },
  });
  // Upload the file to firebase
  const uploadedFile = await uploadFileToFirebase(
    response.audioContent as Uint8Array,
    filePathInBucket,
  );

  const { fullPath } = uploadedFile.metadata;

  return createFirebaseUrl(fullPath);
};
