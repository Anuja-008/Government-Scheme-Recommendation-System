import re
import urllib.request
import ssl
from concurrent.futures import ThreadPoolExecutor, as_completed

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

with open('src/main/java/com/example/demo/service/SchemeDataInitializer.java', 'r', encoding='utf-8') as f:
    content = f.read()

blocks = content.split("list.add(create(")
schemes = []
for block in blocks[1:]:
    lines = [l.strip() for l in block.split("\n") if l.strip()]
    if not lines:
        continue
    name_match = re.search(r'"([^"]+)"', lines[0])
    name = name_match.group(1) if name_match else "Unknown"
    url_match = re.search(r'"(https?://[^"]+)"', block)
    url = url_match.group(1) if url_match else "None"
    schemes.append((name, url))

print(f"Checking {len(schemes)} scheme URLs in parallel...")

def check_url(item):
    name, url = item
    if not url.startswith("http"):
        return (name, url, 0, "No URL")
    try:
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        )
        with urllib.request.urlopen(req, timeout=3, context=ctx) as resp:
            return (name, url, resp.status, "OK")
    except urllib.error.HTTPError as e:
        return (name, url, e.code, f"HTTP {e.code}")
    except Exception as e:
        return (name, url, 0, str(e)[:30])

results = []
with ThreadPoolExecutor(max_workers=20) as executor:
    futures = [executor.submit(check_url, s) for s in schemes]
    for future in as_completed(futures):
        results.append(future.result())

fails = [r for r in results if r[2] != 200]
print(f"Summary: {len(results)-len(fails)} OK, {len(fails)} FAILS")
for f in sorted(fails, key=lambda x: x[0]):
    print(f"FAIL [{f[2]}] {f[3]}: {f[0]} -> {f[1]}")
