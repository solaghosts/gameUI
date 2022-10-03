import "./index.css";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

/*Game Modules*/
import GameCanvas from "./GameCanvas"
import NotFound from "./NotFound";


export function Navigation() {

  return (
<BrowserRouter forceRefresh >
      <Routes>
        <Route path="/" element={<GameCanvas />} />
        <Route path="/graves/:id" element={<GameCanvas />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Navigation;
