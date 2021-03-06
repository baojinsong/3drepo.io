#!/bin/bash

if [ -z "$1" ]
  then
    echo "No version number supplied"
  else 
    git pull origin staging && python tools/release/git_release.py dev $1 && ssh devweb "3drepo upgrade staging"
fi

