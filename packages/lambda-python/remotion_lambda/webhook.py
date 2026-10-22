# pylint: disable=missing-module-docstring
import hashlib
import hmac
from typing import Union

from .exception import RemotionException, RemotionInvalidArgumentException


def validate_webhook_signature(
    secret: str,
    body: Union[str, bytes],
    signature_header: str,
) -> None:
    """
    Validate that an incoming webhook request was sent by Remotion and that its
    body was not modified in transit.

    Pass the webhook secret that was configured when the render was started, the
    raw request body exactly as it was received, and the value of the
    ``X-Remotion-Signature`` header. The function raises an exception if the
    request cannot be verified and returns ``None`` if it is authentic.

    The signature covers the raw JSON bytes, so pass the body as it arrived
    (``request.get_data()`` in Flask, ``request.body`` in Django) and decode it
    only after this function returns. Decoding and re-encoding first can change
    key order and whitespace, which would break the comparison even for a
    genuine request.

    This mirrors ``validateWebhookSignature()`` from ``@remotion/lambda/client``
    and uses the same scheme: ``"sha512="`` followed by the hex digest of an
    HMAC-SHA512 over the request body, keyed with the webhook secret.
    """
    if not secret:
        raise RemotionInvalidArgumentException(
            "No 'secret' was provided to validate_webhook_signature()."
        )

    if body is None or body == '' or body == b'':
        raise RemotionInvalidArgumentException(
            "No 'body' was provided to validate_webhook_signature()."
        )

    if not signature_header or signature_header == 'NO_SECRET_PROVIDED':
        raise RemotionException('No webhook signature was provided')

    body_bytes = body.encode('utf-8') if isinstance(body, str) else body

    expected = (
        'sha512='
        + hmac.new(
            secret.encode('utf-8'), body_bytes, hashlib.sha512
        ).hexdigest()
    )

    # Compare as bytes: `compare_digest()` rejects two `str` values when either
    # side contains non-ASCII characters, and the signature header is
    # attacker-controlled, so a non-ASCII value must fail the check with a
    # `RemotionException` instead of raising an uncaught `TypeError`.
    if not hmac.compare_digest(
        expected.encode('utf-8'), signature_header.encode('utf-8')
    ):
        raise RemotionException('Signatures do not match')
