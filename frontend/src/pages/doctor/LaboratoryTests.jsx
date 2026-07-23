import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDoctorLaboratoryTestsRequest } from "../../services/laboratoryService.js";
import { getAllAppointmentsRequest } from "../../services/appointmentService.js";
import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";

export default function LaboratoryTests() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    patient: "",
    testType: "Blood Test",
    testName: "",
    description: "",
    priority: "Routine",
  });

  const loadTests = async () => {
    try {
      setLoading(true);
      const data = await getDoctorLaboratoryTestsRequest();
      setTests(data.tests);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load laboratory tests");
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const data = await getAllAppointmentsRequest();
      // Extract unique patients from this doctor's appointments
      const seen = new Set();
      const uniquePatients = [];
      for (const apt of data.appointments) {
        if (apt.patient && !seen.has(apt.patient._id)) {
          seen.add(apt.patient._id);
          uniquePatients.push(apt.patient);
        }
      }
      setPatients(uniquePatients);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load patients");
    }
  };

  useEffect(() => {
    loadTests();
    loadPatients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { createLaboratoryTestRequest } = await import("../../services/laboratoryService.js");
      await createLaboratoryTestRequest(formData);
      setShowForm(false);
      setFormData({
        patient: "",
        testType: "Blood Test",
        testName: "",
        description: "",
        priority: "Routine",
      });
      loadTests();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create laboratory test");
    }
  };

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Laboratory Tests</h1>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                {showForm ? "Cancel" : "Request New Test"}
              </button>
            </div>

            {showForm && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Request Laboratory Test</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.patient}
                      onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a patient</option>
                      {patients.map((patient) => (
                        <option key={patient._id} value={patient._id}>
                          {patient.firstName} {patient.lastName} ({patient.patientId})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Test Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.testType}
                        onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Blood Test">Blood Test</option>
                        <option value="Urine Test">Urine Test</option>
                        <option value="X-Ray">X-Ray</option>
                        <option value="MRI">MRI</option>
                        <option value="CT Scan">CT Scan</option>
                        <option value="ECG">ECG</option>
                        <option value="Ultrasound">Ultrasound</option>
                        <option value="Biopsy">Biopsy</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Routine">Routine</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Emergency">Emergency</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Test Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.testName}
                      onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                      required
                      placeholder="Enter test name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter test description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    >
                      Request Test
                    </button>
                  </div>
                </form>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-600">Loading...</div>
              </div>
            ) : tests.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="text-gray-600">No laboratory tests found</div>
              </div>
            ) : (
              <div className="grid gap-4">
                {tests.map((test) => (
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Test Type: </span>
                        <span className="text-gray-600">{test.testType}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Test Name: </span>
                        <span className="text-gray-600">{test.testName}</span>
                      </div>
                      {test.description && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-700">Description: </span>
                          <span className="text-gray-600">{test.description}</span>
                        </div>
                      )}
                    </div>
                    {test.status === "Completed" && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {test.results && (
                          <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Result</p>
                            <p className="text-gray-900 text-sm font-medium whitespace-pre-wrap">{test.results}</p>
                            {test.normalRange && (
                              <p className="text-xs text-gray-500 mt-1">
                                <span className="font-medium">Normal Range:</span> {test.normalRange}
                              </p>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => navigate(`/doctor/laboratory-tests/${test._id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          View Full Details →
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
