#!/bin/bash

# Stop and remove the orphaned uav-db container
docker stop uav-db || true
docker rm uav-db || true

# Launch docker-compose with --remove-orphans flag
docker-compose up --remove-orphans
