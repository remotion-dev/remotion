from tests.conftest import remotion_client, mock_s3_client, remotion_client_with_creds
from remotion_lambda.remotionclient import RemotionClient
import pytest
from tests.constants import (
    TEST_FUNCTION_NAME,
    TEST_REGION,
    TEST_SERVE_URL,
    TEST_AWS_SECRET_KEY,
    TEST_AWS_ACCESS_KEY,
)
from unittest.mock import patch, Mock
from botocore.config import Config


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


def test_client_config_with_creds(remotion_client_with_creds: RemotionClient):
    remotion_client = remotion_client_with_creds
    assert remotion_client.function_name == TEST_FUNCTION_NAME
    assert remotion_client.region == TEST_REGION
    assert remotion_client.serve_url == TEST_SERVE_URL
    assert remotion_client.access_key == TEST_AWS_ACCESS_KEY
    assert remotion_client.secret_key == TEST_AWS_SECRET_KEY
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


@patch('boto3.client')
def test_create_s3_client_default(
    mock_boto_client, mock_s3_client, remotion_client: RemotionClient
):
    mock_boto_client.return_value = mock_s3_client
    result = remotion_client._create_s3_client()

    mock_boto_client.assert_called_once_with('s3', region_name=TEST_REGION)
    assert result == mock_s3_client


@patch('boto3.client')
def test_create_s3_client_partial_creds(mock_boto_client, mock_s3_client):
    remotion_client = RemotionClient(
        region=TEST_REGION,
        serve_url=TEST_SERVE_URL,
        function_name=TEST_FUNCTION_NAME,
        secret_key=TEST_AWS_SECRET_KEY,
    )

    mock_boto_client.return_value = mock_s3_client
    result = remotion_client._create_s3_client()

    mock_boto_client.assert_called_once_with('s3', region_name=TEST_REGION)
    assert result == mock_s3_client


@patch('boto3.client')
def test_create_s3_client_creds(
    mock_boto_client, mock_s3_client, remotion_client_with_creds
):
    mock_boto_client.return_value = mock_s3_client
    result = remotion_client_with_creds._create_s3_client()

    mock_boto_client.assert_called_once_with(
        's3',
        region_name=TEST_REGION,
        aws_access_key_id=TEST_AWS_ACCESS_KEY,
        aws_secret_access_key=TEST_AWS_SECRET_KEY,
    )
    assert result == mock_s3_client


@patch('boto3.client')
def test_create_s3_client_with_path_style(mock_boto_client, mock_s3_client):
    remotion_client = RemotionClient(
        region=TEST_REGION,
        serve_url=TEST_SERVE_URL,
        function_name=TEST_FUNCTION_NAME,
        force_path_style=True,
    )
    mock_boto_client.return_value = mock_s3_client
    result = remotion_client._create_s3_client()

    mock_boto_client.assert_called_once()

    call_args = mock_boto_client.call_args
    assert 'config' in call_args[1]
    config = call_args[1]['config']
    assert isinstance(config, Config)
    assert config.s3['addressing_style'] == 'path'
    assert result == mock_s3_client


@patch.object(RemotionClient, '_create_s3_client')
def test_get_remotion_buckets_empty_response(
    mock_create_client, mock_s3_client, remotion_client
):
    mock_s3_client.list_buckets.return_value = {'Buckets': []}
    mock_create_client.return_value = mock_s3_client

    result = remotion_client._get_remotion_buckets()

    assert result == []
    mock_s3_client.list_buckets.assert_called_once()


@patch.object(RemotionClient, '_create_s3_client')
def test_get_remotion_buckets_no_remotion_buckets(
    mock_create_client, mock_s3_client, remotion_client
):
    mock_s3_client.list_buckets.return_value = {
        'Buckets': [
            {'Name': 'my-app-bucket'},
            {'Name': 'some-other-bucket'},
            {'Name': 'user-data-bucket'},
        ]
    }
    mock_create_client.return_value = mock_s3_client

    result = remotion_client._get_remotion_buckets()

    assert result == []
    mock_s3_client.list_buckets.assert_called_once()
    mock_s3_client.get_bucket_location.assert_not_called()


@patch.object(RemotionClient, '_create_s3_client')
def test_get_remotion_buckets_single_match_us_east_1(
    mock_create_client, mock_s3_client, remotion_client
):
    test_bucket_name = 'remotionlambda-useast1-abc123'
    mock_s3_client.list_buckets.return_value = {
        'Buckets': [
            {'Name': test_bucket_name},
            {'Name': 'other-bucket'},
        ]
    }
    mock_s3_client.get_bucket_location.return_value = {'LocationConstraint': None}
    mock_create_client.return_value = mock_s3_client

    result = remotion_client._get_remotion_buckets()

    assert result == [test_bucket_name]
    mock_s3_client.get_bucket_location.assert_called_once_with(Bucket=test_bucket_name)
