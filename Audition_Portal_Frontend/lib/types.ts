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

export interface Question {
  id: string
  type: QuestionType
  text: string
  marks: number
  difficulty: "easy" | "medium" | "hard"

  imageUrl?: string | null
  options?: Option[]
  correctAnswer?: string
}

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
  type: "MCQ" | "Descriptive"
  picture?: string
  options?: Option[]
  createdAt?: string
  updatedAt?: string
}
