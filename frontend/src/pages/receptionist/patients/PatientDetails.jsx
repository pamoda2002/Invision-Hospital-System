import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPatientByIdRequest } from "../../../services/patientService.js";
import Sidebar from "../../../components/Sidebar.jsx";
import TopBar from "../../../components/TopBar.jsx";

const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPatient = async () => {
    try {
      setLoading(true);
      const data = await getPatientByIdRequest(id);
      setPatient(data.patient);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load patient details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatient();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-red-600 text-lg">{error}</div>
            <Link
              to="/receptionist/patients"
              className="mt-4 inline-block text-blue-600 hover:text-blue-900"
            >
              Back to Patients
            </Link>
          </div>
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
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Patient Details</h1>
                <div className="space-x-2">
                  <Link
                    to={`/receptionist/patients/${id}/edit`}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Edit Patient
                  </Link>
                  <Link
                    to="/receptionist/patients"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </Link>
                </div>
              </div>

              {patient && (
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Patient ID:</span>
                        <p className="font-medium text-gray-800">{patient.patientId}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Full Name:</span>
                        <p className="font-medium text-gray-800">
                          {patient.firstName} {patient.lastName}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">NIC:</span>
                        <p className="font-medium text-gray-800">{patient.nic}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Date of Birth:</span>
                        <p className="font-medium text-gray-800">{formatDate(patient.dateOfBirth)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Gender:</span>
                        <p className="font-medium text-gray-800">{patient.gender}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Blood Group:</span>
                        <p className="font-medium text-gray-800">{patient.bloodGroup}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Phone Number:</span>
                        <p className="font-medium text-gray-800">{patient.phone}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Email:</span>
                        <p className="font-medium text-gray-800">{patient.email}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-sm text-gray-500">Address:</span>
                        <p className="font-medium text-gray-800">{patient.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Emergency Contact</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Name:</span>
                        <p className="font-medium text-gray-800">{patient.emergencyContact.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Relationship:</span>
                        <p className="font-medium text-gray-800">{patient.emergencyContact.relationship}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Phone Number:</span>
                        <p className="font-medium text-gray-800">{patient.emergencyContact.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Registration Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Registered Date:</span>
                        <p className="font-medium text-gray-800">{formatDate(patient.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Registered By:</span>
                        <p className="font-medium text-gray-800">
                          {patient.registeredBy?.fullName || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Medical Information</h2>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-700">Medical records are managed by doctors</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDetails;
