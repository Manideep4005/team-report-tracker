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
import Permissions from "./pages/Permissions/Permissions";

import PublicMonitorManagement
    from "./pages/PublicMonitorManagement/PublicMonitorManagement";

import PublicMonitorView
    from "./pages/PublicMonitorView/PublicMonitorView";



function App() {

    return (
        <Routes>

            {/* Login */}

            <Route
                path="/"
                element={<Login />}
            />


            {/* =================================================
                PUBLIC MONITOR VIEW

                NO AUTHENTICATION
            ================================================= */}

            <Route
                path="/monitor/:token"
                element={
                    <PublicMonitorView />
                }
            />


            {/* =================================================
                DASHBOARD
            ================================================= */}

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


            {/* History */}

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


            {/* Settings */}

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


            {/* Users */}

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


            {/* Reports */}

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


            {/* Login History */}

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


            {/* Roles */}

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


            {/* Permissions */}

            <Route
                path="/permissions"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <Permissions />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                PUBLIC MONITOR MANAGEMENT

                AUTHENTICATED
            ================================================= */}

            <Route
                path="/public-monitor"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <PublicMonitorManagement />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />

        </Routes>
    );
}


export default App;