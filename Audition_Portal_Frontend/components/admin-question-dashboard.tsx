"use client"

import { useState, useEffect } from "react"
import { QuestionForm } from "./question-form"
import { QuestionList } from "./question-list"
import dynamic from "next/dynamic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Question } from "@/lib/types"
import { motion } from "framer-motion"
import { Settings, Plus, List, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// ✅ Fix hydration error by loading ThemeToggle only on client
const ThemeToggle = dynamic(() => import("./theme-toggle").then(mod => ({ default: mod.ThemeToggle })), {
  ssr: false,
})

export function AdminQuestionDashboard() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("list")

  // ✅ Ensure component is mounted before rendering theme toggle
  useEffect(() => {
    setMounted(true)
  }, [])

  // ✅ Fetch all questions
  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:8080/api/quiz", {
        method: "GET",
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch questions")
      }
      const data = await response.json()
      setQuestions(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch questions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  // ✅ Create or Update question
  const handleAddQuestion = async (question: Question) => {
    try {
      // Check if we're editing an existing question
      const isEditing = currentQuestion && currentQuestion.id;
      
      if (isEditing) {
        // Delete the old question first
        const deleteResponse = await fetch(`http://localhost:8080/api/quiz/${currentQuestion.id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!deleteResponse.ok) {
          throw new Error("Failed to delete old question");
        }
      }

      // Create the new/updated question
      const response = await fetch("http://localhost:8080/api/quiz/create", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.description,
          options: question.options,
          type: question.type,
          picture: question.picture,
        }),
      })

      if (!response.ok) {
        throw new Error(isEditing ? "Failed to update question" : "Failed to create question")
      }

      await fetchQuestions()
      setCurrentQuestion(null)
      setActiveTab("list")
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save question")
    }
  }

  // ✅ Set question to edit and switch to create tab
  const handleEditQuestion = (id: string) => {
    const questionToEdit = questions.find((q) => q.id === id)
    if (questionToEdit) {
      setCurrentQuestion(questionToEdit)
      setActiveTab("create")
    }
  }

  // ✅ Delete question
  const handleDeleteQuestion = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/quiz/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete question")
      }

      await fetchQuestions()
      if (currentQuestion?.id === id) {
        setCurrentQuestion(null)
      }
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete question")
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Settings className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Question Management</h1>
                <p className="text-muted-foreground">Create, manage, and organize your quiz questions</p>
              </div>
            </div>
            {mounted && <ThemeToggle />}
          </div>
          <Separator className="mt-4" />
        </motion.div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <List className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{questions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MCQ Questions</CardTitle>
              <Badge variant="secondary">MCQ</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{questions.filter((q) => q.type === "MCQ").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Text Questions</CardTitle>
              <Badge variant="outline">TEXT</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{questions.filter((q) => q.type === "Descriptive").length}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {currentQuestion ? "Edit Question" : "Create Question"}
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Question List
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{currentQuestion ? "Edit Question" : "Create New Question"}</CardTitle>
                  <CardDescription>
                    {currentQuestion 
                      ? "Make changes to the existing question below."
                      : "Add a new question to your quiz database. Choose between multiple choice or text-based questions."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QuestionForm onSubmit={handleAddQuestion} initialData={currentQuestion} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="list" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Questions</CardTitle>
                  <CardDescription>
                    Manage your existing questions. Edit, delete, or review questions in your database.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QuestionList
                    questions={questions}
                    onEdit={handleEditQuestion}
                    onDelete={handleDeleteQuestion}
                    loading={loading}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
