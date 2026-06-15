import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Upload, FileText, X } from 'lucide-react'
import { useStore } from '@/store'
import type { Template, TemplateField } from '@/types'

const STEPS = ['选择模板', '填写信息', '提交审批']

const ALL_DEPARTMENTS = ['采购部', '技术部', '市场部', '行政部', '人力资源部', '法务部']

export default function CreateContract() {
  const navigate = useNavigate()
  const { templates, workflows, addContract, addAttachment, currentUser } = useStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: number; type: string }>>([])
  const [extraDept, setExtraDept] = useState('')
  const [extraTitle, setExtraTitle] = useState('')

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)
  const activeWorkflow = workflows.find((w) => w.isActive) || workflows[0]

  const updateField = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const removeFile = (idx: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleFileDrop = () => {
    const sizes = [150000, 520000, 1048576, 2097152, 350000]
    const idx = uploadedFiles.length
    const name = `合同附件_${String(idx + 1).padStart(2, '0')}.pdf`
    setUploadedFiles((prev) => [...prev, {
      name,
      size: sizes[idx % sizes.length],
      type: 'application/pdf',
    }])
  }

  const getFieldValue = (name: string, altNames?: string[]): string => {
    if (formData[name]) return formData[name]
    for (const alt of altNames || []) {
      if (formData[alt]) return formData[alt]
    }
    return ''
  }

  const computeContractAmount = (): number => {
    const candidates = ['amount', '合同金额', '金额', 'contract_amount', 'value']
    for (const k of candidates) {
      if (formData[k]) {
        const n = Number(formData[k])
        if (!isNaN(n) && n > 0) return n
      }
    }
    return 0
  }

  const computeTitle = (): string => {
    if (extraTitle.trim()) return extraTitle.trim()
    const mainField = getFieldValue('合同名称', ['contract_title', 'title', 'name'])
    if (mainField) return mainField
    if (selectedTemplate) {
      const firstText = Object.entries(formData).find(
        ([, v]) => v && v.length > 0
      )?.[1]
      if (firstText) {
        return `${firstText} - ${selectedTemplate.name.replace(/模板$/, '')}`
      }
      return selectedTemplate.name.replace(/模板$/, '合同')
    }
    return '新建合同'
  }

  const computeDepartment = (): string => {
    if (extraDept) return extraDept
    const depField = getFieldValue('所属部门', ['部门', 'department', 'dept'])
    if (depField) return depField
    if (currentUser.name.includes('业务')) return '采购部'
    if (currentUser.name.includes('技术')) return '技术部'
    if (currentUser.name.includes('市场')) return '市场部'
    if (currentUser.name.includes('行政')) return '行政部'
    if (currentUser.name.includes('人力')) return '人力资源部'
    return currentUser.role === '申请人' ? '采购部' : '采购部'
  }

  const canNext = () => {
    if (currentStep === 0) return !!selectedTemplateId
    if (currentStep === 1) {
      if (!selectedTemplate) return false
      return selectedTemplate.fields
        .filter((f) => f.required)
        .every((f) => formData[f.name]?.trim())
    }
    return true
  }

  const handleSubmit = () => {
    if (!activeWorkflow) return
    const firstNode = activeWorkflow.nodes
      .filter(n => n.type !== 'condition')
      .sort((a, b) => a.order - b.order)[0] || activeWorkflow.nodes[0]

    const amount = computeContractAmount()
    const department = computeDepartment()
    const title = computeTitle()
    const contractId = `ct-${Date.now()}`
    const isoNow = new Date().toISOString()

    const contract = {
      id: contractId,
      title,
      workflowId: activeWorkflow.id,
      templateId: selectedTemplateId,
      initiatorId: currentUser.id,
      initiatorName: currentUser.name,
      department,
      amount,
      status: 'in_review' as const,
      currentNodeId: firstNode?.id || '',
      currentNodeName: firstNode?.name || '合同起草',
      createdAt: isoNow,
      updatedAt: isoNow,
    }
    addContract(contract)

    uploadedFiles.forEach((f, i) => {
      addAttachment({
        id: `att_${Date.now()}_${i}`,
        contractId,
        name: f.name,
        type: f.type,
        size: f.size,
        uploadedBy: currentUser.name,
        uploadedAt: isoNow,
      })
    })

    navigate(`/approval/${contractId}`)
  }

  const renderField = (field: TemplateField) => {
    const common = {
      className: 'input-field',
      value: formData[field.name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        updateField(field.name, e.target.value),
    }
    switch (field.type) {
      case 'text':
        return <input type="text" {...common} placeholder={`请输入${field.label}`} />
      case 'number':
        return <input type="number" {...common} placeholder={`请输入${field.label}`} />
      case 'date':
        return <input type="date" {...common} />
      case 'textarea':
        return <textarea rows={3} {...common} placeholder={`请输入${field.label}`} />
      case 'select':
        return (
          <select {...common}>
            <option value="">请选择{field.label}</option>
            {field.options?.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        )
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold font-serif text-navy-900">发起合同</h1>

      <div className="card p-6">
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    i < currentStep
                      ? 'bg-gold-500 text-navy-950'
                      : i === currentStep
                        ? 'bg-navy-900 text-white shadow-md'
                        : 'bg-navy-100 text-navy-400'
                  }`}
                >
                  {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`mt-1.5 text-xs font-medium ${
                    i <= currentStep ? 'text-navy-900' : 'text-navy-400'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-24 h-0.5 mx-3 mb-5 ${i < currentStep ? 'bg-gold-500' : 'bg-navy-100'}`}
                />
              )}
            </div>
          ))}
        </div>

        {currentStep === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplateId(t.id)}
                className={`card p-4 text-left transition-all hover:shadow-md ${
                  selectedTemplateId === t.id
                    ? 'ring-2 ring-gold-500 border-gold-500'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-navy-900 font-serif">{t.name}</h3>
                  <span className="badge bg-gold-100 text-gold-600">{t.category}</span>
                </div>
                <p className="text-sm text-navy-600 mb-3 line-clamp-2">{t.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-navy-400">{t.fields.length} 个字段</span>
                  <span className="text-navy-300">更新于 {new Date(t.updatedAt).toLocaleDateString('zh-CN')}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {currentStep === 1 && selectedTemplate && (
          <div className="space-y-5">
            <div className="bg-gold-50/40 rounded-lg p-4 border border-gold-200/50">
              <p className="text-xs text-gold-600 mb-2 font-medium">使用模板: {selectedTemplate.name}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5">
                    <span className="text-red-500 mr-0.5">*</span>合同名称
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="请输入合同名称"
                    value={extraTitle}
                    onChange={(e) => setExtraTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5">
                    <span className="text-red-500 mr-0.5">*</span>所属部门
                  </label>
                  <select
                    className="input-field"
                    value={extraDept}
                    onChange={(e) => setExtraDept(e.target.value)}
                  >
                    <option value="">请选择部门</option>
                    {ALL_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <p className="text-sm text-navy-500 font-medium border-b border-border-light pb-2">模板字段</p>

            {selectedTemplate.fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-navy-800 mb-1.5">
                  {field.required && <span className="text-red-500 mr-0.5">*</span>}
                  {field.label}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
        )}

        {currentStep === 2 && selectedTemplate && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-navy-900 font-serif">合同信息确认</h3>
              <div className="card p-4 space-y-2.5">
                <div className="flex justify-between text-sm border-b border-border-light pb-2">
                  <span className="text-navy-500">合同名称</span>
                  <span className="text-navy-900 font-medium">{computeTitle()}</span>
                </div>
                <div className="flex justify-between text-sm border-b border-border-light pb-2">
                  <span className="text-navy-500">所属部门</span>
                  <span className="text-navy-900 font-medium">{computeDepartment()}</span>
                </div>
                {selectedTemplate.fields.map((f) => (
                  <div key={f.name} className="flex justify-between text-sm">
                    <span className="text-navy-500">{f.label}</span>
                    <span className="text-navy-900 font-medium">
                      {f.type === 'number' && formData[f.name]
                        ? `¥${Number(formData[f.name]).toLocaleString()}`
                        : formData[f.name] || '—'}
                    </span>
                  </div>
                ))}
                <div className="mt-2 pt-3 border-t border-border-light flex justify-between">
                  <span className="text-navy-700 font-semibold">合同金额</span>
                  <span className="text-gold-600 font-bold text-lg">
                    ¥{computeContractAmount().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-navy-900 font-serif">上传附件</h3>
              <div
                onClick={handleFileDrop}
                className="border-2 border-dashed border-navy-200 rounded-xl p-8 text-center cursor-pointer hover:border-gold-500 hover:bg-gold-50/30 transition-all"
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-navy-400" />
                <p className="text-sm text-navy-600">点击上传合同相关附件</p>
                <p className="text-xs text-navy-400 mt-1">
                  支持 PDF、Word、Excel、图片等格式
                </p>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((f, idx) => (
                    <div
                      key={idx}
                      className="card px-3 py-2 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 text-sm text-navy-700">
                        <FileText className="w-4 h-4 text-gold-500" />
                        {f.name}
                        <span className="text-xs text-navy-400">
                          ({f.size >= 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : `${(f.size / 1024).toFixed(0)} KB`})
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        className="text-navy-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-light">
          <button
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={currentStep === 0}
            className="btn-secondary inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            上一步
          </button>
          {currentStep < 2 ? (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={!canNext()}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              下一步
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn-gold inline-flex items-center gap-2">
              <Check className="w-4 h-4" />
              提交审批
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
