#!/bin/sh

mkdir -p ./build

DEPLOY_FOLDER=/Users/kevenleone/Documents/projects/liferay/bundles/deploy
FOLDER_NAME=maps-toolkit-fragment-set
ZIP_FILE="build/$FOLDER_NAME.zip"

cp -r $ZIP_FILE $DEPLOY_FOLDER
