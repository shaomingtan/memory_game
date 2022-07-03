import { useState } from 'react'
import shuffle from 'lodash.shuffle';

import Canvas from './components/Canvas'

type WordMapping = {
  [name: string]: null | string
}

const CORRECT_WORDS_MAPPING:WordMapping = {
  "forest":	"forêt",
  "sibling":	"frère et sœur",
  "cereal":	"céréale",
  "desk":	"bureau",
  "camel":	"chameau",
  "butter":	"beurre",
  "bicycle":	"vélo",
  "railroad":	"chemin de fer",
  "folder":	"dossier",
  "weekly":	"hebdomadaire",
  "hungry":	"faim",
  "limestone":	"calcaire",
}

const App = () => {

  const [selectedWordPairings, setSelectedWordPairings] = useState<WordMapping>({});
  const [wordsMapping, setWordsMapping] = useState<WordMapping>({});
  const [renderCanvas, setRenderCanvas] = useState<Boolean>(false);
  const [gradeResult, setGradeResult] = useState<number>(0);

  const handleGoButton = () => {
    // Scramble wordsMapping
    const shuffledWordMapping:WordMapping = {}
    const shuffledFrenchWords = shuffle(Object.values(CORRECT_WORDS_MAPPING))

    // Assign shuffled french words to word mapping
    for (let i=0; i< Object.keys(CORRECT_WORDS_MAPPING).length; i++){
      const englishWord = Object.keys(CORRECT_WORDS_MAPPING)[i]
      shuffledWordMapping[englishWord] = shuffledFrenchWords[i]
    }

    console.log("shuffledWordMapping", shuffledWordMapping)
    setWordsMapping(shuffledWordMapping)
    setRenderCanvas(true)
    setGradeResult(0)
  }

  const handleGradeButton = () => {
    let count = 0
    Object.keys(selectedWordPairings).map(englishWord => {
      const frenchAnswer = selectedWordPairings[englishWord]
      const isCorrect = CORRECT_WORDS_MAPPING[englishWord] === frenchAnswer
      if (isCorrect) {
        count+= 1
      }
    })

    const percentage = Math.round((count / Object.keys(CORRECT_WORDS_MAPPING).length)*100)
    setGradeResult(percentage)
  }
  return (
    <>
      {renderCanvas && 
        <Canvas 
          wordsMapping={wordsMapping} 
          selectedWordPairings={selectedWordPairings}
          setSelectedWordPairings={setSelectedWordPairings} 
        />
      }
      <div onClick={() => handleGradeButton()}>Grade</div>
      <div onClick={() => handleGoButton()}>Go</div>
      {gradeResult && <div>You got {gradeResult}% correct</div>}
    </>
  )
}

export default App;
