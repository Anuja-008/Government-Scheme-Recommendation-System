import re
import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

with open('src/main/java/com/example/demo/service/SchemeDataInitializer.java', 'r', encoding='utf-8') as f:
    content = f.read()

# Match create call and website URL
blocks = content.split("list.add(create(")
print(f"Blocks found: {len(blocks)-1}")

schemes = []
for block in blocks[1:]:
    lines = [l.strip() for l in block.split("\n") if l.strip()]
    if not lines:
        continue
    # First line has name
    name_match = re.search(r'"([^"]+)"', lines[0])
    name = name_match.group(1) if name_match else "Unknown"
    # Find https:// line
    url_match = re.search(r'"(https?://[^"]+)"', block)
    url = url_match.group(1) if url_match else "None"
    schemes.append((name, url))

print(f"Total schemes extracted: {len(schemes)}")

results = []
for i, (name, url) in enumerate(schemes, 1):
    if not url.startswith("http"):
        results.append((name, url, 0, "No URL"))
        continue
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
        with urllib.request.urlopen(req, timeout=4, context=ctx) as resp:
            results.append((name, url, resp.status, "OK"))
    except urllib.error.HTTPError as e:
        results.append((name, url, e.code, f"HTTP {e.code}"))
    except Exception as e:
        results.append((name, url, 0, str(e)[:35]))

fails = [r for r in results if r[2] != 200]
print(f"Audited {len(results)} schemes: {len(results)-len(fails)} OK, {len(fails)} FAILS")
for f in fails:
    print(f"FAIL [{f[2]}] {f[3]}: {f[0]} -> {f[1]}")

with open("url_fails.txt", "w", encoding="utf-8") as out:
    for f in fails:
        out.write(f"{f[0]}\t{f[1]}\t{f[2]}\t{f[3]}\n")
