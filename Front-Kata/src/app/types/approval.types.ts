export interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  requester: User;
  type: ApprovalType;
  status: ApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export type ApprovalType = 'deployment' | 'access' | 'change';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface KPIData {
  pendingApprovals: number;
  totalProcessed: number;
  averageTime: string;
}