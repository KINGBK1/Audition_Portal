"use client"

import type React from "react"
import { useEffect, useState } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import {
  Users,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  Search,
  Filter,
  FileText,
  Trophy,
  Calculator,
} from "lucide-react"

// ========= Color Options (Edit hex values as needed) ==========
const COLOR_OPTIONS = [
  { value: "#2f0e0c", label: "Block + Non-genuine" },
  { value: "#5d3712", label: "Genuine + Weak/Some BT" },
  { value: "#322707", label: "Good + Some BT" },
  { value: "#1f2d2c", label: "Very Good + Some BT" },
  { value: "#1e2c17", label: "Excellent + No BT" },
  { value: "#ba772e", label: "GD pass" },
];


// ========= Types for ROUND 2 ==========
interface AuditionRound {
  id: number
  round: number
  finalSelection: boolean | null
  panel: number | null
  reviews?: Array<{
    id: number
    remarks: string
    evaluatedBy: string
    createdAt: string
  }>
}

interface RoundTwoReview {
  id: string
  attendance: boolean
  reviewedBy: string
  taskgiven: string
  clubPrefer: string
  subDomain: string
  hs_place: string
  reviews: string[]
  remarks: string
  rating: number
  gd: boolean
  general: boolean
  forwarded: boolean
  createdAt: string
  updatedAt: string
  colour?: string
}

interface RoundTwo {
  id: string
  taskAlloted: string
  taskLink: string
  status: string
  addOns: string[]
  panel: number
  tags: string[]
  review?: RoundTwoReview | null
  colour?: string
}

interface User {
  id: number
  username: string
  email: string
  contact: string
  gender?: string
  specialization?: string
  round: number
  createdAt: string
  roundTwo?: RoundTwo | null
  auditionRounds?: AuditionRound[]
  colour?: string
}

interface ReviewFormState {
  attendance: string
  taskgiven: string
  clubPrefer: string
  subDomain: string
  hs_place: string
  reviewsText: string
  remarks: string
  rating: string
  gd: string
  general: string
  forwarded: string
  colour?: string
}

export default function AdminRoundTwoDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [statistics, setStatistics] = useState({
    totalAccepted: 0,
    totalRound2: 0,
    totalReviewed: 0,
    totalAttended: 0,
  })

  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewForm, setReviewForm] = useState<ReviewFormState>({
    attendance: "no",
    taskgiven: "",
    clubPrefer: "",
    subDomain: "",
    hs_place: "",
    reviewsText: "",
    remarks: "",
    rating: "",
    gd: "no",
    general: "no",
    forwarded: "no",
  })

  const fetchCandidates = async () => {
    try {
      setIsLoading(true)

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/r2/candidate`, {
        method: "GET",
        credentials: "include",
      })

      if (!res.ok) {
        console.error("Failed to fetch round 2 candidates:", res.status, res.statusText)
        toast({ title: "Error fetching Round 2 candidates", variant: "destructive" })
        setUsers([])
        return
      }

      const json = await res.json()
      const usersData: User[] = Array.isArray(json) ? json : json.data || []
      setUsers(usersData)

      const statsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/r2/statistics`, {
        method: "GET",
        credentials: "include",
      })

      if (statsRes.ok) {
        const statsJson = await statsRes.json()
        const statsData = statsJson.data || {}

        setStatistics({
          totalAccepted: statsData.totalAccepted || 0,
          totalRound2: statsData.totalRound2 || 0,
          totalReviewed: statsData.totalReviewed || 0,
          totalAttended: statsData.totalAttended || 0,
        })
      } else {
        // safe fallback compute local stats if endpoint not provided
        setStatistics({
          totalAccepted: usersData.filter(u => u.round === 3).length,
          totalRound2: usersData.length,
          totalReviewed: usersData.filter(u => !!u.roundTwo?.review).length,
          totalAttended: usersData.filter(u => u.roundTwo?.review?.attendance).length,
        })
      }
    } catch (err) {
      console.error("Fetch error:", err)
      toast({ title: "Error fetching data", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        const review = user.roundTwo?.review
        const round2Audition = user.auditionRounds?.find((r) => r.round === 2)

        switch (filterStatus) {
          case "attended":
            return review?.attendance === true
          case "notAttended":
            return review?.attendance === false || !review
          case "forwarded":
            // forwarded means they were accepted (moved to round 3) OR review.forwarded true
            return (user.round === 3) || (review?.forwarded === true)
          case "notForwarded":
            return review?.forwarded === false || !review
          case "rated":
            return typeof review?.rating === "number"
          default:
            return true
        }
      })
    }

    setFilteredUsers(list)
  }, [users, searchTerm, filterStatus])

  const getEvaluationStatus = (user: User): { evaluated: boolean; accepted: boolean | null } => {
    const round2Audition = user.auditionRounds?.find((r) => r.round === 2)
    if (!round2Audition) return { evaluated: false, accepted: null }

    if (round2Audition.finalSelection !== null) {
      return {
        evaluated: true,
        accepted: round2Audition.finalSelection
      }
    }

    return { evaluated: false, accepted: null }
  }

  const getRatingBadge = (user: User): React.ReactNode => {
    const rating = user.roundTwo?.review?.rating
    if (rating == null) return <Badge variant="outline" className="border-gray-600 text-gray-300">Not Rated</Badge>

    let variant: "default" | "secondary" | "destructive"
    if (rating >= 8) variant = "default"
    else if (rating >= 5) variant = "secondary"
    else variant = "destructive"

    return (
      <div className="flex flex-col items-center gap-1">
        <Badge variant={variant} className="bg-gray-700 text-gray-100 border-gray-600">{rating}/10</Badge>
      </div>
    )
  }

  const getRoundTwoStatusBadge = (user: User): React.ReactNode => {
    const r2 = user.roundTwo
    const review = r2?.review
    const evaluation = getEvaluationStatus(user)

    if (!r2) {
      return <Badge variant="outline" className="border-gray-600 text-gray-300">No Round 2</Badge>
    }

    if (evaluation.evaluated) {
      if (evaluation.accepted) {
        return <Badge className="bg-emerald-600 text-white">Accepted</Badge>
      } else {
        return <Badge variant="destructive" className="bg-red-600 text-white">Rejected</Badge>
      }
    }

    if (!review) {
      return <Badge variant="secondary" className="bg-gray-700 text-gray-200">Pending Review</Badge>
    }

    if (!review.attendance) {
      return <Badge variant="destructive" className="bg-red-600 text-white">Absent</Badge>
    }

    return <Badge variant="secondary" className="bg-gray-700 text-gray-200">Reviewed</Badge>
  }

  const handleAcceptCandidate = async (user: User) => {
    if (!user.roundTwo) {
      toast({ title: "User does not have Round 2 data", variant: "destructive" })
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to ACCEPT ${user.username} and move them to Round 3?`
    )
    if (!confirmed) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/r2/evaluate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          finalSelection: true,
          remarks: "Accepted for Round 3",
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        console.error("Accept error:", res.status, text)
        throw new Error("Failed to accept candidate")
      }

      toast({
        title: "Candidate Accepted",
        description: `${user.username} has been moved to Round 3`,
      })

      await fetchCandidates()
    } catch (err) {
      console.error(err)
      toast({
        title: "Error accepting candidate",
        description: err instanceof Error ? err.message : "Unexpected error",
        variant: "destructive",
      })
    }
  }

  const handleRejectCandidate = async (user: User) => {
    if (!user.roundTwo) {
      toast({ title: "User does not have Round 2 data", variant: "destructive" })
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to REJECT ${user.username}? They will remain in Round 2.`
    )
    if (!confirmed) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/r2/evaluate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          finalSelection: false,
          remarks: "Rejected in Round 2",
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        console.error("Reject error:", res.status, text)
        throw new Error("Failed to reject candidate")
      }

      toast({
        title: "Candidate Rejected",
        description: `${user.username} has been rejected and will remain in Round 2`,
      })

      await fetchCandidates()
    } catch (err) {
      console.error(err)
      toast({
        title: "Error rejecting candidate",
        description: err instanceof Error ? err.message : "Unexpected error",
        variant: "destructive",
      })
    }
  }

  const openReviewDialog = (user: User) => {
    setViewingUser(user)
    const r2 = user.roundTwo
    const review = r2?.review

    setReviewForm({
      attendance: review?.attendance ? "yes" : "no",
      taskgiven: review?.taskgiven || r2?.taskAlloted || "",
      clubPrefer: review?.clubPrefer || "",
      subDomain: review?.subDomain || "",
      hs_place: review?.hs_place || "",
      reviewsText: review?.reviews?.join("\n") || "",
      remarks: review?.remarks || "",
      rating: review?.rating != null ? String(review.rating) : "",
      gd: review?.gd ? "yes" : "no",
      general: review?.general ? "yes" : "no",
      forwarded: review?.forwarded ? "yes" : "no",
      colour: review?.colour || "#898989",
    })

    setIsReviewDialogOpen(true)
  }

  const updateReviewField = (field: keyof ReviewFormState, value: string) => {
    setReviewForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveReview = async () => {
    if (!viewingUser || !viewingUser.roundTwo) {
      toast({ title: "Missing Round 2 data for this user", variant: "destructive" })
      return
    }

    const ratingNumber = Number(reviewForm.rating || "0")
    if (Number.isNaN(ratingNumber) || ratingNumber < 0 || ratingNumber > 10) {
      toast({ title: "Rating must be a number between 0 and 10", variant: "destructive" })
      return
    }

    const payload = {
      userId: viewingUser.id,
      roundTwoId: viewingUser.roundTwo.id,
      attendance: reviewForm.attendance === "yes",
      taskgiven: reviewForm.taskgiven.trim(),
      clubPrefer: reviewForm.clubPrefer.trim(),
      subDomain: reviewForm.subDomain.trim(),
      hs_place: reviewForm.hs_place.trim(),
      reviews: reviewForm.reviewsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      remarks: reviewForm.remarks.trim(),
      rating: ratingNumber,
      gd: reviewForm.gd === "yes",
      general: reviewForm.general === "yes",
      forwarded: reviewForm.forwarded === "yes",
      colour: reviewForm.colour || "#898989",
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/r2/review`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        console.error("Save review error:", res.status, text)
        throw new Error("Failed to save Round 2 review")
      }

      toast({ title: "Round 2 review saved successfully" })
      setIsReviewDialogOpen(false)
      setViewingUser(null)

      // Re-fetch users so UI shows that review exists — only then Accept/Reject will show
      await fetchCandidates()
    } catch (err) {
      console.error(err)
      toast({
        title: "Error saving review",
        description: err instanceof Error ? err.message : "Unexpected error",
        variant: "destructive",
      })
    }
  }

  const panelCounts = Array.from({ length: 6 }, (_, i) => ({
    panel: i + 1,
    count: users.filter((u) => u.roundTwo?.panel === i + 1).length,
  }))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-100 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading Round 2 dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 w-full">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Admin Dashboard – Round 2</h1>
          <p className="text-gray-400 mt-2">
            Review Round 2 tasks, evaluations, and forward candidates for selection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Total in Round 2</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-100">{statistics.totalRound2}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Reviewed</CardTitle>
              <CheckCircle className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-100">{statistics.totalReviewed}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Attended</CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">{statistics.totalAttended}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Accepted to Round 3</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">{statistics.totalAccepted}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-gray-900 border border-gray-800">
            <TabsTrigger value="users" className="data-[state=active]:bg-gray-800 data-[state=active]:text-gray-100 text-gray-400">Round 2 Candidates</TabsTrigger>
            <TabsTrigger value="panels" className="data-[state=active]:bg-gray-800 data-[state=active]:text-gray-100 text-gray-400">Panel Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-100">Round 2 Management</CardTitle>
                <CardDescription className="text-gray-400">Review Round 2 submissions and evaluations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[220px] bg-gray-800 border-gray-700 text-gray-200">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all" className="text-gray-200 focus:bg-gray-700">All Candidates</SelectItem>
                      <SelectItem value="attended" className="text-gray-200 focus:bg-gray-700">Attended</SelectItem>
                      <SelectItem value="notAttended" className="text-gray-200 focus:bg-gray-700">Not Attended / No Review</SelectItem>
                      <SelectItem value="forwarded" className="text-gray-200 focus:bg-gray-700">Forwarded</SelectItem>
                      <SelectItem value="notForwarded" className="text-gray-200 focus:bg-gray-700">Not Forwarded</SelectItem>
                      <SelectItem value="rated" className="text-gray-200 focus:bg-gray-700">Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border border-gray-800">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800 hover:bg-gray-800/50">
                        <TableHead className="text-gray-300">User</TableHead>
                        <TableHead className="text-gray-300">Contact</TableHead>
                        <TableHead className="text-gray-300">Panel</TableHead>
                        <TableHead className="text-gray-300">Rating</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow className="border-gray-800">
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No Round 2 candidates found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => {
                          const evaluation = getEvaluationStatus(user)

                          return (
                            <TableRow key={user.id} className="border-gray-800 hover:bg-gray-800/50">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {user.roundTwo?.review?.colour && (
                                    <div 
                                      className="w-6 h-6 rounded-full border border-gray-600" 
                                      style={{ backgroundColor: user.roundTwo.review.colour }}
                                      title={`Colour: ${user.roundTwo.review.colour}`}
                                    />
                                  )}
                                  <div>
                                    <div className="font-medium text-gray-200">{user.username}</div>
                                    <div className="text-sm text-gray-400">{user.email}</div>
                                  </div>
                                  {evaluation.evaluated && (
                                    <Badge
                                      variant={evaluation.accepted ? "default" : "destructive"}
                                      className={evaluation.accepted ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}
                                    >
                                      {evaluation.accepted ? "✓ Accepted" : "✗ Rejected"}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="text-sm text-gray-200">{user.contact}</div>
                                  <div className="text-sm text-gray-400">{user.gender}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {user.roundTwo ? (
                                  <Badge variant="outline" className="border-gray-600 text-gray-200">Panel {user.roundTwo.panel}</Badge>
                                ) : (
                                  <span className="text-xs text-gray-400">N/A</span>
                                )}
                              </TableCell>
                              <TableCell>{getRatingBadge(user)}</TableCell>
                              <TableCell>{getRoundTwoStatusBadge(user)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {user.roundTwo && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openReviewDialog(user)}
                                        className="flex items-center gap-1 bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                                      >
                                        <FileText className="h-4 w-4" />
                                        Review
                                      </Button>

                                      {/* === show Accept/Reject only AFTER a review exists and user.round === 2 and not evaluated === */}
                                      {user.round === 2 && user.roundTwo.review && !evaluation.evaluated && (
                                        <>
                                          <Button
                                            size="sm"
                                            onClick={() => handleAcceptCandidate(user)}
                                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                          >
                                            <UserCheck className="h-4 w-4" />
                                            Accept
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleRejectCandidate(user)}
                                            className="flex items-center gap-1"
                                          >
                                            <UserX className="h-4 w-4" />
                                            Reject
                                          </Button>
                                        </>
                                      )}
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="panels" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-100">Panel Distribution – Round 2</CardTitle>
                <CardDescription className="text-gray-400">Overview of candidates assigned to each panel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {panelCounts.map((panel) => (
                    <Card key={panel.panel} className="bg-gray-800 border-gray-700">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-200">Panel {panel.panel}</CardTitle>
                        <Trophy className="h-4 w-4 text-gray-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-100">{panel.count}</div>
                        <p className="text-xs text-gray-400">candidates in Round 2</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-100">Panel Members</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }, (_, i) => {
                      const panelNum = i + 1
                      const panelMembers = users.filter((user) => user.roundTwo?.panel === panelNum)

                      return (
                        <Card key={panelNum} className="bg-gray-800 border-gray-700">
                          <CardHeader>
                            <CardTitle className="text-base text-gray-100">
                              Panel {panelNum} ({panelMembers.length} members)
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {panelMembers.length > 0 ? (
                              <ScrollArea className="h-[400px] pr-2">
                                <div className="space-y-1">
                                  {panelMembers.map((user) => {
                                    const rating = user.roundTwo?.review?.rating
                                    const forwarded = user.roundTwo?.review?.forwarded
                                    const colour = user.roundTwo?.review?.colour
                                    return (
                                      <div
                                        key={user.id}
                                        className="flex items-center justify-between px-3 py-2 bg-gray-900 border border-gray-700 rounded hover:bg-gray-800/50 transition-colors"
                                      >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          {colour && (
                                            <div 
                                              className="w-4 h-4 rounded-full border border-gray-600 flex-shrink-0" 
                                              style={{ backgroundColor: colour }}
                                            />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium text-gray-200 truncate">{user.username}</div>
                                            <div className="text-[10px] text-gray-400 truncate">{user.specialization}</div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          {rating != null && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-600 text-gray-200">
                                              {rating}/10
                                            </Badge>
                                          )}
                                          {forwarded && (
                                            <Badge className="text-[9px] px-1.5 py-0 bg-blue-600 text-white">
                                              ✓
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </ScrollArea>
                            ) : (
                              <p className="text-sm text-gray-400">No members assigned yet</p>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] bg-gray-900 border-gray-800 text-gray-100">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-100">
                <Calculator className="h-5 w-5" />
                Round 2 Review – {viewingUser?.username}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Fill in the Round 2 evaluation fields for this candidate.
              </DialogDescription>
            </DialogHeader>

            {viewingUser && viewingUser.roundTwo && (
              <ScrollArea className="h-[420px] w-full pr-2">
                <div className="space-y-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-base text-gray-100">Task Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-gray-300">
                      <p>
                        <span className="font-medium text-gray-200">Task Allotted:</span> {viewingUser.roundTwo.taskAlloted}
                      </p>
                      <div>
                        <span className="font-medium text-gray-200">Task Link:</span>
                        {viewingUser.roundTwo.taskLink ? (
                          <div className="mt-1 space-y-1">
                            {viewingUser.roundTwo.taskLink
                              .split(/[\n,;]/)
                              .map((link) => link.trim())
                              .filter(Boolean)
                              .map((link, index) => (
                                <div key={index}>
                                  <a
                                    href={link.startsWith('http') ? link : `https://${link}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-400 hover:underline break-all text-sm"
                                  >
                                    {link}
                                  </a>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <span> N/A</span>
                        )}
                      </div>
                      <p>
                        <span className="font-medium text-gray-200">Status:</span> {viewingUser.roundTwo.status || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium text-gray-200">Add on task:</span> {viewingUser.roundTwo.review?.taskgiven || "N/A"}
                      </p>
                      {viewingUser.roundTwo.tags?.length > 0 && (
                        <p>
                          <span className="font-medium text-gray-200">Tags:</span>{" "}
                          {viewingUser.roundTwo.tags.join(", ")}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-base text-gray-100">Evaluation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-200">Attendance</Label>
                          <Select
                            value={reviewForm.attendance}
                            onValueChange={(v) => updateReviewField("attendance", v)}
                          >
                            <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-200">
                              <SelectValue placeholder="Select attendance" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="yes" className="text-gray-200 focus:bg-gray-700">Present</SelectItem>
                              <SelectItem value="no" className="text-gray-200 focus:bg-gray-700">Absent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-200">Rating (0–10)</Label>
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            value={reviewForm.rating}
                            onChange={(e) => updateReviewField("rating", e.target.value)}
                            placeholder="e.g. 8"
                            className="bg-gray-900 border-gray-700 text-gray-200 placeholder:text-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-200">GD Round</Label>
                          <Select value={reviewForm.gd} onValueChange={(v) => updateReviewField("gd", v)}>
                            <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-200">
                              <SelectValue placeholder="GD participated?" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="yes" className="text-gray-200 focus:bg-gray-700">Yes</SelectItem>
                              <SelectItem value="no" className="text-gray-200 focus:bg-gray-700">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-200">General Round</Label>
                          <Select
                            value={reviewForm.general}
                            onValueChange={(v) => updateReviewField("general", v)}
                          >
                            <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-200">
                              <SelectValue placeholder="General round?" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="yes" className="text-gray-200 focus:bg-gray-700">Yes</SelectItem>
                              <SelectItem value="no" className="text-gray-200 focus:bg-gray-700">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-200">Preferred Club</Label>
                          <Input
                            value={reviewForm.clubPrefer}
                            onChange={(e) => updateReviewField("clubPrefer", e.target.value)}
                            placeholder="e.g. GLUG, CodeClub..."
                            className="bg-gray-900 border-gray-700 text-gray-200 placeholder:text-gray-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-200">Sub-domain</Label>
                          <Input
                            value={reviewForm.subDomain}
                            onChange={(e) => updateReviewField("subDomain", e.target.value)}
                            placeholder="e.g. Dev, ML, Web, Ops..."
                            className="bg-gray-900 border-gray-700 text-gray-200 placeholder:text-gray-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-200">HS Place</Label>
                          <Input
                            value={reviewForm.hs_place}
                            onChange={(e) => updateReviewField("hs_place", e.target.value)}
                            placeholder="High school / hometown / other"
                            className="bg-gray-900 border-gray-700 text-gray-200 placeholder:text-gray-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-200">Add on task</Label>
                          <Input
                            value={reviewForm.taskgiven}
                            onChange={(e) => updateReviewField("taskgiven", e.target.value)}
                            placeholder="Task title / summary"
                            className="bg-gray-900 border-gray-700 text-gray-200 placeholder:text-gray-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-200">Review Points (one per line)</Label>
                        <Textarea
                          rows={4}
                          value={reviewForm.reviewsText}
                          onChange={(e) => updateReviewField("reviewsText", e.target.value)}
                          placeholder={"Strong fundamentals\nGood communication\nNeeds improvement in Git"}
                          className="bg-gray-900 border-gray-700 text-gray-200 placeholder:text-gray-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-200">Remarks</Label>
                        <Textarea
                          rows={3}
                          value={reviewForm.remarks}
                          onChange={(e) => updateReviewField("remarks", e.target.value)}
                          placeholder="Final thoughts / summary for core team"
                          className="bg-gray-900 border-gray-700 text-gray-200 placeholder:text-gray-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-200">Candidate Colour Tag</Label>
                        <div className="space-y-2">
                          {COLOR_OPTIONS.map((option) => (
                            <div
                              key={option.value}
                              className="flex items-center gap-3 p-2 rounded border border-gray-700 hover:bg-gray-800/50 cursor-pointer transition-colors"
                              onClick={() => updateReviewField("colour", option.value)}
                            >
                              <input
                                type="radio"
                                name="colour"
                                value={option.value}
                                checked={reviewForm.colour === option.value}
                                onChange={(e) => updateReviewField("colour", e.target.value)}
                                className="w-4 h-4 cursor-pointer"
                              />
                              <div
                                className="w-6 h-6 rounded-full border border-gray-600"
                                style={{ backgroundColor: option.value }}
                              />
                              <span className="text-sm text-gray-300">{option.label}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400">Select a colour to categorize the candidate</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">

                        <div className="space-y-2">
                          <Label className="text-gray-200">Forwarded to next tech task</Label>
                          <Select
                            value={reviewForm.forwarded}
                            onValueChange={(v) => updateReviewField("forwarded", v)}
                          >
                            <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-200">
                              <SelectValue placeholder="Forward candidate?" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="yes" className="text-gray-200 focus:bg-gray-700">Yes, forward</SelectItem>
                              <SelectItem value="no" className="text-gray-200 focus:bg-gray-700">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-200">Colour Preview</Label>
                        <div className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded-md">
                          <div 
                            className="w-10 h-10 rounded-full border border-gray-600" 
                            style={{ backgroundColor: reviewForm.colour || "#898989" }}
                          />
                          <div className="text-sm text-gray-300">
                            This colour tab will appear next to the candidate&apos;s name in the table
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)} className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700">
                Cancel
              </Button>
              <Button onClick={handleSaveReview} className="bg-blue-600 hover:bg-blue-700 text-white">Save Review</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
