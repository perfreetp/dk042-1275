import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  GitBranch,
  Briefcase,
  FileText,
  Archive,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  CheckSquare,
  Eye,
} from 'lucide-react'
import { useStore } from '@/store'

const navItems = [
  { path: '/', label: '工作台概览', icon: LayoutDashboard },
  { path: '/designer', label: '流程设计器', icon: GitBranch },
  { path: '/workspace', label: '合同工作台', icon: Briefcase },
  { path: '/templates', label: '模板中心', icon: FileText },
  { path: '/archive', label: '归档查询', icon: Archive },
  { path: '/statistics', label: '统计分析', icon: BarChart3 },
]

const roles = [
  { key: 'admin' as const, label: '管理员', icon: Shield },
  { key: 'applicant' as const, label: '申请人', icon: User },
  { key: 'approver' as const, label: '审批人', icon: CheckSquare },
  { key: 'manager' as const, label: '管理者', icon: Eye },
]

const breadcrumbMap: Record<string, string> = {
  '/': '工作台概览',
  '/designer': '流程设计器',
  '/workspace': '合同工作台',
  '/workspace/create': '发起新合同',
  '/templates': '模板中心',
  '/archive': '归档查询',
  '/statistics': '统计分析',
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { currentRole, currentUser, setCurrentRole } = useStore()

  const pathSegments = location.pathname.split('/').filter(Boolean)
  const breadcrumbs = pathSegments.length === 0
    ? [{ label: '工作台概览', path: '/' }]
    : pathSegments.reduce<Array<{ label: string; path: string }>>((acc, seg, i) => {
        const path = '/' + pathSegments.slice(0, i + 1).join('/')
        acc.push({ label: breadcrumbMap[path] || seg, path })
        return acc
      }, [])

  if (location.pathname.startsWith('/approval/')) {
    breadcrumbs.length = 0
    breadcrumbs.push({ label: '合同工作台', path: '/workspace' })
    breadcrumbs.push({ label: '审批详情', path: location.pathname })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <aside
        className={`flex flex-col bg-navy-950 text-white transition-all duration-300 ${
          collapsed ? 'w-[68px]' : 'w-[240px]'
        }`}
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b border-navy-800/60">
          <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center flex-shrink-0">
            <GitBranch className="w-4 h-4 text-navy-950" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-serif text-sm font-semibold leading-tight truncate">合同工作流</h1>
              <p className="text-[10px] text-navy-400 leading-tight">编排平台</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-gold-500/15 text-gold-400'
                    : 'text-navy-300 hover:bg-navy-800/50 hover:text-white'
                }`
              }
            >
              <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-navy-800/60 p-3">
          {!collapsed && (
            <div className="mb-3">
              <p className="text-[10px] text-navy-500 uppercase tracking-wider mb-2 px-1">切换角色</p>
              <div className="grid grid-cols-2 gap-1">
                {roles.map((role) => (
                  <button
                    key={role.key}
                    onClick={() => setCurrentRole(role.key)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-all ${
                      currentRole === role.key
                        ? 'bg-gold-500/20 text-gold-400'
                        : 'text-navy-400 hover:bg-navy-800/50 hover:text-navy-200'
                    }`}
                  >
                    <role.icon className="w-3 h-3" />
                    <span>{role.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-2 bg-navy-900/60 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-navy-700 flex items-center justify-center text-xs font-medium">
                {currentUser.name[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-medium text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-navy-400">{currentUser.role}</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-10 border-t border-navy-800/60 text-navy-400 hover:text-white hover:bg-navy-800/50 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center h-12 px-6 bg-white border-b border-border-light flex-shrink-0">
          <nav className="flex items-center gap-1 text-xs">
            {breadcrumbs.map((bc, i) => (
              <span key={bc.path} className="flex items-center gap-1">
                {i > 0 && <span className="text-navy-300">/</span>}
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-navy-800 font-medium">{bc.label}</span>
                ) : (
                  <NavLink to={bc.path} className="text-navy-400 hover:text-navy-600 transition-colors">
                    {bc.label}
                  </NavLink>
                )}
              </span>
            ))}
          </nav>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
