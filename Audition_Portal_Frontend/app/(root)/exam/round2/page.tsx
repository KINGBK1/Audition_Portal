'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaGithub } from 'react-icons/fa'
import { HiPlus, HiCheck, HiExclamation, HiClock, HiX } from 'react-icons/hi'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2 } from 'lucide-react'

export default function Round2() {
  const router = useRouter()
  const [status, setStatus] = useState('incomplete')
  const [addOns, setAddOns] = useState<string[]>([])
  const [newAddOn, setNewAddOn] = useState('')
  const [taskLink, setTaskLink] = useState('')
  const [taskAlloted, setTaskAlloted] = useState('')
  const [panel, setPanel] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isNewEntry, setIsNewEntry] = useState(true)
  
  const fetchUser = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`, {
        method: "GET",
        credentials: "include"
      })
      const user = await res.json()

      if (!user.hasGivenExam || user.round < 2) {
        router.push("/dashboard")
        return
      }

      // Set panel from user data for display purposes
      setPanel(user.panel !== null && user.panel !== undefined ? user.panel : null)

      // Fetch existing Round 2 data if available
      const round2Res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/round2`, {
        method: "GET",
        credentials: "include"
      })
      
      if (round2Res.ok) {
        const round2Data = await round2Res.json()
        if (round2Data.entry) {
          setTaskLink(round2Data.entry.taskLink || '')
          setTaskAlloted(round2Data.entry.taskAlloted || '')
          setStatus(round2Data.entry.status || 'incomplete')
          setAddOns(round2Data.entry.addOns || [])
          setIsNewEntry(false) // User has existing entry
        } else {
          setIsNewEntry(true) // New entry
        }
      }
    } catch (e) {
      toast.error('Failed to fetch user data, please refresh.', {
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid #ef4444',
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { 
    fetchUser()
  }, [])

  const handleAddMore = () => {
    if (newAddOn.trim()) {
      setAddOns([...addOns, newAddOn.trim()])
      setNewAddOn('')
      toast.success('Add-on added successfully', {
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid #10b981',
        },
        icon: '✅',
      })
    }
  }

  const handleRemoveAddOn = (index: number) => {
    setAddOns(addOns.filter((_, i) => i !== index))
    toast.success('Add-on removed', {
      style: {
        background: '#1e293b',
        color: '#f1f5f9',
        border: '1px solid #6b7280',
      },
    })
  }

  const handleSubmit = async () => {
    // Validation
    if (!taskLink.trim()) {
      toast.error('Please enter a GitHub/Drive link', {
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid #ef4444',
        },
        icon: '⚠️',
      })
      return
    }

    if (!taskAlloted.trim()) {
      toast.error('Please describe your task', {
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid #ef4444',
        },
        icon: '⚠️',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Build request body
      const requestBody: any = {
        taskLink,
        taskAlloted,
        status,
        addOns,
      }

      // Only send panel if it's a new entry (first time submission)
      if (isNewEntry && panel !== null) {
        requestBody.panel = panel
      }
      // If it's an update, don't send panel - backend will fetch from existing roundTwo entry

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/round2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to submit Round 2', {
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #ef4444',
          },
          icon: '❌',
        })
        return
      }

      // Success toast with custom component
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-slate-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-green-500/50`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-lg font-semibold text-white flex items-center gap-2">
                  Submission Successful! 🎉
                </p>
                <div className="mt-2 text-sm text-slate-300 space-y-1">
                  <p>✓ Task link saved</p>
                  <p>✓ Description submitted</p>
                  <p>✓ Status: <span className="capitalize font-semibold text-green-400">{status}</span></p>
                  {addOns.length > 0 && (
                    <p>✓ {addOns.length} additional feature{addOns.length !== 1 ? 's' : ''} added</p>
                  )}
                  <p className="mt-3 text-xs text-slate-400 animate-pulse">
                    🔄 Redirecting to dashboard in 3 seconds...
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex border-l border-slate-700">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-white focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
        position: 'top-center',
      })

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    } catch (error) {
      console.error('Submission error:', error)
      toast.error('An error occurred while submitting. Please try again.', {
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid #ef4444',
        },
        icon: '🔥',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
          },
        }}
      />
      <div className="min-h-screen w-full bg-slate-950 overflow-hidden relative">
        {/* Background gradient effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 md:px-8 pt-24 pb-12 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2"
            >
              Round 2
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-3xl md:text-5xl font-bold text-white"
            >
              Tech Review
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-slate-400 mt-4"
            >
              Submit your work and showcase your skills
            </motion.p>
            {panel !== null && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="mt-4 inline-block"
              >
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 text-sm font-semibold">
                  Panel: {panel}
                </Badge>
              </motion.div>
            )}
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Task Link Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <Card className="dark bg-slate-900/80 border-slate-800 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <FaGithub className="text-2xl" />
                    Drive/Github Link
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Paste your project repository or drive link
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      value={taskLink}
                      onChange={(e) => setTaskLink(e.target.value)}
                      placeholder="https://github.com/username/repo or https://drive.google.com/..."
                      className="dark bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (taskLink.trim()) {
                          toast.success('Link format is valid', {
                            style: {
                              background: '#1e293b',
                              color: '#f1f5f9',
                              border: '1px solid #10b981',
                            },
                            icon: '✓',
                          })
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Validate
                    </Button>
                  </div>
                  {taskLink && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-sm text-green-400"
                    >
                      <HiCheck className="text-lg" />
                      <span>Link added successfully</span>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Task Description Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="dark bg-slate-900/80 border-slate-800 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white">Task Description</CardTitle>
                  <CardDescription className="text-slate-400">
                    Describe what you worked on
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={taskAlloted}
                    onChange={(e) => setTaskAlloted(e.target.value)}
                    className="dark bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[200px] resize-none"
                    placeholder="Describe your task in detail..."
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="dark bg-slate-900/80 border-slate-800 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white">Task Status</CardTitle>
                  <CardDescription className="text-slate-400">
                    Select your current progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { value: 'done', label: 'Done', icon: HiCheck, color: 'green' },
                    { value: 'partially done', label: 'Partially Done', icon: HiClock, color: 'yellow' },
                    { value: 'incomplete', label: 'Incomplete', icon: HiExclamation, color: 'red' },
                  ].map((option) => {
                    const Icon = option.icon
                    const isSelected = status === option.value
                    return (
                      <button
                        key={option.value}
                        onClick={() => setStatus(option.value)}
                        className={`w-full p-3 rounded-lg flex items-center justify-between transition-all duration-200 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span className="font-medium">{option.label}</span>
                        {isSelected && <Icon className="text-xl" />}
                      </button>
                    )
                  })}

                  {/* Status Indicator */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`mt-4 p-4 rounded-lg flex items-center justify-center gap-2 font-medium ${
                      status === 'done'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : status === 'partially done'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {status === 'done' && <HiCheck className="text-xl" />}
                    {status === 'partially done' && <HiClock className="text-xl" />}
                    {status === 'incomplete' && <HiExclamation className="text-xl" />}
                    <span className="capitalize">{status}</span>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Add-ons Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-8"
          >
            <Card className="dark bg-slate-900/80 border-slate-800 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">Additional Features</CardTitle>
                <CardDescription className="text-slate-400">
                  Add any extra features or improvements you implemented
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newAddOn}
                    onChange={(e) => setNewAddOn(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddMore()}
                    placeholder="Enter an add-on feature"
                    className="dark bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                  <Button
                    onClick={handleAddMore}
                    className="bg-blue-600 hover:bg-blue-700 px-6"
                  >
                    <HiPlus className="mr-2" /> Add
                  </Button>
                </div>

                {/* Add-ons List */}
                <AnimatePresence>
                  {addOns.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <p className="text-sm text-slate-400 mb-2">
                        {addOns.length} feature{addOns.length !== 1 ? 's' : ''} added
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {addOns.map((addOn, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            <Badge
                              variant="secondary"
                              className="bg-slate-800 text-slate-200 hover:bg-slate-700 pr-1 text-sm py-2"
                            >
                              <span className="mr-2">{addOn}</span>
                              <button
                                onClick={() => handleRemoveAddOn(index)}
                                className="hover:bg-red-500/20 rounded-full p-1 transition-colors"
                              >
                                <HiX className="text-red-400" />
                              </button>
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex justify-center"
          >
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !taskLink.trim() || !taskAlloted.trim()}
              className="px-12 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-blue-500/50 hover:scale-105"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Round 2'
              )}
            </Button>
          </motion.div>
        </div>

        <style jsx>{`
          @keyframes blob {
            0%, 100% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .animate-enter {
            animation: enter 0.3s ease-out;
          }
          .animate-leave {
            animation: leave 0.3s ease-in forwards;
          }
          @keyframes enter {
            0% {
              opacity: 0;
              transform: translateY(-10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes leave {
            0% {
              opacity: 1;
              transform: translateY(0);
            }
            100% {
              opacity: 0;
              transform: translateY(-10px);
            }
          }
        `}</style>
      </div>
    </>
  )
}

