#! /usr/bin/bash

# Exit if any command fails
set -eux pipefail

#installs all the requirements
#pip install -t lib -r requirements.txt

# Install all the requirements
pip install -r requirements.txt -t lib
(cd lib; zip ../lambda_function.zip -r .)
zip lambda_function.zip -u todo.py

# Clean up
rm -rf lib