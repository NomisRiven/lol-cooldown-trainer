import { useState } from 'react';
import './GameModeSelection.css';

function GameModeSelection({ onModeSelect }) {
  const modes = [
    {
      id: 'cooldowns',
      name: 'Cooldown Trainer',
      description: 'Practice champion spell cooldowns',
      icon: '⚡'
    },
    {
      id: 'summoners',
      name: 'Summoner Timer',
      description: 'Calculate summoner spell timers',
      icon: '⏱️'
    }
  ];

  return (
    <div className="game-mode-selection">
      <h1>LoL Trainer</h1>
      <p className="subtitle">Choose your training mode</p>
      
      <div className="mode-cards">
        {modes.map(mode => (
          <button
            key={mode.id}
            className="mode-card"
            onClick={() => onModeSelect(mode.id)}
          >
            <div className="mode-icon">{mode.icon}</div>
            <h2>{mode.name}</h2>
            <p>{mode.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default GameModeSelection;