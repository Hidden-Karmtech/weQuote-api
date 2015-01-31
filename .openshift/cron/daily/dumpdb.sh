#!/bin/bash
# Backup MongoDB Database

 
NOW="$(date +"%Y-%m-%d")"
FILENAME="$OPENSHIFT_DATA_DIR/mongodb-dump.$NOW.tar.gz"

mkdir -p /tmp/dump
mongodump --host 127.7.119.130 --username admin --password a43H9aZb6iuE -o /tmp/dump

tar -zcvf $FILENAME /tmp/dump
