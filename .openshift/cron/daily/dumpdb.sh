#!/bin/bash
# Backup MongoDB Database

FILENAME="$OPENSHIFT_DATA_DIR/mongodb-dump-daily.tar.gz"
TMPDIR="/tmp/dump"

mkdir -p $TMPDIR
mongodump --host $OPENSHIFT_MONGODB_DB_HOST --username $OPENSHIFT_MONGODB_DB_USERNAME --password $OPENSHIFT_MONGODB_DB_PASSWORD -o $TMPDIR

tar -zcvf $FILENAME $TMPDIR
