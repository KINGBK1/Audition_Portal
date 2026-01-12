export enum QuestionType {
  MCQ = "MCQ",
  Descriptive = "Descriptive",
  Pictorial = "Pictorial",
}

export interface MCQOption {
  id: string
  text: string
  isCorrect: boolean
}

// export interface Question {
//   id: string
//   type: QuestionType
//   text: string
//   imageUrl?: string
//   options?: MCQOption[]
//   correctAnswer?: string
//   marks: number
//   difficulty: string
// }

// export interface Option {
//   id: number
//   text: string
//   isCorrect: boolean
//   questionId: number
// }

export interface QuestionWithOptions {
  id: number
  type: QuestionType
  description: string
  options: Option[]
  picture: string | null
  createdAt: string
  updatedAt: string
}

export interface Option {
  id?: string
  text: string
  isCorrect: boolean
}

export interface Question {
  id: string
  description: string
  text?: string
  type: "MCQ" | "Descriptive" | "Pictorial"
  picture?: string
  imageUrl?: string
  options?: Option[]
  marks?: number
  difficulty?: string
  correctAnswer?: string
  createdAt?: string
  updatedAt?: string
}
