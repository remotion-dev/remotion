package goclient

import (
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"
	"time"
)

func serializeInputProps(inputProps interface{}, region string, inputType string, userSpecifiedBucketName *string) (map[string]interface{}, error) {
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
