import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow-lg">
          Checking session...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="max-w-md rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-xl">
          <p className="text-lg font-semibold text-slate-900">Access denied</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your account role does not have permission to open this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
