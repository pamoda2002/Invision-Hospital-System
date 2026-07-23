import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMedicalRecordByIdRequest } from "../../services/medicalRecordService.js";
import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";

export default function ViewMedicalRecord() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRecord = async () => {
    try {
      const data = await getMedicalRecordByIdRequest(id);
      setRecord(data.record);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load medical record");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecord();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const printReport = () => {
    const printContent = `
MEDICAL REPORT
================================
Patient: ${record.patient?.firstName} ${record.patient?.lastName}
Patient ID: ${record.patient?.patientId}
Doctor: ${record.doctor?.firstName} ${record.doctor?.lastName}
Specialization: ${record.doctor?.specialization}
Date: ${formatDate(record.date)}
================================
Diagnosis: ${record.diagnosis}

Symptoms: ${record.symptoms || '-'}

Prescription: ${record.prescription || '-'}

Treatment Notes: ${record.treatmentNotes || '-'}
================================
    `.trim();

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Medical Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              line-height: 1.6;
            }
            pre {
              white-space: pre-wrap;
              font-family: Arial, sans-serif;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <pre>${printContent}</pre>
        </body>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="text-red-700">{error}</div>
              <button
                onClick={() => navigate("/doctor/medical-records")}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Back to Records
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
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Medical Record Details</h1>
                  <p className="text-sm text-gray-500 mt-1">Record ID: {record.recordId}</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={printReport}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Print Report
                  </button>
                  <button
                    onClick={() => navigate(`/doctor/medical-records/${id}/edit`)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                  >
                    Edit Record
                  </button>
                  <button
                    onClick={() => navigate("/doctor/medical-records")}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Back
                  </button>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold text-gray-700 mb-3">Patient Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Name: </span>
                      <span className="text-gray-800">
                        {record.patient?.firstName} {record.patient?.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Patient ID: </span>
                      <span className="text-gray-800">{record.patient?.patientId}</span>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold text-gray-700 mb-3">Doctor Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Name: </span>
                      <span className="text-gray-800">
                        {record.doctor?.firstName} {record.doctor?.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Specialization: </span>
                      <span className="text-gray-800">{record.doctor?.specialization}</span>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold text-gray-700 mb-3">Medical Details</h2>
                  <div className="grid gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Date: </span>
                      <span className="text-gray-800">{formatDate(record.date)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Diagnosis: </span>
                      <p className="text-gray-800 mt-1">{record.diagnosis}</p>
                    </div>
                    {record.symptoms && (
                      <div>
                        <span className="font-medium text-gray-500">Symptoms: </span>
                        <p className="text-gray-800 mt-1">{record.symptoms}</p>
                      </div>
                    )}
                    {record.prescription && (
                      <div>
                        <span className="font-medium text-gray-500">Prescription: </span>
                        <p className="text-gray-800 mt-1 whitespace-pre-wrap">{record.prescription}</p>
                      </div>
                    )}
                    {record.treatmentNotes && (
                      <div>
                        <span className="font-medium text-gray-500">Treatment Notes: </span>
                        <p className="text-gray-800 mt-1 whitespace-pre-wrap">{record.treatmentNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {record.medicalReport && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">Medical Report</h2>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap">{record.medicalReport}</pre>
                    </div>
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
