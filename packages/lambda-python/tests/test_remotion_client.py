from tests.conftest import remotion_client
from remotion_lambda.remotionclient import RemotionClient
import pytest
from tests.constants import TEST_FUNCTION_NAME, TEST_REGION, TEST_SERVE_URL


def test_bucket_name_format(remotion_client: RemotionClient):
    bucket_name = remotion_client._make_bucket_name()
    assert bucket_name.startswith("remotionlambda-useast1-")


def test_client_config(remotion_client: RemotionClient):
    assert remotion_client.function_name == TEST_FUNCTION_NAME
    assert remotion_client.region == TEST_REGION
    assert remotion_client.serve_url == TEST_SERVE_URL
    assert not remotion_client.access_key
    assert not remotion_client.secret_key
    assert not remotion_client.force_path_style


@pytest.mark.parametrize(
    "hash_value,expected",
    [
        ("a1b2c3", "input-props/a1b2c3.json"),
        (
            "very_long_hash_value_123456789",
            "input-props/very_long_hash_value_123456789.json",
        ),
    ],
)
def test_input_props_key_multiple_values(remotion_client, hash_value, expected):
    result = remotion_client._input_props_key(hash_value)
    assert result == expected


def test_generate_hash_basic_string(remotion_client: RemotionClient):
    payload = "test payload"
    result = remotion_client._generate_hash(payload)

    assert len(result) == 64
    assert all(c in '0123456789abcdef' for c in result)
