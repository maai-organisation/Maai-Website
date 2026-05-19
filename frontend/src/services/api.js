import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5000",
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
  return unwrapList(await apiClient.get("/api/activities", { params }));
}

export async function getInitiatives(params = {}) {
  return unwrapList(await apiClient.get("/api/cms/initiatives", { params }));
}

export async function getInitiativeCategories() {
  return unwrapList(await apiClient.get("/api/initiative-categories"));
}

export async function getLeadership() {
  return unwrapList(await apiClient.get("/api/leadership"));
}

export async function getTeam() {
  return unwrapList(await apiClient.get("/api/cms/team"));
}

export async function getMentors() {
  return unwrapList(await apiClient.get("/api/cms/mentors"));
}

export async function getTestimonials() {
  return unwrapList(await apiClient.get("/api/cms/testimonials"));
}

export async function getReels() {
  return unwrapList(await apiClient.get("/api/cms/reels"));
}

export async function getCareers() {
  return unwrapList(await apiClient.get("/api/cms/careers"));
}

export async function getAdminCareers(params = {}) {
  return unwrapList(await apiClient.get("/api/admin/careers", { params }));
}

export async function createAdminCareer(payload) {
  const response = await apiClient.post("/api/admin/careers", payload);
  return response.data?.data;
}

export async function updateAdminCareer(id, payload) {
  const response = await apiClient.put(`/api/admin/careers/${id}`, payload);
  return response.data?.data;
}

export async function patchAdminCareer(id, payload) {
  const response = await apiClient.patch(`/api/admin/careers/${id}`, payload);
  return response.data?.data;
}

export async function deleteAdminCareer(id) {
  const response = await apiClient.delete(`/api/admin/careers/${id}`);
  return response.data;
}

export async function getAdminDashboard() {
  const response = await apiClient.get("/api/admin/dashboard");
  return response.data?.data;
}

export async function getAdminAnalytics() {
  const response = await apiClient.get("/api/admin/analytics");
  return response.data?.data;
}

export async function getAdminVolunteers(params = {}) {
  return unwrapList(await apiClient.get("/api/admin/volunteers", { params }));
}

export async function getAdminNgos(params = {}) {
  return unwrapList(await apiClient.get("/api/admin/ngos", { params }));
}

export async function updateNgoProfile(payload) {
  const response = await apiClient.patch("/api/auth/ngo/me", payload);
  return response.data?.data;
}

export async function updateAdminNgoStatus(id, membershipStatus) {
  const response = await apiClient.patch(`/api/admin/ngos/${id}/status`, { membershipStatus });
  return response.data?.data;
}

export async function updateAdminVolunteerStatus(id, membershipStatus) {
  const response = await apiClient.patch(`/api/admin/volunteers/${id}/status`, { membershipStatus });
  return response.data?.data;
}

export async function updateAdminVolunteerPaymentStatus(id, paymentStatus) {
  const response = await apiClient.patch(`/api/admin/volunteers/${id}/payment-status`, { paymentStatus });
  return response.data?.data;
}

export async function updateAdminVolunteerRole(id, role) {
  const response = await apiClient.patch(`/api/admin/volunteers/${id}/role`, { role });
  return response.data?.data;
}

export async function getAdminAuditLogs() {
  return unwrapList(await apiClient.get("/api/admin/audit-logs"));
}

export async function getAdminAnnouncements(params = {}) {
  return unwrapList(await apiClient.get("/api/admin/announcements", { params }));
}

export async function createAdminAnnouncement(payload) {
  const response = await apiClient.post("/api/admin/announcements", payload);
  return response.data;
}

export async function updateAdminAnnouncement(id, payload) {
  const response = await apiClient.put(`/api/admin/announcements/${id}`, payload);
  return response.data;
}

export async function updateAdminAnnouncementStatus(id, status) {
  const response = await apiClient.patch(`/api/admin/announcements/${id}/status`, { status });
  return response.data;
}

export async function deleteAdminAnnouncement(id) {
  const response = await apiClient.delete(`/api/admin/announcements/${id}`);
  return response.data;
}

export async function getAnnouncements() {
  return unwrapList(await apiClient.get("/api/announcements"));
}

export async function getAdminMembershipSettings() {
  const response = await apiClient.get("/api/admin/membership-settings");
  return response.data?.data;
}

export async function updateAdminMembershipSettings(payload) {
  const response = await apiClient.patch("/api/admin/membership-settings", payload);
  return response.data?.data;
}

export async function getCMSModules() {
  return unwrapList(await apiClient.get("/api/cms/modules"));
}

export async function getCMSItems(module, params = {}) {
  const response = await apiClient.get(`/api/cms/${module}`, { params });
  return {
    items: Array.isArray(response.data?.data) ? response.data.data : [],
    meta: response.data?.meta || { page: 1, limit: 10, total: 0 },
  };
}

export async function getSocialLinks(params = {}) {
  return unwrapList(await apiClient.get("/api/cms/social-links", { params }));
}

export async function createCMSItem(module, payload) {
  const response = await apiClient.post(`/api/cms/${module}`, payload);
  return response.data?.data;
}

export async function updateCMSItem(module, id, payload) {
  const response = await apiClient.put(`/api/cms/${module}/${id}`, payload);
  return response.data?.data;
}

export async function updateCMSItemStatus(module, id, status) {
  const response = await apiClient.patch(`/api/cms/${module}/${id}/status`, { status });
  return response.data?.data;
}

export async function updateCMSItemFeatured(module, id, featured) {
  const response = await apiClient.patch(`/api/cms/${module}/${id}/featured`, { featured });
  return response.data?.data;
}

export async function updateCMSItemDefault(module, id) {
  const response = await apiClient.patch(`/api/cms/${module}/${id}/default`);
  return response.data?.data;
}

export async function deleteCMSItem(module, id) {
  const response = await apiClient.delete(`/api/cms/${module}/${id}`);
  return response.data;
}

export async function sendEmail(payload) {
  const response = await apiClient.post("/api/email/send", payload);
  return response.data?.data;
}

export async function getEmailLogs(params = {}) {
  return unwrapList(await apiClient.get("/api/email/logs", { params }));
}

export async function getSocials() {
  return unwrapList(await apiClient.get("/api/socials"));
}

export async function getStats() {
  return unwrapObjectList(await apiClient.get("/api/stats"));
}

export async function getCamps(params = {}) {
  return unwrapList(await apiClient.get("/api/camps", { params }));
}

export async function submitCampRegistration(payload) {
  const response = await apiClient.post("/api/camp-registration", payload);
  return response.data;
}

export async function requestVolunteerCamp(payload) {
  const response = await apiClient.post("/api/camps/request", payload);
  return response.data;
}

export async function getCampRequests(params = {}) {
  return unwrapList(await apiClient.get("/api/camps/requests", { params }));
}

export async function createCampRequest(payload) {
  const response = await apiClient.post("/api/camps/requests", payload);
  return response.data?.data;
}

export async function updateCampRequest(id, payload) {
  const response = await apiClient.put(`/api/camps/requests/${id}`, payload);
  return response.data;
}

export async function cancelCampRequest(id) {
  const response = await apiClient.patch(`/api/camps/requests/${id}/cancel`);
  return response.data;
}

export async function reviewCampRequest(id, payload) {
  const response = await apiClient.patch(`/api/camps/requests/${id}/review`, payload);
  return response.data;
}

export async function convertCampRequestToEvent(id) {
  const response = await apiClient.post(`/api/camps/requests/${id}/convert-to-event`);
  return response.data?.data;
}

export async function getNgoNotifications() {
  return unwrapList(await apiClient.get("/api/notifications"));
}

export async function getNotifications() {
  const response = await apiClient.get("/api/notifications");
  const payload = response.data || {};
  return {
    items: Array.isArray(payload.data) ? payload.data : [],
    unreadCount: Number(payload.meta?.unreadCount || 0),
  };
}

export async function markNotificationRead(id) {
  const response = await apiClient.patch(`/api/notifications/${id}/read`);
  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await apiClient.patch("/api/notifications/read-all");
  return response.data;
}

export async function getEvents(params = {}) {
  return unwrapList(await apiClient.get("/api/events", { params }));
}

export async function getEvent(id) {
  const response = await apiClient.get(`/api/events/${id}`);
  return response.data?.data;
}

export async function createEvent(payload) {
  const response = await apiClient.post("/api/events", payload);
  return response.data?.data;
}

export async function updateEvent(id, payload) {
  const response = await apiClient.put(`/api/events/${id}`, payload);
  return response.data?.data;
}

export async function updateEventStatus(id, status) {
  const response = await apiClient.patch(`/api/events/${id}/status`, { status });
  return response.data?.data;
}

export async function deleteEvent(id) {
  const response = await apiClient.delete(`/api/events/${id}`);
  return response.data;
}

export async function getEventVolunteers() {
  return unwrapList(await apiClient.get("/api/events/volunteers"));
}

export async function getMyEvents() {
  return unwrapList(await apiClient.get("/api/events/my"));
}

export async function getMyCamps(params = {}) {
  return unwrapList(await apiClient.get("/api/events/my-camps", { params }));
}

export async function getMyCamp(id) {
  const response = await apiClient.get(`/api/events/my-camps/${id}`);
  return response.data?.data;
}

export async function addEventParticipant(eventId, payload) {
  const response = await apiClient.post(`/api/events/${eventId}/participants`, payload);
  return response.data;
}

export async function removeEventParticipant(eventId, participantId) {
  const response = await apiClient.delete(`/api/events/${eventId}/participants/${participantId}`);
  return response.data;
}

export async function updateEventParticipant(eventId, participantId, payload) {
  const response = await apiClient.patch(`/api/events/${eventId}/participants/${participantId}`, payload);
  return response.data;
}

export async function issueEventCertificates(eventId, volunteerIds) {
  const response = await apiClient.post(`/api/events/${eventId}/certificates`, { volunteerIds });
  return response.data;
}

export async function getEventCertificates(eventId, params = {}) {
  const response = await apiClient.get(`/api/events/${eventId}/certificates`, { params });
  return response.data?.data || { event: null, recipients: [] };
}

export async function revokeEventCertificate(eventId, certificateId) {
  const response = await apiClient.patch(`/api/events/${eventId}/certificates/${certificateId}/revoke`);
  return response.data;
}

export async function bulkRevokeEventCertificates(eventId, volunteerIds) {
  const response = await apiClient.patch(`/api/events/${eventId}/certificates/revoke`, { volunteerIds });
  return response.data;
}

export async function getCertificates() {
  return unwrapList(await apiClient.get("/api/certificates"));
}

export async function getMyIdCard() {
  const response = await apiClient.get("/api/id-cards/me");
  return response.data?.data || null;
}

export function getIdCardPreviewUrl() {
  const token = localStorage.getItem("maai_token") || localStorage.getItem("maai_auth_token") || "";
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${apiClient.defaults.baseURL || ""}/api/id-cards/me/preview${query}`;
}

export function getIdCardDownloadUrl() {
  const token = localStorage.getItem("maai_token") || localStorage.getItem("maai_auth_token") || "";
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${apiClient.defaults.baseURL || ""}/api/id-cards/me/download${query}`;
}

export async function claimCertificate(id) {
  const response = await apiClient.post(`/api/certificates/${id}/claim`);
  return response.data;
}

export function getCertificatePreviewUrl(id) {
  const token = localStorage.getItem("maai_token") || localStorage.getItem("maai_auth_token") || "";
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${apiClient.defaults.baseURL || ""}/api/certificates/${id}/preview${query}`;
}

export function getCertificateDownloadUrl(id) {
  const token = localStorage.getItem("maai_token") || localStorage.getItem("maai_auth_token") || "";
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${apiClient.defaults.baseURL || ""}/api/certificates/${id}/download${query}`;
}

export async function getAdminCampRegistrations(params = {}) {
  return unwrapList(await apiClient.get("/api/admin/camp-registrations", { params }));
}

export async function updateCampRegistrationStatus(id, status) {
  const response = await apiClient.patch(`/api/admin/camp-registrations/${id}/status`, { status });
  return response.data?.data;
}

export async function deleteCampRegistration(id) {
  const response = await apiClient.delete(`/api/admin/camp-registrations/${id}`);
  return response.data;
}

export default apiClient;
