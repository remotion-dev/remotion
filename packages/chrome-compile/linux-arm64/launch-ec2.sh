#!/bin/bash
set -euo pipefail

# =============================================================================
# launch-ec2.sh — Launch an ARM64 EC2 instance for Chromium compilation
#
# Region:    eu-central-1
# Instance:  c7g.8xlarge (32 vCPU, 64 GiB RAM, Graviton3)
# Storage:   200 GiB gp3
# OS:        Amazon Linux 2023 ARM64
# =============================================================================

# Load AWS credentials from .env
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/.env" ]; then
  export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
fi

: "${SSH_CIDR:?Set SSH_CIDR to your public IPv4 CIDR, for example 203.0.113.10/32}"

REGION="eu-central-1"
INSTANCE_TYPE="c7g.8xlarge"
VOLUME_SIZE=200
KEY_NAME="${KEY_NAME:-chrome-build-key}"

# --- Query latest Amazon Linux 2023 ARM64 AMI via SSM parameter ---
echo "Looking up latest Amazon Linux 2023 ARM64 AMI..."
AMI_ID=$(aws ssm get-parameters \
  --names /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-arm64 \
  --region "$REGION" \
  --query 'Parameters[0].Value' \
  --output text)
echo "AMI: $AMI_ID"

# --- Create a key pair if it doesn't exist ---
if ! aws ec2 describe-key-pairs --key-names "$KEY_NAME" --region "$REGION" &>/dev/null; then
  echo "Creating key pair '$KEY_NAME'..."
  aws ec2 create-key-pair \
    --key-name "$KEY_NAME" \
    --region "$REGION" \
    --query 'KeyMaterial' \
    --output text > "$SCRIPT_DIR/${KEY_NAME}.pem"
  chmod 400 "$SCRIPT_DIR/${KEY_NAME}.pem"
  echo "Key saved to ${KEY_NAME}.pem"
else
  echo "Key pair '$KEY_NAME' already exists."
fi

# --- Create a security group allowing SSH ---
SG_NAME="chrome-build-sg"
SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=$SG_NAME" \
  --region "$REGION" \
  --query 'SecurityGroups[0].GroupId' \
  --output text 2>/dev/null || true)

if [ "$SG_ID" = "None" ] || [ -z "$SG_ID" ]; then
  echo "Creating security group '$SG_NAME'..."
  SG_ID=$(aws ec2 create-security-group \
    --group-name "$SG_NAME" \
    --description "SSH access for Chromium build" \
    --region "$REGION" \
    --query 'GroupId' \
    --output text)
  aws ec2 authorize-security-group-ingress \
    --group-id "$SG_ID" \
    --protocol tcp \
    --port 22 \
    --cidr "$SSH_CIDR" \
    --region "$REGION"
  echo "Security group created: $SG_ID"
else
  echo "Security group already exists: $SG_ID"
fi

# --- Launch the instance ---
echo "Launching instance..."
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id "$AMI_ID" \
  --instance-type "$INSTANCE_TYPE" \
  --key-name "$KEY_NAME" \
  --security-group-ids "$SG_ID" \
  --block-device-mappings "DeviceName=/dev/xvda,Ebs={VolumeSize=${VOLUME_SIZE},VolumeType=gp3}" \
  --region "$REGION" \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=chrome-build-linux}]' \
  --query 'Instances[0].InstanceId' \
  --output text)
echo "Instance ID: $INSTANCE_ID"

# --- Wait for the instance to be running ---
echo "Waiting for instance to start..."
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID" --region "$REGION"

# --- Get the public IP ---
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --region "$REGION" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

echo ""
echo "========================================="
echo "Instance is running!"
echo "Instance ID:  $INSTANCE_ID"
echo "Public IP:    $PUBLIC_IP"
echo "========================================="
echo ""
echo "SSH in with:"
echo "  ssh -i ${KEY_NAME}.pem ec2-user@${PUBLIC_IP}"
echo ""
echo "Then run:"
echo "  sudo -i"
echo "  # copy over setup-ec2.sh, Dockerfile, build-chromium.sh, .gclient, args.gn"
echo "  bash setup-ec2.sh"
