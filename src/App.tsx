import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Designer from '@/pages/Designer'
import Workspace from '@/pages/Workspace'
import CreateContract from '@/pages/CreateContract'
import ApprovalDetail from '@/pages/ApprovalDetail'
import Templates from '@/pages/Templates'
import Archive from '@/pages/Archive'
import Statistics from '@/pages/Statistics'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/designer" element={<Designer />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/workspace/create" element={<CreateContract />} />
          <Route path="/approval/:id" element={<ApprovalDetail />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  )
}
