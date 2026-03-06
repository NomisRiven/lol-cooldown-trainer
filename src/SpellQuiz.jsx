import { useState, useEffect } from 'react';
import './SpellQuiz.css';

function SpellQuiz({ mode, onBack }) {
  const [allSpells, setAllSpells] = useState([]);
  const [filteredSpells, setFilteredSpells] = useState([]);
  const [currentSpell, setCurrentSpell] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [choices, setChoices] = useState([]);
  const [latestVersion, setLatestVersion] = useState('16.5.1');

  useEffect(() => {
    fetch('https://ddragon.leagueoflegends.com/api/versions.json')
      .then(res => res.json())
      .then(versions => setLatestVersion(versions[0]))
      .catch(() => console.log('Using fallback'));

    fetch('/spells.json')
      .then(res => res.json())
      .then(data => {
        setAllSpells(data);
        const filtered = filterSpells(data);
        setFilteredSpells(filtered);
        if (filtered.length > 0) {
          loadNewSpell(filtered);
        }
      });
  }, []);

  const filterSpells = (data) => {
    let filtered = data;

    // Filtre par rôle (dynamique depuis Community Dragon)
    if (mode.roles && mode.roles.length > 0 && mode.championRoles) {
      const allowedChampions = new Set();
      
      Object.entries(mode.championRoles).forEach(([champion, roles]) => {
        if (mode.roles.some(selectedRole => roles.includes(selectedRole))) {
          allowedChampions.add(champion);
        }
      });
      
      filtered = filtered.filter(spell => allowedChampions.has(spell.champion));
    }

    // Filtre par type de spell
    if (mode.spellType === 'ultimates') {
      filtered = filtered.filter((spell) => {
        const championSpells = data.filter(s => s.champion === spell.champion);
        const indexInChamp = championSpells.indexOf(spell);
        return indexInChamp === 3;
      });
    } else if (mode.spellType === 'basic') {
      filtered = filtered.filter((spell) => {
        const championSpells = data.filter(s => s.champion === spell.champion);
        const indexInChamp = championSpells.indexOf(spell);
        return indexInChamp !== 3;
      });
    }

    return filtered;
  };

  const getSpellKey = () => {
    const championSpells = allSpells.filter(s => s.champion === currentSpell.champion);
    const indexInChamp = championSpells.findIndex(s => s.spell_id === currentSpell.spell_id);
    return ['Q', 'W', 'E', 'R'][indexInChamp] || '?';
  };

  const loadNewSpell = (spellsList) => {
    const randomSpell = spellsList[Math.floor(Math.random() * spellsList.length)];
    const cooldowns = randomSpell.cooldown_text.split('/');
    
    let level;
    if (mode.learningMode === 'single-level') {
      level = Math.floor(Math.random() * cooldowns.length);
    } else {
      level = 0;
    }

    setCurrentSpell(randomSpell);
    setCurrentLevel(level);
    generateChoices(randomSpell, level);
  };

  const generateChoices = (spell, level) => {
    const cooldowns = spell.cooldown_text.split('/');
    const correctAnswer = cooldowns[level];
    
    const wrongAnswers = generateWrongAnswers(parseFloat(correctAnswer));
    const allChoices = [...wrongAnswers, correctAnswer]
      .sort(() => Math.random() - 0.5);
    
    setChoices(allChoices);
  };

  const generateWrongAnswers = (correct) => {
    const wrongs = new Set();
    const range = correct < 10 ? 3 : 10;
    
    while (wrongs.size < 3) {
      const offset = Math.floor(Math.random() * range * 2) - range;
      const wrong = correct + offset;
      if (wrong > 0 && wrong !== correct && wrong <= 200) {
        wrongs.add(wrong.toString());
      }
    }
    return Array.from(wrongs);
  };

  const checkAnswer = (answer) => {
    const cooldowns = currentSpell.cooldown_text.split('/');
    const correctAnswer = cooldowns[currentLevel];
    
    if (answer === correctAnswer) {
      setFeedback('✓');
      setScore(score + 1);
      setStreak(streak + 1);
      
      setTimeout(() => {
        setFeedback('');
        setUserAnswer('');
        
        if (mode.learningMode === 'single-level') {
          loadNewSpell(filteredSpells);
        } else {
          if (currentLevel >= cooldowns.length - 1) {
            loadNewSpell(filteredSpells);
          } else {
            const nextLevel = currentLevel + 1;
            setCurrentLevel(nextLevel);
            generateChoices(currentSpell, nextLevel);
          }
        }
      }, 600);
    } else {
      setFeedback('✗');
      setStreak(0);
      
      setTimeout(() => setFeedback(''), 600);
    }
  };

  if (!currentSpell) return <div className="loading">Loading...</div>;

  return (
    <div className="quiz">
      <div className="quiz-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="stats">
          <span>{score}</span>
          <span className="streak">{streak > 0 ? `🔥 ${streak}` : ''}</span>
        </div>
      </div>

      <div className="spell-info">
        <img 
          src={`http://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/spell/${currentSpell.spell_id}.png`}
          alt={currentSpell.spell_name}
          className="spell-img"
        />
        <div className="spell-text">
          <div className="champion">{currentSpell.champion}</div>
          <div className="spell-name">
            {currentSpell.spell_name} <span className="spell-key">({getSpellKey()})</span>
          </div>
          <div className="level">Level {currentLevel + 1}</div>
        </div>
      </div>

      {feedback && <div className="feedback">{feedback}</div>}

      <div className="choices">
        {choices.map((choice, i) => (
          <button 
            key={i}
            className="choice"
            onClick={() => checkAnswer(choice)}
          >
            {choice}s
          </button>
        ))}
      </div>

      <input 
        className="input"
        type="number"
        step="any"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && checkAnswer(userAnswer)}
        placeholder="Type answer..."
      />
    </div>
  );
}

export default SpellQuiz;