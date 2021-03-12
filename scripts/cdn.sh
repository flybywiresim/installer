#!/bin/bash

CDN_URL="storage.bunnycdn.com/flybywiresim"
FILES=${1}
CDN_DIR=${2:-"installer/test"}

echo "Syncing files from: ${FILES}/*"
echo "Syncing to: ${CDN_DIR}"

for FILE in "${FILES}"/*; do
    DEST="$CDN_URL/$CDN_DIR/$(basename -- "$FILE")"
    echo "Syncing file: $FILE"
    echo "Destination: $DEST"
    curl -X PUT -H "AccessKey: $BUNNY_BUCKET_PASSWORD" --data-binary "@$FILE" "$DEST"
    echo ""; echo ""
done
