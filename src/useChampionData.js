import { useState, useEffect } from 'react';

export function useChampionData() {
  const [championData, setChampionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/champion-data.json')
      .then(res => res.json())
      .then(data => {
        // Créer un mapping champion -> roles
        const rolesMap = {};
        
        data.forEach(champ => {
          rolesMap[champ.name] = champ.roles || [];
        });
        
        setChampionData(rolesMap);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load champion data:', err);
        setLoading(false);
      });
  }, []);

  return { championData, loading };
}