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

    // This handles the case when a user just started drawing a line. Store the line start position
    if (!lineStart) {
      setLineStart({x,y})
      return
    }

    // This handles the case when a user completed drawing a line. Store the newly completed line and draw the lines on the canvas
    if (lineStart) {
      const currLines = linesRef.current
      currLines.push({
        startX: lineStart.x,
        startY: lineStart.y,
        endX: x,
        endY: y
      })
      setLines(currLines)
      setLineStart(null)
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
    setLineStart(null)
    setLineEnd(null)
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
        reset()
      })
    }
  }, [])
  
  return <canvas className="Canvas" ref={canvasRef} {...props}/>
}

export default Canvas