# pylint: disable=too-few-public-methods, missing-module-docstring, broad-exception-caught
class RemotionException(Exception):
    """Base exception for Remotion client errors."""

class RemotionInvalidArgumentException(RemotionException, ValueError):
    """Raised when an invalid argument is provided to a Remotion client method."""

class RemotionRenderingOutputError(RemotionException):
    """Raised when the Remotion rendering process returns an error."""
