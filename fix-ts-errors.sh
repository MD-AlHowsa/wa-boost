#!/bin/bash

# Fix message-queue.ts - change all 'error' on line 138 to '_error'
sed -i '' '138s/error/_error/g' src/core/queue/message-queue.ts
sed -i '' '184s/error/_error/g' src/core/queue/message-queue.ts

# Fix message-sender.ts - convert readonly arrays
sed -i '' '57s/await DOMObserver.waitForAnyElement(FALLBACK_SELECTORS.MESSAGE_BOX/await DOMObserver.waitForAnyElement([...FALLBACK_SELECTORS.MESSAGE_BOX]/' src/content/message-sender.ts

# Fix db.ts hooks - remove the problematic hook line 36
sed -i '' '36d' src/core/database/db.ts
sed -i '' '35a\
    this.contacts.hook('"'"'creating'"'"', (primKey: any, obj: Contact) => {
' src/core/database/db.ts

# Fix ContactImporter unused prop
sed -i '' 's/onImport: (contacts: any\[\]) => void;/\/\/ onImport: (contacts: any[]) => void;/' src/ui/components/ContactImporter.tsx
sed -i '' 's/({ onImport: _onImport })/({})/' src/ui/components/ContactImporter.tsx

echo "Fixes applied"
