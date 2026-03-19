import urllib.request
import os
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

urls = {
    "marketplace_grid.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2EwZmExMTE4MDdhMzQxYjJiNzJkMGU4MWUxMzk0NDc4EgsSBxCHhNiN8w4YAZIBIwoKcHJvamVjdF9pZBIVQhM0MDI2NTk0MjU2Njg2NzQ5NzU5&filename=&opi=89354086",
    "landing_page.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2Y2NjRlOTQ5ZDI5YzRkMWQ5MTM5MWIxNjY5MzgxMzFiEgsSBxCHhNiN8w4YAZIBIwoKcHJvamVjdF9pZBIVQhM0MDI2NTk0MjU2Njg2NzQ5NzU5&filename=&opi=89354086",
    "product_detail_page.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2ZhMWNhYzc2ZGZhYzQ3ZDBiN2QxODQxNzlkYTI4N2E4EgsSBxCHhNiN8w4YAZIBIwoKcHJvamVjdF9pZBIVQhM0MDI2NTk0MjU2Njg2NzQ5NzU5&filename=&opi=89354086",
    "buy_page.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzkzMDUwMGZhNTFmZjRkMzRiMThlYmQ3YWZhYWEwMTNkEgsSBxCHhNiN8w4YAZIBIwoKcHJvamVjdF9pZBIVQhM0MDI2NTk0MjU2Njg2NzQ5NzU5&filename=&opi=89354086",
    "order_success_page.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2E2M2JmODRmMGMxMDQ2ZmQ4Yzc1ZDE0OTE0YjE1ZDQxEgsSBxCHhNiN8w4YAZIBIwoKcHJvamVjdF9pZBIVQhM0MDI2NTk0MjU2Njg2NzQ5NzU5&filename=&opi=89354086",
    "marketplace_grid.png": "https://lh3.googleusercontent.com/aida/ADBb0ui-nIS21f4fPOr8T75dxdPLRs9DNFMve_FneGp3fyJd55e8AwswymPSj9PrOEj28S6E4hqXnS8kRJL5fPhhMrqznHGkPePub-YsoZoHnkOq0Noq43ss0SoIzc9q6qu4jRicNm4h-fBVDILdguokvVngq565px2r7vcyLj_HF5Ya7DAj7z1_pPRM8O2YJhci3SkWwThPATkQON8Eloy_jTttWMc4B8IXLUyrEYqADtrqQ10NBt15vid5TGQ",
    "landing_page.png": "https://lh3.googleusercontent.com/aida/ADBb0ujsURKqXgzsF2wb3Jkug0HhpjzZxU1Vry8fXBI6nVwn4MoXtdAiIyFiPIFEXS_jzluIh1GuRaSDpOKOy-0LTCMCok61mU-t4gGElngpNrNfY1rMUKpMrfkDMFowaIyzREoH2KH7mj9POkAW7Kd9CsrG4E3mR0gqNIWbvwB9CvKA2IYAthVh6sJT2AvQFdHulLt3eheH9Aeg8Zf3VbDxbu_QIvAZ5KefGQWj2OL_-Uw2OPZN-UlBfksPfg",
    "product_detail_page.png": "https://lh3.googleusercontent.com/aida/ADBb0ugyHMVa8-OadOt8XaRuuNEd8PfxXlL3Jdmi__xnhcKUh4Jge14yFpX6qmmaWiG0446XIaZug8URnB7odpcutc3c6NQ0FarJBHzMFCxHE3gg1QvTTI3UGXt3KfIbEs5Lpem8vMndFnjHhDWldFZF20IGa0fwnbmwFQgbra3NDh7xa3WoSA0dYtONTbV80pJYehKLlX7Out5wBRY8mze7L6l0iB0-cJ-TkgIjtP7XNbIiIrWQ5jCVsy0myoE",
    "buy_page.png": "https://lh3.googleusercontent.com/aida/ADBb0uhZwBf113sT-Ee3EZRXmukCduy2ZUjqhM5bUiUzHKd9aKq9p5eVIfTw8hcVlHLSfxWy_Gbz2Hx5SPuLvAcnEwKcM4qjpdvvR3h4zucfzcGtKPvEgjpASQr83sL4H65TCBc4rvWmV4UtEPS1-93Mg27o7OnVv0UNZwXCmo9JKhnbcwQ5INSoIHwh_PosXtzjhsXjFJjrbdVKav_NKl_3T0PauOXQzXE4XzI6ZQo8IkrOrA5ahlX_IwPJQQ",
    "order_success_page.png": "https://lh3.googleusercontent.com/aida/ADBb0ui-gf2U7v-fSn5rm3GTTgwuqKz5zZuQAK7fZ7BsfLF4f_yy-J93C53XCVsBolul7G3yH7JLSSwPZ7lrpL7GqgYsglbSSVL30cpaKKrPkhkSMCyZ4CzocKzMAn-2_aSnVa1gQckJnubqIZhifERTQdtfsczwtKprptowiJjk6gnM17QDx_FtF5pWUo6RXsXkx0j_wIzlcLmmQZquHgg2Kp_DS-ud_LgpaqqELyGYahS_nfS1Il25G2HfBg"
}

os.makedirs("stitch_screens", exist_ok=True)
for name, url in urls.items():
    print(f"Downloading {name}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as response, open(f"stitch_screens/{name}", 'wb') as out_file:
            data = response.read()
            out_file.write(data)
            print(f"Success: {name} ({len(data)} bytes)")
    except Exception as e:
        print(f"Error downloading {name}: {e}")
