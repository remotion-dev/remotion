import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import md5 from "md5";
import {
  SpeechConfig,
  SpeechSynthesisResult,
  SpeechSynthesizer,
  ResultReason,
  AudioConfig,
  AudioOutputStream,
} from "microsoft-cognitiveservices-speech-sdk";
import { env, Voice } from "./types";

export const getFileName = ({
  text,
  voice,
}: {
  text: string;
  voice: string;
}) => {
  return `${md5(`${text}--${voice}`)}.mp3`;
};

export const voiceMap: { [key in Voice]: string } = {
  ptBRWoman: "pt-BR-FranciscaNeural",
  ptBRMan: "pt-BR-AntonioNeural",
  enUSWoman1: "en-US-JennyNeural",
  enUSWoman2: "en-US-AriaNeural",
} as const;

export const synthesizeSpeech = async (
  text: string,
  voice: Voice,
): Promise<void> => {
  const speechConfig = SpeechConfig.fromSubscription(
    env.AZURE_TTS_KEY,
    env.AZURE_TTS_REGION,
  );

  if (!voiceMap[voice]) {
    throw new Error("Voice not found");
  }

  const fileName = getFileName({ text, voice });

  const stream = AudioOutputStream.createPullStream();
  const audioConfig = AudioConfig.fromStreamOutput(stream);

  const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

  const ssml = `
                <speak version="1.0" xml:lang="en-US">
									<voice name="${voiceMap[voice]}">
										<break time="100ms" /> ${text}
									</voice>
                </speak>`.trim();

  const result = await new Promise<SpeechSynthesisResult>((resolve, reject) => {
    synthesizer.speakSsmlAsync(
      ssml,
      (res) => {
        if (res.reason === ResultReason.SynthesizingAudioCompleted) {
          resolve(res);
        } else if (res.errorDetails) {
          reject(new Error(res.errorDetails));
        } else {
          reject(new Error("Speech Synthesis Error"));
        }
      },
      (error) => {
        reject(error);
        synthesizer.close();
      },
    );
  });
  const { audioData, properties } = result;
  console.log(properties);
  synthesizer.close();

  await uploadTtsToS3(audioData, fileName);
};

export const audioAlreadyExists = async ({
  text,
  voice,
}: {
  text: string;
  voice: Voice;
}) => {
  const fileName = getFileName({ text, voice });
  const s3 = new S3Client({
    region: env.AWS_S3_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    return await s3.send(
      new HeadObjectCommand({ Bucket: env.AWS_S3_BUCKET_NAME, Key: fileName }),
    );
  } catch {
    return false;
  }
};

const uploadTtsToS3 = async (audioData: ArrayBuffer, fileName: string) => {
  const bucketName = env.AWS_S3_BUCKET_NAME;
  const awsRegion = env.AWS_S3_REGION;
  const s3 = new S3Client({
    region: awsRegion,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  return s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: new Uint8Array(audioData),
    }),
  );
};

export const createS3Url = ({
  text,
  voice,
}: {
  text: string;
  voice: Voice;
}) => {
  const filename = getFileName({ text, voice });

  return `https://${env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${filename}`;
};
