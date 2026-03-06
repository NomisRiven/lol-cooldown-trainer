import requests
import json

# Récupérer la dernière version
versions = requests.get('https://ddragon.leagueoflegends.com/api/versions.json').json()
latest_version = versions[0]

# Récupérer tous les champions
url = f"http://ddragon.leagueoflegends.com/cdn/{latest_version}/data/en_US/champion.json"
response = requests.get(url)
champions_data = response.json()['data']

# Mapping des tags DDragon vers des rôles
tag_to_role = {
    'Fighter': ['top', 'jungle'],
    'Tank': ['top', 'jungle', 'support'],
    'Mage': ['middle', 'support'],
    'Assassin': ['middle', 'jungle'],
    'Marksman': ['bottom'],
    'Support': ['support']
}

# Construire le mapping des rôles
roles_map = {}

for champ_id, champ_info in champions_data.items():
    name = champ_info['id']
    tags = champ_info.get('tags', [])
    
    # Convertir les tags en rôles
    roles = set()
    for tag in tags:
        if tag in tag_to_role:
            roles.update(tag_to_role[tag])
    
    roles_map[name] = list(roles)

# Sauvegarder
with open('public/roles.json', 'w') as f:
    json.dump(roles_map, f, indent=2)

print(f"✅ {len(roles_map)} champions avec rôles générés dans public/roles.json")
print(f"Version: {latest_version}")