require 'openssl'

module RemotionLambda
  # Validates that an incoming webhook request was sent by Remotion and that its
  # body was not modified in transit.
  #
  # Pass the webhook secret that was configured when the render was started, the
  # raw request body exactly as it was received, and the value of the
  # X-Remotion-Signature header. Raises if the request cannot be verified and
  # returns nil if it is authentic.
  #
  # The signature covers the raw JSON bytes, so pass the body as it arrived
  # (request.body.read in Sinatra, request.raw_post in Rails) and parse it only
  # after this method returns. Parsing and regenerating the JSON first can change
  # whitespace and how numbers are formatted, which would break the comparison
  # even for a genuine request.
  #
  # This mirrors validateWebhookSignature() from @remotion/lambda/client and uses
  # the same scheme: "sha512=" followed by the hex digest of an HMAC-SHA512 over
  # the request body, keyed with the webhook secret.
  def self.validate_webhook_signature(secret, body, signature_header)
    if secret.nil? || secret.empty?
      raise ArgumentError, "No 'secret' was provided to validate_webhook_signature()."
    end

    if body.nil? || body.empty?
      raise ArgumentError, "No 'body' was provided to validate_webhook_signature()."
    end

    if signature_header.nil? || signature_header.empty? ||
       signature_header == 'NO_SECRET_PROVIDED'
      raise 'No webhook signature was provided'
    end

    expected = "sha512=#{OpenSSL::HMAC.hexdigest('SHA512', secret, body)}"

    # The header is attacker-controlled, so force both sides to binary before
    # comparing: fixed_length_secure_compare() compares bytes and must fail the
    # check instead of raising when the header has an unexpected encoding.
    signature = signature_header.b

    matches =
      expected.bytesize == signature.bytesize &&
      OpenSSL.fixed_length_secure_compare(expected.b, signature)

    raise 'Signatures do not match' unless matches

    nil
  end
end
