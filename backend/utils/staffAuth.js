export const DEFAULT_STAFF_PASSWORD = "12345678";

/** Staff roles that can be assigned to a User login account. */
export const LOGIN_ROLES = [
  "Administrator",
  "Doctor",
  "Nurse",
  "Receptionist",
  "Laboratory Staff",
  "Pharmacist",
  "Accountant",
];

/** Map a staff record role to a valid User.role for login. */
export function staffRoleToUserRole(staffRole) {
  if (LOGIN_ROLES.includes(staffRole)) return staffRole;
  return "Receptionist";
}
