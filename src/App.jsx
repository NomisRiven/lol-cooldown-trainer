import { useState } from 'react';
import './App.css';
import GameModeSelection from './GameModeSelection';
import ModeSelection from './ModeSelection';
import SpellQuiz from './SpellQuiz';
// TODO: créer SummonerTimer plus tard

function App() {
  const [gameMode, setGameMode] = useState(null); // 'cooldowns' ou 'summoners'
  const [quizMode, setQuizMode] = useState(null);

  const handleGameModeSelect = (mode) => {
    setGameMode(mode);
  };

  const handleQuizModeSelect = (mode) => {
    setQuizMode(mode);
  };

  const handleBack = () => {
    if (quizMode) {
      setQuizMode(null);
    } else {
      setGameMode(null);
    }
  };

  return (
    <div className="app">
      {!gameMode ? (
        <GameModeSelection onModeSelect={handleGameModeSelect} />
      ) : !quizMode ? (
        gameMode === 'cooldowns' ? (
          <ModeSelection onModeSelect={handleQuizModeSelect} />
        ) : (
          <div>Summoner Timer (coming soon)</div>
        )
      ) : (
        <SpellQuiz mode={quizMode} onBack={handleBack} />
      )}
    </div>
  );
}

export default App;