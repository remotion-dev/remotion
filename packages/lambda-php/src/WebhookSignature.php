<?php

namespace Remotion\LambdaPhp;

use Exception;
use InvalidArgumentException;

class WebhookSignature
{
    /**
     * Validate that an incoming webhook request was sent by Remotion and that
     * its body was not modified in transit.
     *
     * Pass the webhook secret that was configured when the render was started,
     * the raw request body exactly as it was received, and the value of the
     * X-Remotion-Signature header. Throws if the request cannot be verified.
     *
     * The signature covers the raw JSON bytes, so pass the body as it arrived
     * (file_get_contents('php://input')) and decode it only after this method
     * returns. Decoding and re-encoding the body first can change whitespace and
     * how numbers are serialized, which would break the comparison even for a
     * genuine request.
     *
     * This mirrors validateWebhookSignature() from @remotion/lambda/client and
     * uses the same scheme: "sha512=" followed by the hex digest of an
     * HMAC-SHA512 over the request body, keyed with the webhook secret.
     */
    public static function validate(string $secret, string $body, ?string $signatureHeader): void
    {
        if ($secret === '') {
            throw new InvalidArgumentException("No 'secret' was provided to WebhookSignature::validate().");
        }

        if ($body === '') {
            throw new InvalidArgumentException("No 'body' was provided to WebhookSignature::validate().");
        }

        if ($signatureHeader === null || $signatureHeader === '' || $signatureHeader === 'NO_SECRET_PROVIDED') {
            throw new Exception('No webhook signature was provided');
        }

        $expected = 'sha512=' . hash_hmac('sha512', $body, $secret);

        // hash_equals() is constant time and returns false when the lengths
        // differ, so an attacker-controlled header cannot leak information
        // through the comparison.
        if (!hash_equals($expected, $signatureHeader)) {
            throw new Exception('Signatures do not match');
        }
    }
}
