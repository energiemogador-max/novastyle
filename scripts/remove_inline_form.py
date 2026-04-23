#!/usr/bin/env python3
"""
remove_inline_form.py
Strips the redundant inline review form from all 127 product pages.
Usage: python3 remove_inline_form.py [--dry-run]
"""
import os, sys

DRY_RUN = '--dry-run' in sys.argv

BLOCK_START = '<section style="padding:30px 0 0;border-top:1px solid var(--border,#eee);margin-top:10px">'
WIDGET_GUARD = 'ns-reviews-widget'

processed = modified = skipped = errors = 0

for dirpath, dirnames, filenames in os.walk('.'):
    for fname in filenames:
        if fname != 'index.html':
            continue
        fpath = os.path.join(dirpath, fname)
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                original = f.read()
        except Exception as e:
            print(f'ERROR reading {fpath}: {e}')
            errors += 1
            continue

        processed += 1

        if WIDGET_GUARD not in original or BLOCK_START not in original:
            continue

        start_idx = original.find(BLOCK_START)

        chunk = original[start_idx:]
        depth = 0
        pos = 0
        end_pos = -1
        while pos < len(chunk):
            if chunk[pos:pos+8] == '<section':
                depth += 1
                pos += 8
            elif chunk[pos:pos+10] == '</section>':
                depth -= 1
                if depth == 0:
                    end_pos = start_idx + pos + 10
                    break
                pos += 10
            else:
                pos += 1

        if end_pos < 0:
            print(f'WARNING: Could not find closing </section> in {fpath} — skipped')
            skipped += 1
            continue

        after = original[end_pos:]
        if after.startswith('\n'):
            end_pos += 1

        stripped = original[:start_idx] + original[end_pos:]

        if WIDGET_GUARD not in stripped:
            print(f'SAFETY FAIL: widget tag missing after strip in {fpath} — aborted')
            skipped += 1
            continue

        if len(stripped) >= len(original):
            print(f'SAFETY FAIL: file did not shrink for {fpath} — aborted')
            skipped += 1
            continue

        modified += 1
        if DRY_RUN:
            print(f'[DRY-RUN] Would strip {len(original) - len(stripped)}b from {fpath}')
        else:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(stripped)
            print(f'Stripped {len(original) - len(stripped)}b from {fpath}')

print(f'\nDone. Processed={processed}, Modified={modified}, Skipped={skipped}, Errors={errors}')
