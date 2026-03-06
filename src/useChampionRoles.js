import { useState, useEffect } from 'react';

export function useChampionRoles() {
  const [championRoles, setChampionRoles] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/roles.json')
      .then(res => res.json())
      .then(data => {
        console.log('Roles loaded:', data);
        setChampionRoles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load roles:', err);
        setLoading(false);
      });
  }, []);

  return { championRoles, loading };
}