import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import StatusBadge from '@/components/StatusBadge'
import type { ApprovalAction } from '@/types'
import { ArrowLeft, Check, X, UserPlus, FileText, Upload, Paperclip, Clock, User } from 'lucide-react'

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

const ACTION_ICONS: Record<ApprovalAction, React.ReactNode> = {
  approve: <Check className="w-4 h-4 text-green-500" />,
  reject: <X className="w-4 h-4 text-red-500" />,
  add_signer: <UserPlus className="w-4 h-4 text-blue-500" />,
  return_modify: <ArrowLeft className="w-4 h-4 text-orange-500" />,
}

function formatAmount(n: number) {
  return `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
}

function formatSize(bytes: number) {
  return bytes >= 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(1)} KB`
}

export default function ApprovalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { contracts, approvalRecords, attachments, currentUser, addApprovalRecord, updateContract, addAttachment } = useStore()

  const contract = contracts.find((c) => c.id === id)
  const records = approvalRecords.filter((r) => r.contractId === id).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  const files = attachments.filter((a) => a.contractId === id)

  const [approvalOpinion, setApprovalOpinion] = useState('')

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-navy-400">
        <FileText className="w-12 h-12 mb-3" />
        <p className="text-lg">合同不存在</p>
        <button className="btn-primary mt-4" onClick={() => navigate(-1)}>返回</button>
      </div>
    )
  }

  const canApprove = contract.status === 'in_review' && currentUser.role === 'approver'

  function handleAction(action: ApprovalAction) {
    const newRecord = {
      id: `ar_${Date.now()}`,
      contractId: contract.id,
      nodeId: contract.currentNodeId,
      nodeName: contract.currentNodeName,
      approverId: currentUser.id,
      approverName: currentUser.name,
      action,
      opinion: approvalOpinion,
      createdAt: new Date().toISOString(),
    }
    addApprovalRecord(newRecord)

    if (action === 'reject') {
      updateContract(contract.id, { status: 'rejected', updatedAt: new Date().toISOString() })
    } else if (action === 'approve') {
      updateContract(contract.id, { status: 'approved', updatedAt: new Date().toISOString() })
    }

    setApprovalOpinion('')
  }

  function handleUpload() {
    const mockFile = {
      id: `att_${Date.now()}`,
      contractId: contract.id,
      name: `附件_${new Date().toLocaleDateString('zh-CN')}.pdf`,
      type: 'application/pdf',
      size: Math.floor(Math.random() * 2000000) + 50000,
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toISOString(),
    }
    addAttachment(mockFile)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <button className="flex items-center gap-2 text-navy-400 hover:text-navy-700 transition-colors mb-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4" />
        <span>返回列表</span>
      </button>

      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-navy-900">{contract.title}</h1>
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
            金额: {formatAmount(contract.amount)}
          </div>
          <div className="flex items-center gap-2 text-navy-600">
            <Clock className="w-4 h-4 text-navy-300" />
            <span>当前节点: {contract.currentNodeName}</span>
          </div>
        </div>
        <div className="text-xs text-navy-300 mt-3">创建时间: {new Date(contract.createdAt).toLocaleString('zh-CN')}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-4">审批记录</h2>
          {records.length === 0 ? (
            <p className="text-navy-300 text-sm py-8 text-center">暂无审批记录</p>
          ) : (
            <div className="relative">
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-navy-100" />
              <div className="space-y-6">
                {records.map((record) => (
                  <div key={record.id} className="relative flex gap-4">
                    <div className="relative z-10 flex-shrink-0 w-[30px] h-[30px] rounded-full bg-white border-2 border-navy-200 flex items-center justify-center">
                      {ACTION_ICONS[record.action]}
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
                        <p className="text-sm text-navy-600 mt-1">{record.opinion}</p>
                      )}
                      <p className="text-xs text-navy-300 mt-1">{new Date(record.createdAt).toLocaleString('zh-CN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card p-6">
          {canApprove ? (
            <>
              <h2 className="text-lg font-semibold text-navy-900 mb-4">审批操作</h2>
              <textarea
                className="input-field resize-none h-28 mb-4"
                placeholder="请输入审批意见..."
                value={approvalOpinion}
                onChange={(e) => setApprovalOpinion(e.target.value)}
              />
              <div className="space-y-2">
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  onClick={() => handleAction('approve')}
                >
                  <Check className="w-4 h-4" />同意
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
                  <UserPlus className="w-4 h-4" />加签
                </button>
              </div>
            </>
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
            附件
          </h2>
          <button
            className="btn-primary flex items-center gap-2 text-sm"
            onClick={handleUpload}
          >
            <Upload className="w-4 h-4" />上传附件
          </button>
        </div>
        {files.length === 0 ? (
          <p className="text-navy-300 text-sm py-6 text-center">暂无附件</p>
        ) : (
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
                    <FileText className="w-4 h-4 text-navy-300" />{file.name}
                  </td>
                  <td className="py-2.5 text-navy-500">{file.type.split('/').pop()?.toUpperCase()}</td>
                  <td className="py-2.5 text-navy-500">{formatSize(file.size)}</td>
                  <td className="py-2.5 text-navy-500">{file.uploadedBy}</td>
                  <td className="py-2.5 text-navy-400">{new Date(file.uploadedAt).toLocaleDateString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
