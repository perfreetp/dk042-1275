import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import StatusBadge from '@/components/StatusBadge'
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight, FileText, Download, Eye, Calendar, DollarSign } from 'lucide-react'

const DEPARTMENTS = ['采购部', '技术部', '市场部', '行政部', '人力资源部', '法务部']
const PAGE_SIZE = 8

function formatAmount(n: number) {
  return '¥' + n.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

function formatSize(bytes: number) {
  return bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`
}

const ACTION_LABEL: Record<string, string> = {
  approve: '通过',
  reject: '驳回',
  add_signer: '加签',
  return_modify: '退回修改',
}

const ACTION_COLORS: Record<string, string> = {
  approve: 'bg-emerald-50 text-emerald-600',
  reject: 'bg-red-50 text-red-500',
  add_signer: 'bg-blue-50 text-blue-500',
  return_modify: 'bg-amber-50 text-amber-600',
}

export default function Archive() {
  const { contracts, approvalRecords, attachments } = useStore()
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = contracts.filter((c) => c.status === 'archived')
    if (search) {
      result = result.filter((c) => c.title.includes(search) || c.id.includes(search))
    }
    if (department) {
      result = result.filter((c) => c.department === department)
    }
    if (dateFrom) {
      result = result.filter((c) => c.archivedAt && c.archivedAt >= dateFrom)
    }
    if (dateTo) {
      result = result.filter((c) => c.archivedAt && c.archivedAt <= dateTo)
    }
    if (amountMin) {
      result = result.filter((c) => c.amount >= Number(amountMin))
    }
    if (amountMax) {
      result = result.filter((c) => c.amount <= Number(amountMax))
    }
    return result.sort((a, b) => (b.archivedAt || '').localeCompare(a.archivedAt || ''))
  }, [contracts, search, department, dateFrom, dateTo, amountMin, amountMax])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const paged = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, safePage])

  const startIdx = (safePage - 1) * PAGE_SIZE + 1
  const endIdx = Math.min(safePage * PAGE_SIZE, filtered.length)

  function handleReset() {
    setSearch('')
    setDepartment('')
    setDateFrom('')
    setDateTo('')
    setAmountMin('')
    setAmountMax('')
    setCurrentPage(1)
    setExpandedId(null)
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const expandedRecords = useMemo(() => {
    if (!expandedId) return []
    return approvalRecords
      .filter((r) => r.contractId === expandedId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [approvalRecords, expandedId])

  const expandedFiles = useMemo(() => {
    if (!expandedId) return []
    return attachments.filter((a) => a.contractId === expandedId)
  }, [attachments, expandedId])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">归档查询</h1>

      <div className="card p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              placeholder="搜索合同名称/编号"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              className="input-field pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-navy-400" />
            <select value={department} onChange={(e) => { setDepartment(e.target.value); setCurrentPage(1) }} className="input-field w-auto min-w-[120px]">
              <option value="">全部部门</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-navy-600">
            <Calendar className="w-4 h-4 text-navy-400" />
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1) }} className="input-field w-auto" />
            <span>至</span>
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1) }} className="input-field w-auto" />
          </div>
          <div className="flex items-center gap-2 text-sm text-navy-600">
            <DollarSign className="w-4 h-4 text-navy-400" />
            <input type="number" placeholder="最低金额" value={amountMin} onChange={(e) => { setAmountMin(e.target.value); setCurrentPage(1) }} className="input-field w-[100px]" />
            <span>至</span>
            <input type="number" placeholder="最高金额" value={amountMax} onChange={(e) => { setAmountMax(e.target.value); setCurrentPage(1) }} className="input-field w-[100px]" />
          </div>
          <button onClick={() => setCurrentPage(1)} className="btn-primary inline-flex items-center gap-1.5">
            <Search className="w-4 h-4" />搜索
          </button>
          <button onClick={handleReset} className="btn-secondary inline-flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4" />重置
          </button>
        </div>
      </div>

      <div className="card p-0">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-navy-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">暂无归档合同</p>
            <p className="text-sm mt-1">尝试调整筛选条件</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-navy-500">
                    <th className="px-4 py-3 font-medium">合同编号</th>
                    <th className="px-4 py-3 font-medium">合同名称</th>
                    <th className="px-4 py-3 font-medium">发起人</th>
                    <th className="px-4 py-3 font-medium">部门</th>
                    <th className="px-4 py-3 font-medium text-right">金额</th>
                    <th className="px-4 py-3 font-medium">归档时间</th>
                    <th className="px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((c) => (
                    <>
                      <tr
                        key={c.id}
                        className={`border-b border-border-light hover:bg-surface-alt transition-colors cursor-pointer ${expandedId === c.id ? 'bg-surface-alt' : ''}`}
                        onClick={() => toggleExpand(c.id)}
                      >
                        <td className="px-4 py-3 text-navy-500 font-mono text-xs">{c.id}</td>
                        <td className="px-4 py-3 font-medium text-navy-900">{c.title}</td>
                        <td className="px-4 py-3 text-navy-700">{c.initiatorName}</td>
                        <td className="px-4 py-3 text-navy-700">{c.department}</td>
                        <td className="px-4 py-3 text-right font-medium text-navy-900">{formatAmount(c.amount)}</td>
                        <td className="px-4 py-3 text-navy-500">{c.archivedAt || '-'}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleExpand(c.id) }}
                            className="inline-flex items-center gap-1 text-gold-500 hover:text-gold-400 font-medium transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />查看详情
                          </button>
                        </td>
                      </tr>
                      {expandedId === c.id && (
                        <tr key={`${c.id}-detail`}>
                          <td colSpan={7} className="px-6 py-5 bg-navy-50/40 border-b border-border-light">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                              <div className="card p-4 space-y-2">
                                <h4 className="font-semibold text-navy-800 text-sm">合同信息</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <span className="text-navy-500">合同编号</span><span className="text-navy-800 font-medium">{c.id}</span>
                                  <span className="text-navy-500">合同名称</span><span className="text-navy-800 font-medium">{c.title}</span>
                                  <span className="text-navy-500">发起人</span><span className="text-navy-800">{c.initiatorName}</span>
                                  <span className="text-navy-500">部门</span><span className="text-navy-800">{c.department}</span>
                                  <span className="text-navy-500">金额</span><span className="text-navy-800 font-semibold">{formatAmount(c.amount)}</span>
                                  <span className="text-navy-500">状态</span><StatusBadge status={c.status} />
                                </div>
                              </div>
                              <div className="card p-4 space-y-3">
                                <h4 className="font-semibold text-navy-800 text-sm">审批历史</h4>
                                {expandedRecords.length === 0 ? (
                                  <p className="text-xs text-navy-400 py-2">暂无审批记录</p>
                                ) : (
                                  <div className="relative">
                                    <div className="absolute left-[9px] top-1 bottom-1 w-px bg-navy-200" />
                                    <div className="space-y-3">
                                      {expandedRecords.map((r) => (
                                        <div key={r.id} className="relative flex gap-3">
                                          <div className={`relative z-10 flex-shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold ${ACTION_COLORS[r.action] || 'bg-gray-100 text-gray-600'}`}>
                                            {r.action === 'approve' ? '✓' : r.action === 'reject' ? '✗' : '!'}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 text-xs">
                                              <span className="font-medium text-navy-800">{r.nodeName}</span>
                                              <span className="text-navy-400">·</span>
                                              <span className="text-navy-500">{r.approverName}</span>
                                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${ACTION_COLORS[r.action] || ''}`}>
                                                {ACTION_LABEL[r.action] || r.action}
                                              </span>
                                            </div>
                                            {r.opinion && <p className="text-[11px] text-navy-500 mt-0.5">{r.opinion}</p>}
                                            <p className="text-[10px] text-navy-300 mt-0.5">{r.createdAt}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="card p-4 space-y-3">
                                <h4 className="font-semibold text-navy-800 text-sm">附件列表</h4>
                                {expandedFiles.length === 0 ? (
                                  <p className="text-xs text-navy-400 py-2">暂无附件</p>
                                ) : (
                                  <div className="space-y-2">
                                    {expandedFiles.map((f) => (
                                      <div key={f.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-border-light">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <FileText className="w-4 h-4 text-navy-400 flex-shrink-0" />
                                          <div className="min-w-0">
                                            <p className="text-xs font-medium text-navy-800 truncate">{f.name}</p>
                                            <p className="text-[10px] text-navy-400">{formatSize(f.size)} · {f.uploadedBy} · {f.uploadedAt}</p>
                                          </div>
                                        </div>
                                        <button className="flex-shrink-0 text-gold-500 hover:text-gold-400 transition-colors">
                                          <Download className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-border-light">
              <span className="text-sm text-navy-500">
                显示 {startIdx}-{endIdx}，共 {filtered.length} 条
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="btn-secondary inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />上一页
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="btn-secondary inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  下一页<ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
