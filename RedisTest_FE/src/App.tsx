import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import SimpleTest from './pages/SimpleTest';
import ScenarioA from './pages/ScenarioA';
import ScenarioB from './pages/ScenarioB';


function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: '20px' }}>
        <nav style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
          <Link to="/1" style={{ marginRight: '15px' }}>로직 A (기존 작업)</Link>
          <Link to="/2" style={{ marginRight: '15px' }}>로직 B (대기열 입장)</Link>
          <Link to="/3">로직 C (퇴장/입장완료)</Link>
        </nav>

        <Routes>
          <Route path="/1" element={<SimpleTest />} />
          <Route path="/2" element={<ScenarioA />} />
          <Route path="/3" element={<ScenarioB />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;