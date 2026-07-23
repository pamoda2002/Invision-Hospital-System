import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDoctorMedicalRecordsRequest, searchMedicalRecordsRequest } from "../../services/medicalRecordService.js";
import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";

export default function MedicalRecords() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await getDoctorMedicalRecordsRequest();
      setRecords(data.records);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load medical records");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      loadRecords();
      return;
    }
    try {
      setLoading(true);
      const data = await searchMedicalRecordsRequest(searchTerm);
      setRecords(data.records);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Electronic Medical Records (EMR)</h1>
            </div>

            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Search by record ID, diagnosis, or symptoms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Search
                </button>
              </div>
            </form>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-600">Loading...</div>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="text-gray-600">No medical records found</div>
              </div>
            ) : (
              <div className="grid gap-4">
                {records.map((record) => (
                  <div
                    key={record._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {record.patient?.firstName} {record.patient?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Record ID: {record.recordId} • Date: {formatDate(record.date)}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/doctor/medical-records/${record._id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        View Details
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Diagnosis: </span>
                        <span className="text-gray-600">{record.diagnosis}</span>
                      </div>
                      {record.symptoms && (
                        <div>
                          <span className="font-medium text-gray-700">Symptoms: </span>
                          <span className="text-gray-600">{record.symptoms}</span>
                        </div>
                      )}
                    </div>
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
