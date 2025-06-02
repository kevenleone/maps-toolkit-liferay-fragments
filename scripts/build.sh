#!/bin/sh

FOLDER_NAME=maps-toolkit-fragment-set

mkdir -p "./build"

zip -r "build/$FOLDER_NAME.zip" "./$FOLDER_NAME"