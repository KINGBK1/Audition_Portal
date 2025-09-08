'use client'

import { useState, useEffect } from 'react'
import { Participant } from '../types'

// Mock data for participants
const mockParticipants: Participant[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', description: 'Experienced developer', rating: 4, tags: ['webd', 'advanced'] },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', description: 'Talented designer', rating: 5, tags: ['gd', 'intermediate'] },
  { id: 3, name: 'Alice Johnson', email: 'alice@example.com', description: 'Security expert', rating: 3, tags: ['cybersec', 'beginner'] },
  { id: 4, name: 'Bob Williams', email: 'bob@example.com', description: 'Mobile app specialist', rating: 2, tags: ['appd', 'intermediate'] },
  { id: 5, name: 'Eva Brown', email: 'eva@example.com', description: 'Full-stack developer', rating: 4, tags: ['ve', 'cp', 'advanced'] },
]

export function useParticipants(groupId: number) {
  const [participants, setParticipants] = useState<Participant[]>([])

  useEffect(() => {
    // Simulating API call
    // const fetchParticipants = async () => {
    //   const response = await fetch(`/api/groups/${groupId}/participants`);
    //   const data = await response.json();
    //   setParticipants(data);
    // }
    // fetchParticipants();

    // Using mock data for now
    setParticipants(mockParticipants)
  }, [groupId])

  const updateParticipant = (updatedParticipant: Partial<Participant>) => {
    setParticipants(participants.map(participant => 
      participant.id === updatedParticipant.id ? { ...participant, ...updatedParticipant } : participant
    ))
    // API call would go here (commented out for now)
    // await updateParticipantAPI(updatedParticipant);
  }

  return { participants, updateParticipant }
}

