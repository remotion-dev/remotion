import pytest
from remotion_lambda.remotionclient import RemotionClient
from tests.constants import TEST_FUNCTION_NAME, TEST_REGION, TEST_SERVE_URL


@pytest.fixture
def remotion_client():
    return RemotionClient(
        region=TEST_REGION, serve_url=TEST_SERVE_URL, function_name=TEST_FUNCTION_NAME
    )
