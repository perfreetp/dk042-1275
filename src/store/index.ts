import { create } from 'zustand'
import type { Workflow, Contract, ApprovalRecord, Attachment, Template, UrgencyLog, WorkflowNode, ConditionBranch } from '@/types'
import { mockWorkflows, mockContracts, mockApprovalRecords, mockAttachments, mockTemplates, mockUrgencyLogs } from './mockData'

const STORAGE_KEY = 'contract-workflow-store-v1'

interface PersistedState {
  workflows: Workflow[]
  contracts: Contract[]
  approvalRecords: ApprovalRecord[]
  attachments: Attachment[]
  templates: Template[]
  urgencyLogs: UrgencyLog[]
}

function loadPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedState
    if (!parsed.workflows || !parsed.contracts) return null
    return parsed
  } catch {
    return null
  }
}

function persist(s: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {}
}

const persisted = loadPersisted()

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
  updateBranch: (workflowId: string, branchId: string, updates: Partial<ConditionBranch>) => void
  removeBranch: (workflowId: string, branchId: string) => void
  resetAll: () => void
}

const roleUsers: Record<string, { id: string; name: string; role: string }> = {
  admin: { id: 'u001', name: '张管理', role: '管理员' },
  applicant: { id: 'u003', name: '王业务', role: '申请人' },
  approver: { id: 'u002', name: '李法务', role: '审批人' },
  manager: { id: 'u014', name: '何总', role: '管理者' },
}

const extractPersist = (s: AppStore): PersistedState => ({
  workflows: s.workflows,
  contracts: s.contracts,
  approvalRecords: s.approvalRecords,
  attachments: s.attachments,
  templates: s.templates,
  urgencyLogs: s.urgencyLogs,
})

export const useStore = create<AppStore>((set, get) => ({
  workflows: persisted?.workflows ?? mockWorkflows,
  contracts: persisted?.contracts ?? mockContracts,
  approvalRecords: persisted?.approvalRecords ?? mockApprovalRecords,
  attachments: persisted?.attachments ?? mockAttachments,
  templates: persisted?.templates ?? mockTemplates,
  urgencyLogs: persisted?.urgencyLogs ?? mockUrgencyLogs,
  currentRole: 'admin',
  currentUser: roleUsers.admin,

  setCurrentRole: (role) => set({ currentRole: role, currentUser: roleUsers[role] }),

  addContract: (contract) => set((s) => {
    const next = { contracts: [...s.contracts, contract] }
    persist(extractPersist({ ...s, ...next }))
    return next
  }),

  updateContract: (id, updates) => set((s) => {
    const next = {
      contracts: s.contracts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }
    persist(extractPersist({ ...s, ...next }))
    return next
  }),

  addApprovalRecord: (record) => set((s) => {
    const next = { approvalRecords: [...s.approvalRecords, record] }
    persist(extractPersist({ ...s, ...next }))
    return next
  }),

  addAttachment: (attachment) => set((s) => {
    const next = { attachments: [...s.attachments, attachment] }
    persist(extractPersist({ ...s, ...next }))
    return next
  }),

  removeAttachment: (id) => set((s) => {
    const next = { attachments: s.attachments.filter((a) => a.id !== id) }
    persist(extractPersist({ ...s, ...next }))
    return next
  }),

  addUrgencyLog: (log) => set((s) => {
    const next = { urgencyLogs: [...s.urgencyLogs, log] }
    persist(extractPersist({ ...s, ...next }))
    return next
  }),

  addTemplate: (template) => set((s) => {
    const next = { templates: [...s.templates, template] }
    persist(extractPersist({ ...s, ...next }))
    return next
  }),

  updateTemplate: (id, updates) => set((s) => {
    const next = { templates: s.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)) }
    persist(extractPersist({ ...s, ...next }))
    return next
  }),

  deleteTemplate: (id) => set((s) => {
    const next = { templates: s.templates.filter((t) => t.id !== id) }
    persist(extractPersist({ ...s, ...next }))
    return next
  }),

  addWorkflow: (workflow) => set((s) => {
    const next = { workflows: [...s.workflows, workflow] }
    persist(extractPersist({ ...s, ...next }))
    return next
  }),

  updateWorkflow: (id, updates) => set((s) => {
    const next = { workflows: s.workflows.map((w) => (w.id === id ? { ...w, ...updates } : w)) }
    persist(extractPersist({ ...s, ...next }))
    return next
  }),

  updateWorkflowNode: (workflowId, nodeId, updates) => set((s) => {
    const next = {
      workflows: s.workflows.map((w) =>
        w.id === workflowId
          ? { ...w, nodes: w.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)) }
          : w
      ),
    }
    persist(extractPersist({ ...s, ...next }))
    return next
  }),

  addWorkflowNode: (workflowId, node) => set((s) => {
    const next = {
      workflows: s.workflows.map((w) =>
        w.id === workflowId ? { ...w, nodes: [...w.nodes, node] } : w
      ),
    }
    persist(extractPersist({ ...s, ...next }))
    return next
  }),

  removeWorkflowNode: (workflowId, nodeId) => set((s) => {
    const next = {
      workflows: s.workflows.map((w) =>
        w.id === workflowId
          ? {
              ...w,
              nodes: w.nodes.filter((n) => n.id !== nodeId),
              branches: w.branches.filter((b) => b.fromNodeId !== nodeId && b.toNodeId !== nodeId),
            }
          : w
      ),
    }
    persist(extractPersist({ ...s, ...next }))
    return next
  }),

  addBranch: (workflowId, branch) => set((s) => {
    const next = {
      workflows: s.workflows.map((w) =>
        w.id === workflowId ? { ...w, branches: [...w.branches, branch] } : w
      ),
    }
    persist(extractPersist({ ...s, ...next }))
    return next
  }),

  updateBranch: (workflowId, branchId, updates) => set((s) => {
    const next = {
      workflows: s.workflows.map((w) =>
        w.id === workflowId
          ? { ...w, branches: w.branches.map((b) => (b.id === branchId ? { ...b, ...updates } : b)) }
          : w
      ),
    }
    persist(extractPersist({ ...s, ...next }))
    return next
  }),

  removeBranch: (workflowId, branchId) => set((s) => {
    const next = {
      workflows: s.workflows.map((w) =>
        w.id === workflowId ? { ...w, branches: w.branches.filter((b) => b.id !== branchId) } : w
      ),
    }
    persist(extractPersist({ ...s, ...next }))
    return next
  }),

  resetAll: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({
      workflows: mockWorkflows,
      contracts: mockContracts,
      approvalRecords: mockApprovalRecords,
      attachments: mockAttachments,
      templates: mockTemplates,
      urgencyLogs: mockUrgencyLogs,
    })
  },
}))
