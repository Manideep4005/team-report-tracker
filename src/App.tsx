import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import History from "./pages/History/History";

function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={<Login />}
            />


            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <Dashboard />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/history"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <History />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App;