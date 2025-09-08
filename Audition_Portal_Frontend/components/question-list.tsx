"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { Question } from "@/lib/types"
import { Edit, Trash2, ImageIcon, CheckCircle, XCircle } from "lucide-react"
import { motion } from "framer-motion"

interface QuestionListProps {
  questions: Question[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  loading?: boolean
}

export function QuestionList({ questions, onEdit, onDelete, loading }: QuestionListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
        <p className="text-gray-500 mb-4">Get started by creating your first question.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={question.type === "MCQ" ? "default" : "secondary"}>{question.type}</Badge>
                    {question.picture && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        Image
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg leading-tight">{question.description}</CardTitle>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(question.id)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Question</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this question? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(question.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>

            {question.type === "MCQ" && question.options && question.options.length > 0 && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-3">Options:</p>
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`flex items-center gap-2 p-2 rounded-md border ${
                        option.isCorrect ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      {option.isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm">{option.text}</span>
                      {option.isCorrect && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Correct
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
