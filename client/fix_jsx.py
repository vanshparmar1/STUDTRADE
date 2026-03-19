import os
import re

directory = 'src/pages'
files_to_fix = [
    'MarketplaceGrid.jsx',
    'LandingPage.jsx',
    'ProductDetailPage.jsx',
    'BuyPage.jsx',
    'OrderSuccessPage.jsx'
]

def style_replacer(match):
    # match.group(1) is the style string inside quotes: "font-variation-settings: 'FILL' 1;"
    style_str = match.group(1)
    # Simple converter for known properties
    # e.g. font-variation-settings -> fontVariationSettings
    props = style_str.split(';')
    obj_props = []
    for prop in props:
        prop = prop.strip()
        if not prop:
            continue
        if ':' in prop:
            k, v = prop.split(':', 1)
            k = k.strip()
            v = v.strip().replace("'", '"') # internal quotes to double quotes
            # camelCase the key
            parts = k.split('-')
            k_camel = parts[0] + ''.join(p.capitalize() for p in parts[1:])
            obj_props.append(f"{k_camel}: '{v}'")
    
    return "style={{" + ", ".join(obj_props) + "}}"

for file in files_to_fix:
    path = os.path.join(directory, file)
    if os.path.exists(path):
        with open(path, 'r') as f:
            content = f.read()
        
        # 1. Fix HTML comments
        content = re.sub(r'<!--(.*?)-->', r'{/*\1*/}', content, flags=re.DOTALL)
        
        # 2. Fix inline styles
        content = re.sub(r'style="([^"]*)"', style_replacer, content)
        
        # 3. Fix checked without onChange (React warns but doesn't crash, still good to fix)
        content = content.replace('checked=""', 'defaultChecked')
        
        with open(path, 'w') as f:
            f.write(content)

print("JSX Fixes Applied.")
