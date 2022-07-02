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

  // Set previousClick state and ref so that it can accessed by the various event listeners
  const [previousClick, _setPreviousClick] = useState<null | Position>(null);
  const previousClickRef = useRef(previousClick)
  const setPreviousClick = (position: null | Position) => {
    previousClickRef.current = position
    _setPreviousClick(position);
  }

  // Set previousClick state and ref so that it can accessed by the various event listeners
  const [lines, _setLines] = useState<Array<Line>>([]);
  const linesRef = useRef(lines)
  const setLines = (line:Array<Line>) => {
    linesRef.current = line
    _setLines(line);
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
      // console.log("setting line", prevClick.x,prevClick.y,x,y)
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

  const drawLines = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return


    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    const lines = linesRef.current
    for (let i=0; i<lines.length;i++) {
      const line = lines[i]
      ctx.moveTo(line.startX,line.startY)
      ctx.lineTo(line.endX,line.endY)
      ctx.stroke()
    }
  }
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {      
      // Register mouse events
      // canvas.addEventListener("mousemove", function (e) {
      // }, false);

      canvas.addEventListener("mouseup", function (e) {
        console.log('up', e)
        handleClick(e.clientX,e.clientY)
      }, false);
    }
  }, [])
  
  return <canvas className="Canvas" ref={canvasRef} {...props}/>
}

export default Canvas