import pytest
from remotion_lambda.remotionclient import RemotionClient
from tests.constants import (
    TEST_FUNCTION_NAME,
    TEST_REGION,
    TEST_SERVE_URL,
    TEST_AWS_ACCESS_KEY,
    TEST_AWS_SECRET_KEY,
)
from unittest.mock import Mock


@pytest.fixture
def remotion_client():
    return RemotionClient(
        region=TEST_REGION, serve_url=TEST_SERVE_URL, function_name=TEST_FUNCTION_NAME
    )


@pytest.fixture
def remotion_client_with_creds():
    return RemotionClient(
        region=TEST_REGION,
        serve_url=TEST_SERVE_URL,
        function_name=TEST_FUNCTION_NAME,
        access_key=TEST_AWS_ACCESS_KEY,
        secret_key=TEST_AWS_SECRET_KEY,
    )


@pytest.fixture
def mock_s3_client():
    return Mock()
