"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, X, ImageIcon, Save, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import type { Question, Option } from "@/lib/types" 
import { QuestionType } from "@/lib/types"

interface QuestionFormProps {
  onSubmit: (question: Question) => void
  initialData?: Question | null
}

export function QuestionForm({ onSubmit, initialData }: QuestionFormProps) {
  const [description, setDescription] = useState("")
  const [type, setType] = useState<QuestionType>(QuestionType.MCQ);
  const [picture, setPicture] = useState("")
  const [options, setOptions] = useState<Option[]>([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setType(initialData.type);
      setPicture(initialData.picture || "");
      if (initialData.options && initialData.options.length > 0) {
        setOptions(initialData.options);
      }
    }
  }, [initialData]);



  const addOption = () => {
    setOptions([...options, { text: "", isCorrect: false }])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, field: keyof Option, value: string | boolean) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) return

    setIsSubmitting(true)

    try {
      const question: Question = {
        id: initialData?.id || "",
        description: description.trim(),
        type,
        picture: picture.trim() || undefined,
        options: type === QuestionType.MCQ ? options.filter(opt => opt.text.trim()) : undefined,
      };

      await onSubmit(question)

      toast.success(
        initialData
          ? "Question has been updated successfully."
          : "Question has been created successfully."
      )

      // Reset form if not editing
      if (!initialData) {
        setDescription("")
        setPicture("")
        setOptions([
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ])
      }
    } catch (error) {
      toast.error("Failed to save question. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Question Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Question Type</Label>
        <Select
          value={type}
          onValueChange={(value: QuestionType) => setType(value)}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={QuestionType.MCQ}>Multiple Choice (MCQ)</SelectItem>
            <SelectItem value={QuestionType.Descriptive}>Text Answer</SelectItem>
            <SelectItem value={QuestionType.Pictorial}>Pictorial</SelectItem>
          </SelectContent>
        </Select>


      </div>

      {/* Question Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Question</Label>
        <Textarea
          id="description"
          placeholder="Enter your question here..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px]"
          required
          disabled={isSubmitting}
        />
      </div>

      {/* Picture URL */}
      <div className="space-y-2">
        <Label htmlFor="picture" className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Picture URL (Optional)
        </Label>
        <Input
          id="picture"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={picture}
          onChange={(e) => setPicture(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {/* MCQ Options */}
      <AnimatePresence>
        {type === "MCQ" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <Label>Answer Options</Label>
              <Badge variant="outline" className="text-xs">
                Select correct answers
              </Badge>
            </div>

            <div className="space-y-3">
              {options.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`p-3 ${option.isCorrect ? "ring-2 ring-green-500 bg-green-50" : ""}`}>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={option.isCorrect}
                        onCheckedChange={(checked) => updateOption(index, "isCorrect", checked as boolean)}
                        className="mt-1"
                        disabled={isSubmitting}
                      />
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option.text}
                        onChange={(e) => updateOption(index, "text", e.target.value)}
                        className="flex-1"
                        required
                        disabled={isSubmitting}
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="text-red-600 hover:text-red-700"
                          disabled={isSubmitting}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addOption}
              className="w-full flex items-center gap-2 bg-transparent"
              disabled={isSubmitting}
            >
              <Plus className="w-4 h-4" />
              Add Option
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button type="submit" className="flex items-center gap-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {initialData ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {initialData ? "Update Question" : "Create Question"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
