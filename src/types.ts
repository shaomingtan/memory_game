export type WordMapping = {
  [name: string]: null | string
}

export type CanvasProps = {
  wordsMapping: WordMapping
  setAnswer: Function
  answer: WordMapping
}

export type Position = {
  x: number
  y: number
}

export type Line = {
  startX: number
  startY: number
  endX: number
  endY: number
}

export type WordTypes = 'english' | 'french'

export enum WordType {
  ENGLISH= 'english',
  FRENCH= 'french'
}

export type HasClickedBoxResult = false | {
  clickedBox: boolean
  xPosition: number
  yPosition: number
  wordType: WordType
  word: string
}