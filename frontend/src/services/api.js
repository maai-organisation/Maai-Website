import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL || "https://maai-website-production.up.railway.app/api";
const trimmedApiUrl = configuredApiUrl.replace(/\/+$/, "");
const apiBaseUrl = trimmedApiUrl.endsWith("/api") ? trimmedApiUrl : `${trimmedApiUrl}/api`;

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("maai_token") || localStorage.getItem("maai_auth_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

function unwrapList(response) {
  const payload = response?.data;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;

  return [];
}

function unwrapObjectList(response) {
  const payload = response?.data;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (payload?.data && typeof payload.data === "object") return Object.values(payload.data);

  return [];
}

export async function getActivities(params = {}) {
  return unwrapList(await apiClient.get("/activities", { params }));
}

export async function getInitiatives(params = {}) {
  return unwrapList(await apiClient.get("/cms/initiatives", { params }));
}

export async function getInitiativeCategories() {
  return unwrapList(await apiClient.get("/initiative-categories"));
}

export async function getLeadership() {
  return unwrapList(await apiClient.get("/leadership"));
}

export async function getTeam() {
  return unwrapList(await apiClient.get("/cms/team"));
}

export async function getMentors() {
  return unwrapList(await apiClient.get("/cms/mentors"));
}

export async function getTestimonials() {
  return unwrapList(await apiClient.get("/cms/testimonials"));
}

export async function getReels() {
  return unwrapList(await apiClient.get("/cms/reels"));
}

export async function getCareers() {
  return unwrapList(await apiClient.get("/cms/careers"));
}

export async function getAdminCareers(params = {}) {
  return unwrapList(await apiClient.get("/admin/careers", { params }));
}

export async function createAdminCareer(payload) {
  const response = await apiClient.post("/admin/careers", payload);
  return response.data?.data;
}

export async function updateAdminCareer(id, payload) {
  const response = await apiClient.put(`/admin/careers/${id}`, payload);
  return response.data?.data;
}

export async function patchAdminCareer(id, payload) {
  const response = await apiClient.patch(`/admin/careers/${id}`, payload);
  return response.data?.data;
}

export async function deleteAdminCareer(id) {
  const response = await apiClient.delete(`/admin/careers/${id}`);
  return response.data;
}

export async function getAdminDashboard() {
  const response = await apiClient.get("/admin/dashboard");
  return response.data?.data;
}

export async function getAdminAnalytics() {
  const response = await apiClient.get("/admin/analytics");
  return response.data?.data;
}

export async function getAdminVolunteers(params = {}) {
  return unwrapList(await apiClient.get("/admin/volunteers", { params }));
}

export async function getAdminNgos(params = {}) {
  return unwrapList(await apiClient.get("/admin/ngos", { params }));
}

export async function updateNgoProfile(payload) {
  const response = await apiClient.patch("/auth/ngo/me", payload);
  return response.data?.data;
}

export async function updateAdminNgoStatus(id, membershipStatus) {
  const response = await apiClient.patch(`/admin/ngos/${id}/status`, { membershipStatus });
  return response.data?.data;
}

export async function updateAdminVolunteerStatus(id, membershipStatus) {
  const response = await apiClient.patch(`/admin/volunteers/${id}/status`, { membershipStatus });
  return response.data?.data;
}

export async function updateAdminVolunteerPaymentStatus(id, paymentStatus) {
  const response = await apiClient.patch(`/admin/volunteers/${id}/payment-status`, { paymentStatus });
  return response.data?.data;
}

export async function updateAdminVolunteerRole(id, role) {
  const response = await apiClient.patch(`/admin/volunteers/${id}/role`, { role });
  return response.data?.data;
}

export async function getAdminAuditLogs() {
  return unwrapList(await apiClient.get("/admin/audit-logs"));
}

export async function getAdminAnnouncements(params = {}) {
  return unwrapList(await apiClient.get("/admin/announcements", { params }));
}

export async function createAdminAnnouncement(payload) {
  const response = await apiClient.post("/admin/announcements", payload);
  return response.data;
}

export async function updateAdminAnnouncement(id, payload) {
  const response = await apiClient.put(`/admin/announcements/${id}`, payload);
  return response.data;
}

export async function updateAdminAnnouncementStatus(id, status) {
  const response = await apiClient.patch(`/admin/announcements/${id}/status`, { status });
  return response.data;
}

export async function deleteAdminAnnouncement(id) {
  const response = await apiClient.delete(`/admin/announcements/${id}`);
  return response.data;
}

export async function getAnnouncements() {
  return unwrapList(await apiClient.get("/announcements"));
}

export async function markAnnouncementRead(id) {
  const response = await apiClient.post(`/announcements/${id}/read`);
  return response.data?.data;
}

export async function getAdminMembershipSettings() {
  const response = await apiClient.get("/admin/membership-settings");
  return response.data?.data;
}

export async function updateAdminMembershipSettings(payload) {
  const response = await apiClient.patch("/admin/membership-settings", payload);
  return response.data?.data;
}

export async function getCMSModules() {
  return unwrapList(await apiClient.get("/cms/modules"));
}

export async function getCMSItems(module, params = {}) {
  const response = await apiClient.get(`/cms/${module}`, { params });
  return {
    items: Array.isArray(response.data?.data) ? response.data.data : [],
    meta: response.data?.meta || { page: 1, limit: 10, total: 0 },
  };
}

export async function getSocialLinks(params = {}) {
  return unwrapList(await apiClient.get("/cms/social-links", { params }));
}

export async function createCMSItem(module, payload) {
  const response = await apiClient.post(`/cms/${module}`, payload);
  return response.data?.data;
}

export async function updateCMSItem(module, id, payload) {
  const response = await apiClient.put(`/cms/${module}/${id}`, payload);
  return response.data?.data;
}

export async function updateCMSItemStatus(module, id, status) {
  const response = await apiClient.patch(`/cms/${module}/${id}/status`, { status });
  return response.data?.data;
}

export async function updateCMSItemFeatured(module, id, featured) {
  const response = await apiClient.patch(`/cms/${module}/${id}/featured`, { featured });
  return response.data?.data;
}

export async function updateCMSItemDefault(module, id) {
  const response = await apiClient.patch(`/cms/${module}/${id}/default`);
  return response.data?.data;
}

export async function deleteCMSItem(module, id) {
  const response = await apiClient.delete(`/cms/${module}/${id}`);
  return response.data;
}

export async function sendEmail(payload) {
  const response = await apiClient.post("/email/send", payload);
  return response.data?.data;
}

export async function getEmailLogs(params = {}) {
  return unwrapList(await apiClient.get("/email/logs", { params }));
}

export async function getSocials() {
  return unwrapList(await apiClient.get("/socials"));
}

export async function getStats() {
  return unwrapObjectList(await apiClient.get("/stats"));
}

export async function getCamps(params = {}) {
  return unwrapList(await apiClient.get("/camps", { params }));
}

export async function submitCampRegistration(payload) {
  const response = await apiClient.post("/camp-registration", payload);
  return response.data;
}

export async function requestVolunteerCamp(payload) {
  const response = await apiClient.post("/camps/request", payload);
  return response.data;
}

export async function getCampRequests(params = {}) {
  return unwrapList(await apiClient.get("/camps/requests", { params }));
}

export async function createCampRequest(payload) {
  const response = await apiClient.post("/camps/requests", payload);
  return response.data?.data;
}

export async function updateCampRequest(id, payload) {
  const response = await apiClient.put(`/camps/requests/${id}`, payload);
  return response.data;
}

export async function cancelCampRequest(id) {
  const response = await apiClient.patch(`/camps/requests/${id}/cancel`);
  return response.data;
}

export async function reviewCampRequest(id, payload) {
  const response = await apiClient.patch(`/camps/requests/${id}/review`, payload);
  return response.data;
}

export async function convertCampRequestToEvent(id) {
  const response = await apiClient.post(`/camps/requests/${id}/convert-to-event`);
  return response.data?.data;
}

export async function getNgoNotifications() {
  return unwrapList(await apiClient.get("/notifications"));
}

export async function getNotifications() {
  const response = await apiClient.get("/notifications");
  const payload = response.data || {};
  return {
    items: Array.isArray(payload.data) ? payload.data : [],
    unreadCount: Number(payload.meta?.unreadCount || 0),
  };
}

export async function markNotificationRead(id) {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await apiClient.patch("/notifications/read-all");
  return response.data;
}

export async function getEvents(params = {}) {
  try {
    return unwrapList(await apiClient.get("/events", { params }));
  } catch (error) {
    console.error("Unable to load events", error);
    return [];
  }
}

export async function getEvent(id) {
  const response = await apiClient.get(`/events/${id}`);
  return response.data?.data;
}

export async function createEvent(payload) {
  const response = await apiClient.post("/events", payload);
  return response.data?.data;
}

export async function updateEvent(id, payload) {
  const response = await apiClient.put(`/events/${id}`, payload);
  return response.data?.data;
}

export async function updateEventStatus(id, status) {
  const response = await apiClient.patch(`/events/${id}/status`, { status });
  return response.data?.data;
}

export async function deleteEvent(id) {
  const response = await apiClient.delete(`/events/${id}`);
  return response.data;
}

export async function getEventVolunteers() {
  return unwrapList(await apiClient.get("/events/volunteers"));
}

export async function getMyEvents() {
  return unwrapList(await apiClient.get("/events/my"));
}

export async function registerEvent(id) {
  const response = await apiClient.post(`/events/${id}/register`);
  return response.data?.data;
}

export async function getMyCamps(params = {}) {
  return unwrapList(await apiClient.get("/events/my-camps", { params }));
}

export async function getMyCamp(id) {
  const response = await apiClient.get(`/events/my-camps/${id}`);
  return response.data?.data;
}

export async function addEventParticipant(eventId, payload) {
  const response = await apiClient.post(`/events/${eventId}/participants`, payload);
  return response.data;
}

export async function removeEventParticipant(eventId, participantId) {
  const response = await apiClient.delete(`/events/${eventId}/participants/${participantId}`);
  return response.data;
}

export async function updateEventParticipant(eventId, participantId, payload) {
  const response = await apiClient.patch(`/events/${eventId}/participants/${participantId}`, payload);
  return response.data;
}

export async function issueEventCertificates(eventId, volunteerIds) {
  const response = await apiClient.post(`/events/${eventId}/certificates`, { volunteerIds });
  return response.data;
}

export async function getEventCertificates(eventId, params = {}) {
  const response = await apiClient.get(`/events/${eventId}/certificates`, { params });
  return response.data?.data || { event: null, recipients: [] };
}

export async function revokeEventCertificate(eventId, certificateId) {
  const response = await apiClient.patch(`/events/${eventId}/certificates/${certificateId}/revoke`);
  return response.data;
}

export async function bulkRevokeEventCertificates(eventId, volunteerIds) {
  const response = await apiClient.patch(`/events/${eventId}/certificates/revoke`, { volunteerIds });
  return response.data;
}

export async function getCertificates() {
  return unwrapList(await apiClient.get("/certificates"));
}

export async function getMyIdCard() {
  const response = await apiClient.get("/id-cards/me");
  return response.data?.data || null;
}

export function getIdCardPreviewUrl() {
  const token = localStorage.getItem("maai_token") || localStorage.getItem("maai_auth_token") || "";
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${apiClient.defaults.baseURL || ""}/id-cards/me/preview${query}`;
}

export function getIdCardDownloadUrl() {
  const token = localStorage.getItem("maai_token") || localStorage.getItem("maai_auth_token") || "";
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${apiClient.defaults.baseURL || ""}/id-cards/me/download${query}`;
}

export async function claimCertificate(id) {
  const response = await apiClient.post(`/certificates/${id}/claim`);
  return response.data;
}

export function getCertificatePreviewUrl(id) {
  const token = localStorage.getItem("maai_token") || localStorage.getItem("maai_auth_token") || "";
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${apiClient.defaults.baseURL || ""}/certificates/${id}/preview${query}`;
}

export function getCertificateDownloadUrl(id) {
  const token = localStorage.getItem("maai_token") || localStorage.getItem("maai_auth_token") || "";
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${apiClient.defaults.baseURL || ""}/certificates/${id}/download${query}`;
}

export async function getAdminCampRegistrations(params = {}) {
  return unwrapList(await apiClient.get("/admin/camp-registrations", { params }));
}

export async function updateCampRegistrationStatus(id, status) {
  const response = await apiClient.patch(`/admin/camp-registrations/${id}/status`, { status });
  return response.data?.data;
}

export async function deleteCampRegistration(id) {
  const response = await apiClient.delete(`/admin/camp-registrations/${id}`);
  return response.data;
}

export default apiClient;
