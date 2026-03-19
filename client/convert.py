import os
import re

# 1. Properly extract Tailwind colors
with open("stitch_screens/marketplace_grid.html", "r") as f:
    html = f.read()

config_match = re.search(r'colors:\s*({[^}]+})', html)
if config_match:
    colors_block = config_match.group(1)
    color_matches = re.findall(r'"([^"]+)"\s*:\s*"(#[a-fA-F0-9]{6})"', colors_block)
    
    css_vars = []
    for name, hex_val in color_matches:
        css_vars.append(f"  --color-{name}: {hex_val};")
    
    if css_vars:
        with open("src/index.css", "r") as f:
            css = f.read()
        
        # Replace the empty theme block we created earlier
        new_theme = "@theme {\n" + "\n".join(css_vars) + "\n  --font-headline: 'Manrope', sans-serif;\n  --font-body: 'Manrope', sans-serif;\n  --font-label: 'Manrope', sans-serif;\n}"
        css = re.sub(r'@theme\s*{[^}]+}', new_theme, css)
        with open("src/index.css", "w") as f:
            f.write(css)

# 2. Move images to public/assets
os.makedirs("public/assets", exist_ok=True)
os.system("mv stitch_screens/*.png public/assets/")

# 3. Convert HTML to JSX
def get_component_name(filename):
    name = filename.replace('.html', '').title().replace('_', '')
    return name

def html_to_jsx(html_content, component_name):
    # Extract body content
    body_match = re.search(r'<body[^>]*>(.*?)</body>', html_content, re.DOTALL | re.IGNORECASE)
    if not body_match:
        return ""
    
    jsx = body_match.group(1)
    
    # Exclude script tags
    jsx = re.sub(r'<script.*?>.*?</script>', '', jsx, flags=re.DOTALL)
    
    # Class to className
    jsx = jsx.replace('class=', 'className=')
    # Self-closing tags
    jsx = re.sub(r'<(img|input|br|hr)([^>]*?)(?<!/)>', r'<\1\2/>', jsx)
    
    # HTML attributes to React
    jsx = jsx.replace('for=', 'htmlFor=')
    jsx = jsx.replace('stroke-width', 'strokeWidth')
    jsx = jsx.replace('stroke-linecap', 'strokeLinecap')
    jsx = jsx.replace('stroke-linejoin', 'strokeLinejoin')
    jsx = jsx.replace('fill-rule', 'fillRule')
    jsx = jsx.replace('clip-rule', 'clipRule')
    jsx = jsx.replace('viewbox', 'viewBox')
    
    # Replace the Google image URLs with local image names if we want, but actually they're already downloaded.
    # To map them, we could just leave the remote URLs or replace them.
    # We'll leave the remote URLs to avoid breaking external SVGs and avatars.

    # Wrap in component
    res = f"""import React from 'react';\n\nconst {component_name} = () => {{\n  return (\n    <div className="bg-surface text-on-surface min-h-screen">\n      {jsx}\n    </div>\n  );\n}};\n\nexport default {component_name};"""
    return res

os.makedirs("src/pages", exist_ok=True)
for file in os.listdir("stitch_screens"):
    if file.endswith(".html"):
        with open(f"stitch_screens/{file}", "r") as f:
            content = f.read()
        
        comp_name = get_component_name(file)
        jsx_content = html_to_jsx(content, comp_name)
        
        with open(f"src/pages/{comp_name}.jsx", "w") as f:
            f.write(jsx_content)

print("Conversion complete.")
