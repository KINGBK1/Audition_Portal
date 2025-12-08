"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import {
  Users,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  Shuffle,
  Eye,
  XCircle,
  Search,
  Filter,
  FileText,
  Trophy,
  Calculator,
} from "lucide-react"
import { useRouter } from "next/navigation"

// Types
interface QuestionOption {
  id: number
  text: string
  isCorrect: boolean
}

export interface Question {
  id: number
  type: string
  description: string
  picture?: string | null
  options: QuestionOption[]
}

interface Answer {
  questionId: number
  optionId?: number
  description?: string
  option?: QuestionOption
  question?: Question
}

interface AuditionRound {
  id: number
  round: number
  finalSelection: boolean | null
  panel?: number
  reviews?: any[]
}

interface User {
  id: number
  username: string
  email: string
  contact: string
  gender?: string
  specialization?: string
  hasGivenExam: boolean
  createdAt: string
  auditionRounds?: AuditionRound[]
  roundTwo?: { panel: number; status: string } | null
}

interface UserScore {
  userId: number
  correct: number
  total: number
  percentage: number
}

export default function AdminDashboard() {
  // State
  const [users, setUsers] = useState<User[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [userScores, setUserScores] = useState<UserScore[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [viewingResponses, setViewingResponses] = useState<Answer[]>([])
  const [isResponsesDialogOpen, setIsResponsesDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedPanel, setSelectedPanel] = useState<string>("")
  const [loadingScores, setLoadingScores] = useState<number[]>([])
  const router = useRouter()

  // Verify that user is admin or not:
//   useEffect(() => {
//   const verifyAdmin = async () => {
//     try {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify-admin`, {
//         method: "GET",
//         credentials: "include"
//       })
      
//       if (!res.ok || res.status === 403) {
//         router.push('/dashboard')
//       }
//     } catch (e) {
//       router.push('/dashboard')
//     }
//   }
  
//   verifyAdmin()
// }, [router])



  // Fetch initial data
useEffect(() => {
  async function fetchData() {
    try {
      const [usersRes, questionsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/r1/candidate`, {
          method: "GET",
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz`, {
          method: "GET",
          credentials: "include",
        }),
      ]);

      if (!usersRes.ok) {
        console.error("Failed to fetch users:", usersRes.status, usersRes.statusText);
        toast({ title: "Unauthorized: Please log in again", variant: "destructive" });
        setUsers([]);
        return;
      }

      if (!questionsRes.ok) {
        console.error("Failed to fetch questions:", questionsRes.status, questionsRes.statusText);
        toast({ title: "Error fetching questions", variant: "destructive" });
        setQuestions([]);
        return;
      }

      const usersJson = await usersRes.json();
      const questionsJson = await questionsRes.json();

      const usersData: User[] = Array.isArray(usersJson)
        ? usersJson
        : (usersJson.data || []);

      const questionsData: Question[] = Array.isArray(questionsJson)
        ? questionsJson
        : (questionsJson.data || []);

      setUsers(usersData);
      setQuestions(questionsData);

      const examTakenUsers = usersData.filter((u) => u.hasGivenExam);
      if (examTakenUsers.length > 0) {
        calculateAllScores(examTakenUsers, questionsData);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast({ title: "Error fetching data", variant: "destructive" });
    }
  }

  fetchData();
}, []);


  // Calculate scores for all users who have taken the exam
  const calculateAllScores = async (examUsers: User[], questionsData: Question[]) => {
    const scores: UserScore[] = []

    for (const user of examUsers) {
      try {
        setLoadingScores((prev) => [...prev, user.id])
        const score = await calculateUserScore(user.id, questionsData)
        scores.push(score)
      } catch (error) {
        console.error(`Error calculating score for user ${user.id}:`, error)
      } finally {
        setLoadingScores((prev) => prev.filter((id) => id !== user.id))
      }
    }

    setUserScores(scores)
  }

  const calculateUserScore = async (userId: number, questionsData: Question[]): Promise<UserScore> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/r1/responses/${userId}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const json = await res.json();
    const answers: Answer[] = json.data;

    const answerMap = new Map<number, Answer>();
    for (const ans of answers) {
      answerMap.set(ans.questionId, ans);
    }

    const mcqQuestions = questionsData.filter(
      (q) => q.type === "MCQ" || q.type === "Pictorial"
    );
    const total = mcqQuestions.length;

    let correct = 0;

    for (const question of mcqQuestions) {
      const userAnswer = answerMap.get(question.id);
      if (!userAnswer || !userAnswer.optionId) continue;

      const correctOption = question.options.find((o) => o.isCorrect);
      if (correctOption && userAnswer.optionId === correctOption.id) {
        correct++;
      }
    }

    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      userId,
      correct,
      total,
      percentage,
    };
  } catch (error) {
    console.error(`Error fetching responses for user ${userId}:`, error);
    const total = questionsData.filter(
      (q) => q.type === "MCQ" || q.type === "Pictorial"
    ).length;

    return {
      userId,
      correct: 0,
      total,
      percentage: 0,
    };
  }
};


  // Filter logic
  useEffect(() => {
    let list = [...users]

    if (searchTerm) {
      list = list.filter(
        (u) =>
          u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.specialization?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterStatus !== "all") {
      list = list.filter((user) => {
        const round1 = user.auditionRounds?.find((r) => r.round === 1)
        switch (filterStatus) {
          case "pending":
            return user.hasGivenExam && (!round1 || round1.finalSelection === null)
          case "qualified":
            return round1?.finalSelection === true
          case "rejected":
            return round1?.finalSelection === false
          case "assigned":
            return !!user.roundTwo
          default:
            return true
        }
      })
    }

    setFilteredUsers(list)
  }, [users, searchTerm, filterStatus])

  // Get score badge for a user
  const getScoreBadge = (userId: number): React.ReactNode => {
    const user = users.find((u) => u.id === userId)
    if (!user || !user.hasGivenExam) {
      return <Badge variant="outline">Not Taken</Badge>
    }

    if (loadingScores.includes(userId)) {
      return <Badge variant="secondary">Calculating...</Badge>
    }

    const userScore = userScores.find((s) => s.userId === userId)
    if (!userScore) {
      return <Badge variant="secondary">Loading...</Badge>
    }

    const { correct, total, percentage } = userScore
    const variant = percentage >= 70 ? "default" : percentage >= 50 ? "secondary" : "destructive"

    return (
      <div className="flex flex-col items-center gap-1">
        <Badge variant={variant}>{percentage}%</Badge>
        <span className="text-xs text-muted-foreground">
          {correct}/{total}
        </span>
      </div>
    )
  }

  // Get status badge for a user
  const getStatusBadge = (user: User): React.ReactNode => {
    if (!user.hasGivenExam) {
      return <Badge variant="outline">Not Taken</Badge>
    }

    // Check if user has any audition rounds
    const round1 = user.auditionRounds?.find((r) => r.round === 1)

    if (!round1) {
      // If user has given exam but no audition round exists, they're pending review
      return <Badge variant="secondary">Pending Review</Badge>
    }

    if (round1.finalSelection === null) {
      return <Badge variant="secondary">Pending Review</Badge>
    }

    if (round1.finalSelection === true) {
      if (user.roundTwo) {
        return <Badge variant="default">Panel {user.roundTwo.panel}</Badge>
      }
      return <Badge variant="default">Qualified</Badge>
    }

    if (round1.finalSelection === false) {
      return <Badge variant="destructive">Rejected</Badge>
    }

    return <Badge variant="secondary">Pending Review</Badge>
  }

  // Open response dialog and fetch answers
  const handleViewResponses = async (user: User) => {
    setViewingUser(user)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/r1/responses/${user.id}`, {
        method: "GET",
        credentials: "include",
      })
      const json = await res.json()
      setViewingResponses(json.data)
      setIsResponsesDialogOpen(true)
    } catch {
      toast({ title: "Error fetching responses", variant: "destructive" })
    }
  }

// Submit evaluation via API, fetching admin info first
  const submitEvaluation = async (auditionRoundId: number, panel: number | null, finalSelection: boolean) => {
    try {
      // Fetch current admin user to get email
      const adminRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
        { method: "GET", credentials: "include" }
      );
      if (!adminRes.ok) {
        const errorText = await adminRes.text();
        console.error("Failed to fetch admin user:", errorText);
        throw new Error("Could not retrieve admin user");
      }
      const adminJson = await adminRes.json();
      const adminEmail: string = adminJson.email;

      // Submit evaluation
      const evalRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/r1/evaluate`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auditionRoundId, panel, finalSelection, remarks: finalSelection ? "Selected" : "Rejected", evaluatedBy: adminEmail }),
        }
      );
      const evalBody = await evalRes.text();
      if (!evalRes.ok) {
        console.error("Evaluation API error:", evalRes.status, evalBody);
        throw new Error(`Evaluation failed: ${evalRes.status}`);
      }

      // Refresh users
      const updatedRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/r1/candidate`,
        { method: "GET", credentials: "include" }
      );
      if (!updatedRes.ok) {
        console.error("Failed to refresh users:", await updatedRes.text());
      } else {
        const updated: User[] = await updatedRes.json();
        setUsers(updated);
      }
      toast({ title: "Evaluation submitted successfully" });
    } catch (err) {
      console.error(err);
      toast({ title: `Error: ${err instanceof Error ? err.message : "Submitting evaluation"}`, variant: "destructive" });
    }
  };

  // Handle random assignment with equal distribution
  const handleRandomAssignment = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> => {
    event.preventDefault()

    try {
      // Get all qualified users who haven't been assigned a panel yet
      const qualifiedUsers = users.filter(
        (user) => user.auditionRounds?.some((r) => r.round === 1 && r.finalSelection === true) && !user.roundTwo,
      )

      if (qualifiedUsers.length === 0) {
        toast({ title: "No qualified users to assign", variant: "destructive" })
        return
      }

      // Calculate current panel counts
      const panelCounts = Array.from({ length: 6 }, (_, i) => ({
        panel: i + 1,
        count: users.filter((u) => u.roundTwo?.panel === i + 1).length,
      }))

      // Shuffle the qualified users for random assignment
      const shuffledUsers = [...qualifiedUsers].sort(() => Math.random() - 0.5)

      // Assign users to panels with equal distribution
      for (let i = 0; i < shuffledUsers.length; i++) {
        const user = shuffledUsers[i]

        // Find the panel with the minimum count
        const minCount = Math.min(...panelCounts.map((p) => p.count))
        const availablePanels = panelCounts.filter((p) => p.count === minCount)

        // Randomly select from panels with minimum count
        const selectedPanel = availablePanels[Math.floor(Math.random() * availablePanels.length)]

        // Submit assignment
        const auditionRound = user.auditionRounds?.find((r) => r.round === 1)
        if (auditionRound) {
          await submitEvaluation(auditionRound.id, selectedPanel.panel, true)
        }

        // Update local count
        const panelIndex = panelCounts.findIndex((p) => p.panel === selectedPanel.panel)
        panelCounts[panelIndex].count++
      }

      toast({
        title: "Random assignment completed",
        description: `Assigned ${shuffledUsers.length} users across panels with equal distribution`,
      })
    } catch (error) {
      console.error("Random assignment error:", error)
      toast({ title: "Error during random assignment", variant: "destructive" })
    }
  }

  // Handle manual panel assignment
  const handleAssignPanel = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> => {
    event.preventDefault()

    if (!selectedUser || !selectedPanel) {
      toast({ title: "Please select a user and a panel", variant: "destructive" })
      return
    }

    try {
      const auditionRound = selectedUser.auditionRounds?.find((r) => r.round === 1)

      if (!auditionRound) {
        // Create evaluation for user without existing audition round
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/r1/evaluate`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: selectedUser.id,
            panel: Number.parseInt(selectedPanel, 10),
            finalSelection: true,
            remarks: "Selected",
            evaluatedBy: "admin@domain.com",
          }),
        })
      } else {
        await submitEvaluation(auditionRound.id, Number.parseInt(selectedPanel, 10), true)
      }

      setIsAssignDialogOpen(false)
      setSelectedUser(null)
      setSelectedPanel("")

      toast({ title: `Successfully assigned to Panel ${selectedPanel}` })
    } catch {
      toast({ title: "Error assigning panel", variant: "destructive" })
    }
  }

  // Handle user rejection
  const handleRejectUser = async (userId: number): Promise<void> => {
    try {
      const user = users.find((u) => u.id === userId)
      if (!user) {
        toast({ title: "User not found", variant: "destructive" })
        return
      }

      const auditionRound = user.auditionRounds?.find((r) => r.round === 1)

      // If no audition round exists, create one first
      if (!auditionRound) {
        // You might need to create an audition round first via API
        // For now, we'll assume the API handles this
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/r1/evaluate`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            panel: null,
            finalSelection: false,
            remarks: "Rejected",
            evaluatedBy: "admin@domain.com",
          }),
        })
      } else {
        await submitEvaluation(auditionRound.id, null, false)
      }

      toast({ title: "User rejected successfully" })
    } catch {
      toast({ title: "Error rejecting user", variant: "destructive" })
    }
  }

  // Statistics calculations
  const totalRegistered = users.length
  const hasGivenExam = users.filter((u) => u.hasGivenExam).length
  const pendingReview = users.filter(
    (u) =>
      u.hasGivenExam &&
      (!u.auditionRounds?.some((r) => r.round === 1) ||
        u.auditionRounds?.some((r) => r.round === 1 && r.finalSelection === null)),
  ).length
  const qualifiedRound2 = users.filter((u) =>
    u.auditionRounds?.some((r) => r.round === 1 && r.finalSelection === true),
  ).length
  const rejected = users.filter((u) =>
    u.auditionRounds?.some((r) => r.round === 1 && r.finalSelection === false),
  ).length

  // Calculate panel counts for panels 1-6
  const panelCounts = Array.from({ length: 6 }, (_, i) => ({
    panel: i + 1,
    count: users.filter((u) => u.roundTwo?.panel === i + 1).length,
  }))

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage quiz participants and panel assignments</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registered</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRegistered}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exam Taken</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hasGivenExam}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingReview}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{qualifiedRound2}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejected}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="panels">Panel Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Filters and Actions */}
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Review quiz responses and manage participants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="assigned">Panel Assigned</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={handleRandomAssignment} className="flex items-center gap-2">
                    <Shuffle className="h-4 w-4" />
                    Random Assignment
                  </Button>
                </div>

                {/* Users Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.username}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm">{user.contact}</div>
                              <div className="text-sm text-muted-foreground">{user.gender}</div>
                            </div>
                          </TableCell>
                          <TableCell>{user.specialization}</TableCell>
                          <TableCell>{getScoreBadge(user.id)}</TableCell>
                          <TableCell>{getStatusBadge(user)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {user.hasGivenExam && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewResponses(user)}
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="h-4 w-4" />
                                  View
                                </Button>
                              )}

                              {/* Show Accept/Reject buttons for users who have taken exam and are pending review */}
                              {user.hasGivenExam &&
                                (!user.auditionRounds?.some((round) => round.round === 1) ||
                                  user.auditionRounds?.some(
                                    (round) => round.round === 1 && round.finalSelection === null,
                                  )) && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => {
                                        setSelectedUser(user)
                                        setIsAssignDialogOpen(true)
                                      }}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Accept
                                    </Button>

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="destructive">
                                          <XCircle className="h-4 w-4 mr-1" />
                                          Reject
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Reject User</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to reject {user.username}? This action cannot be
                                            undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleRejectUser(user.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Reject
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="panels" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Panel Distribution</CardTitle>
                <CardDescription>Overview of candidates assigned to each panel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {panelCounts.map((panel) => (
                    <Card key={panel.panel}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Panel {panel.panel}</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{panel.count}</div>
                        <p className="text-xs text-muted-foreground">candidates assigned</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Panel Members</h3>
                  {Array.from({ length: 6 }, (_, i) => {
                    const panelNum = i + 1
                    const panelMembers = users.filter((user) => user.roundTwo?.panel === panelNum)

                    return (
                      <Card key={panelNum}>
                        <CardHeader>
                          <CardTitle className="text-base">
                            Panel {panelNum} ({panelMembers.length} members)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {panelMembers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {panelMembers.map((user) => {
                                const userScore = userScores.find((s) => s.userId === user.id)
                                return (
                                  <div
                                    key={user.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                                  >
                                    <div className="flex-1">
                                      <div className="text-sm font-medium">{user.username}</div>
                                      <div className="text-xs text-muted-foreground">{user.specialization}</div>
                                    </div>
                                    {userScore && (
                                      <Badge variant="outline" className="ml-2">
                                        {userScore.percentage}%
                                      </Badge>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No members assigned yet</p>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Panel Assignment Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Panel</DialogTitle>
              <DialogDescription>Select a panel for {selectedUser?.username} in Round 2</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="panel" className="text-right">
                  Panel
                </Label>
                <Select value={selectedPanel} onValueChange={setSelectedPanel}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select panel (1-6)" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 6 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Panel {i + 1} ({panelCounts[i].count} members)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignPanel}>Assign Panel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Quiz Responses Dialog */}
        <Dialog open={isResponsesDialogOpen} onOpenChange={setIsResponsesDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Quiz Responses - {viewingUser?.username}
              </DialogTitle>
              <DialogDescription>
                Review the user&apos;s quiz responses and performance before making a decision
              </DialogDescription>
            </DialogHeader>

            {viewingUser && (
              <div className="space-y-4">
                {/* Score Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Performance Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Overall Score</p>
                        <div className="text-2xl font-bold">{getScoreBadge(viewingUser.id)}</div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Submitted</p>
                        <p className="text-sm font-medium">{new Date(viewingUser.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Questions and Answers */}
                <ScrollArea className="h-[400px] w-full">
                  <div className="space-y-6 pr-4">
                    {questions.map((question, index) => {
                      const userAnswer = viewingResponses.find((answer) => answer.questionId === question.id)
                      const isCorrect =
                        question.type === "MCQ" || question.type === "Pictorial"
                          ? question.options.find((opt) => opt.id === userAnswer?.optionId)?.isCorrect
                          : null

                      return (
                        <Card key={question.id}>
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Q{index + 1}</span>
                              <Badge variant="outline">{question.type}</Badge>
                              {isCorrect !== null && (
                                <Badge variant={isCorrect ? "default" : "destructive"}>
                                  {isCorrect ? "Correct" : "Incorrect"}
                                </Badge>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              {question.picture && (
                                <div className="mb-4">
                                  <Image
                                    src={question.picture || "/placeholder.svg"}
                                    alt="Question diagram"
                                    width={384}
                                    height={288}
                                    className="max-w-sm rounded border"
                                  />
                                </div>
                              )}
                              
                            </div>

                            {question.type === "MCQ" || question.type === "Pictorial" ? (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Options:</p>
                                {question.options.map((option) => (
                                  <div
                                    key={option.id}
                                    className={`p-2 rounded border ${
                                      option.id === userAnswer?.optionId
                                        ? option.isCorrect
                                          ? "bg-green-50 border-green-200"
                                          : "bg-red-50 border-red-200"
                                        : option.isCorrect
                                          ? "bg-green-50 border-green-200"
                                          : "bg-gray-50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-4 h-4 rounded-full border-2 ${
                                          option.id === userAnswer?.optionId
                                            ? "bg-blue-500 border-blue-500"
                                            : "border-gray-300"
                                        }`}
                                      />
                                      <span className={option.isCorrect ? "font-medium" : ""}>{option.text}</span>
                                      {option.isCorrect && (
                                        <Badge variant="default" className="ml-auto">
                                          Correct Answer
                                        </Badge>
                                      )}
                                      {option.id === userAnswer?.optionId && !option.isCorrect && (
                                        <Badge variant="destructive" className="ml-auto">
                                          User&apos;s Choice
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">User&apos;s Answer:</p>
                                <div className="p-3 bg-gray-50 rounded border">
                                  <p className="text-sm">{userAnswer?.description || "No answer provided"}</p>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </ScrollArea>

                {/* Action Buttons */}
                {viewingUser.auditionRounds?.some((round) => round.round === 1 && round.finalSelection === null) && (
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleRejectUser(viewingUser.id)
                        setIsResponsesDialogOpen(false)
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject User
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedUser(viewingUser)
                        setIsResponsesDialogOpen(false)
                        setIsAssignDialogOpen(true)
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept & Assign Panel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
