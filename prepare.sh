#!/bin/bash

echo "Preparing demo environment..."

## Common preparation for all demos

echo "// AI Features implementation

async function proofRead(text) {

}

async function summarize(data) {

}

async function analyseImage(image) {

}
" > ./seine/ai.js

## Open files
USERNAME=$(whoami)
if [ "$USERNAME" = "oleplus" ]; then
  kiro seine
else
  code seine
fi

echo "Setup done"
