import urllib.request
import os

urls = {
    "marketplace_grid.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2EwZmExMTE4MDdhMzQxYjJiNzJkMGU4MWUxMzk0NDc4EgsSBxCHhNiN8w4YAZIBIwoKcHJvamVjdF9pZBIVQhM0MDI2NTk0MjU2Njg2NzQ5NzU5&filename=&opi=89354086",
    "landing_page.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2Y2NjRlOTQ5ZDI5YzRkMWQ5MTM5MWIxNjY5MzgxMzFiEgsSBxCHhNiN8w4YAZIBIwoKcHJvamVjdF9pZBIVQhM0MDI2NTk0MjU2Njg2NzQ5NzU5&filename=&opi=89354086",
    "product_detail_page.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2ZhMWNhYzc2ZGZhYzQ3ZDBiN2QxODQxNzlkYTI4N2E4EgsSBxCHhNiN8w4YAZIBIwoKcHJvamVjdF9pZBIVQhM0MDI2NTk0MjU2Njg2NzQ5NzU5&filename=&opi=89354086",
    "buy_page.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzkzMDUwMGZhNTFmZjRkMzRiMThlYmQ3YWZhYWEwMTNkEgsSBxCHhNiN8w4YAZIBIwoKcHJvamVjdF9pZBIVQhM0MDI2NTk0MjU2Njg2NzQ5NzU5&filename=&opi=89354086",
    "order_success_page.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2E2M2JmODRmMGMxMDQ2ZmQ4Yzc1ZDE0OTE0YjE1ZDQxEgsSBxCHhNiN8w4YAZIBIwoKcHJvamVjdF9pZBIVQhM0MDI2NTk0MjU2Njg2NzQ5NzU5&filename=&opi=89354086"
}

os.makedirs("client/stitch_screens", exist_ok=True)
for name, url in urls.items():
    print(f"Downloading {name}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as response, open(f"client/stitch_screens/{name}", 'wb') as out_file:
            data = response.read()
            out_file.write(data)
            print(f"Success: {name} ({len(data)} bytes)")
    except Exception as e:
        print(f"Error downloading {name}: {e}")
