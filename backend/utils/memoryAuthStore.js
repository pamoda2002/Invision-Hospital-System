const memoryUsers = [];
let memoryIdCounter = 1;

const cloneUser = (user) => ({ ...user });

export const findMemoryUserByEmailOrUsername = (identifier) => {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  return memoryUsers.find(
    (user) => user.email === normalizedIdentifier || user.username === normalizedIdentifier
  );
};

export const findMemoryUserByEmailOrUsernameForRegistration = (email, username) => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();

  return memoryUsers.find(
    (user) => user.email === normalizedEmail || user.username === normalizedUsername
  );
};

export const createMemoryUser = ({ fullName, username, email, password, role }) => {
  const now = new Date().toISOString();
  const user = {
    _id: String(memoryIdCounter++),
    fullName: fullName.trim(),
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    password,
    role,
    status: "Active",
    createdAt: now,
    updatedAt: now,
  };

  memoryUsers.push(user);
  return cloneUser(user);
};

export const getMemoryUserById = (userId) => {
  const user = memoryUsers.find((entry) => entry._id === String(userId));
  return user ? cloneUser(user) : null;
};

export const memoryUserExists = (predicate) => memoryUsers.some(predicate);
