import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Eye, Bell, Briefcase, Clock, FileText } from 'lucide-react'
import { useStore } from '@/store'
import StatusBadge from '@/components/StatusBadge'
import type { ContractStatus } from '@/types'

const DEPARTMENTS = ['采购部', '技术部', '市场部', '行政部', '人力资源部', '法务部']

const STATUS_OPTIONS: { value: ContractStatus; label: string }[] = [
  { value: 'draft', label: '起草中' },
  { value: 'in_review', label: '审批中' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已驳回' },
  { value: 'stamped', label: '已盖章' },
  { value: 'archived', label: '已归档' },
]

const TABS = [
  { key: 'mine', label: '我的合同', icon: Briefcase },
  { key: 'pending', label: '待办合同', icon: Clock },
  { key: 'all', label: '全部合同', icon: FileText },
] as const

type TabKey = (typeof TABS)[number]['key']

function formatAmount(n: number) {
  return '¥' + n.toLocaleString('zh-CN')
}

export default function Workspace() {
  const { contracts, currentUser, currentRole, addUrgencyLog } = useStore()
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  let filtered = contracts

  if (activeTab === 'mine') {
    filtered = filtered.filter((c) => c.initiatorId === currentUser.id)
  } else if (activeTab === 'pending') {
    filtered = filtered.filter((c) => c.status === 'in_review')
  }

  if (searchQuery) {
    filtered = filtered.filter((c) => c.title.includes(searchQuery))
  }
  if (departmentFilter) {
    filtered = filtered.filter((c) => c.department === departmentFilter)
  }
  if (statusFilter) {
    filtered = filtered.filter((c) => c.status === statusFilter)
  }

  const handleUrgency = (contractId: string) => {
    addUrgencyLog({
      id: `ug-${Date.now()}`,
      contractId,
      urgenterId: currentUser.id,
      urgenterName: currentUser.name,
      targetNodeId: '',
      message: '请尽快处理',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">合同工作台</h1>
        <Link to="/workspace/create" className="btn-gold inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          发起新合同
        </Link>
      </div>

      <div className="card p-1.5 inline-flex gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-navy-600 hover:bg-navy-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              placeholder="搜索合同名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-navy-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="input-field w-auto min-w-[120px]"
            >
              <option value="">全部部门</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-auto min-w-[120px]"
            >
              <option value="">全部状态</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-navy-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">暂无匹配的合同</p>
            <p className="text-sm mt-1">尝试调整筛选条件</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-navy-500">
                  <th className="pb-3 font-medium">合同名称</th>
                  <th className="pb-3 font-medium">发起人</th>
                  <th className="pb-3 font-medium">部门</th>
                  <th className="pb-3 font-medium text-right">金额</th>
                  <th className="pb-3 font-medium">当前节点</th>
                  <th className="pb-3 font-medium">状态</th>
                  <th className="pb-3 font-medium">发起时间</th>
                  <th className="pb-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border-light hover:bg-surface-alt transition-colors">
                    <td className="py-3 font-medium text-navy-900">{c.title}</td>
                    <td className="py-3 text-navy-700">{c.initiatorName}</td>
                    <td className="py-3 text-navy-700">{c.department}</td>
                    <td className="py-3 text-right font-medium text-navy-900">{formatAmount(c.amount)}</td>
                    <td className="py-3 text-navy-600">{c.currentNodeName}</td>
                    <td className="py-3"><StatusBadge status={c.status} /></td>
                    <td className="py-3 text-navy-500">{c.createdAt}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/approval/${c.id}`}
                          className="inline-flex items-center gap-1 text-gold-500 hover:text-gold-400 font-medium transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          查看
                        </Link>
                        {c.status === 'in_review' && (
                          <button
                            onClick={() => handleUrgency(c.id)}
                            className="inline-flex items-center gap-1 text-navy-500 hover:text-gold-500 font-medium transition-colors"
                          >
                            <Bell className="w-3.5 h-3.5" />
                            催办
                          </button>
                        )}
                      </div>
                    </td>
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
