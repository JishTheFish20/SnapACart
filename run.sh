#!/bin/bash

# Function to check if we're inside the snapCart virtual environment
check_venv() {
  if [[ "$VIRTUAL_ENV" != "" ]]; then
    echo "You are already inside the virtual environment: $VIRTUAL_ENV"
  else
    echo "Virtual environment 'snapCart' is not activated. Activating it now..."
    source snapCart/Scripts/activate
  fi
}

# Check if the user is in the virtual environment
check_venv

# Navigate to the website folder
echo "Navigating to the website folder..."
cd website

# Run npm build
echo "Running npm build in the website folder..."
npm run build

# Go back to the previous directory (root folder)
cd ..

# Start the server
echo "Starting the server..."
python server.py
