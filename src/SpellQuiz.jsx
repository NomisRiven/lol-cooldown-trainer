import { useState, useEffect } from 'react';
import './SpellQuiz.css';
import { gameConfig } from './gameConfig';


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
  const [currentCDR, setCurrentCDR] = useState(0);
  const [shakeScreen, setShakeScreen] = useState(false);


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
    if (mode.customFilters?.famousUltimates) {
      filtered = filtered.filter(spell => {
        const championSpells = data.filter(s => s.champion === spell.champion);
        const indexInChamp = championSpells.indexOf(spell);
        return indexInChamp === 3 && gameConfig.famousUltimates.includes(spell.champion);
      });
    }
    if (mode.customFilters?.bigCooldowns) {
      filtered = filtered.filter(spell => {
        const cooldowns = spell.cooldown_text.split('/');
        const firstCooldown = parseFloat(cooldowns[0]);
        return firstCooldown >= gameConfig.bigCooldownThreshold;
      });
    }
    if (mode.customFilters?.metaOnly) {
      filtered = filtered.filter(spell => 
        gameConfig.metaChampions.includes(spell.champion)
      );
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
  
    // Générer un CDR aléatoire si mode CDR activé
    let cdr = 0;
    if (mode.cdrMode === 'random') {
      // Ability Haste entre 0 et 100
      const possibleCDR = [0, 10, 20, 30, 40, 50];
      const abilityHaste = possibleCDR[Math.floor(Math.random() * possibleCDR.length)];
      cdr = abilityHaste;
    }
  
    setCurrentSpell(randomSpell);
    setCurrentLevel(level);
    setCurrentCDR(cdr);
    generateChoices(randomSpell, level, cdr);
  };

  const generateChoices = (spell, level, cdr = 0) => {
    const cooldowns = spell.cooldown_text.split('/');
    const baseCooldown = parseFloat(cooldowns[level]);
    
    // Calculer le CD réel avec Ability Haste
    const actualCooldown = cdr > 0 
      ? baseCooldown * (100 / (100 + cdr))
      : baseCooldown;
    
    // Arrondir de manière cohérente
    let correctAnswer;
    if (actualCooldown < 1) {
      correctAnswer = Math.round(actualCooldown * 4) / 4;
    } else if (actualCooldown < 10) {
      correctAnswer = Math.round(actualCooldown * 2) / 2;
    } else {
      correctAnswer = Math.round(actualCooldown);
    }
    
    const wrongAnswers = generateWrongAnswers(correctAnswer);
    const allChoices = [...wrongAnswers, correctAnswer.toString()]
      .sort(() => Math.random() - 0.5);
    
    setChoices(allChoices);
  };

  const generateWrongAnswers = (correct) => {
    const wrongs = new Set();
    
    // Déterminer le delta et le type d'arrondi selon la plage
    let delta, roundFn;
    if (correct < 3) {
      delta = 0.5;
      roundFn = (v) => Math.round(v * 4) / 4;
    } else if (correct < 6) {
      delta = 0.5;
      roundFn = (v) => Math.round(v * 2) / 2;
    } else if (correct < 10) {
      delta = 1;
      roundFn = (v) => Math.round(v * 2) / 2;
    } else if (correct < 20) {
      delta = 1.5; // Plus petit delta pour cette plage
      roundFn = (v) => Math.round(v * 2) / 2;
    } else if (correct < 40) {
      delta = 3;
      roundFn = (v) => Math.round(v);
    } else {
      delta = 10;
      roundFn = (v) => Math.round(v);
    }
    
    // Générer 6 candidats proches
    const candidates = [
      correct - delta * 2,
      correct - delta,
      correct + delta,
      correct + delta * 2,
    ];
    
    // Mélanger et filtrer
    candidates.sort(() => Math.random() - 0.5);
    
    for (const value of candidates) {
      if (wrongs.size >= 3) break;
      
      const rounded = roundFn(value);
      
      // Vérifier que c'est dans une plage raisonnable (pas trop loin de correct)
      const percentDiff = Math.abs((rounded - correct) / correct);
      
      if (rounded >= 0.5 && 
          rounded <= 200 && 
          rounded !== correct && 
          percentDiff <= 0.35) { // Max 35% de différence
        wrongs.add(rounded.toString());
      }
    }
    
    // Si pas assez, générer des valeurs plus proches
    let attempts = 0;
    while (wrongs.size < 3 && attempts < 30) {
      const offset = (Math.random() > 0.5 ? 1 : -1) * delta * (Math.random() * 1.5 + 0.5);
      const value = roundFn(correct + offset);
      const percentDiff = Math.abs((value - correct) / correct);
      
      if (value >= 0.5 && 
          value <= 200 && 
          value !== correct && 
          percentDiff <= 0.35 &&
          !wrongs.has(value.toString())) {
        wrongs.add(value.toString());
      }
      attempts++;
    }
    
    return Array.from(wrongs);
  };

  const checkAnswer = (answer) => {
    const cooldowns = currentSpell.cooldown_text.split('/');
    const baseCooldown = parseFloat(cooldowns[currentLevel]);
    
    const actualCooldown = currentCDR > 0 
      ? baseCooldown * (100 / (100 + currentCDR))
      : baseCooldown;
    
    // Même arrondi que generateChoices
    let correctAnswer;
    if (actualCooldown < 1) {
      correctAnswer = Math.round(actualCooldown * 4) / 4;
    } else if (actualCooldown < 10) {
      correctAnswer = Math.round(actualCooldown * 2) / 2;
    } else {
      correctAnswer = Math.round(actualCooldown);
    }
    
    const correctAnswerStr = correctAnswer.toString();
    
    if (answer === correctAnswerStr) {
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
            
            // Générer nouveau CDR pour chaque niveau
            let newCdr = 0;
            if (mode.cdrMode === 'random') {
              const possibleCDR = [0, 10, 20, 30, 40, 50];
              newCdr = possibleCDR[Math.floor(Math.random() * possibleCDR.length)];
            }
            setCurrentCDR(newCdr);
            generateChoices(currentSpell, nextLevel, newCdr);
          }
        }
      }, 600);
    } else {
      setFeedback('✗');
      setStreak(0);
      setShakeScreen(true);  // NOUVEAU
      
      setTimeout(() => {
        setFeedback('');
        setShakeScreen(false);  // NOUVEAU
      }, 600);
    }
  };

  if (!currentSpell) return <div className="loading">Loading...</div>;

  return (
    <div className={`quiz ${shakeScreen ? 'shake' : ''}`}>
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
          {currentCDR > 0 && (
            <div className="cdr-info">{currentCDR} Ability Haste</div>
          )}
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