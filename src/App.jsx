import { useState } from 'react';
import './App.css';
import GameModeSelection from './GameModeSelection';
import ModeSelection from './ModeSelection';
import SpellQuiz from './SpellQuiz';
import SummonerTimer from './SummonerTimer';


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
          <SummonerTimer onBack={handleBackToMain} />
        )
      ) : (
        <SpellQuiz mode={quizMode} onBack={handleBackToGameMode} />
      )}
    </div>
  );
}

export default App;