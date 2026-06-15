import { useStore } from '@/store'
import StatusBadge from '@/components/StatusBadge'
import { FileText, Clock, Archive, AlertTriangle, ArrowRight, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'

const metricConfig = [
  { key: 'in_review', label: '进行中合同', icon: FileText, color: 'text-navy-600', bg: 'bg-navy-50' },
  { key: 'pending', label: '待审批', icon: Clock, color: 'text-gold-500', bg: 'bg-gold-50' },
  { key: 'archived', label: '本月归档', icon: Archive, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'abnormal', label: '异常节点', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
]

const actionLabel: Record<string, { text: string; cls: string }> = {
  approve: { text: '通过', cls: 'text-emerald-600' },
  reject: { text: '驳回', cls: 'text-red-500' },
  add_signer: { text: '加签', cls: 'text-gold-500' },
  return_modify: { text: '退回修改', cls: 'text-amber-500' },
}

const actionIcon: Record<string, { char: string; cls: string }> = {
  approve: { char: '✓', cls: 'bg-emerald-50 text-emerald-600' },
  reject: { char: '✗', cls: 'bg-red-50 text-red-500' },
  add_signer: { char: '!', cls: 'bg-gold-50 text-gold-500' },
  return_modify: { char: '↩', cls: 'bg-amber-50 text-amber-500' },
}

export default function Dashboard() {
  const { contracts, approvalRecords, currentUser, urgencyLogs } = useStore()

  const inReviewCount = contracts.filter(c => c.status === 'in_review').length

  const pendingContracts = contracts.filter(c =>
    c.status === 'in_review' &&
    !approvalRecords.some(r =>
      r.contractId === c.id &&
      r.approverId === currentUser.id &&
      r.nodeId === c.currentNodeId &&
      r.action === 'approve'
    )
  )

  const now = new Date()
  const archivedThisMonth = contracts.filter(c => {
    if (c.status !== 'archived' || !c.archivedAt) return false
    const d = new Date(c.archivedAt)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length

  const abnormalCount = urgencyLogs.length

  const metricValues = [inReviewCount, pendingContracts.length, archivedThisMonth, abnormalCount]

  const recentContracts = [...contracts]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  const recentApprovals = [...approvalRecords]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  const fmt = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(1)}万` : n.toLocaleString()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-5">
        {metricConfig.map((m, i) => (
          <div key={m.key} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${m.bg} flex items-center justify-center`}>
              <m.icon className={`w-6 h-6 ${m.color}`} />
            </div>
            <div>
              <div className="text-sm text-navy-400">{m.label}</div>
              <div className="text-2xl font-serif font-bold text-navy-900">{metricValues[i]}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-bold text-navy-900">最近合同</h2>
            <Link to="/contracts" className="text-sm text-gold-500 flex items-center gap-1 hover:text-gold-400">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-1">
            {recentContracts.map(c => (
              <Link key={c.id} to={`/contracts/${c.id}`} className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded hover:bg-surface-alt">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-navy-800 truncate">{c.title}</div>
                  <div className="text-xs text-navy-400 mt-0.5">{c.department} · {c.currentNodeName}</div>
                </div>
                <div className="flex items-center gap-3 ml-3 shrink-0">
                  <span className="text-sm text-navy-600">{fmt(c.amount)}</span>
                  <StatusBadge status={c.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-bold text-navy-900">待办事项</h2>
            <Bell className="w-5 h-5 text-gold-500" />
          </div>
          {pendingContracts.length === 0 ? (
            <div className="text-sm text-navy-400 text-center py-8">暂无待办事项</div>
          ) : (
            <div className="space-y-1">
              {pendingContracts.map(c => (
                <Link key={c.id} to={`/contracts/${c.id}`} className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded hover:bg-surface-alt">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-navy-800 truncate">{c.title}</div>
                    <div className="text-xs text-navy-400 mt-0.5">{c.initiatorName} · {c.currentNodeName}</div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gold-50 text-gold-500 ml-3 shrink-0">待处理</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-lg font-serif font-bold text-navy-900 mb-4">审批动态</h2>
        <div>
          {recentApprovals.map((r, i) => {
            const icon = actionIcon[r.action] ?? actionIcon.approve
            const act = actionLabel[r.action] ?? actionLabel.approve
            return (
              <div key={r.id} className="flex gap-4 py-3 relative">
                {i < recentApprovals.length - 1 && (
                  <div className="absolute left-[11px] top-8 bottom-0 w-px bg-border-light" />
                )}
                <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold z-10 ${icon.cls}`}>
                  {icon.char}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-navy-800">
                    <span className="font-medium">{r.approverName}</span>
                    <span className="text-navy-400 mx-1">在【{r.nodeName}】</span>
                    <span className={act.cls}>{act.text}</span>
                  </div>
                  {r.opinion && <div className="text-xs text-navy-400 mt-1 truncate">{r.opinion}</div>}
                  <div className="text-xs text-navy-300 mt-1">{r.createdAt}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
