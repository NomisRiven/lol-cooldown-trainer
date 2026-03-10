import { useState, useEffect } from 'react';
import './SummonerTimer.css';
import { gameConfig } from './gameConfig';

function SummonerTimer({ onBack }) {
  const [currentSummoner, setCurrentSummoner] = useState(null);
  const [usedTime, setUsedTime] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [choices, setChoices] = useState([]);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [latestVersion, setLatestVersion] = useState('16.5.1');

  useEffect(() => {
    fetch('https://ddragon.leagueoflegends.com/api/versions.json')
      .then(res => res.json())
      .then(versions => setLatestVersion(versions[0]))
      .catch(() => console.log('Using fallback'));

    loadNewSummoner();
  }, []);

  const loadNewSummoner = () => {
    // Choisir un summoner aléatoire
    const randomSummoner = gameConfig.summonerSpells[
      Math.floor(Math.random() * gameConfig.summonerSpells.length)
    ];

    // Générer un temps d'utilisation aléatoire entre 0:00 et 30:00
    const randomMinutes = Math.floor(Math.random() * 31); // 0-30
    const randomSeconds = Math.floor(Math.random() * 60); // 0-59
    const timeUsed = `${randomMinutes}:${randomSeconds.toString().padStart(2, '0')}`;

    setCurrentSummoner(randomSummoner);
    setUsedTime(timeUsed);
    generateChoices(randomSummoner, timeUsed);
  };

  const calculateReturnTime = (usedTime, cooldown) => {
    // Parse "MM:SS" format
    const [minutes, seconds] = usedTime.split(':').map(Number);
    const totalSeconds = minutes * 60 + seconds;
    
    // Ajouter le cooldown
    const returnSeconds = totalSeconds + cooldown;
    
    // Convertir en MM:SS
    const returnMinutes = Math.floor(returnSeconds / 60);
    const returnSecs = returnSeconds % 60;
    
    return `${returnMinutes}:${returnSecs.toString().padStart(2, '0')}`;
  };

  const generateChoices = (summoner, timeUsed) => {
    const correctAnswer = calculateReturnTime(timeUsed, summoner.cooldown);
    
    // Générer 3 mauvaises réponses (±30s, ±60s, ±90s)
    const wrongOffsets = [-90, -60, -30, 30, 60, 90];
    const wrongAnswers = new Set();
    
    wrongOffsets.sort(() => Math.random() - 0.5);
    
    for (const offset of wrongOffsets) {
      if (wrongAnswers.size >= 3) break;
      
      const [minutes, seconds] = timeUsed.split(':').map(Number);
      const totalSeconds = minutes * 60 + seconds + summoner.cooldown + offset;
      
      if (totalSeconds >= 0 && totalSeconds <= 3600) { // Max 60 minutes
        const wrongMinutes = Math.floor(totalSeconds / 60);
        const wrongSeconds = totalSeconds % 60;
        const wrongTime = `${wrongMinutes}:${wrongSeconds.toString().padStart(2, '0')}`;
        
        if (wrongTime !== correctAnswer) {
          wrongAnswers.add(wrongTime);
        }
      }
    }
    
    const allChoices = [...Array.from(wrongAnswers), correctAnswer]
      .sort(() => Math.random() - 0.5);
    
    setChoices(allChoices);
  };

  const checkAnswer = (answer) => {
    const correctAnswer = calculateReturnTime(usedTime, currentSummoner.cooldown);
    
    if (answer === correctAnswer) {
      setFeedback('✓');
      setScore(score + 1);
      setStreak(streak + 1);
      
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      setTimeout(() => {
        setFeedback('');
        setUserAnswer('');
        loadNewSummoner();
      }, 600);
    } else {
      setFeedback('✗');
      setStreak(0);
      setShakeScreen(true);
      
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }
      
      setTimeout(() => {
        setFeedback('');
        setShakeScreen(false);
      }, 600);
    }
  };

  const handleInputChange = (e) => {
    let value = e.target.value.replace(/[^\d:]/g, ''); // Garde seulement chiffres et :
    
    // Auto-format MM:SS
    if (value.length === 2 && !value.includes(':')) {
      value = value + ':';
    }
    
    setUserAnswer(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && userAnswer) {
      checkAnswer(userAnswer);
    }
  };

  if (!currentSummoner) return <div className="loading">Loading...</div>;

  return (
    <div className={`summoner-timer ${shakeScreen ? 'shake' : ''}`}>
      <div className="quiz-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="stats">
          <span>{score}</span>
          <span className="streak">{streak > 0 ? `🔥 ${streak}` : ''}</span>
        </div>
      </div>

      <div className="summoner-info">
        <img 
          src={`http://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/spell/${currentSummoner.image}`}
          alt={currentSummoner.name}
          className="summoner-img"
        />
        <div className="summoner-text">
          <div className="summoner-name">{currentSummoner.name}</div>
          <div className="cooldown-info">{currentSummoner.cooldown}s cooldown</div>
          <div className="question">Used at <span className="highlight">{usedTime}</span></div>
          <div className="prompt">When does it come back?</div>
        </div>
      </div>

      {feedback && (
        <>
          <div className="feedback-overlay"></div>
          <div className={`feedback ${feedback === '✓' ? 'correct' : 'wrong'}`}>
            {feedback === '✓' ? (
              <>
                <div className="feedback-text">CORRECT</div>
                <div className="confetti"></div>
              </>
            ) : (
              <div className="feedback-text">WRONG</div>
            )}
          </div>
        </>
      )}

      <div className="choices">
        {choices.map((choice, i) => (
          <button 
            key={i}
            className="choice"
            onClick={() => checkAnswer(choice)}
          >
            {choice}
          </button>
        ))}
      </div>

      <input 
        className="input"
        type="text"
        value={userAnswer}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="MM:SS"
        maxLength={5}
      />
    </div>
  );
}

export default SummonerTimer;