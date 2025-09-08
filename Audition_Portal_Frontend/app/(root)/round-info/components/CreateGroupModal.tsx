'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Search, Plus, Tag } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Participant, ParticipantTag } from '../types'

interface CreateGroupModalProps {
  onClose: () => void
  onCreateGroup: (participants: Participant[]) => void
}

// Mock data for all participants
const allParticipants: Participant[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', tags: ['webd', 'advanced'], description: '', rating: 0},
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', tags: ['gd', 'intermediate'], description: '', rating: 0 },
  { id: 3, name: 'Alice Johnson', email: 'alice@example.com', tags: ['cybersec', 'beginner'], description: '', rating: 0 },
  { id: 4, name: 'Bob Williams', email: 'bob@example.com', tags: ['appd', 'intermediate'], description: '', rating: 0 },
  { id: 5, name: 'Eva Brown', email: 'eva@example.com', tags: ['ve', 'cp', 'advanced'], description: '', rating: 0 },
]

const allTags: ParticipantTag[] = ['gd', 've', 'cybersec', 'webd', 'appd', 'cp', 'beginner', 'intermediate', 'advanced']

export function CreateGroupModal({ onClose, onCreateGroup }: CreateGroupModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<ParticipantTag[]>([])
  const [selectedParticipants, setSelectedParticipants] = useState<Participant[]>([])

  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>(allParticipants)

  useEffect(() => {
    const filtered = allParticipants.filter(participant => 
      (participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       participant.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedTags.length === 0 || selectedTags.some(tag => participant.tags.includes(tag)))
    )
    setFilteredParticipants(filtered)
  }, [searchTerm, selectedTags])

  const handleAddParticipant = (participant: Participant) => {
    if (!selectedParticipants.some(p => p.id === participant.id)) {
      setSelectedParticipants([...selectedParticipants, participant])
    }
  }

  const handleRemoveParticipant = (participantId: number) => {
    setSelectedParticipants(selectedParticipants.filter(p => p.id !== participantId))
  }

  const handleCreateGroup = () => {
    onCreateGroup(selectedParticipants)
    onClose()
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
          <h2 className="text-2xl font-bold text-white">Create New Group</h2>
          <Button variant="ghost" onClick={onClose} className="text-white hover:text-blue-400">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Search className="text-blue-400 mr-2" />
            <Input
              type="text"
              placeholder="Search participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-white border-blue-500 focus:border-blue-400"
            />
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <Tag className="text-blue-400 mr-2" />
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedTags(
                  selectedTags.includes(tag)
                    ? selectedTags.filter(t => t !== tag)
                    : [...selectedTags, tag]
                )}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Available Participants</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-blue-300">Name</TableHead>
                  <TableHead className="text-blue-300">Email</TableHead>
                  <TableHead className="text-blue-300">Tags</TableHead>
                  <TableHead className="text-blue-300">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.map((participant) => (
                  <TableRow key={participant.id} className="border-b border-blue-800">
                    <TableCell className="font-medium text-white">{participant.name}</TableCell>
                    <TableCell className="text-white">{participant.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {participant.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleAddParticipant(participant)}
                        disabled={selectedParticipants.some(p => p.id === participant.id)}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Selected Participants</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-blue-300">Name</TableHead>
                  <TableHead className="text-blue-300">Email</TableHead>
                  <TableHead className="text-blue-300">Tags</TableHead>
                  <TableHead className="text-blue-300">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedParticipants.map((participant) => (
                  <TableRow key={participant.id} className="border-b border-blue-800">
                    <TableCell className="font-medium text-white">{participant.name}</TableCell>
                    <TableCell className="text-white">{participant.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {participant.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveParticipant(participant.id)}
                      >
                        <X className="mr-2 h-4 w-4" /> Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleCreateGroup} disabled={selectedParticipants.length === 0}>
            Create Group
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

