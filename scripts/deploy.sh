#!/usr/bin/env bash -e

# Deploys frontend website.

ng build --prod
yes | gcloud app deploy . --project glo2mhaven-tracker