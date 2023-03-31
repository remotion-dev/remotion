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

locals {
  permissions = jsondecode(file("${path.module}/../src/shared/sa-permissions.json"))
}

# Create an IAM role
resource "google_project_iam_custom_role" "remotion_sa" {
  role_id     = "RemotionSA"
  title       = "Remotion API Service Account"
  description = "Allow the service account to manage necessary resources for Remotion Cloud Run rendering."
  permissions = local.permissions.list
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
  member  = "serviceAccount:${google_service_account.remotion_sa.email}"
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

# Output the command to generate service account keys
output "service_account_key_generation_command" {
  value = "gcloud iam service-accounts keys create key.json --iam-account=${google_service_account.remotion_sa.email}"
}
