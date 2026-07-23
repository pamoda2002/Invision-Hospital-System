import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllLaboratoryTestsRequest } from "../../services/laboratoryService.js";
import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";

export default function LaboratoryTests() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [error, setError] = useState("");

  const loadTests = async () => {
    try {
      setLoading(true);
      const data = await getAllLaboratoryTestsRequest();
      setTests(data.tests);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load laboratory tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    const colors = {
      "Pending": "bg-yellow-100 text-yellow-800",
      "Sample Collected": "bg-blue-100 text-blue-800",
      "In Progress": "bg-purple-100 text-purple-800",
      "Completed": "bg-green-100 text-green-800",
      "Cancelled": "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      "Routine": "bg-gray-100 text-gray-800",
      "Urgent": "bg-orange-100 text-orange-800",
      "Emergency": "bg-red-100 text-red-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const filteredTests = statusFilter === "All" 
    ? tests 
    : tests.filter(test => test.status === statusFilter);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Laboratory Tests - Administrator View</h1>
            </div>

            <div className="mb-6">
              <div className="flex space-x-2">
                <button
                  onClick={() => setStatusFilter("All")}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    statusFilter === "All"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter("Pending")}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    statusFilter === "Pending"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setStatusFilter("Sample Collected")}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    statusFilter === "Sample Collected"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Sample Collected
                </button>
                <button
                  onClick={() => setStatusFilter("In Progress")}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    statusFilter === "In Progress"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => setStatusFilter("Completed")}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    statusFilter === "Completed"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-600">Loading...</div>
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="text-gray-600">No laboratory tests found</div>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredTests.map((test) => (
                  <div
                    key={test._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {test.patient?.firstName} {test.patient?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Test ID: {test.testId} • Date: {formatDate(test.createdAt)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(test.priority)}`}>
                          {test.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                          {test.status}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="font-medium text-gray-700">Test Type: </span>
                        <span className="text-gray-600">{test.testType}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Test Name: </span>
                        <span className="text-gray-600">{test.testName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Doctor: </span>
                        <span className="text-gray-600">
                          {test.doctor?.firstName} {test.doctor?.lastName}
                        </span>
                      </div>
                      {test.sampleCollectedBy && (
                        <div>
                          <span className="font-medium text-gray-700">Sample Collected By: </span>
                          <span className="text-gray-600">{test.sampleCollectedBy?.fullName}</span>
                        </div>
                      )}
                      {test.completedBy && (
                        <div>
                          <span className="font-medium text-gray-700">Completed By: </span>
                          <span className="text-gray-600">{test.completedBy?.fullName}</span>
                        </div>
                      )}
                      {test.description && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-700">Description: </span>
                          <span className="text-gray-600">{test.description}</span>
                        </div>
                      )}
                    </div>
                    {test.status === "Completed" && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => navigate(`/admin/laboratory-tests/${test._id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          View Report
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
