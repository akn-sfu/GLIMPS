#!/bin/bash

LOCKFILES=("package-lock.json" "packages/api/package-lock.json" "packages/types/package-lock.json" "packages/webapp/package-lock.json")

for file in "${LOCKFILES[@]}"; do
  if ! grep -q '"lockfileVersion": 2' $file; then
    echo "ERROR: Invalid lockfileVersion for $file"
    exit 1
  fi
done
