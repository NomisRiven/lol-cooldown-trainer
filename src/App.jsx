import { useState } from 'react';
import './App.css';
import GameModeSelection from './GameModeSelection';
import ModeSelection from './ModeSelection';
import SpellQuiz from './SpellQuiz';
// TODO: créer SummonerTimer plus tard

function App() {
  const [gameMode, setGameMode] = useState(null);
  const [quizMode, setQuizMode] = useState(null);

  const handleGameModeSelect = (mode) => {
    setGameMode(mode);
  };

  const handleQuizModeSelect = (mode) => {
    setQuizMode(mode);
  };

  const handleBackToGameMode = () => {
    setQuizMode(null);
  };

  const handleBackToMain = () => {
    setGameMode(null);
    setQuizMode(null);
  };

  return (
    <div className="app">
      {!gameMode ? (
        <GameModeSelection onModeSelect={handleGameModeSelect} />
      ) : !quizMode ? (
        gameMode === 'cooldowns' ? (
          <ModeSelection 
            onModeSelect={handleQuizModeSelect} 
            onBack={handleBackToMain}
          />
        ) : (
          <div className="coming-soon">
            <button className="back-btn" onClick={handleBackToMain}>←</button>
            <p>Summoner Timer (coming soon)</p>
          </div>
        )
      ) : (
        <SpellQuiz mode={quizMode} onBack={handleBackToGameMode} />
      )}
    </div>
  );
}

export default App;