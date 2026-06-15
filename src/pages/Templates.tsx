import { useState } from 'react'
import { useStore } from '@/store'
import { Link } from 'react-router-dom'
import type { Template, TemplateField } from '@/types'
import { Plus, Search, Edit, Trash2, FileText, X, ChevronDown, GripVertical, Check, ToggleLeft, ToggleRight } from 'lucide-react'

const CATEGORIES = ['采购类', '租赁类', '技术类', '市场类', '人事类', '法务类']

const CATEGORY_COLORS: Record<string, string> = {
  '采购类': 'bg-blue-100 text-blue-700',
  '租赁类': 'bg-purple-100 text-purple-700',
  '技术类': 'bg-cyan-100 text-cyan-700',
  '市场类': 'bg-orange-100 text-orange-700',
  '人事类': 'bg-green-100 text-green-700',
  '法务类': 'bg-navy-100 text-navy-700',
}

const FIELD_TYPES: TemplateField['type'][] = ['text', 'number', 'date', 'select', 'textarea']
const FIELD_TYPE_LABELS: Record<string, string> = { text: '文本', number: '数字', date: '日期', select: '下拉选择', textarea: '长文本' }

const emptyField = (): TemplateField => ({ name: '', label: '', type: 'text', required: false, options: [] })

export default function Templates() {
  const { templates, addTemplate, updateTemplate, deleteTemplate, currentUser } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState(CATEGORIES[0])
  const [formDesc, setFormDesc] = useState('')
  const [formFields, setFormFields] = useState<TemplateField[]>([emptyField()])
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null)

  const categoryCounts = CATEGORIES.reduce((acc, c) => {
    acc[c] = templates.filter(t => t.category === c).length
    return acc
  }, {} as Record<string, number>)

  const filtered = templates.filter(t => {
    const matchCat = selectedCategory === '全部' || t.category === selectedCategory
    const matchSearch = !searchQuery || t.name.includes(searchQuery) || t.description.includes(searchQuery)
    return matchCat && matchSearch
  })

  const openNew = () => {
    setEditingTemplate(null)
    setFormName(''); setFormCategory(CATEGORIES[0]); setFormDesc('')
    setFormFields([emptyField()])
    setShowModal(true)
  }

  const openEdit = (t: Template) => {
    setEditingTemplate(t)
    setFormName(t.name); setFormCategory(t.category); setFormDesc(t.description)
    setFormFields(t.fields.length ? t.fields.map(f => ({ ...f, options: f.options ? [...f.options] : [] })) : [emptyField()])
    setShowModal(true)
  }

  const handleSave = () => {
    if (!formName.trim()) return
    const fields = formFields.filter(f => f.name.trim() && f.label.trim())
    const now = new Date().toISOString().slice(0, 10)
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, { name: formName, category: formCategory, description: formDesc, fields, updatedAt: now })
    } else {
      addTemplate({ id: `tpl_${Date.now()}`, name: formName, category: formCategory, description: formDesc, fields, createdBy: currentUser.id, createdAt: now, updatedAt: now })
    }
    setShowModal(false)
  }

  const updateField = (i: number, updates: Partial<TemplateField>) => {
    setFormFields(prev => prev.map((f, idx) => idx === i ? { ...f, ...updates } : f))
  }

  const addField = () => setFormFields(prev => [...prev, emptyField()])
  const removeField = (i: number) => setFormFields(prev => prev.filter((_, idx) => idx !== i))

  const addOption = (fi: number) => {
    setFormFields(prev => prev.map((f, i) => i === fi ? { ...f, options: [...(f.options || []), ''] } : f))
  }
  const updateOption = (fi: number, oi: number, val: string) => {
    setFormFields(prev => prev.map((f, i) => i === fi ? { ...f, options: (f.options || []).map((o, j) => j === oi ? val : o) } : f))
  }
  const removeOption = (fi: number, oi: number) => {
    setFormFields(prev => prev.map((f, i) => i === fi ? { ...f, options: (f.options || []).filter((_, j) => j !== oi) } : f))
  }

  return (
    <div className="flex gap-6 h-full">
      <aside className="w-52 shrink-0">
        <div className="card p-4 sticky top-6">
          <h3 className="text-sm font-semibold text-navy-400 mb-3">模板分类</h3>
          <ul className="space-y-1">
            <li>
              <button onClick={() => setSelectedCategory('全部')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === '全部' ? 'bg-navy-900 text-white font-medium' : 'text-navy-600 hover:bg-navy-50'}`}>
                全部 <span className="ml-1 opacity-60">{templates.length}</span>
              </button>
            </li>
            {CATEGORIES.map(c => (
              <li key={c}>
                <button onClick={() => setSelectedCategory(c)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === c ? 'bg-navy-900 text-white font-medium' : 'text-navy-600 hover:bg-navy-50'}`}>
                  {c} <span className="ml-1 opacity-60">{categoryCounts[c] || 0}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索模板..." className="input-field pl-10" />
          </div>
          <button onClick={openNew} className="btn-gold flex items-center gap-2">
            <Plus className="w-4 h-4" /> 新建模板
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <FileText className="w-12 h-12 text-navy-200 mx-auto mb-3" />
            <p className="text-navy-400">暂无模板</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {filtered.map(t => (
              <div key={t.id} className="card p-5 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <span className={`badge ${CATEGORY_COLORS[t.category] || 'bg-gray-100 text-gray-700'}`}>{t.category}</span>
                  <FileText className="w-4 h-4 text-navy-300" />
                </div>
                <h3 className="font-serif font-bold text-navy-900 mb-1.5 text-lg leading-tight">{t.name}</h3>
                <p className="text-sm text-navy-400 mb-3 line-clamp-2 flex-1">{t.description}</p>
                <div className="flex items-center gap-3 text-xs text-navy-300 mb-4">
                  <span>{t.fields.length} 个字段</span>
                  <span>创建 {t.createdAt}</span>
                  <span>更新 {t.updatedAt}</span>
                </div>
                <div className="flex items-center gap-2 border-t border-border-light pt-3">
                  <button onClick={() => openEdit(t)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                    <Edit className="w-3.5 h-3.5" /> 编辑
                  </button>
                  <button onClick={() => setDeleteTarget(t)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 text-red-500 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" /> 删除
                  </button>
                  <Link to="/workspace/create" className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 ml-auto">
                    使用
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(showModal || deleteTarget) && <div className="fixed inset-0 bg-navy-950/50 z-40" onClick={() => { setShowModal(false); setDeleteTarget(null) }} />}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
              <h2 className="text-lg font-serif font-bold text-navy-900">{editingTemplate ? '编辑模板' : '新建模板'}</h2>
              <button onClick={() => setShowModal(false)} className="text-navy-300 hover:text-navy-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">模板名称</label>
                <input value={formName} onChange={e => setFormName(e.target.value)} className="input-field" placeholder="输入模板名称" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">分类</label>
                <div className="relative">
                  <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="input-field appearance-none pr-10">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">描述</label>
                <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} className="input-field" rows={3} placeholder="输入模板描述" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-navy-700">字段列表</label>
                  <button onClick={addField} className="text-sm text-gold-500 hover:text-gold-400 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> 添加字段
                  </button>
                </div>
                <div className="space-y-3">
                  {formFields.map((f, i) => (
                    <div key={i} className="border border-border-light rounded-lg p-3 space-y-2 bg-surface">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-navy-300 shrink-0" />
                        <input value={f.name} onChange={e => updateField(i, { name: e.target.value })} placeholder="字段名" className="input-field text-sm py-1.5 flex-1" />
                        <input value={f.label} onChange={e => updateField(i, { label: e.target.value })} placeholder="标签" className="input-field text-sm py-1.5 flex-1" />
                        <div className="relative">
                          <select value={f.type} onChange={e => updateField(i, { type: e.target.value as TemplateField['type'] })} className="input-field text-sm py-1.5 appearance-none pr-8 w-28">
                            {FIELD_TYPES.map(t => <option key={t} value={t}>{FIELD_TYPE_LABELS[t]}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-navy-400 pointer-events-none" />
                        </div>
                        <button onClick={() => updateField(i, { required: !f.required })} className="shrink-0 text-navy-400 hover:text-navy-700">
                          {f.required ? <ToggleRight className="w-6 h-6 text-gold-500" /> : <ToggleLeft className="w-6 h-6" />}
                        </button>
                        <button onClick={() => removeField(i)} className="shrink-0 text-navy-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                      </div>
                      {f.type === 'select' && (
                        <div className="ml-6 space-y-1.5">
                          {(f.options || []).map((o, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-navy-300 shrink-0" />
                              <input value={o} onChange={e => updateOption(i, oi, e.target.value)} className="input-field text-sm py-1 flex-1" placeholder="选项值" />
                              <button onClick={() => removeOption(i, oi)} className="text-navy-300 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          ))}
                          <button onClick={() => addOption(i)} className="text-xs text-gold-500 hover:text-gold-400 flex items-center gap-1 ml-1">
                            <Plus className="w-3 h-3" /> 添加选项
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-light">
              <button onClick={() => setShowModal(false)} className="btn-secondary">取消</button>
              <button onClick={handleSave} className="btn-gold">保存</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-serif font-bold text-navy-900 mb-2">确认删除</h3>
            <p className="text-sm text-navy-500 mb-6">确定要删除模板「{deleteTarget.name}」吗？此操作不可撤销。</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary">取消</button>
              <button onClick={() => { deleteTemplate(deleteTarget.id); setDeleteTarget(null) }} className="btn-danger">删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
