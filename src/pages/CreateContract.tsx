import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Upload, FileText, X } from 'lucide-react'
import { useStore } from '@/store'
import type { Template, TemplateField } from '@/types'

const STEPS = ['选择模板', '填写信息', '提交审批']

export default function CreateContract() {
  const navigate = useNavigate()
  const { templates, workflows, addContract, currentUser } = useStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)
  const activeWorkflow = workflows.find((w) => w.isActive)

  const updateField = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const removeFile = (name: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f !== name))
  }

  const handleFileDrop = () => {
    const name = `附件_${uploadedFiles.length + 1}.pdf`
    setUploadedFiles((prev) => [...prev, name])
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
    if (!selectedTemplate || !activeWorkflow) return
    const firstNode = activeWorkflow.nodes[0]
    const contract = {
      id: `ct-${Date.now()}`,
      title: formData['合同名称'] || selectedTemplate.name,
      workflowId: activeWorkflow.id,
      templateId: selectedTemplate.id,
      initiatorId: currentUser.id,
      initiatorName: currentUser.name,
      department: formData['所属部门'] || '采购部',
      amount: Number(formData['合同金额']) || 0,
      status: 'draft' as const,
      currentNodeId: firstNode?.id || '',
      currentNodeName: firstNode?.name || '',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    }
    addContract(contract)
    navigate('/workspace')
  }

  const renderField = (field: TemplateField) => {
    const common = { className: 'input-field', value: formData[field.name] || '', onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => updateField(field.name, e.target.value) }
    switch (field.type) {
      case 'text': return <input type="text" {...common} placeholder={`请输入${field.label}`} />
      case 'number': return <input type="number" {...common} placeholder={`请输入${field.label}`} />
      case 'date': return <input type="date" {...common} />
      case 'textarea': return <textarea rows={3} {...common} placeholder={`请输入${field.label}`} />
      case 'select': return (
        <select {...common}>
          <option value="">请选择{field.label}</option>
          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">发起合同</h1>

      <div className="card p-6">
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  i < currentStep ? 'bg-gold-500 text-navy-950' :
                  i === currentStep ? 'bg-navy-900 text-white' :
                  'bg-navy-100 text-navy-400'
                }`}>
                  {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`mt-1.5 text-xs font-medium ${
                  i <= currentStep ? 'text-navy-900' : 'text-navy-400'
                }`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-20 h-0.5 mx-3 mb-5 ${i < currentStep ? 'bg-gold-500' : 'bg-navy-100'}`} />
              )}
            </div>
          ))}
        </div>

        {currentStep === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplateId(t.id)}
                className={`card p-4 text-left transition-all hover:shadow-md ${
                  selectedTemplateId === t.id ? 'ring-2 ring-gold-500 border-gold-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-navy-900">{t.name}</h3>
                  <span className="badge bg-gold-100 text-gold-600">{t.category}</span>
                </div>
                <p className="text-sm text-navy-600 mb-3 line-clamp-2">{t.description}</p>
                <span className="text-xs text-navy-400">{t.fields.length} 个字段</span>
              </button>
            ))}
          </div>
        )}

        {currentStep === 1 && selectedTemplate && (
          <div className="max-w-xl mx-auto space-y-5">
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
          <div className="max-w-xl mx-auto space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-navy-900">合同信息确认</h3>
              <div className="card p-4 space-y-2.5">
                {selectedTemplate.fields.map((f) => (
                  <div key={f.name} className="flex justify-between text-sm">
                    <span className="text-navy-500">{f.label}</span>
                    <span className="text-navy-900 font-medium">{formData[f.name] || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-navy-900">上传附件</h3>
              <div
                onClick={handleFileDrop}
                className="border-2 border-dashed border-navy-200 rounded-xl p-8 text-center cursor-pointer hover:border-gold-500 hover:bg-gold-50/30 transition-all"
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-navy-400" />
                <p className="text-sm text-navy-600">点击或拖拽文件到此处上传</p>
                <p className="text-xs text-navy-400 mt-1">支持 PDF、Word、图片等格式</p>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((name) => (
                    <div key={name} className="card px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-navy-700">
                        <FileText className="w-4 h-4 text-gold-500" />
                        {name}
                      </div>
                      <button onClick={() => removeFile(name)} className="text-navy-400 hover:text-red-500 transition-colors">
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
