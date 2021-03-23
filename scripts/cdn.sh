#!/bin/bash

CDN_URL="storage.bunnycdn.com/flybywiresim-cdn"
CDN_PURGE_LINK="https://bunnycdn.com/api/purge?url=http://flybywiresim.b-cdn.net"
FILES=${1}
CDN_DIR=${2:-"installer/test"}

echo "Syncing files from: ${FILES}/*"
echo "Syncing to: ${CDN_DIR}"

for FILE in "${FILES}"/*; do
    DEST="$CDN_URL/$CDN_DIR/$(basename -- "$FILE")"
    echo "Syncing file: $FILE"
    echo "Destination: $DEST"
    curl -X PUT -H "AccessKey: $BUNNY_BUCKET_PASSWORD" --data-binary "@$FILE" "$DEST"
done

# Purge after all uploads that the files are somewhat in sync
echo "Purging cache"
for FILE in "${FILES}"/*; do
    DEST="$CDN_PURGE_LINK/$CDN_DIR/$(basename -- "$FILE")"
    echo "Purging cache for file: $FILE"
    echo "Purge URL: $DEST"
    curl -X POST -H "AccessKey: $BUNNY_SECRET_TOKEN" -H "Content-Length: 0" "$DEST"
done
