import { useState } from 'react'
import shuffle from 'lodash.shuffle';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';


import Canvas from './components/Canvas'

import type { WordMapping } from './types'
import { Typography } from '@mui/material';

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

  const [answer, setAnswer] = useState<WordMapping>({});
  const [wordsMapping, setWordsMapping] = useState<WordMapping>({});
  const [renderCanvas, setRenderCanvas] = useState<Boolean>(false);
  const [gradeResult, setGradeResult] = useState<null | number>(null);
  const [gameStart, setGameStart] = useState<Boolean>(false);

  const handleGoButton = () => {
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
    setGradeResult(null)
    setGameStart(true)
  }

  const handleGradeButton = () => {
    let count = 0
    Object.keys(answer).map(englishWord => {
      const frenchAnswer = answer[englishWord]
      const isCorrect = CORRECT_WORDS_MAPPING[englishWord] === frenchAnswer
      if (isCorrect) {
        count+= 1
      }
    })

    const percentage = Math.round((count / Object.keys(CORRECT_WORDS_MAPPING).length)*100)
    setGradeResult(percentage)
    setGameStart(false)
  }

  const renderTitleAndGo = () => (
    <>
      {gradeResult === null ?
        <Typography variant="h3" sx={{marginBottom: '1rem'}}>Welcome to the memory game!</Typography> 
      :
        <Typography variant="h3" sx={{marginBottom: '1rem'}}>Try again!</Typography>
      }
      <Button onClick={handleGoButton} variant="contained">Go</Button> 
    </>
  )

  const renderGrade = () => (
    <>
      <Typography variant="h3" sx={{marginBottom: '1rem'}}>Match the english words with the french words</Typography>
      <Button onClick={handleGradeButton} variant="contained">Grade</Button>
    </>
  )

  return (
    <Box sx={{margin: '5rem'}}>
      <Grid container>
        <Grid item xs={12} sx={{textAlign:'center', marginBottom:"1rem"}}>
          {!gameStart && renderTitleAndGo()}
          {gameStart && renderGrade()}
        </Grid>
        <Grid item xs={12} sx={{textAlign:'center'}}>
          {gradeResult !== null && 
            <Typography variant="body1" sx={{marginBottom: '1rem'}}>You got {gradeResult}% correct</Typography> 
          }
        </Grid>
        <Grid item xs={12} sx={{textAlign:'center'}}>
          {renderCanvas && 
            <Canvas 
              wordsMapping={wordsMapping} 
              answer={answer}
              setAnswer={setAnswer} 
            />
          }
        </Grid>
      </Grid>
    </Box>
  )
}

export default App;
