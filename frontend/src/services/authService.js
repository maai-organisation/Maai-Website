import apiClient from "./api";

const TOKEN_KEY = "maai_token";
const USER_KEY = "maai_user";
const LEGACY_TOKEN_KEY = "maai_auth_token";
const LEGACY_USER_KEY = "maai_auth_user";

function persistSession(payload) {
  const token = payload?.token || payload?.data?.token;
  const user = payload?.user || payload?.data?.user;

  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);

  return { token, user };
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
}

export function getStoredUser() {
  const rawUser = localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
}

export function getRoleRedirect(user = getStoredUser()) {
  if (user?.role === "ngo" || user?.accountType === "ngo" || user?.account_type === "ngo") return "/ngo/dashboard";
  return "/dashboard";
}

export async function registerVolunteer(payload) {
  const response = await apiClient.post("/auth/register", payload);
  return persistSession(response.data);
}

export async function registerNgo(payload) {
  const response = await apiClient.post("/auth/ngo/register", payload);
  return persistSession(response.data);
}

export async function getMembershipSettings() {
  const response = await apiClient.get("/auth/membership-settings");
  return response.data?.data;
}

export async function loginVolunteer(payload) {
  const response = await apiClient.post("/auth/login", payload);
  return persistSession(response.data);
}

export async function loginNgo(payload) {
  const response = await apiClient.post("/auth/ngo/login", payload);
  return persistSession(response.data);
}

export async function getCurrentUser() {
  const response = await apiClient.get("/auth/me");
  return response.data?.data?.user;
}
