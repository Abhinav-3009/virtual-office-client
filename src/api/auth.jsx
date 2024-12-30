export const login = async (username, password) => {
  console.log(`${process.env.REACT_APP_API_URL}`);
  const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error("Invalid username or password");
  }

  return await response.json();
};

export const register = async (username, password) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error("Registration failed");
  }

  return await response.json();
};

export const logout = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
};
