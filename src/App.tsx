import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { HackathonProvider } from "./context/HackathonContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ParticleBackground from "./components/ParticleBackground";
import Home from "./pages/Home";
import Hackathons from "./pages/Hackathons";
import HackathonDetails from "./pages/HackathonDetails";
import CreateHackathon from "./pages/CreateHackathon";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SubmitProject from "./pages/SubmitProject";

function App() {
  return (
    <Router>
      <AuthProvider>
        <HackathonProvider>
          <div className="flex flex-col min-h-screen w-full overflow-x-hidden relative">
            <ParticleBackground />
            <Navbar />
            <main className="flex-grow w-full relative z-10">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/hackathons" element={<Hackathons />} />
                <Route path="/hackathon/:id" element={<HackathonDetails />} />
                <Route path="/create-hackathon" element={<CreateHackathon />} />
                <Route
                  path="/create-hackathon/:id"
                  element={<CreateHackathon />}
                />
                <Route
                  path="/edit-hackathon/:id"
                  element={<CreateHackathon />}
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                  path="/hackathon/:hackathonId/submit-project/:participantId"
                  element={<SubmitProject />}
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </HackathonProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
