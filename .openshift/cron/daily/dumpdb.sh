#!/bin/bash
# Backup MongoDB Database

 
FILENAME="$OPENSHIFT_DATA_DIR/mongodb-dump-daily.tar.gz"

mkdir -p /tmp/dump
mongodump --host 127.7.119.130 --username admin --password a43H9aZb6iuE -o /tmp/dump

tar -zcvf $FILENAME /tmp/dump
