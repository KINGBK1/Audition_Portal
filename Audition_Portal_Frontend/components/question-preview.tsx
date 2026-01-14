import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { type Question, QuestionType , Option } from "@/lib/types"

interface QuestionPreviewProps {
  question: Question
}

export function QuestionPreview({ question }: QuestionPreviewProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="p-6 border-2 border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="font-normal">
            {question.type === QuestionType.MCQ
              ? "Multiple Choice"
              : question.type === QuestionType.Descriptive
                ? "Descriptive"
                : "Pictorial"}
          </Badge>
          <Badge className={`${getDifficultyColor(question.difficulty || "easy")} border-0`}>
            {(question.difficulty || "easy").charAt(0).toUpperCase() + (question.difficulty || "easy").slice(1)}
          </Badge>
        </div>
        <Badge variant="secondary">
          {question.marks} {question.marks === 1 ? "Mark" : "Marks"}
        </Badge>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Question:</h3>
        <p className="text-gray-700">{question.text}</p>
      </div>

      {question.imageUrl && (
        <div className="mb-6">
          <img
            src={question.imageUrl || "/placeholder.svg"}
            alt="Question image"
            className="max-h-60 object-contain mx-auto border rounded-md p-2"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg?height=200&width=300"
            }}
          />
        </div>
      )}

      {question.type === QuestionType.MCQ && question.options && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Options:</h3>
          <RadioGroup
            defaultValue={
              question.options.find((o) => o.isCorrect)?.id || question.options[0]?.id || ""
            }
          >
            {question.options.map((option) => (
              <div key={option.id} className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50">
                <RadioGroupItem value={option.id || ""} id={`preview-${option.id}`} />
                <Label htmlFor={`preview-${option.id}`} className="cursor-pointer">
                  {option.text}
                </Label>
                {option.isCorrect && (
                  <Badge className="ml-auto bg-green-100 text-green-800 border-0">Correct Answer</Badge>
                )}
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {question.type === QuestionType.Descriptive && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Answer:</h3>
          <Textarea placeholder="Type your answer here..." className="min-h-[120px]" disabled />
          {question.correctAnswer && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md border">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Model Answer (for reference):</h4>
              <p className="text-gray-700">{question.correctAnswer}</p>
            </div>
          )}
        </div>
      )}

      {question.type === QuestionType.Pictorial && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Answer:</h3>
          <Textarea placeholder="Describe what you see in the image..." className="min-h-[120px]" disabled />
        </div>
      )}
    </Card>
  )
}
