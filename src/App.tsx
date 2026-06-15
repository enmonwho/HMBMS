import { Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import DonateForm from './components/DonateForm';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      
      <Route path="/donate" element={<DonateForm />} />
    </Routes>
  );
}

export default App;