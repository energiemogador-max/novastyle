#!/usr/bin/env python3
import os
import glob

old_domain = 'shop.novastyle.ma'
new_domain = 'novastyle.ma'
fixed_count = 0
error_count = 0

for html_file in glob.glob('**/*.html', recursive=True):
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if old_domain in content:
            new_content = content.replace(old_domain, new_domain)
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            fixed_count += 1
            print(f'FIXED: {html_file}')
    except Exception as e:
        error_count += 1
        print(f'ERROR in {html_file}: {str(e)}')

print(f'\n=== SUMMARY ===')
print(f'Total files fixed: {fixed_count}')
print(f'Errors: {error_count}')
