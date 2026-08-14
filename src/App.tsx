import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import History from "./pages/History/History";
import Settings from "./pages/Settings/Settings";
import Users from "./pages/Users/Users";
import Roles from "./pages/Roles/Roles";
import Reports from "./pages/Reports/Reports";
import LoginHistory from "./pages/LoginHistory/LoginHistory";


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

            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <Settings />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/users"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <Users />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/reports"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <Reports />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />


            <Route
                path="/login-history"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <LoginHistory />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/roles"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <Roles />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
        </Routes>


    );
}

export default App;