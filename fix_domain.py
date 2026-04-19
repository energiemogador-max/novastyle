#!/usr/bin/env python3
import os
import re

root_dir = r'c:\Users\h\Downloads\novastyle-main\novastyle-main'
old_domain = 'shop.novastyle.ma'
new_domain = 'novastyle.ma'

files_updated = 0
changes_made = 0

for root, dirs, files in os.walk(root_dir):
    # Skip certain directories
    if any(skip in root for skip in ['node_modules', '.git', 'images']):
        continue
    
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Count occurrences
                count = content.count(old_domain)
                
                if count > 0:
                    # Replace all occurrences
                    new_content = content.replace(old_domain, new_domain)
                    
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    
                    files_updated += 1
                    changes_made += count
                    folder = os.path.basename(os.path.dirname(filepath))
                    print(f'✓ {folder}/{file} - {count} change(s)')
                    
            except Exception as e:
                print(f'✗ Error in {filepath}: {e}')

print(f'\n✅ Summary: Updated {files_updated} files with {changes_made} total changes')
print(f'Changed: {old_domain} → {new_domain}')
