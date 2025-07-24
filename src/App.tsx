import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import { Toolbar, LiveCanvas } from "widgets";
import { Home, NotFound, NoAuth, Dashboard } from "pages";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

function App() {
  return (
    <div className="h-screen w-screen touch-none">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/files" element={<Dashboard />} />
          <Route
            path="/:type/:id"
            element={
              <>
                <SignedIn>
                  <LiveCanvas />
                  <Toolbar />
                </SignedIn>
                <SignedOut>
                  <NoAuth />
                </SignedOut>
              </>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
