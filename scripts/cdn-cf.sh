#!/bin/bash

CDN_URL="flybywirecdn.com"
CDN_PURGE_LINK="https://flybywirecdn.com/purgeCache?url=http://flybywirecdn.com"
FILES=${1}
CDN_DIR=${2:-"installer/test"}

echo "Syncing files from: ${FILES}/*"
echo "Syncing to: ${CDN_DIR}"

for FILE in "${FILES}"/*; do
    DEST="$CDN_URL/$CDN_DIR/$(basename -- "$FILE")"
    echo "Syncing file: $FILE"
    echo "Destination: $DEST"
    curl -X PUT -H "X-FBW-Access-Key: $CLOUDFLARE_BUCKET_PASSWORD" -T "$FILE" "$DEST"
done

# Purge after all uploads that the files are somewhat in sync
echo "Purging cache"
for FILE in "${FILES}"/*; do
    DEST="$CDN_PURGE_LINK/$CDN_DIR/$(basename -- "$FILE")"
    echo "Purging cache for file: $FILE"
    echo "Purge URL: $DEST"
   curl -X POST -H "X-FBW-Access-Key: $CLOUDFLARE_BUCKET_PASSWORD" -H "Content-Length: 0" "$DEST"
done
