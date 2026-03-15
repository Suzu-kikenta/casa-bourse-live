import re, sys

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

original = content
lines = content.splitlines(keepends=True)
print(f"Total lines: {len(lines)}")

# ── FIX 1: Missing GLOBAL_CSS = ` declaration ──────────────────────────────
if 'GLOBAL_CSS = `' not in content and 'GLOBAL_CSS =`' not in content:
    # Find the @import url line - that's where CSS starts
    for i, line in enumerate(lines):
        if '@import url' in line:
            # Find the start of this CSS block - go back to find the comment header
            start = i
            # Check if there's a comment block before it
            for j in range(max(0, i-5), i):
                if 'GLOBAL CSS' in lines[j] or 'GLOBAL_CSS' in lines[j]:
                    start = j
                    break
            print(f"CSS starts around line {start+1}")
            print(f"Line {i+1}: {repr(lines[i][:60])}")
            # Insert `const GLOBAL_CSS = \`` before the @import line
            lines.insert(i, 'const GLOBAL_CSS = `\n')
            print(f"✓ Inserted GLOBAL_CSS = ` before line {i+1}")
            content = ''.join(lines)
            break
else:
    print("GLOBAL_CSS declaration already present")

# ── FIX 2: Find the closing backtick position ───────────────────────────────
# If we added the opening backtick, we need to find where the CSS ends
# The CSS block ends before the first JS function/const after it
# Look for a line that is just "`;" or "`\n" after the CSS

lines = content.splitlines(keepends=True)
if 'GLOBAL_CSS = `' in content:
    # Find where the template literal should close
    # It should close before "const TABS" or similar
    in_css = False
    css_start = -1
    for i, line in enumerate(lines):
        if 'GLOBAL_CSS = `' in line:
            in_css = True
            css_start = i
            continue
        if in_css:
            # Check if this line closes the template literal
            if line.strip() in ['`', '`;', '`;']:
                print(f"Template literal closes at line {i+1}")
                in_css = False
                break
            # If we hit a JS declaration without being in the template, 
            # we need to add the closing backtick
            if re.match(r'^(const|let|var|function|export)\s', line.strip()):
                if i - css_start > 5:  # at least 5 lines of CSS
                    print(f"CSS template literal not closed! Inserting ` before line {i+1}")
                    lines.insert(i, '`;\n')
                    content = ''.join(lines)
                    break

# ── FIX 3: Remove stray `*/` lines ─────────────────────────────────────────
lines = content.splitlines(keepends=True)
fixed_lines = []
removed = 0
for i, line in enumerate(lines):
    stripped = line.strip()
    # Remove lines that are ONLY dashes + */  (orphaned block comment end)
    if re.match(r'^-+\s*\*/$', stripped):
        print(f"✓ Removed stray */ at line {i+1}: {repr(line[:60])}")
        removed += 1
        continue
    fixed_lines.append(line)

content = ''.join(fixed_lines)
print(f"Removed {removed} stray */ lines")

# ── Write fixed file ────────────────────────────────────────────────────────
if content != original:
    with open('src/App.jsx', 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print("✓ File saved successfully")
else:
    print("No changes made - file may already be correct or issues not found")
    print("Showing lines 30-40:")
    for i, l in enumerate(original.splitlines()[29:40], 30):
        print(f"  {i}: {repr(l[:80])}")
