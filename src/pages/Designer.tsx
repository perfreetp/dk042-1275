import { useState, useRef, useCallback, useMemo } from 'react'
import { useStore } from '@/store'
import { NODE_TYPE_CONFIG } from '@/types'
import type { WorkflowNode, NodeType, ConditionBranch } from '@/types'
import { Plus, Save, X, Trash2, FileEdit, UserCheck, Scale, Calculator, Stamp, Archive, GitBranch, ChevronDown, GripVertical, ArrowRight, Sparkles } from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number | string; className?: string; color?: string }>> = { FileEdit, UserCheck, Scale, Calculator, Stamp, Archive, GitBranch }

const NODE_PALETTE: NodeType[] = ['draft', 'business_confirm', 'legal_review', 'finance_review', 'stamp', 'archive', 'condition']

const PRESET_CONDITIONS = [
  { label: '金额≤50万', value: 'amount <= 500000' },
  { label: '金额>50万', value: 'amount > 500000' },
  { label: '金额≤100万', value: 'amount <= 1000000' },
  { label: '金额>100万', value: 'amount > 1000000' },
  { label: '通过', value: 'pass' },
  { label: '驳回', value: 'reject' },
]

export default function Designer() {
  const { workflows, addWorkflow, updateWorkflowNode, addWorkflowNode, removeWorkflowNode, addBranch, removeBranch, updateBranch, updateWorkflow } = useStore()
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(workflows[0]?.id ?? '')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showConfigPanel, setShowConfigPanel] = useState(false)
  const [dragInfo, setDragInfo] = useState<{ nodeId: string; offsetX: number; offsetY: number } | null>(null)
  const [newMaterial, setNewMaterial] = useState('')
  const [saveTip, setSaveTip] = useState('')
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null)
  const [branchForm, setBranchForm] = useState<Partial<ConditionBranch>>({ condition: '', toNodeId: '' })
  const canvasRef = useRef<HTMLDivElement>(null)

  const workflow = workflows.find(w => w.id === selectedWorkflowId)
  const selectedNode = workflow?.nodes.find(n => n.id === selectedNodeId)

  const outgoingBranches = useMemo(() => {
    if (!workflow || !selectedNodeId) return []
    return workflow.branches.filter(b => b.fromNodeId === selectedNodeId)
  }, [workflow, selectedNodeId])

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, node: WorkflowNode) => {
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setDragInfo({ nodeId: node.id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top })
    setSelectedNodeId(node.id)
    setShowConfigPanel(true)
    setEditingBranchId(null)
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
    const node: WorkflowNode = {
      id,
      workflowId: workflow.id,
      type,
      name: NODE_TYPE_CONFIG[type].label,
      assigneeRole: '',
      timeLimit: type === 'condition' ? 0 : 3,
      requiredMaterials: [],
      order: workflow.nodes.length + 1,
      position: { x: 200 + workflow.nodes.length * 60, y: 200 + (type === 'condition' ? workflow.nodes.length * 20 : 0) }
    }
    addWorkflowNode(workflow.id, node)
  }

  const handleNewWorkflow = () => {
    const id = `wf-${Date.now()}`
    addWorkflow({ id, name: '新流程', description: '', version: '1.0', isActive: false, createdBy: '张管理', createdAt: new Date().toISOString().slice(0, 10), nodes: [], branches: [] })
    setSelectedWorkflowId(id)
    setSelectedNodeId(null)
    setShowConfigPanel(false)
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

  const handleStartAddBranch = () => {
    if (!selectedNodeId) return
    setEditingBranchId('new')
    setBranchForm({ fromNodeId: selectedNodeId, toNodeId: '', condition: '' })
  }

  const handleStartEditBranch = (branch: ConditionBranch) => {
    setEditingBranchId(branch.id)
    setBranchForm({ fromNodeId: branch.fromNodeId, toNodeId: branch.toNodeId, condition: branch.condition })
  }

  const handleCancelBranch = () => {
    setEditingBranchId(null)
    setBranchForm({ condition: '', toNodeId: '' })
  }

  const handleSaveBranch = () => {
    if (!workflow || !branchForm.fromNodeId || !branchForm.toNodeId || !branchForm.condition?.trim()) return
    if (editingBranchId === 'new') {
      const newBranch: ConditionBranch = {
        id: `br-${Date.now()}`,
        workflowId: workflow.id,
        fromNodeId: branchForm.fromNodeId,
        toNodeId: branchForm.toNodeId,
        condition: branchForm.condition.trim(),
        priority: workflow.branches.filter(b => b.fromNodeId === branchForm.fromNodeId).length + 1
      }
      addBranch(workflow.id, newBranch)
    } else if (editingBranchId) {
      updateBranch(workflow.id, editingBranchId, {
        toNodeId: branchForm.toNodeId,
        condition: branchForm.condition.trim()
      })
    }
    handleCancelBranch()
  }

  const handleDeleteBranch = (branchId: string) => {
    if (!workflow) return
    removeBranch(workflow.id, branchId)
    if (editingBranchId === branchId) handleCancelBranch()
  }

  const handleSaveWorkflow = () => {
    if (!workflow) return
    updateWorkflow(workflow.id, { version: String((parseFloat(workflow.version) + 0.1)).slice(0, 3) })
    setSaveTip('✓ 已保存')
    setTimeout(() => setSaveTip(''), 2000)
  }

  const handlePresetCondition = (value: string) => {
    setBranchForm(prev => ({ ...prev, condition: value }))
  }

  const renderConnections = () => {
    if (!workflow) return null
    const lines: React.ReactNode[] = []
    workflow.branches.forEach((branch, i) => {
      const from = workflow.nodes.find(n => n.id === branch.fromNodeId)
      const to = workflow.nodes.find(n => n.id === branch.toNodeId)
      if (!from || !to) return
      const fx = from.position.x + (from.type === 'condition' ? 40 : 280)
      const fy = from.position.y + (from.type === 'condition' ? 40 : 40)
      const tx = to.position.x
      const ty = to.position.y + 40
      const mx = (fx + tx) / 2
      const my = (fy + ty) / 2
      const isActive = selectedNodeId === branch.fromNodeId || selectedNodeId === branch.toNodeId
      lines.push(
        <path
          key={`l-${i}`}
          d={`M${fx},${fy} C${mx},${fy} ${mx},${ty} ${tx},${ty}`}
          fill="none"
          stroke={isActive ? '#D4A843' : '#6B8CC2'}
          strokeWidth={isActive ? 3 : 2}
          markerEnd="url(#arrow)"
        />
      )
      lines.push(
        <g key={`tg-${i}`}>
          <rect x={mx - 52} y={my - 16} width={104} height={24} rx={4} fill="white" stroke={isActive ? '#D4A843' : '#CBD5E1'} strokeWidth={1} />
          <text x={mx} y={my} textAnchor="middle" className={isActive ? 'fill-gold-700' : 'fill-navy-600'} fontSize={11} fontWeight={500}>{branch.condition}</text>
        </g>
      )
    })
    return lines
  }

  const availableTargetNodes = useMemo(() => {
    if (!workflow || !selectedNodeId) return []
    return workflow.nodes.filter(n => n.id !== selectedNodeId)
  }, [workflow, selectedNodeId])

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-white shrink-0">
        <div className="relative">
          <select
            value={selectedWorkflowId}
            onChange={e => { setSelectedWorkflowId(e.target.value); setSelectedNodeId(null); setShowConfigPanel(false) }}
            className="appearance-none bg-surface border border-border rounded-lg px-3 py-2 pr-8 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-gold-400"
          >
            {workflows.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
        </div>
        <button onClick={handleNewWorkflow} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-navy-800 text-white text-sm hover:bg-navy-700">
          <Plus size={15} />新建流程
        </button>
        <button onClick={handleSaveWorkflow} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gold-500 text-white text-sm hover:bg-gold-600">
          <Save size={15} />保存{saveTip && <span className="ml-1 text-xs">{saveTip}</span>}
        </button>
        {workflow && <span className="ml-auto text-xs text-navy-400">版本 v{workflow.version} · {workflow.nodes.length}节点 · {workflow.branches.length}连线</span>}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-16 shrink-0 bg-white border-r border-border flex flex-col items-center py-3 gap-2">
          {NODE_PALETTE.map(type => {
            const Icon = ICON_MAP[NODE_TYPE_CONFIG[type].icon]
            const cfg = NODE_TYPE_CONFIG[type]
            return (
              <button
                key={type}
                onClick={() => handleAddNode(type)}
                title={`添加${cfg.label}`}
                className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:border-gold-400 hover:bg-gold-50 transition-colors group relative"
                style={{ borderLeftColor: cfg.color, borderLeftWidth: 3 }}
              >
                {Icon && <Icon size={16} color={cfg.color} />}
              </button>
            )
          })}
          <div className="mt-4 w-8 h-px bg-border-light" />
          <div className="text-[10px] text-navy-400 leading-tight text-center px-1">点击<br/>添加节点</div>
        </div>

        <div
          ref={canvasRef}
          className="flex-1 relative overflow-auto"
          style={{ backgroundImage: 'radial-gradient(circle,#D8E2F1 1px,transparent 1px)', backgroundSize: '20px 20px' }}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onClick={() => { setSelectedNodeId(null); setShowConfigPanel(false) }}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: '2000px', minHeight: '1500px' }}>
            <defs>
              <marker id="arrow" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto">
                <path d="M0,0 L8,3 L0,6" fill="#6B8CC2" />
              </marker>
            </defs>
            {renderConnections()}
          </svg>

          {workflow?.nodes.map(node => {
            const cfg = NODE_TYPE_CONFIG[node.type]
            const Icon = ICON_MAP[cfg.icon]
            const isCondition = node.type === 'condition'
            const isSelected = selectedNodeId === node.id
            return (
              <div
                key={node.id}
                onMouseDown={e => handleNodeMouseDown(e, node)}
                className={`absolute cursor-grab active:cursor-grabbing select-none transition-shadow ${isSelected ? 'z-10' : ''}`}
                style={{ left: node.position.x, top: node.position.y }}
              >
                {isCondition ? (
                  <div
                    className={`w-20 h-20 border-2 flex items-center justify-center bg-white ${isSelected ? 'ring-2 ring-gold-400 ring-offset-2 shadow-xl' : 'shadow-md'}`}
                    style={{ borderColor: cfg.color, transform: 'rotate(45deg)' }}
                  >
                    <div className="-rotate-45 text-center">
                      <Icon size={18} color={cfg.color} />
                      <div className="text-[11px] font-medium text-navy-800 mt-0.5 leading-tight">{node.name}</div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`bg-white rounded-lg border border-border-light flex overflow-hidden ${isSelected ? 'ring-2 ring-gold-400 ring-offset-1 shadow-xl' : 'shadow-md'}`}
                    style={{ borderLeft: `4px solid ${cfg.color}`, width: 260 }}
                  >
                    <div className="flex-1 px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Icon size={15} color={cfg.color} />
                        <span className="text-sm font-medium text-navy-800 flex-1 truncate">{node.name}</span>
                        <GripVertical size={12} className="text-navy-300" />
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-navy-400">
                        {node.assigneeRole && <span className="truncate">👤 {node.assigneeRole}</span>}
                        {node.timeLimit > 0 && <span>⏱ {node.timeLimit}天</span>}
                        {node.requiredMaterials.length > 0 && <span>📎 {node.requiredMaterials.length}</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {workflow?.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <GitBranch size={48} className="mx-auto text-navy-200 mb-3" />
                <p className="text-navy-400 text-sm">从左侧工具栏拖入节点，开始设计流程</p>
                <p className="text-navy-300 text-xs mt-1">选中节点后可在右侧配置属性和分支</p>
              </div>
            </div>
          )}
        </div>

        {showConfigPanel && selectedNode && workflow && (
          <div className="w-80 shrink-0 bg-white border-l border-border overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-navy-50/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 rounded" style={{ backgroundColor: NODE_TYPE_CONFIG[selectedNode.type].color }} />
                <span className="text-sm font-semibold text-navy-800">节点配置</span>
              </div>
              <button onClick={() => { setShowConfigPanel(false); setSelectedNodeId(null); setEditingBranchId(null) }}>
                <X size={16} className="text-navy-400 hover:text-navy-600" />
              </button>
            </div>

            <div className="p-4 space-y-4 flex-1">
              <div>
                <label className="text-xs text-navy-500 mb-1 block font-medium">节点名称</label>
                <input
                  value={selectedNode.name}
                  onChange={e => updateWorkflowNode(workflow.id, selectedNode.id, { name: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>

              <div>
                <label className="text-xs text-navy-500 mb-1 block font-medium">节点类型</label>
                <select
                  value={selectedNode.type}
                  onChange={e => updateWorkflowNode(workflow.id, selectedNode.id, { type: e.target.value as NodeType })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-gold-400"
                >
                  {(Object.keys(NODE_TYPE_CONFIG) as NodeType[]).map(t => (
                    <option key={t} value={t}>{NODE_TYPE_CONFIG[t].label}</option>
                  ))}
                </select>
              </div>

              {selectedNode.type !== 'condition' && (
                <>
                  <div>
                    <label className="text-xs text-navy-500 mb-1 block font-medium">审批角色</label>
                    <input
                      value={selectedNode.assigneeRole}
                      onChange={e => updateWorkflowNode(workflow.id, selectedNode.id, { assigneeRole: e.target.value })}
                      placeholder="如：法务、财务总监、总经理…"
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-gold-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-navy-500 mb-1 block font-medium">时限（天）</label>
                    <input
                      type="number"
                      min={0}
                      value={selectedNode.timeLimit}
                      onChange={e => updateWorkflowNode(workflow.id, selectedNode.id, { timeLimit: Number(e.target.value) })}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-gold-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-navy-500 mb-1 block font-medium">必需材料</label>
                    <div className="space-y-1.5">
                      {selectedNode.requiredMaterials.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 bg-surface-alt rounded px-2 py-1.5">
                          <span className="flex-1 text-sm text-navy-700 truncate">{m}</span>
                          <button onClick={() => handleRemoveMaterial(i)}>
                            <Trash2 size={13} className="text-red-400 hover:text-red-600" />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-1.5">
                        <input
                          value={newMaterial}
                          onChange={e => setNewMaterial(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddMaterial()}
                          placeholder="添加材料名称"
                          className="flex-1 border border-border rounded px-2 py-1.5 text-xs bg-surface focus:outline-none focus:ring-1 focus:ring-gold-400"
                        />
                        <button onClick={handleAddMaterial} className="px-2 py-1 rounded bg-navy-100 text-navy-600 hover:bg-navy-200">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-border-light">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <ArrowRight size={14} className="text-gold-600" />
                    <span className="text-xs font-semibold text-navy-700">
                      分支连线 <span className="text-navy-400 font-normal">({outgoingBranches.length})</span>
                    </span>
                  </div>
                  <button
                    onClick={handleStartAddBranch}
                    disabled={editingBranchId !== null}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-gold-50 text-gold-700 text-xs hover:bg-gold-100 border border-gold-200 disabled:opacity-40"
                  >
                    <Plus size={12} />新增分支
                  </button>
                </div>

                <div className="space-y-2">
                  {outgoingBranches.length === 0 && editingBranchId === null && (
                    <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
                      <p className="text-xs text-navy-400 mb-2">暂未设置分支</p>
                      <p className="text-[10px] text-navy-300">
                        {selectedNode.type === 'condition' ? '条件节点需配置至少2条分支' : '点击"新增分支"配置条件流转'}
                      </p>
                    </div>
                  )}

                  {outgoingBranches.map(branch => {
                    const targetNode = workflow.nodes.find(n => n.id === branch.toNodeId)
                    const isEditing = editingBranchId === branch.id
                    return (
                      <div key={branch.id} className={`rounded-lg border ${isEditing ? 'border-gold-300 bg-gold-50/40' : 'border-border-light bg-surface-alt'}`}>
                        {isEditing ? (
                          <div className="p-3 space-y-2.5">
                            <div>
                              <label className="text-[10px] text-navy-500 mb-1 block font-medium">目标节点</label>
                              <select
                                value={branchForm.toNodeId}
                                onChange={e => setBranchForm(prev => ({ ...prev, toNodeId: e.target.value }))}
                                className="w-full border border-border rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gold-400"
                              >
                                <option value="">选择节点…</option>
                                {availableTargetNodes.map(n => (
                                  <option key={n.id} value={n.id}>
                                    [{NODE_TYPE_CONFIG[n.type].label}] {n.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-navy-500 mb-1 block font-medium">条件表达式</label>
                              <input
                                value={branchForm.condition}
                                onChange={e => setBranchForm(prev => ({ ...prev, condition: e.target.value }))}
                                placeholder="如：amount > 500000"
                                className="w-full border border-border rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gold-400 font-mono"
                              />
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {PRESET_CONDITIONS.map(p => (
                                  <button
                                    key={p.label}
                                    onClick={() => handlePresetCondition(p.value)}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-border text-navy-500 hover:border-gold-300 hover:text-gold-700 hover:bg-gold-50"
                                  >
                                    {p.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-1.5 pt-1">
                              <button
                                onClick={handleSaveBranch}
                                className="flex-1 px-2 py-1.5 rounded bg-gold-500 text-white text-xs hover:bg-gold-600 font-medium"
                              >
                                保存
                              </button>
                              <button
                                onClick={handleCancelBranch}
                                className="px-2 py-1.5 rounded bg-white border border-border text-navy-500 text-xs hover:bg-navy-50"
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="p-2.5 flex items-start gap-2 cursor-pointer hover:bg-white transition-colors rounded-lg"
                            onClick={() => handleStartEditBranch(branch)}
                          >
                            <div className="w-1 self-stretch rounded-full bg-gold-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <ArrowRight size={11} className="text-gold-600 shrink-0" />
                                <span className="text-xs font-medium text-navy-700 truncate">
                                  {targetNode ? `→ ${targetNode.name}` : '→ (未设置)'}
                                </span>
                              </div>
                              <div className="font-mono text-[10px] text-navy-500 bg-white px-1.5 py-0.5 rounded border border-border-light truncate">
                                {branch.condition}
                              </div>
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); handleDeleteBranch(branch.id) }}
                              className="shrink-0 p-1 rounded hover:bg-red-50 group"
                            >
                              <Trash2 size={12} className="text-navy-300 group-hover:text-red-500" />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {editingBranchId === 'new' && (
                    <div className="rounded-lg border-2 border-gold-300 bg-gold-50/60 ring-1 ring-gold-200">
                      <div className="p-3 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gold-700">
                          <Sparkles size={12} />新增分支
                        </div>
                        <div>
                          <label className="text-[10px] text-navy-500 mb-1 block font-medium">目标节点</label>
                          <select
                            value={branchForm.toNodeId}
                            onChange={e => setBranchForm(prev => ({ ...prev, toNodeId: e.target.value }))}
                            className="w-full border border-border rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gold-400"
                          >
                            <option value="">选择节点…</option>
                            {availableTargetNodes.map(n => (
                              <option key={n.id} value={n.id}>
                                [{NODE_TYPE_CONFIG[n.type].label}] {n.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-navy-500 mb-1 block font-medium">条件表达式</label>
                          <input
                            value={branchForm.condition}
                            onChange={e => setBranchForm(prev => ({ ...prev, condition: e.target.value }))}
                            placeholder="如：amount > 500000 或 pass"
                            className="w-full border border-border rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gold-400 font-mono"
                          />
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {PRESET_CONDITIONS.map(p => (
                              <button
                                key={p.label}
                                onClick={() => handlePresetCondition(p.value)}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-border text-navy-500 hover:border-gold-300 hover:text-gold-700 hover:bg-gold-50"
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1.5 pt-1">
                          <button
                            onClick={handleSaveBranch}
                            disabled={!branchForm.toNodeId || !branchForm.condition?.trim()}
                            className="flex-1 px-2 py-1.5 rounded bg-gold-500 text-white text-xs hover:bg-gold-600 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            添加
                          </button>
                          <button
                            onClick={handleCancelBranch}
                            className="px-2 py-1.5 rounded bg-white border border-border text-navy-500 text-xs hover:bg-navy-50"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border shrink-0">
              <button
                onClick={handleDeleteNode}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-200 text-red-500 text-sm hover:bg-red-50"
              >
                <Trash2 size={14} />删除此节点
              </button>
              <p className="text-[10px] text-navy-300 text-center mt-2">
                删除节点会同时移除相关分支
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
