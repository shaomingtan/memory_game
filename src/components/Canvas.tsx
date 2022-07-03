import React, { useRef, useEffect, useState } from 'react'
import './Canvas.css';

const WORD_HEIGHT = 50
const BOX_WIDTH = 200

type WordMapping = {
  [name: string]: null | string
}

type CanvasProps = {
  wordsMapping: WordMapping
}

type Position = {
  x: number
  y: number
}

type Line = {
  startX: number
  startY: number
  endX: number
  endY: number
}

enum WordType {
  ENGLISH= 'english',
  FRENCH= 'french'
}

type HasClickedBoxResult = false | {
  clickedBox: boolean
  xPosition: number
  yPosition: number
  wordType: WordType
  wordIndex: number
}

const Canvas = (props:CanvasProps) => {
  const { wordsMapping, ...rest } = props
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

  const [_selectedWordPairings, _setSelectedWordPairings] = useState<WordMapping>({});
  const selectedWordPairingsRef = useRef(_selectedWordPairings)
  const setSelectedWordPairings = (wordPairing: WordMapping) => {
    selectedWordPairingsRef.current = wordPairing
    _setSelectedWordPairings(wordPairing);
  }

  const canvasHeight = Object.keys(wordsMapping).length * WORD_HEIGHT

  const getEnglishWordByIndex = (index:number) => {
    return Object.keys(wordsMapping)[index]
  }

  const getFrenchWordByIndex = (index:number) => {
    return Object.values(wordsMapping)[index]
  }

  // Check if mouse click is within a box region and returns the identifier of the box
  const hasClickedBox = (x:number, y:number):HasClickedBoxResult => {
    const canvas = canvasRef.current
    if (!canvas) return false

    const ctx = canvas.getContext('2d')
    if (!ctx) return false
    
    let xPosition
    let yPosition
    let wordType
    let wordIndex
    let clickedBox
    // Check if a box has been clicked and identify it
    if (x <= BOX_WIDTH) {
      xPosition = BOX_WIDTH
      wordType = WordType.ENGLISH
    } else if (x >= ctx.canvas.width - BOX_WIDTH) {
      xPosition = ctx.canvas.width - BOX_WIDTH
      wordType = WordType.FRENCH
    } else {
      return false
    }

    wordIndex = Math.floor(y/WORD_HEIGHT)
    yPosition = wordIndex*WORD_HEIGHT+WORD_HEIGHT/2
    clickedBox = true
    return {
      clickedBox,
      xPosition,
      yPosition,
      wordType,
      wordIndex,
    }
  }

  const drawWordBoxes = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
   
    // Draw left side vertical lines
    ctx.moveTo(BOX_WIDTH,0)
    ctx.lineTo(BOX_WIDTH,ctx.canvas.height)
    ctx.stroke()

    // Draw right side vertical lines
    ctx.moveTo(ctx.canvas.width-BOX_WIDTH,0)
    ctx.lineTo(ctx.canvas.width-BOX_WIDTH,ctx.canvas.height)
    ctx.stroke()

    for(let i=0; i<Object.keys(wordsMapping).length; i++){
      const englishWord = Object.keys(wordsMapping)[i]
      const frenchWord = wordsMapping[englishWord]

      // Draw left side horizontal lines
      const yPosition = WORD_HEIGHT*(i+1)
      ctx.moveTo(0,yPosition)
      ctx.lineTo(BOX_WIDTH,yPosition)
      ctx.stroke()
      // Set english word
      ctx.fillText(englishWord, BOX_WIDTH/2, yPosition-WORD_HEIGHT/2);

      // Draw right side horizontal lines
      ctx.moveTo(ctx.canvas.width-BOX_WIDTH,yPosition)
      ctx.lineTo(ctx.canvas.width,yPosition)
      ctx.stroke()
      // Set french word
      if (!frenchWord) {
        throw new Error("French word missing")
      }
      ctx.fillText(frenchWord, ctx.canvas.width-BOX_WIDTH/2, yPosition-WORD_HEIGHT/2);
    }
  }

  // Active line is the current line where user is drawing and has yet to set the line end.
  // This function draws an active line on the canvas to give the user an idea of how the line looks like.
  const drawActiveLine = (x:number, y:number) => {
    if (lineStartRef.current) {
      setLineEnd({x,y})
      drawLines()
    }
  }

  const handleClick = (x:number, y:number) => {
    const lineStart = lineStartRef.current

    const clickedBoxResult = hasClickedBox(x, y)
    // Dont handle if a box was not clicked
    if (!clickedBoxResult) {
      return
    }

    // This handles the case when a user just started drawing a line. Store the line start position
    if (!lineStart) {
      if (clickedBoxResult.wordType === WordType.ENGLISH) {
        setSelectedEnglishWord(getEnglishWordByIndex(clickedBoxResult.wordIndex))
      } else if (clickedBoxResult.wordType === WordType.FRENCH) {
        setSelectedFrenchWord(getFrenchWordByIndex(clickedBoxResult.wordIndex))
      }
      setLineStart({x: clickedBoxResult.xPosition, y: clickedBoxResult.yPosition})
      return
    }

    // This handles the case when a user completed drawing a line. Store the newly completed line and draw the lines on the canvas
    if (lineStart) {
      // Validation: Handle scenario where user selected 2 english words
      if (selectedEnglishWordRef.current && clickedBoxResult.wordType === WordType.ENGLISH) {
        // TODO Show some meaningful prompt to the user that they should select a french word next
        return
      }

      // Validation: Handle scenario where user selected 2 french words
      if (selectedFrenchWordRef.current && clickedBoxResult.wordType === WordType.FRENCH) {
        // TODO Show some meaningful prompt to the user that they should select an english word next
        return
      }

      // Get current selected english and french word
      let currentEnglishWord
      let currentFrenchWord
      if (clickedBoxResult.wordType === WordType.FRENCH) {
        currentEnglishWord = selectedEnglishWordRef.current
        currentFrenchWord = getFrenchWordByIndex(clickedBoxResult.wordIndex)
      } else {
        currentEnglishWord = getEnglishWordByIndex(clickedBoxResult.wordIndex)
        currentFrenchWord = selectedFrenchWordRef.current
      }

      const currentWordPairings = selectedWordPairingsRef.current
      if (currentEnglishWord && currentFrenchWord) {
        // Validation: Handle scenario where selected english word has already been paired with another french word
        if (currentWordPairings[currentEnglishWord] !== null) {
          // TODO return a meaningful prompt to user
          return
        }

        // Validation: Handle scenario where selected french word has already been paired with another english word
        if (Object.values(currentWordPairings).includes(currentFrenchWord)) {
          // TODO return a meaningful prompt to user
          return
        }
        currentWordPairings[currentEnglishWord] = currentFrenchWord
        setSelectedWordPairings(currentWordPairings)
      }

      // Draw pairing on canvas
      const currLines = linesRef.current
      currLines.push({
        startX: lineStart.x,
        startY: lineStart.y,
        endX: clickedBoxResult.xPosition,
        endY: clickedBoxResult.yPosition
      })
      setLines(currLines)
      setLineStart(null)
      drawLines()
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
    drawLines()
  }

  const drawLines = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Reset canvas each time to prevent active line from cluttering the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.beginPath()

    // Draw all lines that are stored in the lines state
    const lines = linesRef.current
    for (let i=0; i<lines.length;i++) {
      const line = lines[i]
      ctx.moveTo(line.startX,line.startY)
      ctx.lineTo(line.endX,line.endY)
      ctx.stroke()
    }

    // Check if there's an active line, if so, draw on the canvas
    const lineStart = lineStartRef.current
    const lineEnd = lineEndRef.current
    if (lineStart && lineEnd) {
      ctx.moveTo(lineStart.x,lineStart.y)
      ctx.lineTo(lineEnd.x,lineEnd.y)
      ctx.stroke()
    }
    drawWordBoxes()
  }
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {  
      canvas.addEventListener("mousemove", function (e) {
        drawActiveLine(e.clientX,e.clientY)
      }, false);

      canvas.addEventListener("mouseup", function (e) {
        console.log('up', e)
        handleClick(e.clientX,e.clientY)
      }, false);

      // Use Mouseout to temporarily reset canvas and states 
      canvas.addEventListener("mouseout", function (e) {
        // reset()
      })
      
      const initialSelectedWordPairings:WordMapping = {}
      Object.keys(wordsMapping).map(englishWord => {
        initialSelectedWordPairings[englishWord] = null
      })
      console.log("initialSelectedWordPairings", initialSelectedWordPairings)
      setSelectedWordPairings(initialSelectedWordPairings)
      drawWordBoxes()
    }
  }, [])
  
  return <canvas className="Canvas" width="1000" height={canvasHeight} ref={canvasRef} {...props}/>
}

export default Canvas