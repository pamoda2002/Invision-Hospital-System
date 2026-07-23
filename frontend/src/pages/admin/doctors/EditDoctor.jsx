import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoctorByIdRequest, updateDoctorRequest } from "../../../services/doctorService.js";
import FormField from "../../../components/FormField.jsx";
import Sidebar from "../../../components/Sidebar.jsx";
import TopBar from "../../../components/TopBar.jsx";

const EditDoctor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    specialization: "",
    department: "",
    phone: "",
    email: "",
    schedule: [],
    isActive: true,
  });

  const [newScheduleDay, setNewScheduleDay] = useState("");
  const [newScheduleStart, setNewScheduleStart] = useState("");
  const [newScheduleEnd, setNewScheduleEnd] = useState("");

  const loadDoctor = async () => {
    try {
      setLoading(true);
      const data = await getDoctorByIdRequest(id);
      const doctor = data.doctor;
      setFormData({
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization,
        department: doctor.department,
        phone: doctor.phone,
        email: doctor.email,
        schedule: doctor.schedule || [],
        isActive: doctor.isActive,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load doctor details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctor();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addScheduleSlot = () => {
    if (!newScheduleDay || !newScheduleStart || !newScheduleEnd) {
      return;
    }

    const slot = {
      day: newScheduleDay,
      startTime: newScheduleStart,
      endTime: newScheduleEnd,
    };

    setFormData((prev) => ({
      ...prev,
      schedule: [...prev.schedule, slot],
    }));

    setNewScheduleDay("");
    setNewScheduleStart("");
    setNewScheduleEnd("");
  };

  const removeScheduleSlot = (index) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateDoctorRequest(id, formData);
      setSuccess("Doctor details updated successfully!");
      setTimeout(() => navigate("/admin/doctors"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update doctor details");
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
              onClick={() => navigate("/admin/doctors")}
              className="mt-4 text-blue-600 hover:text-blue-900"
            >
              Back to Doctors
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
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Doctor</h1>

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
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Personal & Professional Details</h2>
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
                      label="Specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      required
                    />
                    <FormField
                      label="Department"
                      name="department"
                      value={formData.department}
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
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        Active
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Weekly Schedule</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                      <select
                        value={newScheduleDay}
                        onChange={(e) => setNewScheduleDay(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Day</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={newScheduleStart}
                        onChange={(e) => setNewScheduleStart(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <div className="flex space-x-2">
                        <input
                          type="time"
                          value={newScheduleEnd}
                          onChange={(e) => setNewScheduleEnd(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={addScheduleSlot}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                  {formData.schedule.length > 0 && (
                    <div className="space-y-2">
                      {formData.schedule.map((slot, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg">
                          <span className="text-sm text-gray-700">
                            {slot.day}: {slot.startTime} - {slot.endTime}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeScheduleSlot(index)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/doctors")}
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

export default EditDoctor;
