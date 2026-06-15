import { useState, useRef, useCallback } from 'react'
import { useStore } from '@/store'
import { NODE_TYPE_CONFIG } from '@/types'
import type { WorkflowNode, NodeType } from '@/types'
import { Plus, Save, X, Trash2, Settings, FileEdit, UserCheck, Scale, Calculator, Stamp, Archive, GitBranch, ChevronDown, GripVertical } from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number | string; className?: string; color?: string }>> = { FileEdit, UserCheck, Scale, Calculator, Stamp, Archive, GitBranch }

const NODE_PALETTE: NodeType[] = ['draft', 'business_confirm', 'legal_review', 'finance_review', 'stamp', 'archive', 'condition']

export default function Designer() {
  const { workflows, addWorkflow, updateWorkflowNode, addWorkflowNode, removeWorkflowNode, addBranch, removeBranch } = useStore()
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(workflows[0]?.id ?? '')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showConfigPanel, setShowConfigPanel] = useState(false)
  const [dragInfo, setDragInfo] = useState<{ nodeId: string; offsetX: number; offsetY: number } | null>(null)
  const [newMaterial, setNewMaterial] = useState('')
  const canvasRef = useRef<HTMLDivElement>(null)

  const workflow = workflows.find(w => w.id === selectedWorkflowId)
  const selectedNode = workflow?.nodes.find(n => n.id === selectedNodeId)

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, node: WorkflowNode) => {
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setDragInfo({ nodeId: node.id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top })
    setSelectedNodeId(node.id)
    setShowConfigPanel(true)
  }, [])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragInfo || !canvasRef.current || !selectedWorkflowId) return
    const canvasRect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(0, e.clientX - canvasRect.left - dragInfo.offsetX)
    const y = Math.max(0, e.clientY - canvasRect.top - dragInfo.offsetY)
    updateWorkflowNode(selectedWorkflowId, dragInfo.nodeId, { position: { x, y } })
  }, [dragInfo, selectedWorkflowId, updateWorkflowNode])

  const handleCanvasMouseUp = useCallback(() => setDragInfo(null), [])

  const handleAddNode = (type: NodeType) => {
    if (!workflow) return
    const id = `n-${Date.now()}`
    const node: WorkflowNode = { id, workflowId: workflow.id, type, name: NODE_TYPE_CONFIG[type].label, assigneeRole: '', timeLimit: type === 'condition' ? 0 : 3, requiredMaterials: [], order: workflow.nodes.length + 1, position: { x: 200 + workflow.nodes.length * 50, y: 200 } }
    addWorkflowNode(workflow.id, node)
  }

  const handleNewWorkflow = () => {
    const id = `wf-${Date.now()}`
    addWorkflow({ id, name: '新流程', description: '', version: '1.0', isActive: false, createdBy: '张管理', createdAt: new Date().toISOString().slice(0, 10), nodes: [], branches: [] })
    setSelectedWorkflowId(id)
  }

  const handleDeleteNode = () => {
    if (!selectedNodeId || !workflow) return
    removeWorkflowNode(workflow.id, selectedNodeId)
    setSelectedNodeId(null)
    setShowConfigPanel(false)
  }

  const handleAddMaterial = () => {
    if (!newMaterial.trim() || !selectedNodeId || !workflow) return
    const node = workflow.nodes.find(n => n.id === selectedNodeId)
    if (!node) return
    updateWorkflowNode(workflow.id, selectedNodeId, { requiredMaterials: [...node.requiredMaterials, newMaterial.trim()] })
    setNewMaterial('')
  }

  const handleRemoveMaterial = (idx: number) => {
    if (!selectedNodeId || !workflow) return
    const node = workflow.nodes.find(n => n.id === selectedNodeId)
    if (!node) return
    updateWorkflowNode(workflow.id, selectedNodeId, { requiredMaterials: node.requiredMaterials.filter((_, i) => i !== idx) })
  }

  const renderConnections = () => {
    if (!workflow) return null
    const lines: React.ReactNode[] = []
    workflow.branches.forEach((branch, i) => {
      const from = workflow.nodes.find(n => n.id === branch.fromNodeId)
      const to = workflow.nodes.find(n => n.id === branch.toNodeId)
      if (!from || !to) return
      const fx = from.position.x + 140, fy = from.position.y + 40
      const tx = to.position.x, ty = to.position.y + 40
      const mx = (fx + tx) / 2
      lines.push(<path key={`l-${i}`} d={`M${fx},${fy} C${mx},${fy} ${mx},${ty} ${tx},${ty}`} fill="none" stroke="#6B8CC2" strokeWidth={2} markerEnd="url(#arrow)" />)
      lines.push(<text key={`t-${i}`} x={mx} y={(fy + ty) / 2 - 8} textAnchor="middle" className="fill-navy-600 text-xs" fontSize={11}>{branch.condition}</text>)
    })
    return lines
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-white shrink-0">
        <div className="relative">
          <select value={selectedWorkflowId} onChange={e => { setSelectedWorkflowId(e.target.value); setSelectedNodeId(null); setShowConfigPanel(false) }} className="appearance-none bg-surface border border-border rounded-lg px-3 py-2 pr-8 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-gold-400">
            {workflows.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
        </div>
        <button onClick={handleNewWorkflow} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-navy-800 text-white text-sm hover:bg-navy-700"><Plus size={15} />新建流程</button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gold-500 text-white text-sm hover:bg-gold-600"><Save size={15} />保存</button>
        {workflow && <span className="ml-auto text-xs text-navy-400">版本 v{workflow.version}</span>}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-16 shrink-0 bg-white border-r border-border flex flex-col items-center py-3 gap-2">
          {NODE_PALETTE.map(type => {
            const Icon = ICON_MAP[NODE_TYPE_CONFIG[type].icon]
            return (
              <button key={type} onClick={() => handleAddNode(type)} title={NODE_TYPE_CONFIG[type].label}
                className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:border-gold-400 hover:bg-gold-50 transition-colors"
                style={{ borderLeftColor: NODE_TYPE_CONFIG[type].color, borderLeftWidth: 3 }}>
                {Icon && <Icon size={16} color={NODE_TYPE_CONFIG[type].color} />}
              </button>
            )
          })}
        </div>

        <div ref={canvasRef} className="flex-1 relative overflow-auto" style={{ backgroundImage: 'radial-gradient(circle,#D8E2F1 1px,transparent 1px)', backgroundSize: '20px 20px' }}
          onMouseMove={handleCanvasMouseMove} onMouseUp={handleCanvasMouseUp} onClick={() => { setSelectedNodeId(null); setShowConfigPanel(false) }}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: '100%' }}>
            <defs><marker id="arrow" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto"><path d="M0,0 L8,3 L0,6" fill="#6B8CC2" /></marker></defs>
            {renderConnections()}
          </svg>

          {workflow?.nodes.map(node => {
            const cfg = NODE_TYPE_CONFIG[node.type]
            const Icon = ICON_MAP[cfg.icon]
            const isCondition = node.type === 'condition'
            return (
              <div key={node.id}
                onMouseDown={e => handleNodeMouseDown(e, node)}
                className={`absolute cursor-grab active:cursor-grabbing select-none ${isCondition ? '' : 'rounded-lg'} ${selectedNodeId === node.id ? 'ring-2 ring-gold-400 shadow-lg' : 'shadow'}`}
                style={{ left: node.position.x, top: node.position.y, ...(isCondition ? { width: 80, height: 80, transform: 'rotate(45deg)' } : { width: 280 }) }}>
                {isCondition ? (
                  <div className="w-full h-full bg-white border-2 flex items-center justify-center" style={{ borderColor: cfg.color }}>
                    <div className="-rotate-45 text-center">
                      <Icon size={16} color={cfg.color} />
                      <div className="text-xs font-medium text-navy-800 mt-0.5">{node.name}</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-border-la flex overflow-hidden" style={{ borderLeft: `4px solid ${cfg.color}` }}>
                    <div className="flex-1 px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Icon size={15} color={cfg.color} />
                        <span className="text-sm font-medium text-navy-800">{node.name}</span>
                        <GripVertical size={12} className="ml-auto text-navy-300" />
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-navy-400">
                        {node.assigneeRole && <span>{node.assigneeRole}</span>}
                        {node.timeLimit > 0 && <span>{node.timeLimit}天</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {showConfigPanel && selectedNode && workflow && (
          <div className="w-72 shrink-0 bg-white border-l border-border overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-medium text-navy-800">节点配置</span>
              <button onClick={() => { setShowConfigPanel(false); setSelectedNodeId(null) }}><X size={16} className="text-navy-400 hover:text-navy-600" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-navy-500 mb-1 block">节点名称</label>
                <input value={selectedNode.name} onChange={e => updateWorkflowNode(workflow.id, selectedNode.id, { name: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-gold-400" />
              </div>
              <div>
                <label className="text-xs text-navy-500 mb-1 block">节点类型</label>
                <select value={selectedNode.type} onChange={e => updateWorkflowNode(workflow.id, selectedNode.id, { type: e.target.value as NodeType })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-gold-400">
                  {(Object.keys(NODE_TYPE_CONFIG) as NodeType[]).map(t => <option key={t} value={t}>{NODE_TYPE_CONFIG[t].label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-navy-500 mb-1 block">审批角色</label>
                <input value={selectedNode.assigneeRole} onChange={e => updateWorkflowNode(workflow.id, selectedNode.id, { assigneeRole: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-gold-400" />
              </div>
              <div>
                <label className="text-xs text-navy-500 mb-1 block">时限（天）</label>
                <input type="number" value={selectedNode.timeLimit} onChange={e => updateWorkflowNode(workflow.id, selectedNode.id, { timeLimit: Number(e.target.value) })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-gold-400" />
              </div>
              <div>
                <label className="text-xs text-navy-500 mb-1 block">必需材料</label>
                <div className="space-y-1.5">
                  {selectedNode.requiredMaterials.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 bg-surface-alt rounded px-2 py-1.5">
                      <span className="flex-1 text-sm text-navy-700">{m}</span>
                      <button onClick={() => handleRemoveMaterial(i)}><Trash2 size={13} className="text-red-400 hover:text-red-600" /></button>
                    </div>
                  ))}
                  <div className="flex gap-1.5">
                    <input value={newMaterial} onChange={e => setNewMaterial(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddMaterial()}
                      placeholder="添加材料" className="flex-1 border border-border rounded px-2 py-1.5 text-xs bg-surface focus:outline-none focus:ring-1 focus:ring-gold-400" />
                    <button onClick={handleAddMaterial} className="px-2 py-1 rounded bg-navy-100 text-navy-600 hover:bg-navy-200"><Plus size={14} /></button>
                  </div>
                </div>
              </div>
              <button onClick={handleDeleteNode} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-200 text-red-500 text-sm hover:bg-red-50">
                <Trash2 size={14} />删除节点
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
