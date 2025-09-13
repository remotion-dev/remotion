import pytest
from remotion_lambda.remotionclient import RemotionClient

@pytest.fixture
def remotion_client():
    return RemotionClient(
        region="us-east-1",
        serve_url="testbed",
        function_name="remotion-render"
    )

