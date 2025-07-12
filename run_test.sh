#!/bin/bash

echo "Running Scoundrel game tests..."

cd tests || exit 1
echo "Running tests..."
node run-tests.js --headless
