import { useStore } from '@/store'
import { departmentStats, monthlyTrend, nodeTimeStats, abnormalNodes } from '@/store/mockData'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, FileText, DollarSign, Clock, AlertTriangle, BarChart3 } from 'lucide-react'

const severityConfig: Record<string, { label: string; cls: string }> = {
  high: { label: '高', cls: 'bg-red-50 text-red-600' },
  medium: { label: '中', cls: 'bg-gold-50 text-gold-500' },
  low: { label: '低', cls: 'bg-emerald-50 text-emerald-600' },
}

const deptChartData = departmentStats.map(d => ({
  department: d.department,
  count: d.count,
  amount: +(d.totalAmount / 10000).toFixed(0),
}))

const monthlyChartData = monthlyTrend.map(m => ({
  month: m.month,
  contracts: m.contracts,
  amount: +(m.amount / 10000).toFixed(0),
}))

export default function Statistics() {
  const { contracts } = useStore()

  const totalCount = contracts.length
  const totalAmount = contracts.reduce((sum, c) => sum + c.amount, 0)
  const avgDays = +(departmentStats.reduce((s, d) => s + d.avgDays, 0) / departmentStats.length).toFixed(1)
  const abnormalRate = `${+((abnormalNodes.length / contracts.length) * 100).toFixed(1)}%`
  const formattedAmount = `¥${(totalAmount / 10000).toLocaleString()}万`

  const metrics = [
    { label: '合同总量', value: totalCount, icon: FileText, color: 'text-navy-600', bg: 'bg-navy-50' },
    { label: '合同总金额', value: formattedAmount, icon: DollarSign, color: 'text-gold-500', bg: 'bg-gold-50' },
    { label: '平均审批耗时', value: `${avgDays}天`, icon: Clock, color: 'text-navy-500', bg: 'bg-navy-50' },
    { label: '异常率', value: abnormalRate, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-5">
        {metrics.map(m => (
          <div key={m.label} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${m.bg} flex items-center justify-center`}>
              <m.icon className={`w-6 h-6 ${m.color}`} />
            </div>
            <div>
              <div className="text-sm text-navy-400">{m.label}</div>
              <div className="text-2xl font-serif font-bold text-navy-900">{m.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-navy-700" />
            <h2 className="text-lg font-serif font-bold text-navy-900">各部门合同数量与金额</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E0D8" />
              <XAxis dataKey="department" tick={{ fontSize: 12, fill: '#4A6BA5' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#4A6BA5' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#D4A843' }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="count" name="数量" fill="#243660" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="amount" name="金额(万)" fill="#D4A843" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gold-500" />
            <h2 className="text-lg font-serif font-bold text-navy-900">月度合同趋势</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E0D8" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#4A6BA5' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#4A6BA5' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#D4A843' }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="contracts" name="合同数" stroke="#6B8CC2" strokeWidth={2} dot={{ fill: '#6B8CC2', r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="amount" name="金额(万)" stroke="#D4A843" strokeWidth={2} dot={{ fill: '#D4A843', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-navy-600" />
            <h2 className="text-lg font-serif font-bold text-navy-900">各节点平均耗时</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={nodeTimeStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E0D8" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#4A6BA5' }} />
              <YAxis type="category" dataKey="node" width={80} tick={{ fontSize: 12, fill: '#4A6BA5' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgHours" name="平均耗时(h)" fill="#243660" radius={[0, 4, 4, 0]} />
              <Bar dataKey="maxHours" name="最大耗时(h)" fill="#D4A843" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-serif font-bold text-navy-900">异常节点列表</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-navy-400 font-medium">合同名称</th>
                <th className="text-left py-2 text-navy-400 font-medium">节点</th>
                <th className="text-left py-2 text-navy-400 font-medium">类型</th>
                <th className="text-left py-2 text-navy-400 font-medium">详情</th>
                <th className="text-left py-2 text-navy-400 font-medium">严重程度</th>
              </tr>
            </thead>
            <tbody>
              {abnormalNodes.map(n => {
                const sev = severityConfig[n.severity] ?? severityConfig.low
                return (
                  <tr key={n.id} className="border-b border-border-light hover:bg-surface-alt">
                    <td className="py-2.5 text-navy-800 max-w-[160px] truncate">{n.contractTitle}</td>
                    <td className="py-2.5 text-navy-700">{n.node}</td>
                    <td className="py-2.5 text-navy-700">{n.type}</td>
                    <td className="py-2.5 text-navy-500 max-w-[140px] truncate">{n.detail}</td>
                    <td className="py-2.5">
                      <span className={`badge ${sev.cls}`}>{sev.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
