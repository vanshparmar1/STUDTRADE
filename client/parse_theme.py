import json
import re

with open('stitch_screens/marketplace_grid.html', 'r') as f:
    html = f.read()

# find tailwind.config = {...}
match = re.search(r'tailwind\.config\s*=\s*({.*?})\s*</script>', html, re.DOTALL)
if match:
    config_str = match.group(1)
    # This is a JS object, not strict JSON (e.g., keys don't always have quotes)
    # but the Stitch output actually has quoted keys. Let's try parsing it as JSON.
    try:
        # We need to make it valid JSON by replacing single quotes if any, etc.
        # It's relatively well-formed in the HTML.
        # Let's write a simple extraction.
        pass
    except:
        pass

# Actually let's just use Python's regex to find all color key-value pairs
color_matches = re.findall(r'"([^"]+)"\s*:\s*"([^"]+#\w{6})"', config_str)
colors = {k: v for k, v in color_matches}

# Generate CSS vars for tailwind 4
theme_css = "\n@theme {\n"
for name, hex_val in colors.items():
    theme_css += f"  --color-{name}: {hex_val};\n"
theme_css += "  --font-headline: 'Manrope', sans-serif;\n"
theme_css += "  --font-body: 'Manrope', sans-serif;\n"
theme_css += "  --font-label: 'Manrope', sans-serif;\n"
theme_css += "}\n\n"

with open('src/index.css', 'r') as f:
    css = f.read()

css = css.replace('@import "tailwindcss";', '@import "tailwindcss";\n' + theme_css)

with open('src/index.css', 'w') as f:
    f.write(css)

print("Injected tailwind colors to index.css")
