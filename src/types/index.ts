export type NodeType = 'draft' | 'business_confirm' | 'legal_review' | 'finance_review' | 'stamp' | 'archive' | 'condition'

export type ContractStatus = 'draft' | 'in_review' | 'approved' | 'rejected' | 'stamped' | 'archived'

export type ApprovalAction = 'approve' | 'reject' | 'add_signer' | 'return_modify'

export interface WorkflowNode {
  id: string
  workflowId: string
  type: NodeType
  name: string
  assigneeRole: string
  timeLimit: number
  requiredMaterials: string[]
  order: number
  position: { x: number; y: number }
}

export interface ConditionBranch {
  id: string
  workflowId: string
  fromNodeId: string
  condition: string
  toNodeId: string
  priority: number
}

export interface Workflow {
  id: string
  name: string
  description: string
  version: string
  isActive: boolean
  createdBy: string
  createdAt: string
  nodes: WorkflowNode[]
  branches: ConditionBranch[]
}

export interface Contract {
  id: string
  title: string
  workflowId: string
  templateId: string
  initiatorId: string
  initiatorName: string
  department: string
  amount: number
  status: ContractStatus
  currentNodeId: string
  currentNodeName: string
  createdAt: string
  updatedAt: string
  archivedAt?: string
}

export interface ApprovalRecord {
  id: string
  contractId: string
  nodeId: string
  nodeName: string
  approverId: string
  approverName: string
  action: ApprovalAction
  opinion: string
  createdAt: string
}

export interface Attachment {
  id: string
  contractId: string
  name: string
  type: string
  size: number
  uploadedBy: string
  uploadedAt: string
}

export interface TemplateField {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea'
  required: boolean
  options?: string[]
}

export interface Template {
  id: string
  name: string
  category: string
  description: string
  fields: TemplateField[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface UrgencyLog {
  id: string
  contractId: string
  urgenterId: string
  urgenterName: string
  targetNodeId: string
  message: string
  createdAt: string
}

export const NODE_TYPE_CONFIG: Record<NodeType, { label: string; color: string; icon: string }> = {
  draft: { label: '起草', color: '#6B8CC2', icon: 'FileEdit' },
  business_confirm: { label: '业务确认', color: '#4A6BA5', icon: 'UserCheck' },
  legal_review: { label: '法务审核', color: '#1B2A4A', icon: 'Scale' },
  finance_review: { label: '财务复核', color: '#2E4478', icon: 'Calculator' },
  stamp: { label: '盖章', color: '#D4A843', icon: 'Stamp' },
  archive: { label: '归档', color: '#8FA8D6', icon: 'Archive' },
  condition: { label: '条件分支', color: '#B8912E', icon: 'GitBranch' },
}

export const STATUS_CONFIG: Record<ContractStatus, { label: string; color: string; bg: string }> = {
  draft: { label: '起草中', color: '#6B8CC2', bg: '#EEF2F8' },
  in_review: { label: '审批中', color: '#D4A843', bg: '#FDF8EC' },
  approved: { label: '已通过', color: '#22C55E', bg: '#F0FDF4' },
  rejected: { label: '已驳回', color: '#EF4444', bg: '#FEF2F2' },
  stamped: { label: '已盖章', color: '#8B5CF6', bg: '#F5F3FF' },
  archived: { label: '已归档', color: '#6B7280', bg: '#F9FAFB' },
}
