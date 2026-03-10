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
  const [cooldownRevealed, setCooldownRevealed] = useState(false); // NOUVEAU
  const [currentHaste, setCurrentHaste] = useState(0); // NOUVEAU
  const [hasteItems, setHasteItems] = useState([]); // NOUVEAU

  // Table de conversion haste -> cooldown réduit (en secondes)
  const hasteCooldowns = {
    0: { 420: 420, 300: 300, 240: 240, 180: 180, 210: 210, 90: 90 },
    10: { 420: 381.82, 300: 272.73, 240: 218.18, 180: 163.64, 210: 190.91, 90: 81.82 },
    18: { 420: 355.93, 300: 254.24, 240: 203.39, 180: 152.54, 210: 177.97, 90: 76.27 },
    20: { 420: 350, 300: 250, 240: 200, 180: 150, 210: 175, 90: 75 }
  };

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

    // Générer haste aléatoire (0, 10, 18, ou 20)
    const hasteOptions = [0, 0, 10, 18, 20]; // Plus de chances d'avoir 0
    const haste = hasteOptions[Math.floor(Math.random() * hasteOptions.length)];
    
    // Déterminer quels items donnent le haste
    const items = [];
    if (haste === 10) {
      items.push('Cosmic Insight');
    } else if (haste === 18) {
      items.push('Ionian Boots of Lucidity');
    } else if (haste === 20) {
      items.push('Cosmic Insight', 'Ionian Boots of Lucidity');
    }

    // Générer un temps d'utilisation aléatoire entre 0:00 et 30:00
    const randomMinutes = Math.floor(Math.random() * 31);
    const randomSeconds = Math.floor(Math.random() * 60);
    const timeUsed = `${randomMinutes}:${randomSeconds.toString().padStart(2, '0')}`;

    setCurrentSummoner(randomSummoner);
    setUsedTime(timeUsed);
    setCurrentHaste(haste);
    setHasteItems(items);
    setCooldownRevealed(false); // Reset l'état du blur
    generateChoices(randomSummoner, timeUsed, haste);
  };

  const calculateReturnTime = (usedTime, baseCooldown, haste) => {
    const [minutes, seconds] = usedTime.split(':').map(Number);
    const totalSeconds = minutes * 60 + seconds;
    
    // Récupérer le cooldown réduit depuis la table
    const actualCooldown = hasteCooldowns[haste][baseCooldown] || baseCooldown;
    
    // Arrondir le cooldown (certains sont en décimales)
    const roundedCooldown = Math.round(actualCooldown);
    
    const returnSeconds = totalSeconds + roundedCooldown;
    
    const returnMinutes = Math.floor(returnSeconds / 60);
    const returnSecs = returnSeconds % 60;
    
    return `${returnMinutes}:${returnSecs.toString().padStart(2, '0')}`;
  };

  const generateChoices = (summoner, timeUsed, haste) => {
    const correctAnswer = calculateReturnTime(timeUsed, summoner.cooldown, haste);
    
    const wrongOffsets = [-90, -60, -30, 30, 60, 90];
    const wrongAnswers = new Set();
    
    wrongOffsets.sort(() => Math.random() - 0.5);
    
    for (const offset of wrongOffsets) {
      if (wrongAnswers.size >= 3) break;
      
      const [minutes, seconds] = timeUsed.split(':').map(Number);
      const actualCooldown = Math.round(hasteCooldowns[haste][summoner.cooldown] || summoner.cooldown);
      const totalSeconds = minutes * 60 + seconds + actualCooldown + offset;
      
      if (totalSeconds >= 0 && totalSeconds <= 3600) {
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
    const correctAnswer = calculateReturnTime(usedTime, currentSummoner.cooldown, currentHaste);
    
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
    let value = e.target.value.replace(/[^\d:]/g, '');
    
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

  const actualCooldown = Math.round(hasteCooldowns[currentHaste][currentSummoner.cooldown]);

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
          
          {/* Cooldown cliquable avec blur */}
          <div 
            className={`cooldown-info ${!cooldownRevealed ? 'blurred' : ''}`}
            onClick={() => setCooldownRevealed(true)}
          >
            {actualCooldown}s cooldown
          </div>
          
          {/* Afficher les items de haste si présents */}
          {currentHaste > 0 && (
            <div className="haste-info">
              {hasteItems.map((item, i) => (
                <span key={i} className="haste-badge">{item}</span>
              ))}
            </div>
          )}
          
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