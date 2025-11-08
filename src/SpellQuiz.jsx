import { useState, useEffect } from 'react';
import './SpellQuizz.css';

function SpellQuiz() {
  const [spells, setSpells] = useState([]);
  const [currentSpell, setCurrentSpell] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [scoreChange, setScoreChange] = useState('');
  const [choices, setChoices] = useState([]);

  useEffect(() => {
    fetch('/spells.json')
      .then(res => res.json())
      .then(data => {
        setSpells(data);
        loadNewSpell(data, 0);
      });
  }, []);

  const loadNewSpell = (spellsData, level) => {
    const randomSpell = spellsData[Math.floor(Math.random() * spellsData.length)];
    setCurrentSpell(randomSpell);
    setCurrentLevel(level);
    generateChoices(randomSpell, level);
  };

  const generateChoices = (spell, level) => {
    const cooldowns = spell.cooldown_text.split('/');
    const correctAnswer = cooldowns[level];
    
    const wrongAnswers = generateWrongAnswers(parseInt(correctAnswer));
    const allChoices = [...wrongAnswers, correctAnswer]
      .sort(() => Math.random() - 0.5);
    
    setChoices(allChoices);
  };

  const generateWrongAnswers = (correct) => {
    const wrongs = new Set();
    while (wrongs.size < 3) {
      const offset = Math.floor(Math.random() * 20) - 10;
      const wrong = correct + offset;
      if (wrong > 0 && wrong !== correct && wrong <= 200) {
        wrongs.add(wrong.toString());
      }
    }
    return Array.from(wrongs);
  };

  if (!currentSpell) return <div>Chargement...</div>;

  const checkAnswer = (answer) => {
    const cooldowns = currentSpell.cooldown_text.split('/');
    const correctAnswer = cooldowns[currentLevel];
    
    if (answer === correctAnswer) {
      setFeedback('✅');
      setScore(score + 1);
      setScoreChange('+1');
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
      
      setTimeout(() => {
        setFeedback('');
        setScoreChange('');
        setUserAnswer('');
        
        if (currentLevel >= cooldowns.length - 1) {
          loadNewSpell(spells, 0);
        } else {
          const nextLevel = currentLevel + 1;
          setCurrentLevel(nextLevel);
          generateChoices(currentSpell, nextLevel);
        }
      }, 800);
    } else {
      setFeedback('❌');
      setScoreChange('+0');
      setStreak(0);
      
      setTimeout(() => {
        setFeedback('');
        setScoreChange('');
      }, 800);
    }
  };

  return (
    <div className="quiz-container">
      {feedback && <div className="feedback">{feedback}</div>}
      {scoreChange && <div className="score-change">{scoreChange}</div>}
      
      <div className="spell-card">
        <div className="stats-container">
          <div className="stat">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Serie 🔥</span>
            <span className="stat-value">{streak}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Record</span>
            <span className="stat-value">{bestStreak}</span>
          </div>
        </div>
        
        <h2>{currentSpell.champion}</h2>
        <p className="spell-name">{currentSpell.spell_name}</p>
        <p className="spell-id">({currentSpell.spell_id})</p>
        <p className="level-indicator">Level {currentLevel + 1}</p>
        
        <img 
          className="spell-image"
          src={`http://ddragon.leagueoflegends.com/cdn/15.22.1/img/spell/${currentSpell.spell_id}.png`}
          alt={currentSpell.spell_name}
        />
        
        <div className="choices-container">
          {choices.map((choice, index) => (
            <button 
              key={index}
              className="choice-btn"
              onClick={() => checkAnswer(choice)}
            >
              {choice}s
            </button>
          ))}
        </div>
        
        <p style={{margin: '20px 0', color: '#666'}}>or</p>
        
        <input 
          className="answer-input"
          type="text" 
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && checkAnswer(userAnswer)}
          placeholder="Type your answer..."
        />
      </div>
    </div>
  );
}

export default SpellQuiz;