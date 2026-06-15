import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStore } from '@/store'
import StatusBadge from '@/components/StatusBadge'
import type { ApprovalAction, NodeType } from '@/types'
import { NODE_TYPE_CONFIG } from '@/types'
import { ArrowLeft, Check, X, UserPlus, FileText, Upload, Paperclip, Clock, User, ChevronRight } from 'lucide-react'

const ACTION_LABELS: Record<ApprovalAction, string> = {
  approve: '同意',
  reject: '驳回',
  add_signer: '加签',
  return_modify: '退回修改',
}

const ACTION_COLORS: Record<ApprovalAction, string> = {
  approve: 'bg-green-100 text-green-700',
  reject: 'bg-red-100 text-red-700',
  add_signer: 'bg-blue-100 text-blue-700',
  return_modify: 'bg-orange-100 text-orange-700',
}

function formatAmount(n: number) {
  return `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatSize(bytes: number) {
  return bytes >= 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(1)} KB`
}

export default function ApprovalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    contracts,
    approvalRecords,
    attachments,
    currentUser,
    workflows,
    addApprovalRecord,
    updateContract,
    addAttachment,
  } = useStore()

  const [approvalOpinion, setApprovalOpinion] = useState('')

  const contract = contracts.find((c) => c.id === id)
  const records = approvalRecords
    .filter((r) => r.contractId === id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  const files = attachments.filter((a) => a.contractId === id)
  const workflow = workflows.find((w) => w.id === contract?.workflowId)

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-navy-400">
        <FileText className="w-12 h-12 mb-3" />
        <p className="text-lg">合同不存在</p>
        <Link to="/workspace" className="btn-primary mt-4">返回工作台</Link>
      </div>
    )
  }

  const hasApprovedCurrentNode = records.some(
    (r) => r.nodeId === contract.currentNodeId && r.approverId === currentUser.id
  )
  const canApprove = contract.status === 'in_review' && !hasApprovedCurrentNode

  function findNextNode(currentNodeId: string, amount: number): { id: string; name: string } | null {
    if (!workflow) return null
    const idx = workflow.nodes.findIndex(n => n.id === currentNodeId)
    if (idx === -1) return null

    if (idx < workflow.nodes.length - 1) {
      const next = workflow.nodes[idx + 1]
      return { id: next.id, name: next.name }
    }
    return null
  }

  function advanceContractNode(advance: boolean) {
    if (!advance) return
    const next = findNextNode(contract.currentNodeId, contract.amount)
    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() }

    if (next) {
      updates.currentNodeId = next.id
      updates.currentNodeName = next.name
    } else {
      if (workflow?.nodes[workflow.nodes.length - 1].id === contract.currentNodeId) {
        const lastType = workflow.nodes[workflow.nodes.length - 1].type
        if (lastType === 'archive' as NodeType) {
          updates.status = 'archived'
          updates.archivedAt = new Date().toISOString()
        } else if (lastType === 'stamp' as NodeType) {
          updates.status = 'stamped'
        }
      }
    }
    updateContract(contract.id, updates)
  }

  function handleAction(action: ApprovalAction) {
    const now = new Date().toISOString()
    const newRecord = {
      id: `ar_${Date.now()}`,
      contractId: contract.id,
      nodeId: contract.currentNodeId,
      nodeName: contract.currentNodeName,
      approverId: currentUser.id,
      approverName: currentUser.name,
      action,
      opinion: approvalOpinion.trim(),
      createdAt: now,
    }
    addApprovalRecord(newRecord)

    if (action === 'reject') {
      updateContract(contract.id, { status: 'rejected', updatedAt: now })
    } else if (action === 'approve') {
      advanceContractNode(true)
    } else if (action === 'add_signer') {
      updateContract(contract.id, { updatedAt: now })
    } else if (action === 'return_modify') {
      updateContract(contract.id, { status: 'draft', updatedAt: now })
    }

    setApprovalOpinion('')
  }

  function handleUpload() {
    const mockFile = {
      id: `att_${Date.now()}`,
      contractId: contract.id,
      name: `附件_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}_${Math.floor(Math.random() * 100)}.pdf`,
      type: 'pdf',
      size: Math.floor(Math.random() * 2000000) + 50000,
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toISOString(),
    }
    addAttachment(mockFile)
  }

  function buildFlowSteps(): Array<{ id: string; name: string; type: NodeType; done: boolean; current: boolean }> {
    if (!workflow) return []
    const currentIdx = workflow.nodes.findIndex(n => n.id === contract.currentNodeId)
    return workflow.nodes.map((n, i) => ({
      id: n.id,
      name: n.name,
      type: n.type,
      done: i < currentIdx || contract.status === 'archived',
      current: i === currentIdx,
    }))
  }

  const flowSteps = buildFlowSteps()

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <button
        className="flex items-center gap-2 text-navy-400 hover:text-navy-700 transition-colors mb-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回列表</span>
      </button>

      <div className="card p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold font-serif text-navy-900">{contract.title}</h1>
            <p className="text-sm text-navy-400 mt-1">合同编号: {contract.id}</p>
          </div>
          <StatusBadge status={contract.status} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 text-navy-600">
            <User className="w-4 h-4 text-navy-300" />
            <span>发起人: {contract.initiatorName}</span>
          </div>
          <div className="flex items-center gap-2 text-navy-600">
            <FileText className="w-4 h-4 text-navy-300" />
            <span>部门: {contract.department}</span>
          </div>
          <div className="text-navy-900 font-semibold">
            金额: <span className="text-gold-600">{formatAmount(contract.amount)}</span>
          </div>
          <div className="flex items-center gap-2 text-navy-600">
            <Clock className="w-4 h-4 text-navy-300" />
            <span>当前节点: <span className="font-medium text-navy-800">{contract.currentNodeName}</span></span>
          </div>
        </div>
        <div className="text-xs text-navy-400 mt-3">创建时间: {new Date(contract.createdAt).toLocaleString('zh-CN')}</div>
      </div>

      {flowSteps.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-navy-500 mb-4">流程进度</h2>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {flowSteps.map((step, i) => {
              const cfg = NODE_TYPE_CONFIG[step.type]
              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all ${
                        step.done
                          ? 'bg-green-500 text-white border-green-500'
                          : step.current
                            ? 'bg-gold-500 text-navy-950 border-gold-500 shadow-md'
                            : 'bg-white text-navy-400 border-navy-200'
                      }`}
                      style={!step.done && !step.current ? { borderColor: cfg.color, color: cfg.color } : undefined}
                    >
                      {step.done ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`mt-1.5 text-[11px] w-20 text-center ${
                      step.current ? 'text-navy-800 font-semibold' : 'text-navy-400'
                    }`}>{step.name}</span>
                  </div>
                  {i < flowSteps.length - 1 && (
                    <ChevronRight
                      className={`w-4 h-4 mx-0.5 mb-5 ${
                        step.done ? 'text-green-400' : 'text-navy-200'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-4">审批记录</h2>
          {records.length === 0 ? (
            <p className="text-navy-300 text-sm py-8 text-center">暂无审批记录</p>
          ) : (
            <div className="relative">
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-navy-100" />
              <div className="space-y-6">
                {records.map((record) => {
                  const isApproved = record.action === 'approve'
                  const isRejected = record.action === 'reject'
                  const DotIcon = isApproved ? Check : isRejected ? X : UserPlus
                  const dotColor = isApproved ? 'border-green-400' : isRejected ? 'border-red-400' : 'border-blue-400'
                  return (
                    <div key={record.id} className="relative flex gap-4">
                      <div className={`relative z-10 flex-shrink-0 w-[30px] h-[30px] rounded-full bg-white border-2 ${dotColor} flex items-center justify-center`}>
                        <DotIcon className={`w-3.5 h-3.5 ${
                          isApproved ? 'text-green-500' : isRejected ? 'text-red-500' : 'text-blue-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-navy-800">{record.nodeName}</span>
                          <span className="text-navy-300">·</span>
                          <span className="text-sm text-navy-500">{record.approverName}</span>
                          <span className={`badge text-xs ${ACTION_COLORS[record.action]}`}>
                            {ACTION_LABELS[record.action]}
                          </span>
                        </div>
                        {record.opinion && (
                          <div className="mt-1.5 px-3 py-2 bg-surface-alt rounded-lg text-sm text-navy-700">
                            {record.opinion}
                          </div>
                        )}
                        <p className="text-xs text-navy-300 mt-1.5">
                          {new Date(record.createdAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="card p-6 h-fit">
          {canApprove ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
                <h2 className="text-lg font-semibold text-navy-900">审批操作</h2>
              </div>
              <p className="text-xs text-navy-400 mb-3">
                当前节点: <span className="text-navy-700 font-medium">{contract.currentNodeName}</span>
              </p>
              <textarea
                className="input-field resize-none h-28 mb-4"
                placeholder="请输入审批意见...（同意可留空，驳回请说明原因）"
                value={approvalOpinion}
                onChange={(e) => setApprovalOpinion(e.target.value)}
              />
              <div className="space-y-2">
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
                  onClick={() => handleAction('approve')}
                >
                  <Check className="w-4 h-4" />同意并流转至下一节点
                </button>
                <button
                  className="btn-danger w-full flex items-center justify-center gap-2"
                  onClick={() => handleAction('reject')}
                >
                  <X className="w-4 h-4" />驳回
                </button>
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  onClick={() => handleAction('add_signer')}
                >
                  <UserPlus className="w-4 h-4" />加签其他审批人
                </button>
              </div>
            </>
          ) : hasApprovedCurrentNode ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-50 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm text-navy-600 font-medium">您已审批当前节点</p>
              <p className="text-xs text-navy-400 mt-1">等待其他节点处理</p>
            </div>
          ) : (
            <div className="text-center py-8 text-navy-300">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">当前无需您审批</p>
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-navy-400" />
            附件 <span className="text-xs text-navy-400 font-normal">（{files.length}个）</span>
          </h2>
          <button
            className="btn-primary flex items-center gap-2 text-sm"
            onClick={handleUpload}
          >
            <Upload className="w-4 h-4" />上传附件
          </button>
        </div>
        {files.length === 0 ? (
          <p className="text-navy-300 text-sm py-6 text-center">暂无附件，点击上方按钮上传</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-navy-400 border-b border-border-light">
                  <th className="text-left py-2 font-medium">文件名</th>
                  <th className="text-left py-2 font-medium">类型</th>
                  <th className="text-left py-2 font-medium">大小</th>
                  <th className="text-left py-2 font-medium">上传人</th>
                  <th className="text-left py-2 font-medium">上传时间</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="border-b border-border-light last:border-0 hover:bg-navy-50/50">
                    <td className="py-2.5 text-navy-800 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-navy-300" />
                      <span>{file.name}</span>
                    </td>
                    <td className="py-2.5 text-navy-500">
                      <span className="badge bg-navy-50 text-navy-600">
                        {(file.type || '').split('/').pop()?.toUpperCase() || 'FILE'}
                      </span>
                    </td>
                    <td className="py-2.5 text-navy-500">{formatSize(file.size)}</td>
                    <td className="py-2.5 text-navy-500">{file.uploadedBy}</td>
                    <td className="py-2.5 text-navy-400">{new Date(file.uploadedAt).toLocaleDateString('zh-CN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
