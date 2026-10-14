package lambda_go_sdk

import (
	"crypto/hmac"
	"crypto/sha512"
	"encoding/hex"
	"errors"
)

// ValidateWebhookSignature verifies that an incoming webhook request was sent
// by Remotion and that its body was not modified in transit.
//
// Pass the webhook secret that was configured when the render was started, the
// raw request body exactly as it was received, and the value of the
// X-Remotion-Signature header. The function returns an error if the request
// cannot be verified and nil if it is authentic.
//
// The signature covers the raw JSON bytes, so decode the body only after this
// function returns. Decoding and re-encoding first can change key order and
// whitespace, which would break the comparison even for a genuine request.
//
// This mirrors validateWebhookSignature() from @remotion/lambda/client and uses
// the same scheme: "sha512=" followed by the hex digest of an HMAC-SHA512 over
// the request body, keyed with the webhook secret.
func ValidateWebhookSignature(secret string, body []byte, signatureHeader string) error {
	if secret == "" {
		return errors.New("no webhook secret was provided to ValidateWebhookSignature()")
	}

	if len(body) == 0 {
		return errors.New("no webhook body was provided to ValidateWebhookSignature()")
	}

	if signatureHeader == "" || signatureHeader == "NO_SECRET_PROVIDED" {
		return errors.New("no webhook signature was provided")
	}

	mac := hmac.New(sha512.New, []byte(secret))
	mac.Write(body)
	expected := "sha512=" + hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(expected), []byte(signatureHeader)) {
		return errors.New("webhook signature does not match")
	}

	return nil
}
