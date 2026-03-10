// Configuration facile à modifier pour les filtres custom
export const gameConfig = {
    // Famous Ultimates - Modifiable facilement
    famousUltimates: [
      'Malphite', 'Amumu', 'Orianna', 'Yasuo', 'MissFortune', 
      'Kennen', 'Thresh', 'Sona', 'Leona', 'Sejuani',
      'Sylas', 'Pyke', 'Sett', 'Ornn', 'Rell'
    ],
  
    // Champions meta - À modifier à chaque patch
    metaChampions: [
      'Ambessa', 'Yone', 'Sylas', 'Aurora', 'Smolder',
      'Rell', 'Skarner', 'Viego', 'KSante', 'Rumble',
      'Ezreal', 'Jinx', 'Caitlyn', 'Ashe',
      'Lux', 'Thresh', 'Nautilus', 'Milio'
    ],
  
    // Summoner spells avec leurs CDs de base
    summonerSpells: [
      { id: 'flash', name: 'Flash', cooldown: 300, image: 'SummonerFlash.png' },
      { id: 'ignite', name: 'Ignite', cooldown: 180, image: 'SummonerDot.png' },
      { id: 'teleport', name: 'Teleport', cooldown: 360, image: 'SummonerTeleport.png' },
      { id: 'smite', name: 'Smite', cooldown: 90, image: 'SummonerSmite.png' },
      { id: 'heal', name: 'Heal', cooldown: 240, image: 'SummonerHeal.png' },
      { id: 'barrier', name: 'Barrier', cooldown: 180, image: 'SummonerBarrier.png' },
      { id: 'exhaust', name: 'Exhaust', cooldown: 240, image: 'SummonerExhaust.png' },
      { id: 'ghost', name: 'Ghost', cooldown: 240, image: 'SummonerHaste.png' },
      { id: 'cleanse', name: 'Cleanse', cooldown: 240, image: 'SummonerBoost.png' },
    ],
  
    // Seuil pour "big cooldowns"
    bigCooldownThreshold: 50
  };