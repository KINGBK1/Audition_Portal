'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageSquare, Star, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useParticipants } from '../hooks/useParticipants'
import { Group, Participant, GroupStatus } from '../types'

interface GroupModalProps {
  group: Group
  onClose: () => void
  onUpdateGroup: (groupId: number, newStatus: GroupStatus, description: string) => void
}

export function GroupModal({ group, onClose, onUpdateGroup }: GroupModalProps) {
  const { participants } = useParticipants(group.id)
  const [groupDescription, setGroupDescription] = useState('')
  const [participantDescriptions, setParticipantDescriptions] = useState<{ [key: number]: string }>({})
  const [participantRatings, setParticipantRatings] = useState<{ [key: number]: number }>({})
  const [groupStatus, setGroupStatus] = useState<GroupStatus>(group.status)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleGroupUpdate = (newStatus: GroupStatus) => {
    setGroupStatus(newStatus)
  }

  const handleParticipantUpdate = (participantId: number, description: string, rating: number) => {
    setParticipantDescriptions(prev => ({ ...prev, [participantId]: description }))
    setParticipantRatings(prev => ({ ...prev, [participantId]: rating }))
  }

  const handleFinalReview = () => {
    // Prepare data for API request
    const reviewData = {
      groupId: group.id,
      status: groupStatus,
      description: groupDescription,
      participants: participants.map(participant => ({
        id: participant.id,
        description: participantDescriptions[participant.id] || '',
        rating: participantRatings[participant.id] || 0
      }))
    }

    // API call would go here (commented out for now)
    // await submitGroupReviewAPI(reviewData);

    console.log('Review data:', reviewData)
    setShowConfirmation(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="bg-gradient-to-br from-blue-900 to-black bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{group.number} Information</h2>
          <Button variant="ghost" onClick={onClose} className="text-white hover:text-blue-400">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">Participants</h3>
            <p className="text-3xl font-bold text-white">{group.participants}</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">Status</h3>
            <Badge
              className={`${
                groupStatus === 'Qualified' ? 'bg-green-500' :
                groupStatus === 'Reviewed' ? 'bg-yellow-500' :
                'bg-red-500'
              } text-white text-lg`}
            >
              {groupStatus}
            </Badge>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Group Review</h3>
          <div className="flex space-x-2 mb-4">
            <Button onClick={() => handleGroupUpdate('Qualified')} variant={groupStatus === 'Qualified' ? 'default' : 'outline'}>
              Qualify
            </Button>
            <Button onClick={() => handleGroupUpdate('Reviewed')} variant={groupStatus === 'Reviewed' ? 'default' : 'outline'}>
              Mark as Reviewed
            </Button>
            <Button onClick={() => handleGroupUpdate('Rejected')} variant={groupStatus === 'Rejected' ? 'default' : 'outline'}>
              Reject
            </Button>
          </div>
          <Textarea
            placeholder="Add a description for this group..."
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            className="w-full bg-white bg-opacity-10 text-white mb-2"
          />
        </div>

        <h3 className="text-xl font-semibold text-white mb-4">Participant Details</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-blue-300">Name</TableHead>
              <TableHead className="text-blue-300">Email</TableHead>
              <TableHead className="text-blue-300">Rating</TableHead>
              <TableHead className="text-blue-300">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant: Participant) => (
              <TableRow key={participant.id} className="border-b border-blue-800">
                <TableCell className="font-medium text-white">{participant.name}</TableCell>
                <TableCell className="text-white">{participant.email}</TableCell>
                <TableCell>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 cursor-pointer ${
                          (participantRatings[participant.id] || 0) >= star ? 'text-yellow-400 fill-current' : 'text-gray-400'
                        }`}
                        onClick={() => handleParticipantUpdate(
                          participant.id, 
                          participantDescriptions[participant.id] || '', 
                          star
                        )}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Textarea
                    placeholder="Add a description..."
                    value={participantDescriptions[participant.id] || ''}
                    onChange={(e) => handleParticipantUpdate(
                      participant.id, 
                      e.target.value, 
                      participantRatings[participant.id] || 0
                    )}
                    className="w-full bg-white bg-opacity-10 text-white"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleFinalReview} className="bg-green-600 hover:bg-green-700">
            Submit Final Review
          </Button>
        </div>

        <AnimatePresence>
          {showConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-lg p-6 max-w-sm"
              >
                <h3 className="text-xl font-bold mb-4">Review Submitted</h3>
                <p className="mb-4">The team and team members have been successfully reviewed.</p>
                <Button onClick={() => {
                  setShowConfirmation(false)
                  onClose()
                }} className="w-full">
                  <Check className="mr-2 h-4 w-4" /> Close
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

