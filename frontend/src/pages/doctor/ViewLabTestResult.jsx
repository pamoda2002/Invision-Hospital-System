import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLaboratoryTestByIdRequest } from "../../services/laboratoryService.js";
import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";

export default function ViewLabTestResult() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
    loadTest();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const printReport = () => {
    if (!test) return;
    const printContent = `
LABORATORY TEST REPORT
================================
Test ID     : ${test.testId}
Patient     : ${test.patient?.firstName} ${test.patient?.lastName} (${test.patient?.patientId})
Doctor      : ${test.doctor?.firstName} ${test.doctor?.lastName}
Specialization: ${test.doctor?.specialization}
Requested   : ${formatDate(test.createdAt)}
================================
Test Type   : ${test.testType}
Test Name   : ${test.testName}
Priority    : ${test.priority}
Status      : ${test.status}
${test.description ? `\nDescription :\n${test.description}` : ""}
================================
TEST RESULTS
================================
${test.results || "No results entered"}
${test.normalRange ? `\nNormal Range: ${test.normalRange}` : ""}
${test.notes ? `\nLab Notes   :\n${test.notes}` : ""}

Completed At: ${formatDate(test.completedAt)}
Completed By: ${test.completedBy?.fullName || "-"}
${test.sampleCollectedAt ? `\nSample Collected At: ${formatDate(test.sampleCollectedAt)}` : ""}
${test.sampleCollectedBy?.fullName ? `Sample Collected By: ${test.sampleCollectedBy.fullName}` : ""}
================================
    `.trim();

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Lab Test Report - ${test.testId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            pre { white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 14px; }
          </style>
        </head>
        <body><pre>${printContent}</pre></body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
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

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => navigate("/doctor/laboratory-tests")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Back to Tests
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

              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Laboratory Test Details</h1>
                  <p className="text-sm text-gray-500 mt-1">Test ID: {test.testId}</p>
                </div>
                <div className="flex space-x-3">
                  {test.status === "Completed" && (
                    <button
                      onClick={printReport}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Print Report
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/doctor/laboratory-tests")}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Back
                  </button>
                </div>
              </div>

              <div className="grid gap-6">

                {/* Status & Priority */}
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Status</h2>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(test.priority)}`}>
                      {test.priority}
                    </span>
                  </div>
                </div>

                {/* Patient */}
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Patient</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Name: </span>
                      <span className="text-gray-800">{test.patient?.firstName} {test.patient?.lastName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Patient ID: </span>
                      <span className="text-gray-800">{test.patient?.patientId}</span>
                    </div>
                  </div>
                </div>

                {/* Doctor */}
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Requesting Doctor</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Name: </span>
                      <span className="text-gray-800">{test.doctor?.firstName} {test.doctor?.lastName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Specialization: </span>
                      <span className="text-gray-800">{test.doctor?.specialization}</span>
                    </div>
                  </div>
                </div>

                {/* Test Details */}
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Test Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Test Type: </span>
                      <span className="text-gray-800">{test.testType}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Test Name: </span>
                      <span className="text-gray-800">{test.testName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Requested: </span>
                      <span className="text-gray-800">{formatDate(test.createdAt)}</span>
                    </div>
                    {test.description && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-500">Description: </span>
                        <p className="text-gray-800 mt-1">{test.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sample Collection */}
                {test.sampleCollectedAt && (
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Sample Collection</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">Collected At: </span>
                        <span className="text-gray-800">{formatDate(test.sampleCollectedAt)}</span>
                      </div>
                      {test.sampleCollectedBy?.fullName && (
                        <div>
                          <span className="font-medium text-gray-500">Collected By: </span>
                          <span className="text-gray-800">{test.sampleCollectedBy.fullName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── RESULTS SECTION ── */}
                {test.status === "Completed" ? (
                  <div>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Test Results</h2>

                    {/* Main result value */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-4">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Result</p>
                      <p className="text-gray-900 text-base font-medium whitespace-pre-wrap">
                        {test.results || "No result value recorded"}
                      </p>
                    </div>

                    {/* Normal range */}
                    {test.normalRange && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-4">
                        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Normal Range</p>
                        <p className="text-gray-900 whitespace-pre-wrap">{test.normalRange}</p>
                      </div>
                    )}

                    {/* Lab notes */}
                    {test.notes && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-4">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Laboratory Notes</p>
                        <p className="text-gray-800 whitespace-pre-wrap">{test.notes}</p>
                      </div>
                    )}

                    {/* Completion metadata */}
                    <div className="text-sm text-gray-500 space-y-1 pt-2">
                      <p>
                        <span className="font-medium text-gray-600">Completed At: </span>
                        {formatDate(test.completedAt)}
                      </p>
                      {test.completedBy?.fullName && (
                        <p>
                          <span className="font-medium text-gray-600">Completed By: </span>
                          {test.completedBy.fullName}
                        </p>
                      )}
                    </div>
                  </div>
                ) : test.status === "Cancelled" ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">This test has been cancelled.</p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      Results are not yet available. Current status: <span className="font-medium">{test.status}</span>
                    </p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
