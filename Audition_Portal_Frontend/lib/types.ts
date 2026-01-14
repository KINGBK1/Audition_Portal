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
  description: string
  type: QuestionType
  picture?: string      // corresponds to imageUrl
  text?: string         // add this if needed
  marks?: number        // add this
  correctAnswer?: string
  options?: Option[]
  difficulty?: "easy" | "medium" | "hard"
  createdAt?: string
  updatedAt?: string
  imageUrl?: string
}


// export interface Option {
//   id: string || null    
//   text: string
//   isCorrect: boolean
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

// export interface Question {
//   id: string
//   description: string
//   type: "MCQ" | "Descriptive"
//   picture?: string
//   options?: Option[]
//   createdAt?: string
//   updatedAt?: string
// }
