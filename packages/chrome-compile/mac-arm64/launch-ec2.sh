#!/bin/bash
set -euo pipefail

# Allocate the same class of EC2 Mac host used to validate this recipe. EC2 Mac
# Dedicated Hosts have a 24-hour minimum allocation, even if the instance is
# terminated earlier. See README.md before running this script.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REGION="${AWS_REGION:-eu-central-1}"
AVAILABILITY_ZONE="${AVAILABILITY_ZONE:-eu-central-1c}"
INSTANCE_TYPE="${INSTANCE_TYPE:-mac-m4.metal}"
VOLUME_SIZE="${VOLUME_SIZE:-250}"
AMI_ID="${AMI_ID:-ami-0ee70a16fff09dedd}"
BUILD_NAME="${BUILD_NAME:-remotion-chromium-mac-arm64-$(date -u +%Y%m%d%H%M%S)}"
KEY_NAME="${KEY_NAME:-$BUILD_NAME}"
STATE_FILE="$SCRIPT_DIR/launch-state.env"
KEY_FILE="$SCRIPT_DIR/$KEY_NAME.pem"

: "${SSH_CIDR:?Set SSH_CIDR to the public IPv4 CIDR allowed to SSH, for example 203.0.113.10/32}"

for command in aws; do
  command -v "$command" >/dev/null || {
    echo "Missing required command: $command" >&2
    exit 1
  }
done

if [ -e "$STATE_FILE" ]; then
  echo "Refusing to overwrite existing $STATE_FILE" >&2
  exit 1
fi

VPC_ID="${VPC_ID:-$(aws ec2 describe-vpcs \
  --region "$REGION" \
  --filters Name=is-default,Values=true \
  --query 'Vpcs[0].VpcId' --output text)}"
SUBNET_ID="${SUBNET_ID:-$(aws ec2 describe-subnets \
  --region "$REGION" \
  --filters "Name=vpc-id,Values=$VPC_ID" \
    "Name=availability-zone,Values=$AVAILABILITY_ZONE" \
  --query 'Subnets[0].SubnetId' --output text)}"
if [ -z "$VPC_ID" ] || [ "$VPC_ID" = None ] || \
   [ -z "$SUBNET_ID" ] || [ "$SUBNET_ID" = None ]; then
  echo 'Could not find a default VPC and subnet in the requested availability zone.' >&2
  exit 1
fi

if aws ec2 describe-key-pairs --region "$REGION" --key-names "$KEY_NAME" \
  >/dev/null 2>&1; then
  if [ ! -f "$KEY_FILE" ]; then
    echo "The EC2 key pair $KEY_NAME exists, but $KEY_FILE does not." >&2
    exit 1
  fi
else
  aws ec2 create-key-pair --region "$REGION" --key-name "$KEY_NAME" \
    --query KeyMaterial --output text > "$KEY_FILE"
  chmod 400 "$KEY_FILE"
fi

SECURITY_GROUP_ID=$(aws ec2 create-security-group \
  --region "$REGION" \
  --vpc-id "$VPC_ID" \
  --group-name "$BUILD_NAME" \
  --description 'Temporary SSH access for a Remotion Chromium macOS build' \
  --query GroupId --output text)
aws ec2 authorize-security-group-ingress \
  --region "$REGION" \
  --group-id "$SECURITY_GROUP_ID" \
  --ip-permissions \
    "IpProtocol=tcp,FromPort=22,ToPort=22,IpRanges=[{CidrIp=$SSH_CIDR,Description=Chromium-build-SSH}]"

HOST_ID=$(aws ec2 allocate-hosts \
  --region "$REGION" \
  --availability-zone "$AVAILABILITY_ZONE" \
  --instance-type "$INSTANCE_TYPE" \
  --auto-placement off \
  --quantity 1 \
  --client-token "$BUILD_NAME-host" \
  --tag-specifications \
    "ResourceType=dedicated-host,Tags=[{Key=Name,Value=$BUILD_NAME},{Key=Purpose,Value=chromium-mac-arm64-build}]" \
  --query 'HostIds[0]' --output text)

cat > "$STATE_FILE" <<EOF
REGION='$REGION'
AVAILABILITY_ZONE='$AVAILABILITY_ZONE'
HOST_ID='$HOST_ID'
SECURITY_GROUP_ID='$SECURITY_GROUP_ID'
KEY_NAME='$KEY_NAME'
KEY_FILE='$KEY_FILE'
EOF

echo "Allocated Dedicated Host $HOST_ID; waiting for it to become available."
for _ in {1..90}; do
  HOST_STATE=$(aws ec2 describe-hosts --region "$REGION" --host-ids "$HOST_ID" \
    --query 'Hosts[0].State' --output text)
  if [ "$HOST_STATE" = available ]; then
    break
  fi
  sleep 10
done
if [ "${HOST_STATE:-}" != available ]; then
  echo "Host did not become available. Resource IDs are preserved in $STATE_FILE." >&2
  exit 1
fi

INSTANCE_ID=$(aws ec2 run-instances \
  --region "$REGION" \
  --image-id "$AMI_ID" \
  --instance-type "$INSTANCE_TYPE" \
  --key-name "$KEY_NAME" \
  --security-group-ids "$SECURITY_GROUP_ID" \
  --subnet-id "$SUBNET_ID" \
  --associate-public-ip-address \
  --placement "AvailabilityZone=$AVAILABILITY_ZONE,Tenancy=host,HostId=$HOST_ID,Affinity=host" \
  --block-device-mappings \
    "DeviceName=/dev/sda1,Ebs={VolumeSize=$VOLUME_SIZE,VolumeType=gp3,DeleteOnTermination=true,Encrypted=true}" \
  --metadata-options HttpTokens=required,HttpEndpoint=enabled \
  --client-token "$BUILD_NAME-instance" \
  --tag-specifications \
    "ResourceType=instance,Tags=[{Key=Name,Value=$BUILD_NAME},{Key=Purpose,Value=chromium-mac-arm64-build}]" \
  --query 'Instances[0].InstanceId' --output text)
printf "INSTANCE_ID='%s'\n" "$INSTANCE_ID" >> "$STATE_FILE"

aws ec2 wait instance-running --region "$REGION" --instance-ids "$INSTANCE_ID"
PUBLIC_IP=$(aws ec2 describe-instances --region "$REGION" \
  --instance-ids "$INSTANCE_ID" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
printf "PUBLIC_IP='%s'\n" "$PUBLIC_IP" >> "$STATE_FILE"

cat <<EOF

EC2 Mac instance is running. macOS can take several more minutes to accept SSH.
State: $STATE_FILE

Copy the build inputs to the host:
  ssh -i '$KEY_FILE' ec2-user@'$PUBLIC_IP' 'mkdir -p remotion-chromium-mac-arm64'
  scp -i '$KEY_FILE' \\
    '$SCRIPT_DIR/README.md' '$SCRIPT_DIR/args.gn' \\
    '$SCRIPT_DIR/apply-clt-support.py' '$SCRIPT_DIR/build-chromium.sh' \\
    '$SCRIPT_DIR/probe-fast-path.py' '$SCRIPT_DIR/remotion-shared-memory-v3.patch' \\
    '$SCRIPT_DIR/setup-ec2.sh' \\
    ec2-user@'$PUBLIC_IP':remotion-chromium-mac-arm64/

Start the build:
  ssh -i '$KEY_FILE' ec2-user@'$PUBLIC_IP' \\
    'cd remotion-chromium-mac-arm64 && ./setup-ec2.sh'

Terminate the instance as soon as the artifacts are copied. Release $HOST_ID
only after its 24-hour minimum allocation has elapsed.
EOF
