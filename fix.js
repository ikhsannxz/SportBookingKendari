const fs = require('fs');
const path = 'supabase/migrations/20260626000011_payment_system.sql';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/create policy "([^"]+)"\s+on\s+storage.objects/g, 'drop policy if exists "$1" on storage.objects;\ncreate policy "$1" on storage.objects');
fs.writeFileSync(path, content, 'utf8');
console.log('Updated migration 11');
