'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaGithub } from 'react-icons/fa'
import { HiPlus, HiCheck, HiExclamation, HiClock } from 'react-icons/hi'
import { Navbar } from '../../../../components/Navbar'
import { Footer } from '../../../../components/Footer'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'


import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from '@/components/ui/use-toast'

export default function Round2() {
  const router = useRouter();
  const [status, setStatus] = useState('incomplete')
  const [addOns, setAddOns] = useState<string[]>([])
  const [newAddOn, setNewAddOn] = useState('')
  const [taskLink, setTaskLink] = useState('')
  const [taskAlloted, setTaskAlloted] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const fetchUser = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
        {
          method: "GET",
          credentials: "include"
        })
      const user = await res.json()

      if (!user.hasGivenExam || user.round < 2) {
        router.push("/dashboard")
      }
    } catch (e) {
      toast({
        variant: "destructive",
        description: "Failed to fetch user data, please refresh.",
      })
    }
  }

  useEffect(() => { 
    fetchUser()
  }, [])

  const handleAddMore = () => {
    if (newAddOn.trim()) {
      setAddOns([...addOns, newAddOn.trim()])
      setNewAddOn('')
    }
  }

  const handleRemoveAddOn = (index: number) => {
    setAddOns(addOns.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    // Validation
    if (!taskLink.trim()) {
      toast({
        variant: "destructive",
        description: "Please enter a GitHub/Drive link",
      })
      return
    }

    if (!taskAlloted.trim()) {
      toast({
        variant: "destructive",
        description: "Please describe your task",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/round2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          taskLink,
          taskAlloted,
          status,
          addOns,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          variant: "destructive",
          description: data.error || "Failed to submit Round 2",
        })
        return
      }

      toast({
        description: "Round 2 submission saved successfully!",
      })

      // Reset form
      setTaskLink('')
      setTaskAlloted('')
      setAddOns([])
      setStatus('incomplete')
      setNewAddOn('')
    } catch (error) {
      console.error('Submission error:', error)
      toast({
        variant: "destructive",
        description: "An error occurred while submitting",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 to-black overflow-hidden relative">
      <Navbar />

      {/* Gradient Circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-8 pt-24 pb-12"
      >
        <header className="flex flex-col items-center justify-center mb-12 relative">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2"
          >
            Round 2
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-5xl font-bold text-white relative z-10"
          >
            Tech Review
          </motion.h1>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"
          ></motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-2">
            <motion.div
              whileHover={{ boxShadow: '0 0 15px #4299e1' }}
              className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-400 border-opacity-70"
            >
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <FaGithub className="mr-2" /> Drive/Github Link
              </h2>
              <div className="flex items-center bg-white bg-opacity-30 rounded-lg overflow-hidden">
                <input
                  type="text"
                  value={taskLink}
                  onChange={(e) => setTaskLink(e.target.value)}
                  placeholder="Enter your Drive or Github link"
                  className="flex-grow bg-transparent text-white placeholder-white placeholder-opacity-70 px-4 py-2 focus:outline-none"
                />
                <button 
                  type="button"
                  onClick={() => {
                    if (taskLink.trim()) {
                      toast({
                        description: "Link added",
                      })
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors duration-200"
                >
                  Add
                </button>
              </div>
              {taskLink && (
                <p className="text-sm text-green-400 mt-2">✓ Link added: {taskLink}</p>
              )}
            </motion.div>
          </div>

          <motion.div
            whileHover={{ boxShadow: '0 0 15px #4299e1' }}
            className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-400 border-opacity-70"
          >
            <h2 className="text-2xl font-semibold text-white mb-4">Task Allotted</h2>
            <textarea
              value={taskAlloted}
              onChange={(e) => setTaskAlloted(e.target.value)}
              className="w-full h-32 bg-white bg-opacity-30 rounded-lg p-2 text-white placeholder-white placeholder-opacity-70 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your task here..."
            />
          </motion.div>

          <motion.div
            whileHover={{ boxShadow: '0 0 15px #4299e1' }}
            className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-400 border-opacity-70"
          >
            <h2 className="text-2xl font-semibold text-white mb-4">Add-ons</h2>
            <div className="space-y-2">
              <input
                type="text"
                value={newAddOn}
                onChange={(e) => setNewAddOn(e.target.value)}
                placeholder="Enter any add-ons"
                className="w-full bg-white bg-opacity-30 rounded-lg px-4 py-2 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddMore}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
              >
                <HiPlus className="mr-2" /> Add More
              </button>
            </div>
            {addOns.length > 0 && (
              <ul className="mt-4 space-y-2">
                {addOns.map((addOn, index) => (
                  <li key={index} className="text-white bg-white bg-opacity-30 rounded-lg px-4 py-2 flex items-center justify-between">
                    <span>{addOn}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAddOn(index)}
                      className="text-red-400 hover:text-red-600 ml-2"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          <motion.div
            whileHover={{ boxShadow: '0 0 15px #4299e1' }}
            className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-400 border-opacity-70"
          >
            <h2 className="text-2xl font-semibold text-white mb-4">Status</h2>
            <div className="space-y-2">
              {['done', 'partially done', 'incomplete'].map((option) => (
                <button
                  key={option}
                  onClick={() => setStatus(option)}
                  className={`w-full py-2 px-4 rounded-lg flex items-center justify-between ${status === option
                      ? 'bg-blue-600 text-white'
                      : 'bg-white bg-opacity-30 text-white'
                    } hover:bg-blue-500 hover:text-white transition-colors duration-200`}
                >
                  <span className="capitalize">{option}</span>
                  {status === option && <HiCheck className="text-xl" />}
                </button>
              ))}
            </div>
            <div className={`mt-4 p-3 rounded-lg flex items-center justify-center text-white ${status === 'done' ? 'bg-green-500' :
                status === 'partially done' ? 'bg-yellow-500' :
                  'bg-red-500'
              }`}>
              {status === 'done' && <HiCheck className="mr-2 text-xl" />}
              {status === 'partially done' && <HiClock className="mr-2 text-xl" />}
              {status === 'incomplete' && <HiExclamation className="mr-2 text-xl" />}
              <span className="capitalize">{status}</span>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 text-center">
          <motion.button
            onClick={handleSubmit}
            disabled={isSubmitting}
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px #4299e1' }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg border border-blue-400 border-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </motion.button>
        </div>
      </motion.div>

      <Footer />

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
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
      `}</style>
    </div>
  )
}

