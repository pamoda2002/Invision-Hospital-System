import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPatientByIdRequest, updatePatientRequest } from "../../../services/patientService.js";
import FormField from "../../../components/FormField.jsx";
import Sidebar from "../../../components/Sidebar.jsx";
import TopBar from "../../../components/TopBar.jsx";

const EditPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
  });

  const loadPatient = async () => {
    try {
      setLoading(true);
      const data = await getPatientByIdRequest(id);
      const patient = data.patient;
      setFormData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        emergencyContact: {
          name: patient.emergencyContact.name,
          relationship: patient.emergencyContact.relationship,
          phone: patient.emergencyContact.phone,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load patient details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatient();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("emergencyContact.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updatePatientRequest(id, formData);
      setSuccess("Patient details updated successfully!");
      setTimeout(() => navigate(`/receptionist/patients/${id}`), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update patient details");
    } finally {
      setSaving(false);
    }
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

  if (error && !formData.firstName) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-red-600 text-lg">{error}</div>
            <button
              onClick={() => navigate("/receptionist/patients")}
              className="mt-4 text-blue-600 hover:text-blue-900"
            >
              Back to Patients
            </button>
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
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Patient</h1>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Personal Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                    <FormField
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                    <FormField
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                    <FormField
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="md:col-span-2">
                      <FormField
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Emergency Contact</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      label="Contact Name"
                      name="emergencyContact.name"
                      value={formData.emergencyContact.name}
                      onChange={handleInputChange}
                      required
                    />
                    <FormField
                      label="Relationship"
                      name="emergencyContact.relationship"
                      value={formData.emergencyContact.relationship}
                      onChange={handleInputChange}
                      required
                    />
                    <FormField
                      label="Phone Number"
                      name="emergencyContact.phone"
                      value={formData.emergencyContact.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/receptionist/patients/${id}`)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditPatient;
