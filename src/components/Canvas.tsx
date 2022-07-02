import React, { useRef, useEffect, useState } from 'react'
import './Canvas.css';

type CanvasProps = {
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

const Canvas = (props:CanvasProps) => {
  const { ...rest } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // previousClick is used to track the initial position of the line
  const [previousClick, _setPreviousClick] = useState<null | Position>(null);
  const previousClickRef = useRef(previousClick)
  const setPreviousClick = (position: null | Position) => {
    previousClickRef.current = position
    _setPreviousClick(position);
  }

  // currentPosition is used to plot an active line using the previousClick position on the canvas to guide the user on how the line will look like
  const [currentPosition, _setCurrentPosition] = useState<null | Position>(null);
  const currentPositionRef = useRef(currentPosition)
  const setCurrentPosition = (position: null | Position) => {
    currentPositionRef.current = position
    _setCurrentPosition(position);
  }

  // lines is used to track all the lines that user has drawn
  const [lines, _setLines] = useState<Array<Line>>([]);
  const linesRef = useRef(lines)
  const setLines = (line:Array<Line>) => {
    linesRef.current = line
    _setLines(line);
  }

  const handleMouseMove = (x:number, y:number) => {
    const prevClick = previousClickRef.current

    if (prevClick) {
      setCurrentPosition({x,y})
      drawLines()
    }
  }

  // Check if there's a previousClick, if so setLine and drawLine, if not setPreviousClick
  const handleClick = (x:number, y:number) => {
    const prevClick = previousClickRef.current

    if (!prevClick) {
      setPreviousClick({x,y})
      return
    }

    if (prevClick) {
      const currLines = linesRef.current
      currLines.push({
        startX: prevClick.x,
        startY: prevClick.y,
        endX: x,
        endY: y
      })
      setLines(currLines)
      setPreviousClick(null)
      drawLines()
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
    setPreviousClick(null)
    setCurrentPosition(null)
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
    const prevClick = previousClickRef.current
    const currentPos = currentPositionRef.current
    if (prevClick && currentPos) {
      ctx.moveTo(prevClick.x,prevClick.y)
      ctx.lineTo(currentPos.x,currentPos.y)
      ctx.stroke()
    }
  }
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {  
      canvas.addEventListener("mousemove", function (e) {
        handleMouseMove(e.clientX,e.clientY)
      }, false);

      canvas.addEventListener("mouseup", function (e) {
        console.log('up', e)
        handleClick(e.clientX,e.clientY)
      }, false);

      // Use Mouseout to temporarily reset canvas and states 
      canvas.addEventListener("mouseout", function (e) {
        reset()
      })
    }
  }, [])
  
  return <canvas className="Canvas" ref={canvasRef} {...props}/>
}

export default Canvas