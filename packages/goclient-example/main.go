package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/remotion-dev/remotion/packages/goclient"
)

func main() {

	// Load the environment variables from the .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal(err)
	}

	serveUrl := os.Getenv("REMOTION_APP_SERVER_URL")
	functionName := os.Getenv("REMOTION_APP_FUNCTION_NAME")
	region := os.Getenv("REMOTION_APP_REGION")
	bucketName := os.Getenv("REMOTION_APP_BUCKET")

	println(serveUrl)
	input := &goclient.RemotionOptions{
		ServeUrl:              serveUrl,
		FunctionName:          functionName,
		Region:                region,
		InputProps:            nil,
		Composition:           "main",
		Type:                  "start",
		Codec:                 "h264",
		Version:               "3.3.78",
		ImageFormat:           "jpeg",
		Crf:                   1,
		EnvVariables:          []interface{}{},
		Quality:               80,
		MaxRetries:            1,
		Privacy:               "public",
		LogLevel:              "info",
		FrameRange:            nil,
		OutName:               nil,
		TimeoutInMilliseconds: 0,
		ChromiumOptions:       []interface{}{},
		Scale:                 0,
		EveryNthFrame:         1,
		NumberOfGifLoops:      0,
		ConcurrencyPerLambda:  1,
		DownloadBehavior: map[string]interface{}{
			"type": "play-in-browser",
		},
		Muted:           false,
		Overwrite:       false,
		AudioBitrate:    nil,
		VideoBitrate:    nil,
		Webhook:         nil,
		ForceHeight:     nil,
		ForceWidth:      nil,
		BucketName:      nil,
		AudioCodec:      nil,
		ForceBucketName: bucketName,
	}
	_, error := goclient.Render(input)
	if error != nil {
		log.Fatal(err)
	}
}
