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

variable "remotion_version" {
  type        = string
  description = "The version of Remotion being deployed."
}


provider "google" {
  project = var.project_id
  region  = "us-central1"
  zone    = "us-central1-c"
}

data "http" "permissions" {
  url = "https://storage.googleapis.com/remotion-sa/sa-permissions.json"
}

locals {
  # permissions = jsondecode(file("${path.module}/../src/shared/sa-permissions.json"))
  cloudrun-permissions  = jsondecode(data.http.permissions.response_body)
  service-account-email = "remotion-sa@${var.project_id}.iam.gserviceaccount.com"
}

# Create an IAM role
resource "google_project_iam_custom_role" "remotion_sa" {
  role_id     = "RemotionSA"
  title       = "Remotion API Service Account"
  description = "Allow the service account to manage necessary resources for Remotion Cloud Run rendering."
  permissions = local.cloudrun-permissions.list
}

# Create a service account
resource "google_service_account" "remotion_sa" {
  account_id   = "remotion-sa"
  display_name = "Remotion Service Account"
  description  = var.remotion_version
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
