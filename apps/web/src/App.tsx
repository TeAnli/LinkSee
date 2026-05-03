import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>LinkSee 灵犀 — 首页</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
