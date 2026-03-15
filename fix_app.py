import re
with open("src/App.jsx", "r", encoding="utf-8") as f:
    content = f.read()
original = content
content = re.sub(r"(?m)^[ \t]*-{3,}[ \t]*\*/$", "", content)
if "GLOBAL_CSS = `" not in content:
    content = content.replace("@import url(", "const GLOBAL_CSS = `\n  @import url(", 1)
with open("src/App.jsx", "w", encoding="utf-8", newline="\n") as f:
    f.write(content)
print("Done" if content != original else "No changes")
