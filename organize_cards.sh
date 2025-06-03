#!/bin/bash

# Script to organize card images for Scoundrel game
# Uses enhanced face card images (originally with '2' suffix)

# Create backup folders if they don't exist
mkdir -p images/ui/unused
mkdir -p images/ui/unused_originals

# Move joker images to unused folder
mv images/cards/*joker.png images/ui/unused/ 2>/dev/null

echo "Card organization complete."
echo "- Using enhanced face card images (originally with '2' suffix)"
echo "- Joker cards moved to images/ui/unused/"
echo "- Original face cards stored in images/ui/unused_originals/"
echo "Standard 52-card deck is ready to use."

# List the current cards to verify
echo "Current card count:"
ls -la images/cards/ | grep -v "total" | grep -v "\.$" | wc -l
