import { Route, Router } from "wouter";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Route path="/" component={Dashboard} />
      </div>
    </Router>
  );
}

export default App;
