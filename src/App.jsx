import { useState } from 'react';
import './App.css';
import ModeSelection from './ModeSelection';
import SpellQuiz from './SpellQuiz';

function App() {
  const [selectedMode, setSelectedMode] = useState(null);

  return (
    <div className="app">
      {!selectedMode ? (
        <ModeSelection onModeSelect={setSelectedMode} />
      ) : (
        <SpellQuiz mode={selectedMode} onBack={() => setSelectedMode(null)} />
      )}
    </div>
  );
}

export default App;