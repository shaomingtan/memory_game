import { useRef, useEffect, useState } from 'react'

import './Canvas.css';
import { WordType } from '../types'

import type { WordMapping, CanvasProps, Position, Line, WordTypes,  HasClickedBoxResult } from '../types'

const WORD_BOX_HEIGHT = 50
const BOX_WIDTH = 200

const Canvas = (props:CanvasProps) => {
  const { wordsMapping, setAnswer: _setAnswer, answer: _answer } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // lineStart is used to track the start position of the current line
  const [_lineStart, _setLineStart] = useState<null | Position>(null);
  const lineStartRef = useRef(_lineStart)
  const setLineStart = (position: null | Position) => {
    lineStartRef.current = position
    _setLineStart(position);
  }

  // lineEnd is used to track the end position of the current line
  const [_lineEnd, _setLineEnd] = useState<null | Position>(null);
  const lineEndRef = useRef(_lineEnd)
  const setLineEnd = (position: null | Position) => {
    lineEndRef.current = position
    _setLineEnd(position);
  }

  // lines is used to track all the lines that user has drawn
  const [_lines, _setLines] = useState<Array<Line>>([]);
  const linesRef = useRef(_lines)
  const setLines = (line:Array<Line>) => {
    linesRef.current = line
    _setLines(line);
  }

  const [_selectedEnglishWord, _setSelectedEnglishWord] = useState<null | string>(null);
  const selectedEnglishWordRef = useRef(_selectedEnglishWord)
  const setSelectedEnglishWord = (word: null | string) => {
    selectedEnglishWordRef.current = word
    _setSelectedEnglishWord(word);
  }

  const [_selectedFrenchWord, _setSelectedFrenchWord] = useState<null | string>(null);
  const selectedFrenchWordRef = useRef(_selectedFrenchWord)
  const setSelectedFrenchWord = (word: null | string) => {
    selectedFrenchWordRef.current = word
    _setSelectedFrenchWord(word);
  }

  const answerRef = useRef(_answer)
  const setAnswer = (answer: WordMapping) => {
    answerRef.current = answer
    _setAnswer(answer);
  }

  const canvasHeight = Object.keys(wordsMapping).length * WORD_BOX_HEIGHT

  const getEnglishWordByIndex = (index:number):string => {
    const result = Object.keys(wordsMapping)[index]
    if (result) {
      return result
    } else {
      throw new Error("English word index out of bound")
    }
  }

  const getFrenchWordByIndex = (index:number):string => {
    const result = Object.values(wordsMapping)[index]
    if (result) {
      return result
    } else {
      throw new Error("French word index out of bound")
    }
  }

  // Check if word has already been selected as an answer
  const isWordSelected = (word: string, wordType: WordTypes) => {
    const currentAnswer = answerRef.current    
    // Check if english word has been selected
    if (wordType === WordType.ENGLISH && currentAnswer[word] !== null) {
      return true
    }

    // Check if french word has been selected
    if (wordType === WordType.FRENCH && Object.values(currentAnswer).includes(word)) {
      return true
    }
    return false
  }

  // Check if mouse click is within a box region and return the word and it's respective properties
  const hasClickedWordBox = (x:number, y:number):HasClickedBoxResult => {
    const canvas = canvasRef.current
    if (!canvas) return false

    const ctx = canvas.getContext('2d')
    if (!ctx) return false
    
    let xPosition
    let yPosition
    let wordType
    let clickedBox
    let word

    // Find index of the word that was clicked by calculating the y position of the click and the height of a word box
    const wordIndex = Math.floor(y/WORD_BOX_HEIGHT)
    yPosition = wordIndex*WORD_BOX_HEIGHT+WORD_BOX_HEIGHT/2

    // Handle if english boxes was clicked
    if (x <= BOX_WIDTH) {
      xPosition = BOX_WIDTH
      wordType = WordType.ENGLISH
      word = getEnglishWordByIndex(wordIndex)
    // Handle if french boxes was clicked
    } else if (x >= ctx.canvas.width - BOX_WIDTH) {
      xPosition = ctx.canvas.width - BOX_WIDTH
      wordType = WordType.FRENCH
      word = getFrenchWordByIndex(wordIndex)
    // Handle if area between english and french box was clicked
    } else {
      return false
    }

    clickedBox = true
    return {
      clickedBox,
      xPosition,
      yPosition,
      wordType,
      word,
    }
  }

  const drawWordBoxes = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
   
    // Draw English vertical lines
    ctx.moveTo(BOX_WIDTH,0)
    ctx.lineTo(BOX_WIDTH,ctx.canvas.height)
    ctx.stroke()

    // Draw French vertical lines
    ctx.moveTo(ctx.canvas.width-BOX_WIDTH,0)
    ctx.lineTo(ctx.canvas.width-BOX_WIDTH,ctx.canvas.height)
    ctx.stroke()

    for(let i=0; i<Object.keys(wordsMapping).length; i++){
      // const englishWord = Object.keys(wordsMapping)[i]
      // const frenchWord = wordsMapping[englishWord]
      const englishWord = getEnglishWordByIndex(i)
      const frenchWord = getFrenchWordByIndex(i)

      // Draw English horizontal line
      const yPosition = WORD_BOX_HEIGHT*(i+1)
      ctx.moveTo(0,yPosition)
      ctx.lineTo(BOX_WIDTH,yPosition)
      ctx.stroke()
      // Set english word
      ctx.fillText(englishWord, BOX_WIDTH/2, yPosition-WORD_BOX_HEIGHT/2);

      // Draw French horizontal line
      ctx.moveTo(ctx.canvas.width-BOX_WIDTH,yPosition)
      ctx.lineTo(ctx.canvas.width,yPosition)
      ctx.stroke()
      // Set french word
      ctx.fillText(frenchWord, ctx.canvas.width-BOX_WIDTH/2, yPosition-WORD_BOX_HEIGHT/2);
    }
  }

  // Active line is the current line where user is drawing and has yet to set end of line.
  // This function draws an active line on the canvas to give the user an idea of how the line will look like.
  const drawActiveLine = (e:MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    var rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (lineStartRef.current) {
      setLineEnd({x,y})
      drawLines()
    }
  }

  const drawLines = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Reset canvas each time to prevent currently drawn line from cluttering the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.strokeStyle = '#d3d3d3'    

    // Draw all lines that are stored in the lines state
    const lines = linesRef.current
    for (let i=0; i<lines.length;i++) {
      const line = lines[i]
      ctx.moveTo(line.startX,line.startY)
      ctx.lineTo(line.endX,line.endY)
      ctx.stroke()
    }

    // Check if there's an active line, if so, draw it on the canvas
    const lineStart = lineStartRef.current
    const lineEnd = lineEndRef.current
    if (lineStart && lineEnd) {
      ctx.moveTo(lineStart.x,lineStart.y)
      ctx.lineTo(lineEnd.x,lineEnd.y)
      ctx.stroke()
    }
    drawWordBoxes()
  }

  // Checks if word has been clicked and sets word
  const checkAndSetWord = (word: string, wordType: WordTypes):boolean => {
    if (
      wordType === WordType.ENGLISH &&
      !isWordSelected(word, WordType.ENGLISH)
    ) {
      setSelectedEnglishWord(word)
    } else if (
      wordType === WordType.FRENCH && 
      !isWordSelected(word, WordType.FRENCH)
    ) {
      setSelectedFrenchWord(word)
    } else {
      // TODO return a meaningful response informing user that word has already been selected
      console.log("word has already been selected")
      return true
    }
    return false
  }

  const handleClick = (e:MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    var rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const lineStart = lineStartRef.current

    // Check if click was within a box containing an english or french word
    const wordBox = hasClickedWordBox(x, y)
    // Dont handle if a box was not clicked
    if (!wordBox) {
      return
    }

    // Check if the word has already been clicked before
    const clickedBefore = checkAndSetWord(wordBox.word, wordBox.wordType)
    if (clickedBefore) {
      return
    }

    // Handle scenario when user just started drawing a line
    if (!lineStart) {
      setLineStart({x: wordBox.xPosition, y: wordBox.yPosition})
      return
    }

    // Handle scenario when user completed drawing a line
    if (lineStart) {
      const currentEnglishWord = selectedEnglishWordRef.current
      const currentFrenchWord = selectedFrenchWordRef.current
      const currentAnswer = answerRef.current

      // Update answer
      if (currentEnglishWord && currentFrenchWord) {
        currentAnswer[currentEnglishWord] = currentFrenchWord
        setAnswer(currentAnswer)
      }

      // Draw newly selected words on canvas
      const currLines = linesRef.current
      currLines.push({
        startX: lineStart.x,
        startY: lineStart.y,
        endX: wordBox.xPosition,
        endY: wordBox.yPosition
      })
      setLines(currLines)
      setLineStart(null)
      drawLines()

      // Reset words state
      setSelectedFrenchWord(null)
      setSelectedEnglishWord(null)
      return
    }
  }

  const reset = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    setLines([])
    setLineStart(null)
    setLineEnd(null)
    setSelectedEnglishWord(null)
    setSelectedFrenchWord(null)
    drawLines()

    // Initialise answer with english words and empty french words
    const initialAnswer:WordMapping = {}
    Object.keys(wordsMapping).map(englishWord => {
      initialAnswer[englishWord] = null
    })
    setAnswer(initialAnswer)
  }
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {  
      reset()
      canvas.addEventListener("mousemove", drawActiveLine, false);
      canvas.addEventListener("mouseup", handleClick, false);
      drawWordBoxes()

      // Unsub event listeners
      return () => {
        canvas.removeEventListener("mousemove", drawActiveLine)
        canvas.removeEventListener("mouseup", handleClick)
      }
    }
  }, [wordsMapping])
  
  return <canvas className="Canvas" width="1000" height={canvasHeight} ref={canvasRef}/>
}

export default Canvas