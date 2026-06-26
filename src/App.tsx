import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import HomePage from './HomePage';
import DonateForm from './DonateForm';
import AboutUs from './AboutUs';
import WhoWeHelp from './WhoWeHelp';
import MilkyWay from './MilkyWay';
import SupsupTodo from './SupsupTodo';
import MomsAct from './MomsAct';
import Procedure from './Procedure';
import Process from './Process';
import Safety from './Safety';

function App() {
  return (
    <div>
      <NavBar />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/donate" element={<DonateForm />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/who" element={<WhoWeHelp />} />
          <Route path="/milky-way" element={<MilkyWay />} />
          <Route path="/supsup-todo" element={<SupsupTodo />} />
          <Route path="/moms-act" element={<MomsAct />} />
          <Route path="/procedure" element={<Procedure />} />
          <Route path="/process" element={<Process />} />
          <Route path="/safety" element={<Safety />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;