#!/bin/bash

# Function to display progress bar with green color
show_progress() {
  local progress=$1
  local total=$2
  local percent=$(( 100 * progress / total ))
  local bar_width=50
  local filled=$(( bar_width * percent / 100 ))
  local empty=$(( bar_width - filled ))

  # Create the progress bar with green color
  printf "\r\033[K"  # Clear the current line
  printf "\033[32m["  # Start the green colored section
  printf "%${filled}s" | tr ' ' '='
  printf "%${empty}s" | tr ' ' ' '
  printf "] \033[0m$percent%%"  # End the green color and show the percentage
}

# Run npm install if needed (optional), suppress output
echo -e "Setting up backend..."
npm install &> /dev/null
show_progress 1 5  # Update progress after npm install

# Activate the virtual environment, suppress output
echo -e "\nActivating virtual environment..."
source snapCart/Scripts/activate &> /dev/null
show_progress 2 5  # Update progress after activating the virtual environment

# Install all the libraries listed in requirements.txt, suppress output
echo -e "\nInstalling required Python packages..."
pip install -r requirements.txt &> /dev/null
show_progress 3 5  # Update progress after pip install

# Navigate to the website folder (replace with the actual folder path), suppress output
echo -e "\nSetting up frontend..."
cd website &> /dev/null
show_progress 4 5  # Update progress before running npm build

# Run the npm build command, suppress output
npm run build &> /dev/null
show_progress 5 5  # Update progress after npm build

cd ..

# Run the server.py (with visible output)
echo -e "\nStarting the server..."
python server.py
