#!/bin/bash
set -euo pipefail

# Launches a Windows Server EC2 instance for the Chromium headless_shell x64
# build. User data enables OpenSSH with the generated key pair so the build can
# be driven over SSH like the other recipes. See README.md before running.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REGION="${AWS_REGION:-eu-central-1}"
INSTANCE_TYPE="${INSTANCE_TYPE:-c6i.16xlarge}"
VOLUME_SIZE="${VOLUME_SIZE:-300}"
AMI_PARAMETER="${AMI_PARAMETER:-/aws/service/ami-windows-latest/Windows_Server-2025-English-Full-Base}"
BUILD_NAME="${BUILD_NAME:-remotion-chromium-win-x64-$(date -u +%Y%m%d%H%M%S)}"
KEY_NAME="${KEY_NAME:-$BUILD_NAME}"
STATE_FILE="$SCRIPT_DIR/launch-state.env"
KEY_FILE="$SCRIPT_DIR/$KEY_NAME.pem"

: "${SSH_CIDR:?Set SSH_CIDR to the public IPv4 CIDR allowed to SSH, for example 203.0.113.10/32}"

for command in aws ssh-keygen; do
  command -v "$command" >/dev/null || {
    echo "Missing required command: $command" >&2
    exit 1
  }
done

if [ -e "$STATE_FILE" ]; then
  echo "Refusing to overwrite existing $STATE_FILE" >&2
  exit 1
fi

AMI_ID="${AMI_ID:-$(aws ssm get-parameters --region "$REGION" --names "$AMI_PARAMETER" \
  --query 'Parameters[0].Value' --output text)}"
VPC_ID="${VPC_ID:-$(aws ec2 describe-vpcs \
  --region "$REGION" \
  --filters Name=is-default,Values=true \
  --query 'Vpcs[0].VpcId' --output text)}"
SUBNET_ID="${SUBNET_ID:-$(aws ec2 describe-subnets \
  --region "$REGION" \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query 'Subnets[0].SubnetId' --output text)}"
if [ -z "$AMI_ID" ] || [ "$AMI_ID" = None ] || [ -z "$VPC_ID" ] || [ "$VPC_ID" = None ] || \
   [ -z "$SUBNET_ID" ] || [ "$SUBNET_ID" = None ]; then
  echo 'Could not resolve the Windows AMI or a default VPC and subnet.' >&2
  exit 1
fi

# Windows instances require RSA key pairs. The public key is installed for the
# Administrators group by the user data below.
if aws ec2 describe-key-pairs --region "$REGION" --key-names "$KEY_NAME" >/dev/null 2>&1; then
  if [ ! -f "$KEY_FILE" ]; then
    echo "The EC2 key pair $KEY_NAME exists, but $KEY_FILE does not." >&2
    exit 1
  fi
else
  aws ec2 create-key-pair --region "$REGION" --key-name "$KEY_NAME" --key-type rsa \
    --query KeyMaterial --output text > "$KEY_FILE"
  chmod 400 "$KEY_FILE"
fi
PUBLIC_KEY="$(ssh-keygen -y -f "$KEY_FILE")"

SECURITY_GROUP_ID=$(aws ec2 create-security-group \
  --region "$REGION" \
  --vpc-id "$VPC_ID" \
  --group-name "$BUILD_NAME" \
  --description 'Temporary SSH access for a Remotion Chromium Windows build' \
  --query GroupId --output text)
aws ec2 authorize-security-group-ingress \
  --region "$REGION" \
  --group-id "$SECURITY_GROUP_ID" \
  --ip-permissions \
    "IpProtocol=tcp,FromPort=22,ToPort=22,IpRanges=[{CidrIp=$SSH_CIDR,Description=Chromium-build-SSH}]"

USER_DATA_FILE="$(mktemp)"
trap 'rm -f "$USER_DATA_FILE"' EXIT
cat > "$USER_DATA_FILE" <<EOF
<powershell>
\$ErrorActionPreference = 'Stop'
Start-Transcript -Path C:\\remotion-user-data.log -Append
\$capability = Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH.Server*'
if (\$capability.State -ne 'Installed') { Add-WindowsCapability -Online -Name \$capability.Name | Out-Null }
New-Item -ItemType Directory -Force -Path C:\\ProgramData\\ssh | Out-Null
Set-Content -Path C:\\ProgramData\\ssh\\administrators_authorized_keys -Value '$PUBLIC_KEY' -Encoding ascii
icacls.exe C:\\ProgramData\\ssh\\administrators_authorized_keys /inheritance:r /grant 'Administrators:F' /grant 'SYSTEM:F' | Out-Null
New-Item -Path HKLM:\\SOFTWARE\\OpenSSH -Force | Out-Null
New-ItemProperty -Path HKLM:\\SOFTWARE\\OpenSSH -Name DefaultShell -PropertyType String -Force -Value 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe' | Out-Null
Set-Service -Name sshd -StartupType Automatic
Start-Service sshd
if (-not (Get-NetFirewallRule -Name sshd -ErrorAction SilentlyContinue)) {
  New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22 | Out-Null
}
Set-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\FileSystem' -Name LongPathsEnabled -Value 1
New-Item -ItemType Directory -Force -Path C:\\chrome-build | Out-Null
Stop-Transcript
</powershell>
EOF

INSTANCE_ID=$(aws ec2 run-instances \
  --region "$REGION" \
  --image-id "$AMI_ID" \
  --instance-type "$INSTANCE_TYPE" \
  --key-name "$KEY_NAME" \
  --security-group-ids "$SECURITY_GROUP_ID" \
  --subnet-id "$SUBNET_ID" \
  --associate-public-ip-address \
  --block-device-mappings \
    "DeviceName=/dev/sda1,Ebs={VolumeSize=$VOLUME_SIZE,VolumeType=gp3,Iops=10000,Throughput=600,DeleteOnTermination=true}" \
  --metadata-options HttpTokens=required,HttpEndpoint=enabled \
  --user-data "file://$USER_DATA_FILE" \
  --client-token "$BUILD_NAME-instance" \
  --tag-specifications \
    "ResourceType=instance,Tags=[{Key=Name,Value=$BUILD_NAME},{Key=Purpose,Value=chromium-win-x64-build}]" \
  --query 'Instances[0].InstanceId' --output text)

cat > "$STATE_FILE" <<EOF
REGION='$REGION'
AMI_ID='$AMI_ID'
SECURITY_GROUP_ID='$SECURITY_GROUP_ID'
KEY_NAME='$KEY_NAME'
KEY_FILE='$KEY_FILE'
INSTANCE_ID='$INSTANCE_ID'
EOF

aws ec2 wait instance-running --region "$REGION" --instance-ids "$INSTANCE_ID"
PUBLIC_IP=$(aws ec2 describe-instances --region "$REGION" \
  --instance-ids "$INSTANCE_ID" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
printf "PUBLIC_IP='%s'\n" "$PUBLIC_IP" >> "$STATE_FILE"

cat <<EOF

Windows instance is running. Windows takes several minutes to boot and run the
user data before SSH accepts connections.
State: $STATE_FILE

Copy the build inputs to the host:
  scp -i '$KEY_FILE' \\
    '$SCRIPT_DIR/args.gn' '$SCRIPT_DIR/build-chromium.ps1' '$SCRIPT_DIR/setup-ec2.ps1' \\
    '$SCRIPT_DIR/../mac-arm64/remotion-shared-memory-v3.patch' \\
    '$SCRIPT_DIR/../mac-arm64/probe-fast-path.py' \\
    Administrator@'$PUBLIC_IP':C:/chrome-build/

Start the build (it keeps running after the SSH session ends):
  ssh -i '$KEY_FILE' Administrator@'$PUBLIC_IP' \\
    'powershell -NoProfile -ExecutionPolicy Bypass -File C:\\chrome-build\\setup-ec2.ps1'

Follow it with:
  ssh -i '$KEY_FILE' Administrator@'$PUBLIC_IP' 'Get-Content C:\\chrome-build\\build.log -Tail 20'

Terminate the instance as soon as the artifacts are copied:
  aws ec2 terminate-instances --region '$REGION' --instance-ids '$INSTANCE_ID'
EOF
