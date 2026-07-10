package lambda_go_sdk

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
)

// inline payload margin, matching the client SDK reference implementations:
// 5KB of headroom for the rest of the Lambda payload + 1KB for webhook data.
const inlinePayloadMargin = 5_000 + 1_024
const maxStillInlinePayloadSize = 5_000_000 - inlinePayloadMargin
const maxVideoInlinePayloadSize = 200_000 - inlinePayloadMargin

// needsUpload reports whether a payload of the given size must be uploaded to S3
// instead of being sent inline, and logs a warning when that is the case.
func needsUpload(payloadSize int, inputType string) bool {
	maxSize := maxVideoInlinePayloadSize
	if inputType == "still" {
		maxSize = maxStillInlinePayloadSize
	}

	if payloadSize <= maxSize {
		return false
	}

	log.Printf(
		"Warning: The props are over %dKB (%dKB) in size. Uploading them to S3 to circumvent the AWS Lambda payload size limit, which may lead to slowdown.",
		int(math.Round(float64(maxSize)/1000)), (payloadSize+1023)/1024,
	)
	return true
}

func serializeInputProps(inputProps interface{}, region string, inputType string,
	userSpecifiedBucketName string, forcePathStyle bool) (*SerializedInputProps, error) {
	if inputProps == nil {
		return &SerializedInputProps{
			Payload: "{}",
			Type:    "payload",
		}, nil
	}

	payload, err := json.Marshal(inputProps)
	if err != nil {
		return nil, fmt.Errorf("error serializing inputProps. Check it has no circular references or reduce the size if the object is big: %w", err)
	}

	if !needsUpload(len(payload), inputType) {
		return &SerializedInputProps{
			Payload: string(payload),
			Type:    "payload",
		}, nil
	}

	svc, err := newS3Client(region, forcePathStyle)
	if err != nil {
		return nil, err
	}

	bucketName := userSpecifiedBucketName
	if bucketName == "" {
		bucketName, err = getOrCreateBucket(svc, region)
		if err != nil {
			return nil, err
		}
	}

	hash := hashPayload(string(payload))
	if err := uploadInputPropsToS3(svc, bucketName, inputPropsKey(hash), string(payload)); err != nil {
		return nil, err
	}

	return &SerializedInputProps{
		Type:       "bucket-url",
		Hash:       hash,
		BucketName: bucketName,
	}, nil
}
