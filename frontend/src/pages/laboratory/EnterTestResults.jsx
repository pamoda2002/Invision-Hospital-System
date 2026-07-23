import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLaboratoryTestByIdRequest, enterTestResultsRequest } from "../../services/laboratoryService.js";
import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";

export default function EnterTestResults() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    results: "",
    normalRange: "",
    notes: "",
  });

  const loadTest = async () => {
    try {
      const data = await getLaboratoryTestByIdRequest(id);
      setTest(data.test);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load laboratory test");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTest();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await enterTestResultsRequest(id, formData);
      navigate("/laboratory/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enter test results");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-gray-600">Loading...</div>
          </main>
        </div>
      </div>
    );
  }

  if (error && !test) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="text-red-700">{error}</div>
              <button
                onClick={() => navigate("/laboratory/dashboard")}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Back to Dashboard
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Enter Test Results</h1>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Test Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Test ID: </span>
                    <span className="text-gray-800">{test.testId}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Patient: </span>
                    <span className="text-gray-800">
                      {test.patient?.firstName} {test.patient?.lastName} ({test.patient?.patientId})
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Test Type: </span>
                    <span className="text-gray-800">{test.testType}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Test Name: </span>
                    <span className="text-gray-800">{test.testName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Priority: </span>
                    <span className="text-gray-800">{test.priority}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Requested Date: </span>
                    <span className="text-gray-800">{formatDate(test.createdAt)}</span>
                  </div>
                  {test.description && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-500">Description: </span>
                      <span className="text-gray-800">{test.description}</span>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Results <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="results"
                    value={formData.results}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter test results"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Normal Range</label>
                  <input
                    type="text"
                    name="normalRange"
                    value={formData.normalRange}
                    onChange={handleInputChange}
                    placeholder="Enter normal range (e.g., 4.5-11.0 x 10^9/L)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Enter any additional notes"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate("/laboratory/dashboard")}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Results"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
