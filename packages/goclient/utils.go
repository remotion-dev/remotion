package goclient

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"time"
)

func serializeInputProps(inputProps interface{}, region string, inputType string,
	userSpecifiedBucketName string) (map[string]interface{}, error) {
	payload, err := json.Marshal(inputProps)
	if err != nil {
		return nil, errors.New("error serializing inputProps. Check it has no circular references or reduce the size if the object is big.")
	}

	// Set maximum inline payload size based on input type
	maxInlinePayloadSize := 200000
	if inputType == "still" {
		maxInlinePayloadSize = 5000000
	}

	// Check if payload size is within the limit
	if len(payload) > maxInlinePayloadSize {
		return nil, fmt.Errorf("warning: inputProps are over %dKB (%dKB) in size. This is not currently supported", maxInlinePayloadSize/1000, len(payload)/1024)
	}

	return map[string]interface{}{
		"type":    "payload",
		"payload": string(payload),
	}, nil
}

func randomHash(options ...bool) string {
	var randomInTests bool
	if len(options) > 0 {
		randomInTests = options[0]
	}

	alphabet := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	length := 10

	if randomInTests {
		rand.Seed(1234)
	} else {
		rand.Seed(time.Now().UnixNano())
	}

	hash := make([]byte, length)
	for i := 0; i < length; i++ {
		hash[i] = alphabet[rand.Intn(len(alphabet))]
	}

	return string(hash)
}

func constructInternals(options *RemotionOptions) internalOptions {

	inputProps, err := serializeInputProps(options.InputProps, options.Region, "video-or-audio", options.ForceBucketName)

	if err != nil {
		log.Fatal("Failed to open file:", err)
	}

	internalParams := &internalOptions{
		serveUrl:              options.ServeUrl,
		inputProps:            inputProps,
		composition:           options.Composition,
		region:                options.Region,
		Type:                  options.Type,
		Codec:                 options.Codec,
		Version:               options.Version,
		ImageFormat:           options.ImageFormat,
		Crf:                   options.Crf,
		EnvVariables:          options.EnvVariables,
		Quality:               options.Quality,
		MaxRetries:            options.MaxRetries,
		Privacy:               options.Privacy,
		LogLevel:              options.LogLevel,
		FrameRange:            options.FrameRange,
		OutName:               options.OutName,
		TimeoutInMilliseconds: options.TimeoutInMilliseconds,
		ChromiumOptions:       options.ChromiumOptions,
		Scale:                 options.Scale,
		EveryNthFrame:         options.EveryNthFrame,
		NumberOfGifLoops:      options.NumberOfGifLoops,
		ConcurrencyPerLambda:  options.ConcurrencyPerLambda,
		DownloadBehavior:      options.DownloadBehavior,
		Muted:                 options.Muted,
		Overwrite:             options.Overwrite,
		AudioBitrate:          options.AudioBitrate,
		VideoBitrate:          options.VideoBitrate,
		Webhook:               options.Webhook,
		ForceHeight:           options.ForceHeight,
		ForceWidth:            options.ForceWidth,
		BucketName:            options.BucketName,
		AudioCodec:            options.AudioCodec,
		ForceBucketName:       options.ForceBucketName,
	}

	return *internalParams
}
