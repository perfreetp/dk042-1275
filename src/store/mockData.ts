import type { Workflow, Contract, ApprovalRecord, Attachment, Template, UrgencyLog } from '@/types'

export const mockWorkflows: Workflow[] = [
  {
    id: 'wf-001',
    name: '标准合同审批流程',
    description: '适用于常规合同审批，金额≤50万',
    version: '2.1',
    isActive: true,
    createdBy: '张管理',
    createdAt: '2025-01-15',
    nodes: [
      { id: 'n1', workflowId: 'wf-001', type: 'draft', name: '合同起草', assigneeRole: '申请人', timeLimit: 3, requiredMaterials: ['合同文本', '对方资质'], order: 1, position: { x: 100, y: 200 } },
      { id: 'n2', workflowId: 'wf-001', type: 'business_confirm', name: '业务确认', assigneeRole: '业务主管', timeLimit: 2, requiredMaterials: ['业务确认函'], order: 2, position: { x: 300, y: 200 } },
      { id: 'n3', workflowId: 'wf-001', type: 'condition', name: '金额判断', assigneeRole: '', timeLimit: 0, requiredMaterials: [], order: 3, position: { x: 500, y: 200 } },
      { id: 'n4', workflowId: 'wf-001', type: 'legal_review', name: '法务审核', assigneeRole: '法务专员', timeLimit: 3, requiredMaterials: ['法律意见书'], order: 4, position: { x: 700, y: 120 } },
      { id: 'n5', workflowId: 'wf-001', type: 'finance_review', name: '财务复核', assigneeRole: '财务主管', timeLimit: 2, requiredMaterials: ['财务测算表'], order: 5, position: { x: 700, y: 300 } },
      { id: 'n6', workflowId: 'wf-001', type: 'stamp', name: '盖章', assigneeRole: '印章管理员', timeLimit: 1, requiredMaterials: [], order: 6, position: { x: 900, y: 200 } },
      { id: 'n7', workflowId: 'wf-001', type: 'archive', name: '归档', assigneeRole: '档案管理员', timeLimit: 1, requiredMaterials: ['归档清单'], order: 7, position: { x: 1100, y: 200 } },
    ],
    branches: [
      { id: 'b1', workflowId: 'wf-001', fromNodeId: 'n3', condition: '金额≤50万', toNodeId: 'n4', priority: 1 },
      { id: 'b2', workflowId: 'wf-001', fromNodeId: 'n3', condition: '金额>50万', toNodeId: 'n5', priority: 2 },
      { id: 'b3', workflowId: 'wf-001', fromNodeId: 'n4', condition: '通过', toNodeId: 'n6', priority: 1 },
      { id: 'b4', workflowId: 'wf-001', fromNodeId: 'n5', condition: '通过', toNodeId: 'n6', priority: 1 },
    ],
  },
  {
    id: 'wf-002',
    name: '大额合同审批流程',
    description: '适用于金额>50万的重要合同',
    version: '1.3',
    isActive: true,
    createdBy: '张管理',
    createdAt: '2025-03-01',
    nodes: [
      { id: 'n2-1', workflowId: 'wf-002', type: 'draft', name: '合同起草', assigneeRole: '申请人', timeLimit: 5, requiredMaterials: ['合同文本', '对方资质', '合作背景说明'], order: 1, position: { x: 100, y: 200 } },
      { id: 'n2-2', workflowId: 'wf-002', type: 'business_confirm', name: '部门负责人确认', assigneeRole: '部门负责人', timeLimit: 2, requiredMaterials: ['业务确认函'], order: 2, position: { x: 300, y: 200 } },
      { id: 'n2-3', workflowId: 'wf-002', type: 'finance_review', name: '财务复核', assigneeRole: '财务主管', timeLimit: 3, requiredMaterials: ['财务测算表', '预算审批单'], order: 3, position: { x: 500, y: 200 } },
      { id: 'n2-4', workflowId: 'wf-002', type: 'legal_review', name: '法务审核', assigneeRole: '法务总监', timeLimit: 5, requiredMaterials: ['法律意见书', '风险评估报告'], order: 4, position: { x: 700, y: 200 } },
      { id: 'n2-5', workflowId: 'wf-002', type: 'stamp', name: '盖章', assigneeRole: '印章管理员', timeLimit: 1, requiredMaterials: [], order: 5, position: { x: 900, y: 200 } },
      { id: 'n2-6', workflowId: 'wf-002', type: 'archive', name: '归档', assigneeRole: '档案管理员', timeLimit: 1, requiredMaterials: ['归档清单', '原件扫描件'], order: 6, position: { x: 1100, y: 200 } },
    ],
    branches: [],
  },
  {
    id: 'wf-003',
    name: '简易合同流程',
    description: '适用于框架协议、备忘录等低风险文件',
    version: '1.0',
    isActive: false,
    createdBy: '李法务',
    createdAt: '2025-05-10',
    nodes: [
      { id: 'n3-1', workflowId: 'wf-003', type: 'draft', name: '起草', assigneeRole: '申请人', timeLimit: 2, requiredMaterials: ['文件文本'], order: 1, position: { x: 100, y: 200 } },
      { id: 'n3-2', workflowId: 'wf-003', type: 'legal_review', name: '法务确认', assigneeRole: '法务专员', timeLimit: 1, requiredMaterials: [], order: 2, position: { x: 400, y: 200 } },
      { id: 'n3-3', workflowId: 'wf-003', type: 'stamp', name: '盖章', assigneeRole: '印章管理员', timeLimit: 1, requiredMaterials: [], order: 3, position: { x: 700, y: 200 } },
      { id: 'n3-4', workflowId: 'wf-003', type: 'archive', name: '归档', assigneeRole: '档案管理员', timeLimit: 1, requiredMaterials: [], order: 4, position: { x: 1000, y: 200 } },
    ],
    branches: [],
  },
]

export const mockContracts: Contract[] = [
  { id: 'ct-001', title: 'XX科技产品采购合同', workflowId: 'wf-001', templateId: 'tp-001', initiatorId: 'u003', initiatorName: '王业务', department: '采购部', amount: 350000, status: 'in_review', currentNodeId: 'n4', currentNodeName: '法务审核', createdAt: '2026-05-20', updatedAt: '2026-06-01' },
  { id: 'ct-002', title: '办公楼租赁合同', workflowId: 'wf-001', templateId: 'tp-002', initiatorId: 'u004', initiatorName: '赵行政', department: '行政部', amount: 1200000, status: 'in_review', currentNodeId: 'n5', currentNodeName: '财务复核', createdAt: '2026-05-15', updatedAt: '2026-05-28' },
  { id: 'ct-003', title: 'SaaS服务订阅协议', workflowId: 'wf-002', templateId: 'tp-003', initiatorId: 'u005', initiatorName: '陈技术', department: '技术部', amount: 280000, status: 'approved', currentNodeId: 'n6', currentNodeName: '盖章', createdAt: '2026-04-10', updatedAt: '2026-05-05' },
  { id: 'ct-004', title: '市场推广合作合同', workflowId: 'wf-001', templateId: 'tp-004', initiatorId: 'u006', initiatorName: '刘市场', department: '市场部', amount: 500000, status: 'rejected', currentNodeId: 'n4', currentNodeName: '法务审核', createdAt: '2026-03-20', updatedAt: '2026-04-02' },
  { id: 'ct-005', title: '人力资源外包服务合同', workflowId: 'wf-002', templateId: 'tp-005', initiatorId: 'u007', initiatorName: '孙人力', department: '人力资源部', amount: 800000, status: 'archived', currentNodeId: 'n7', currentNodeName: '归档', createdAt: '2026-01-05', updatedAt: '2026-02-10', archivedAt: '2026-02-10' },
  { id: 'ct-006', title: '知识产权许可协议', workflowId: 'wf-001', templateId: 'tp-006', initiatorId: 'u003', initiatorName: '王业务', department: '法务部', amount: 150000, status: 'stamped', currentNodeId: 'n7', currentNodeName: '归档', createdAt: '2026-05-01', updatedAt: '2026-05-25' },
  { id: 'ct-007', title: '云服务器租赁合同', workflowId: 'wf-002', templateId: 'tp-003', initiatorId: 'u005', initiatorName: '陈技术', department: '技术部', amount: 960000, status: 'draft', currentNodeId: 'n2-1', currentNodeName: '合同起草', createdAt: '2026-06-10', updatedAt: '2026-06-10' },
  { id: 'ct-008', title: '员工培训服务合同', workflowId: 'wf-001', templateId: 'tp-007', initiatorId: 'u007', initiatorName: '孙人力', department: '人力资源部', amount: 200000, status: 'in_review', currentNodeId: 'n2', currentNodeName: '业务确认', createdAt: '2026-06-05', updatedAt: '2026-06-12' },
  { id: 'ct-009', title: '办公设备采购合同', workflowId: 'wf-001', templateId: 'tp-001', initiatorId: 'u004', initiatorName: '赵行政', department: '行政部', amount: 180000, status: 'archived', currentNodeId: 'n7', currentNodeName: '归档', createdAt: '2025-11-15', updatedAt: '2025-12-20', archivedAt: '2025-12-20' },
  { id: 'ct-010', title: '物流配送服务框架协议', workflowId: 'wf-002', templateId: 'tp-008', initiatorId: 'u003', initiatorName: '王业务', department: '采购部', amount: 2200000, status: 'archived', currentNodeId: 'n2-6', currentNodeName: '归档', createdAt: '2025-08-01', updatedAt: '2025-09-15', archivedAt: '2025-09-15' },
  { id: 'ct-011', title: '品牌设计服务合同', workflowId: 'wf-001', templateId: 'tp-004', initiatorId: 'u006', initiatorName: '刘市场', department: '市场部', amount: 420000, status: 'in_review', currentNodeId: 'n4', currentNodeName: '法务审核', createdAt: '2026-06-08', updatedAt: '2026-06-13' },
  { id: 'ct-012', title: '安全运维服务合同', workflowId: 'wf-002', templateId: 'tp-003', initiatorId: 'u005', initiatorName: '陈技术', department: '技术部', amount: 680000, status: 'approved', currentNodeId: 'n2-5', currentNodeName: '盖章', createdAt: '2026-02-20', updatedAt: '2026-03-25' },
]

export const mockApprovalRecords: ApprovalRecord[] = [
  { id: 'ar-001', contractId: 'ct-001', nodeId: 'n1', nodeName: '合同起草', approverId: 'u003', approverName: '王业务', action: 'approve', opinion: '合同内容已完善，提交审核', createdAt: '2026-05-20 10:30' },
  { id: 'ar-002', contractId: 'ct-001', nodeId: 'n2', nodeName: '业务确认', approverId: 'u008', approverName: '周主管', action: 'approve', opinion: '业务需求已确认，同意', createdAt: '2026-05-22 14:15' },
  { id: 'ar-003', contractId: 'ct-002', nodeId: 'n1', nodeName: '合同起草', approverId: 'u004', approverName: '赵行政', action: 'approve', opinion: '材料已齐备', createdAt: '2026-05-15 09:00' },
  { id: 'ar-004', contractId: 'ct-002', nodeId: 'n2', nodeName: '业务确认', approverId: 'u009', approverName: '吴经理', action: 'approve', opinion: '确认', createdAt: '2026-05-17 11:20' },
  { id: 'ar-005', contractId: 'ct-004', nodeId: 'n1', nodeName: '合同起草', approverId: 'u006', approverName: '刘市场', action: 'approve', opinion: '已提交', createdAt: '2026-03-20 16:00' },
  { id: 'ar-006', contractId: 'ct-004', nodeId: 'n2', nodeName: '业务确认', approverId: 'u010', approverName: '郑总监', action: 'approve', opinion: '确认', createdAt: '2026-03-22 09:30' },
  { id: 'ar-007', contractId: 'ct-004', nodeId: 'n4', nodeName: '法务审核', approverId: 'u002', approverName: '李法务', action: 'reject', opinion: '合同第8条违约责任条款不明确，请修改后重新提交。建议参照标准模板补充违约金计算方式。', createdAt: '2026-04-02 15:45' },
  { id: 'ar-008', contractId: 'ct-005', nodeId: 'n2-1', nodeName: '合同起草', approverId: 'u007', approverName: '孙人力', action: 'approve', opinion: '材料齐全', createdAt: '2026-01-05 10:00' },
  { id: 'ar-009', contractId: 'ct-005', nodeId: 'n2-2', nodeName: '部门负责人确认', approverId: 'u010', approverName: '郑总监', action: 'approve', opinion: '同意', createdAt: '2026-01-07 14:00' },
  { id: 'ar-010', contractId: 'ct-005', nodeId: 'n2-3', nodeName: '财务复核', approverId: 'u011', approverName: '钱会计', action: 'approve', opinion: '预算充足，同意', createdAt: '2026-01-10 11:30' },
  { id: 'ar-011', contractId: 'ct-005', nodeId: 'n2-4', nodeName: '法务审核', approverId: 'u002', approverName: '李法务', action: 'approve', opinion: '合同条款合规', createdAt: '2026-01-15 09:00' },
  { id: 'ar-012', contractId: 'ct-005', nodeId: 'n2-5', nodeName: '盖章', approverId: 'u012', approverName: '冯印章', action: 'approve', opinion: '已盖章', createdAt: '2026-01-18 10:00' },
  { id: 'ar-013', contractId: 'ct-005', nodeId: 'n2-6', nodeName: '归档', approverId: 'u013', approverName: '褚档案', action: 'approve', opinion: '已归档', createdAt: '2026-01-20 14:00' },
  { id: 'ar-014', contractId: 'ct-006', nodeId: 'n1', nodeName: '合同起草', approverId: 'u003', approverName: '王业务', action: 'approve', opinion: '已完成起草', createdAt: '2026-05-01 10:00' },
  { id: 'ar-015', contractId: 'ct-006', nodeId: 'n2', nodeName: '业务确认', approverId: 'u008', approverName: '周主管', action: 'approve', opinion: '确认', createdAt: '2026-05-03 11:00' },
  { id: 'ar-016', contractId: 'ct-006', nodeId: 'n4', nodeName: '法务审核', approverId: 'u002', approverName: '李法务', action: 'approve', opinion: '条款合规', createdAt: '2026-05-08 15:30' },
  { id: 'ar-017', contractId: 'ct-006', nodeId: 'n6', nodeName: '盖章', approverId: 'u012', approverName: '冯印章', action: 'approve', opinion: '已盖章完成', createdAt: '2026-05-15 09:00' },
  { id: 'ar-018', contractId: 'ct-011', nodeId: 'n1', nodeName: '合同起草', approverId: 'u006', approverName: '刘市场', action: 'approve', opinion: '已提交审核', createdAt: '2026-06-08 10:00' },
  { id: 'ar-019', contractId: 'ct-011', nodeId: 'n2', nodeName: '业务确认', approverId: 'u009', approverName: '吴经理', action: 'add_signer', opinion: '需要品牌部确认，已加签品牌经理', createdAt: '2026-06-10 14:00' },
  { id: 'ar-020', contractId: 'ct-008', nodeId: 'n1', nodeName: '合同起草', approverId: 'u007', approverName: '孙人力', action: 'approve', opinion: '已填写完毕', createdAt: '2026-06-05 09:30' },
]

export const mockAttachments: Attachment[] = [
  { id: 'at-001', contractId: 'ct-001', name: '产品采购合同_v1.2.pdf', type: 'pdf', size: 2048000, uploadedBy: '王业务', uploadedAt: '2026-05-20' },
  { id: 'at-002', contractId: 'ct-001', name: 'XX科技营业执照.pdf', type: 'pdf', size: 512000, uploadedBy: '王业务', uploadedAt: '2026-05-20' },
  { id: 'at-003', contractId: 'ct-001', name: '业务确认函.docx', type: 'docx', size: 128000, uploadedBy: '周主管', uploadedAt: '2026-05-22' },
  { id: 'at-004', contractId: 'ct-002', name: '办公楼租赁合同.pdf', type: 'pdf', size: 3072000, uploadedBy: '赵行政', uploadedAt: '2026-05-15' },
  { id: 'at-005', contractId: 'ct-002', name: '房产证复印件.pdf', type: 'pdf', size: 1024000, uploadedBy: '赵行政', uploadedAt: '2026-05-15' },
  { id: 'at-006', contractId: 'ct-004', name: '市场推广合作合同.pdf', type: 'pdf', size: 1536000, uploadedBy: '刘市场', uploadedAt: '2026-03-20' },
  { id: 'at-007', contractId: 'ct-005', name: '人力资源外包服务合同.pdf', type: 'pdf', size: 2560000, uploadedBy: '孙人力', uploadedAt: '2026-01-05' },
  { id: 'at-008', contractId: 'ct-005', name: '财务测算表.xlsx', type: 'xlsx', size: 256000, uploadedBy: '钱会计', uploadedAt: '2026-01-10' },
  { id: 'at-009', contractId: 'ct-006', name: '知识产权许可协议.pdf', type: 'pdf', size: 1792000, uploadedBy: '王业务', uploadedAt: '2026-05-01' },
  { id: 'at-010', contractId: 'ct-011', name: '品牌设计服务合同.pdf', type: 'pdf', size: 1280000, uploadedBy: '刘市场', uploadedAt: '2026-06-08' },
]

export const mockTemplates: Template[] = [
  {
    id: 'tp-001', name: '产品采购合同模板', category: '采购类', description: '适用于公司各类产品、设备采购',
    fields: [
      { name: 'supplier', label: '供应商名称', type: 'text', required: true },
      { name: 'amount', label: '合同金额', type: 'number', required: true },
      { name: 'deliveryDate', label: '交付日期', type: 'date', required: true },
      { name: 'paymentTerms', label: '付款条件', type: 'select', required: true, options: ['预付全款', '分期付款', '货到付款', '30天账期'] },
      { name: 'remarks', label: '备注', type: 'textarea', required: false },
    ],
    createdBy: '张管理', createdAt: '2025-06-01', updatedAt: '2026-03-15',
  },
  {
    id: 'tp-002', name: '房屋租赁合同模板', category: '租赁类', description: '适用于办公场地、仓库等租赁',
    fields: [
      { name: 'lessor', label: '出租方', type: 'text', required: true },
      { name: 'address', label: '租赁地址', type: 'text', required: true },
      { name: 'amount', label: '年租金', type: 'number', required: true },
      { name: 'term', label: '租赁期限', type: 'select', required: true, options: ['1年', '2年', '3年', '5年'] },
      { name: 'deposit', label: '押金金额', type: 'number', required: true },
      { name: 'remarks', label: '特殊约定', type: 'textarea', required: false },
    ],
    createdBy: '张管理', createdAt: '2025-06-15', updatedAt: '2026-01-20',
  },
  {
    id: 'tp-003', name: '技术服务合同模板', category: '技术类', description: '适用于IT服务、软件开发、云服务',
    fields: [
      { name: 'provider', label: '服务提供方', type: 'text', required: true },
      { name: 'serviceType', label: '服务类型', type: 'select', required: true, options: ['软件开发', '云服务', '运维服务', '技术咨询'] },
      { name: 'amount', label: '合同金额', type: 'number', required: true },
      { name: 'duration', label: '服务期限', type: 'text', required: true },
      { name: 'sla', label: 'SLA要求', type: 'textarea', required: false },
    ],
    createdBy: '李法务', createdAt: '2025-07-01', updatedAt: '2026-02-10',
  },
  {
    id: 'tp-004', name: '市场推广服务合同模板', category: '市场类', description: '适用于广告投放、品牌合作、活动策划',
    fields: [
      { name: 'agency', label: '合作方名称', type: 'text', required: true },
      { name: 'serviceContent', label: '服务内容', type: 'textarea', required: true },
      { name: 'amount', label: '合同金额', type: 'number', required: true },
      { name: 'campaignPeriod', label: '推广周期', type: 'text', required: true },
    ],
    createdBy: '张管理', createdAt: '2025-08-01', updatedAt: '2026-04-05',
  },
  {
    id: 'tp-005', name: '人力资源外包服务合同模板', category: '人事类', description: '适用于劳务派遣、外包服务等',
    fields: [
      { name: 'provider', label: '服务商', type: 'text', required: true },
      { name: 'headcount', label: '外包人数', type: 'number', required: true },
      { name: 'amount', label: '服务费用', type: 'number', required: true },
      { name: 'servicePeriod', label: '服务期限', type: 'text', required: true },
      { name: 'remarks', label: '特殊要求', type: 'textarea', required: false },
    ],
    createdBy: '张管理', createdAt: '2025-09-01', updatedAt: '2025-12-10',
  },
  {
    id: 'tp-006', name: '知识产权许可协议模板', category: '法务类', description: '适用于专利、商标、版权许可',
    fields: [
      { name: 'licensor', label: '许可方', type: 'text', required: true },
      { name: 'licenseType', label: '许可类型', type: 'select', required: true, options: ['独占许可', '排他许可', '普通许可'] },
      { name: 'amount', label: '许可费用', type: 'number', required: true },
      { name: 'scope', label: '许可范围', type: 'textarea', required: true },
    ],
    createdBy: '李法务', createdAt: '2025-10-01', updatedAt: '2026-05-20',
  },
  {
    id: 'tp-007', name: '培训服务合同模板', category: '人事类', description: '适用于员工培训、课程采购',
    fields: [
      { name: 'trainer', label: '培训机构', type: 'text', required: true },
      { name: 'course', label: '课程名称', type: 'text', required: true },
      { name: 'headcount', label: '参训人数', type: 'number', required: true },
      { name: 'amount', label: '培训费用', type: 'number', required: true },
    ],
    createdBy: '张管理', createdAt: '2025-11-01', updatedAt: '2026-03-01',
  },
  {
    id: 'tp-008', name: '物流配送服务框架协议模板', category: '采购类', description: '适用于长期物流合作',
    fields: [
      { name: 'carrier', label: '物流商', type: 'text', required: true },
      { name: 'scope', label: '服务范围', type: 'textarea', required: true },
      { name: 'amount', label: '年度预估金额', type: 'number', required: true },
      { name: 'term', label: '协议期限', type: 'select', required: true, options: ['1年', '2年', '3年'] },
    ],
    createdBy: '李法务', createdAt: '2025-12-01', updatedAt: '2026-04-15',
  },
]

export const mockUrgencyLogs: UrgencyLog[] = [
  { id: 'ug-001', contractId: 'ct-001', urgenterId: 'u003', urgenterName: '王业务', targetNodeId: 'n4', message: '请尽快审核，供应商催促签约', createdAt: '2026-05-30 10:00' },
  { id: 'ug-002', contractId: 'ct-002', urgenterId: 'u004', urgenterName: '赵行政', targetNodeId: 'n5', message: '租赁合同即将到期，急需续签', createdAt: '2026-05-25 14:30' },
]

export const departmentStats = [
  { department: '采购部', count: 45, totalAmount: 12500000, avgDays: 8.5 },
  { department: '技术部', count: 32, totalAmount: 8900000, avgDays: 10.2 },
  { department: '市场部', count: 28, totalAmount: 6700000, avgDays: 7.8 },
  { department: '行政部', count: 20, totalAmount: 4300000, avgDays: 6.5 },
  { department: '人力资源部', count: 15, totalAmount: 3100000, avgDays: 9.1 },
  { department: '法务部', count: 10, totalAmount: 1800000, avgDays: 5.3 },
]

export const monthlyTrend = [
  { month: '1月', contracts: 12, amount: 3200000 },
  { month: '2月', contracts: 8, amount: 2100000 },
  { month: '3月', contracts: 15, amount: 4800000 },
  { month: '4月', contracts: 18, amount: 5500000 },
  { month: '5月', contracts: 22, amount: 7200000 },
  { month: '6月', contracts: 25, amount: 8100000 },
]

export const nodeTimeStats = [
  { node: '合同起草', avgHours: 48, maxHours: 72 },
  { node: '业务确认', avgHours: 24, maxHours: 48 },
  { node: '法务审核', avgHours: 56, maxHours: 120 },
  { node: '财务复核', avgHours: 32, maxHours: 48 },
  { node: '盖章', avgHours: 8, maxHours: 24 },
  { node: '归档', avgHours: 12, maxHours: 24 },
]

export const abnormalNodes = [
  { id: 'ab-001', contractTitle: 'XX科技产品采购合同', node: '法务审核', type: '超时', detail: '已超时限2天', severity: 'high' },
  { id: 'ab-002', contractTitle: '办公楼租赁合同', node: '财务复核', type: '超时', detail: '已超时限1天', severity: 'medium' },
  { id: 'ab-003', contractTitle: '市场推广合作合同', node: '法务审核', type: '驳回', detail: '违约责任条款不明确', severity: 'high' },
  { id: 'ab-004', contractTitle: '品牌设计服务合同', node: '业务确认', type: '加签', detail: '已加签品牌经理审批', severity: 'low' },
  { id: 'ab-005', contractTitle: 'SaaS服务订阅协议', node: '法务审核', type: '超时', detail: '已超时限3天', severity: 'high' },
]
