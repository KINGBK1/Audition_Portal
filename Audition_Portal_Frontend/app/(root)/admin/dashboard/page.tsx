'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { selectAuthState } from '@/lib/store/features/auth/authSlice'
import { ChevronRight, Users, ClipboardList, FileText, Award, LogOut, User } from 'lucide-react'

const AdminDashboard = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { userInfo } = useAppSelector(selectAuthState)

  const rounds = [
    {
      id: 1,
      title: 'Round 1',
      description: 'Quiz + Meet Round',
      icon: ClipboardList,
      path: '/admin/dashboard/round1',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Round 2',
      description: 'Tech Task Round',
      icon: FileText,
      path: '/admin/dashboard/round2',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      title: 'Round 3',
      description: 'Group Discussion Round',
      icon: Users,
      path: '/admin/dashboard/round3',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 4,
      title: 'Round 4',
      description: 'Personal Interview Round',
      icon: Award,
      path: '/admin/dashboard/round4',
      color: 'from-green-500 to-emerald-500'
    }
  ]

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      })
      
      if (response.ok) {
        router.push('/')
      }
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">Manage audition rounds</p>
          </div>
          
          <Popover>
            <PopoverTrigger>
              <Avatar className="hover:ring-2 ring-slate-700 transition-all w-12 h-12 cursor-pointer">
                <AvatarImage src={userInfo?.picture || undefined} alt="Admin" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {userInfo?.username?.charAt(0).toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
            </PopoverTrigger>

            <PopoverContent className="w-64 bg-slate-900 border-slate-800">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={userInfo?.picture || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {userInfo?.username?.charAt(0).toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-slate-400">Admin</p>
                    <p className="text-sm font-semibold text-white truncate">
                      {userInfo?.username || 'Admin User'}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  className="justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                  onClick={() => router.push('/admin/profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </Button>
                
                <Button
                  variant="ghost"
                  className="justify-start text-red-400 hover:text-red-300 hover:bg-red-950/50"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-88px)]">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Audition Rounds</h2>
          <p className="text-slate-400">Select a round to manage candidates and evaluations</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Button
            onClick={() => router.push('/admin/round1/questions')}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-cyan-500/50"
          >
            <ClipboardList className="w-5 h-5 mr-2" />
            Manage Round 1 Questions
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl">
          {rounds.map((round) => {
            const Icon = round.icon
            return (
              <Card
                key={round.id}
                className="group relative overflow-hidden bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => router.push(round.path)}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${round.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <CardHeader className="relative">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${round.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <CardTitle className="text-xl text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                    {round.title}
                  </CardTitle>
                  
                  <CardDescription className="text-slate-400 text-sm">
                    {round.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Manage Round</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard