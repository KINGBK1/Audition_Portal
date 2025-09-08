'use client'

import { useState, useEffect } from 'react'
import { Group, GroupStatus, Participant } from '../types'

// Mock data for groups
const mockGroups: Group[] = [
  { id: 1, number: 'Group 1', participants: 5, status: 'Reviewed', description: 'This is group 1' },
  { id: 2, number: 'Group 2', participants: 4, status: 'Qualified', description: 'This is group 2' },
  { id: 3, number: 'Group 3', participants: 6, status: 'Rejected', description: 'This is group 3' },
  { id: 4, number: 'Group 4', participants: 5, status: 'Reviewed', description: 'This is group 4' },
  { id: 5, number: 'Group 5', participants: 4, status: 'Qualified', description: 'This is group 5' },
]

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([])

  useEffect(() => {
    // Simulating API call
    // const fetchGroups = async () => {
    //   const response = await fetch('/api/groups');
    //   const data = await response.json();
    //   setGroups(data);
    // }
    // fetchGroups();

    // Using mock data for now
    setGroups(mockGroups)
  }, [])

  const statusCounts = groups.reduce((acc, group) => {
    acc[group.status] = (acc[group.status] || 0) + 1
    return acc
  }, {} as Record<GroupStatus, number>)

  const createGroup = (participants: Participant[]) => {
    const newGroup: Group = {
      id: groups.length + 1,
      number: `Group ${groups.length + 1}`,
      participants: participants.length,
      status: 'Pending',
      description: ''
    }
    setGroups([...groups, newGroup])
    // API call would go here (commented out for now)
    // await createGroupAPI(newGroup);
  }

  const updateGroupStatus = (groupId: number, newStatus: GroupStatus, description: string) => {
    setGroups(groups.map(group => 
      group.id === groupId ? { ...group, status: newStatus, description } : group
    ))
    // API call would go here (commented out for now)
    // await updateGroupAPI(groupId, newStatus, description);
  }

  return { groups, statusCounts, createGroup, updateGroupStatus }
}

