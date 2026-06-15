import { create } from 'zustand'
import type { Workflow, Contract, ApprovalRecord, Attachment, Template, UrgencyLog, WorkflowNode, ConditionBranch } from '@/types'
import { mockWorkflows, mockContracts, mockApprovalRecords, mockAttachments, mockTemplates, mockUrgencyLogs } from './mockData'

interface AppStore {
  workflows: Workflow[]
  contracts: Contract[]
  approvalRecords: ApprovalRecord[]
  attachments: Attachment[]
  templates: Template[]
  urgencyLogs: UrgencyLog[]
  currentRole: 'admin' | 'applicant' | 'approver' | 'manager'
  currentUser: { id: string; name: string; role: string }

  setCurrentRole: (role: 'admin' | 'applicant' | 'approver' | 'manager') => void
  addContract: (contract: Contract) => void
  updateContract: (id: string, updates: Partial<Contract>) => void
  addApprovalRecord: (record: ApprovalRecord) => void
  addAttachment: (attachment: Attachment) => void
  removeAttachment: (id: string) => void
  addUrgencyLog: (log: UrgencyLog) => void
  addTemplate: (template: Template) => void
  updateTemplate: (id: string, updates: Partial<Template>) => void
  deleteTemplate: (id: string) => void
  addWorkflow: (workflow: Workflow) => void
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void
  updateWorkflowNode: (workflowId: string, nodeId: string, updates: Partial<WorkflowNode>) => void
  addWorkflowNode: (workflowId: string, node: WorkflowNode) => void
  removeWorkflowNode: (workflowId: string, nodeId: string) => void
  addBranch: (workflowId: string, branch: ConditionBranch) => void
  removeBranch: (workflowId: string, branchId: string) => void
}

const roleUsers: Record<string, { id: string; name: string; role: string }> = {
  admin: { id: 'u001', name: '张管理', role: '管理员' },
  applicant: { id: 'u003', name: '王业务', role: '申请人' },
  approver: { id: 'u002', name: '李法务', role: '审批人' },
  manager: { id: 'u014', name: '何总', role: '管理者' },
}

export const useStore = create<AppStore>((set) => ({
  workflows: mockWorkflows,
  contracts: mockContracts,
  approvalRecords: mockApprovalRecords,
  attachments: mockAttachments,
  templates: mockTemplates,
  urgencyLogs: mockUrgencyLogs,
  currentRole: 'admin',
  currentUser: roleUsers.admin,

  setCurrentRole: (role) => set({ currentRole: role, currentUser: roleUsers[role] }),

  addContract: (contract) => set((s) => ({ contracts: [...s.contracts, contract] })),

  updateContract: (id, updates) => set((s) => ({
    contracts: s.contracts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
  })),

  addApprovalRecord: (record) => set((s) => ({
    approvalRecords: [...s.approvalRecords, record],
  })),

  addAttachment: (attachment) => set((s) => ({
    attachments: [...s.attachments, attachment],
  })),

  removeAttachment: (id) => set((s) => ({
    attachments: s.attachments.filter((a) => a.id !== id),
  })),

  addUrgencyLog: (log) => set((s) => ({
    urgencyLogs: [...s.urgencyLogs, log],
  })),

  addTemplate: (template) => set((s) => ({
    templates: [...s.templates, template],
  })),

  updateTemplate: (id, updates) => set((s) => ({
    templates: s.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  })),

  deleteTemplate: (id) => set((s) => ({
    templates: s.templates.filter((t) => t.id !== id),
  })),

  addWorkflow: (workflow) => set((s) => ({
    workflows: [...s.workflows, workflow],
  })),

  updateWorkflow: (id, updates) => set((s) => ({
    workflows: s.workflows.map((w) => (w.id === id ? { ...w, ...updates } : w)),
  })),

  updateWorkflowNode: (workflowId, nodeId, updates) => set((s) => ({
    workflows: s.workflows.map((w) =>
      w.id === workflowId
        ? { ...w, nodes: w.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)) }
        : w
    ),
  })),

  addWorkflowNode: (workflowId, node) => set((s) => ({
    workflows: s.workflows.map((w) =>
      w.id === workflowId ? { ...w, nodes: [...w.nodes, node] } : w
    ),
  })),

  removeWorkflowNode: (workflowId, nodeId) => set((s) => ({
    workflows: s.workflows.map((w) =>
      w.id === workflowId
        ? {
            ...w,
            nodes: w.nodes.filter((n) => n.id !== nodeId),
            branches: w.branches.filter((b) => b.fromNodeId !== nodeId && b.toNodeId !== nodeId),
          }
        : w
    ),
  })),

  addBranch: (workflowId, branch) => set((s) => ({
    workflows: s.workflows.map((w) =>
      w.id === workflowId ? { ...w, branches: [...w.branches, branch] } : w
    ),
  })),

  removeBranch: (workflowId, branchId) => set((s) => ({
    workflows: s.workflows.map((w) =>
      w.id === workflowId ? { ...w, branches: w.branches.filter((b) => b.id !== branchId) } : w
    ),
  })),
}))
