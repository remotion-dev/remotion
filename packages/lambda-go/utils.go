package lambda_go_sdk

import (
	"encoding/json"
	"errors"
	"fmt"
)

func serializeInputProps(inputProps interface{}, region string, inputType string,
	userSpecifiedBucketName string) (*PayloadData, error) {
	payload, err := json.Marshal(inputProps)

	if inputProps == nil {
		return &PayloadData{
			Payload: "{}",
			Type:    "payload",
		}, nil
	}

	if err != nil {
		return nil, errors.New("error serializing inputProps. Check it has no circular references or reduce the size if the object is big")
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

	return &PayloadData{
		Payload: string(payload),
		Type:    "payload",
	}, nil

}
