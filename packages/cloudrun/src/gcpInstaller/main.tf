terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.58.0"
    }
  }

  required_version = ">= 1.4.1"
}

variable "project_id" {
  type        = string
  description = "The ID of the project in which the resources will be created."
}

provider "google" {
  project = var.project_id
  region  = "us-central1"
  zone    = "us-central1-c"
}

data "local_file" "permissions" {
  filename = "./sa-permissions.json"
}

locals {
  raw-permissions       = jsondecode(data.local_file.permissions.content)
  cloudrun-permissions  = [for i in local.raw-permissions.list : i.name]
  service-account-email = "remotion-sa@${var.project_id}.iam.gserviceaccount.com"
}

# Create an IAM role
resource "google_project_iam_custom_role" "remotion_sa" {
  role_id     = "RemotionSA"
  title       = "Remotion API Service Account"
  description = "Allow the service account to manage necessary resources for Remotion Cloud Run rendering."
  permissions = local.cloudrun-permissions
}

# Create a service account
resource "google_service_account" "remotion_sa" {
  account_id   = "remotion-sa"
  display_name = "Remotion Service Account"
}

# Bind the IAM role to the service account
resource "google_project_iam_member" "remotion_sa" {
  project = var.project_id
  role    = google_project_iam_custom_role.remotion_sa.id
  member  = "serviceAccount:${local.service-account-email}"
}

# Enable Cloud Run API
resource "google_project_service" "cloud_run" {
  project = var.project_id
  service = "run.googleapis.com"
}

# Enable Cloud Resource Manager
resource "google_project_service" "cloud_resource_manager" {
  project = var.project_id
  service = "cloudresourcemanager.googleapis.com"
}

# For tf state diagnosis, output the project ID
output "remotion_project_id" {
  value = var.project_id
}
