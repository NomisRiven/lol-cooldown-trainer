import requests
import json

# Récupérer la dernière version
versions = requests.get('https://ddragon.leagueoflegends.com/api/versions.json').json()
latest_version = versions[0]

print(f"Version: {latest_version}")

# Récupérer tous les champions
url = f"http://ddragon.leagueoflegends.com/cdn/{latest_version}/data/en_US/champion.json"
response = requests.get(url)
champions_data = response.json()['data']

all_spells = []

for champ_id, champ_info in champions_data.items():
    champion_name = champ_info['id']
    
    # Récupérer les données détaillées du champion
    champ_url = f"http://ddragon.leagueoflegends.com/cdn/{latest_version}/data/en_US/champion/{champion_name}.json"
    champ_response = requests.get(champ_url)
    champ_data = champ_response.json()['data'][champion_name]
    
    # Extraire les sorts (Q, W, E, R)
    for spell in champ_data['spells']:
        spell_data = {
            'champion': champion_name,
            'spell_name': spell['name'],
            'spell_id': spell['id'],
            'cooldown_text': spell['cooldownBurn']  # SEULEMENT cooldown_text, pas cooldown
        }
        all_spells.append(spell_data)
    
    print(f"✓ {champion_name}")

# Sauvegarder dans spells.json
with open('public/spells.json', 'w', encoding='utf-8') as f:
    json.dump(all_spells, f, indent=2, ensure_ascii=False)

print(f"\n✅ {len(all_spells)} sorts sauvegardés dans public/spells.json")
print(f"Version: {latest_version}")