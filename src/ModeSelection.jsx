import { useState } from 'react';
import { useChampionRoles } from './useChampionRoles';
import './ModeSelection.css';
import { gameConfig } from './gameConfig';


function ModeSelection({ onModeSelect, onBack }) {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [spellType, setSpellType] = useState('all');
  const [learningMode, setLearningMode] = useState('all-levels');
  const [cdrMode, setCdrMode] = useState('none');
  const [customFilters, setCustomFilters] = useState({
    famousUltimates: false,
    bigCooldowns: false,
    metaOnly: false
  });
  
  const { championRoles, loading } = useChampionRoles();
  // Ajoute ça juste après le useChampionRoles()
console.log('Champion Roles:', championRoles);
console.log('Loading:', loading);

// Et pour voir les champions par rôle, ajoute ça aussi
if (championRoles) {
  console.log('Top champions:', Object.entries(championRoles)
    .filter(([champ, roles]) => roles.includes('top'))
    .map(([champ]) => champ)
  );
  
  console.log('Jungle champions:', Object.entries(championRoles)
    .filter(([champ, roles]) => roles.includes('jungle'))
    .map(([champ]) => champ)
  );
}

  const roles = [
    { id: 'top', name: 'Top' },
    { id: 'jungle', name: 'Jungle' },
    { id: 'middle', name: 'Mid' },
    { id: 'bottom', name: 'ADC' },
    { id: 'utility', name: 'Support' }
  ];

  const toggleRole = (roleId) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    );
  };

  const handleStart = () => {
    onModeSelect({
      roles: selectedRoles,
      spellType,
      learningMode,
      cdrMode,
      customFilters,
      championRoles
    });
  };

  if (loading) {
    return (
      <div className="mode-selection">
            <button className="back-btn-top" onClick={onBack}>← Back</button>  {/* NOUVEAU */}
        <div className="loading-text">Loading champion data...</div>
      </div>
    );
  }

  return (
    <div className="mode-selection">
      <h1>Cooldown Trainer</h1>

      <div className="filter-section">
        <h2>Roles</h2>
        <div className="role-grid">
          {roles.map(role => (
            <button
              key={role.id}
              className={`role-btn ${selectedRoles.includes(role.id) ? 'selected' : ''}`}
              onClick={() => toggleRole(role.id)}
            >
              {role.name}
            </button>
          ))}
        </div>
        {selectedRoles.length === 0 && <p className="hint">All roles selected by default</p>}
      </div>

      <div className="filter-section">
        <h2>Spell Type</h2>
        <div className="option-grid">
          <button
            className={`option-btn ${spellType === 'all' ? 'selected' : ''}`}
            onClick={() => setSpellType('all')}
          >
            All Spells
          </button>
          <button
            className={`option-btn ${spellType === 'ultimates' ? 'selected' : ''}`}
            onClick={() => setSpellType('ultimates')}
          >
            Ultimates
          </button>
          <button
            className={`option-btn ${spellType === 'basic' ? 'selected' : ''}`}
            onClick={() => setSpellType('basic')}
          >
            Basic (Q/W/E)
          </button>
        </div>
      </div>
          <div className="filter-section">
      <h2>Custom Filters</h2>
      <div className="toggle-filters">
        <button
          className={`filter-toggle ${customFilters.famousUltimates ? 'active' : ''}`}
          onClick={() => setCustomFilters(prev => ({
            ...prev,
            famousUltimates: !prev.famousUltimates
          }))}
        >
          Famous Ultimates ⭐
        </button>
        <button
          className={`filter-toggle ${customFilters.bigCooldowns ? 'active' : ''}`}
          onClick={() => setCustomFilters(prev => ({
            ...prev,
            bigCooldowns: !prev.bigCooldowns
          }))}
        >
          Big Cooldowns (50s+) 🕐
        </button>
        <button
          className={`filter-toggle ${customFilters.metaOnly ? 'active' : ''}`}
          onClick={() => setCustomFilters(prev => ({
            ...prev,
            metaOnly: !prev.metaOnly
          }))}
        >
          Meta Champions 🔥
        </button>
      </div>
      {customFilters.famousUltimates && (
        <p className="hint">Only famous game-changing ultimates</p>
      )}
      {customFilters.bigCooldowns && (
        <p className="hint">Cooldowns above {gameConfig.bigCooldownThreshold} seconds</p>
      )}
      {customFilters.metaOnly && (
        <p className="hint">Current patch meta champions only</p>
      )}
    </div>
      <div className="filter-section">
        <h2>Learning Mode</h2>
        <div className="option-grid">
          <button
            className={`option-btn ${learningMode === 'all-levels' ? 'selected' : ''}`}
            onClick={() => setLearningMode('all-levels')}
          >
            All Levels
          </button>
          <button
            className={`option-btn ${learningMode === 'single-level' ? 'selected' : ''}`}
            onClick={() => setLearningMode('single-level')}
          >
            Random Level
          </button>
        </div>
        <div className="filter-section">
          <h2>CDR Challenge</h2>
          <div className="option-grid">
            <button
              className={`option-btn ${cdrMode === 'none' ? 'selected' : ''}`}
              onClick={() => setCdrMode('none')}
            >
              No CDR
            </button>
            <button
              className={`option-btn ${cdrMode === 'random' ? 'selected' : ''}`}
              onClick={() => setCdrMode('random')}
            >
              With CDR
            </button>
          </div>
          <p className="hint">
            {cdrMode === 'none' 
              ? 'Base cooldowns only'
              : 'Calculate cooldowns with Ability Haste (0, 10, 20, 30, 40, or 50)'}
          </p>
        </div>
        <p className="hint">
          {learningMode === 'all-levels' 
            ? 'Practice all 5 levels of each spell in order'
            : 'Practice one random level per spell, then switch'}
        </p>
      </div>

      <button className="start-btn" onClick={handleStart}>
        Start Training
      </button>
    </div>
  );
}

export default ModeSelection;