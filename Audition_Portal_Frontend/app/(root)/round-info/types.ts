export type GroupStatus = 'Qualified' | 'Reviewed' | 'Rejected' | 'Pending';

export type Group = {
  id: number;
  number: string;
  participants: number;
  status: GroupStatus;
  description: string;
}

export type ParticipantTag = 'gd' | 've' | 'cybersec' | 'webd' | 'appd' | 'cp' | 'beginner' | 'intermediate' | 'advanced';

export type Participant = {
  id: number;
  name: string;
  email: string;
  description: string;
  rating: number;
  tags: ParticipantTag[];
}

