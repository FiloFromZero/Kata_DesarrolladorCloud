variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "us-east-2"
}

variable "project_name" {
  description = "Project Name"
  type        = string
  default     = "back-kata"
}

variable "environment" {
  description = "Environment (dev, prod)"
  type        = string
  default     = "prod"
}

variable "db_password" {
  description = "Database Password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT Secret"
  type        = string
  sensitive   = true
}

variable "mail_from" {
  description = "Mail From address used for email simulation"
  type        = string
  default     = "no-reply@kata.local"
}

variable "allowed_origins" {
  description = "Comma-separated list of allowed origins for CORS"
  type        = string
  default     = "*"
}

variable "allowed_methods" {
  description = "Comma-separated list of allowed HTTP methods for CORS"
  type        = string
  default     = "GET,POST,PUT,PATCH,DELETE,OPTIONS"
}

variable "allow_credentials" {
  description = "Whether CORS should allow credentials"
  type        = string
  default     = "true"
}

variable "cors_max_age" {
  description = "CORS preflight cache max age in seconds"
  type        = string
  default     = "3600"
}
