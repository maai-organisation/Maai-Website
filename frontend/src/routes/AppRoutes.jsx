import { Navigate, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import InitiativeDetail from "../pages/InitiativeDetail";
import AdminCampRegistrations from "../pages/AdminCampRegistrations";
import AdminAnnouncements from "../pages/AdminAnnouncements";
import AdminCareers from "../pages/AdminCareers";
import AdminEmailCenter from "../pages/AdminEmailCenter";
import AdminEventCertificates from "../pages/AdminEventCertificates";
import AdminEvents from "../pages/AdminEvents";
import AdminPanel from "../pages/admin/AdminPanel";
import AdminNgos from "../pages/admin/AdminNgos";
import AdminVolunteers from "../pages/admin/AdminVolunteers";
import Careers from "../pages/Careers";
import CMSConsole from "../pages/cms/CMSConsole";
import Dashboard from "../pages/Dashboard";
import Membership from "../pages/Membership";
import NgoPortal from "../pages/NgoPortal";
import NgoDashboard from "../pages/NgoDashboard";
import RoleSelection from "../pages/RoleSelection";
import StaffPanel from "../pages/staff/StaffPanel";
import Team from "../pages/Team";
import { ProtectedRoute, RoleProtectedRoute } from "../components/auth/ProtectedRoute";
import Auth from "../pages/auth/Auth";
import PublicLayout from "../layouts/PublicLayout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<RoleSelection />} />
        <Route path="volunteer" element={<Home />} />
        <Route path="team" element={<Team />} />
        <Route path="careers" element={<Careers />} />
        <Route path="initiative/:slug" element={<InitiativeDetail />} />
        <Route path="membership" element={<Membership />} />
      </Route>

      <Route path="/auth" element={<Auth />} />
      <Route path="/ngo" element={<NgoPortal />} />
      <Route path="/ngo/login" element={<Navigate replace to="/auth?mode=ngo-login" />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/my-camps"
        element={
          <RoleProtectedRoute allowedRoles={["volunteer", "it_staff", "superadmin"]}>
            <Dashboard page="my-camps" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/dashboard/my-camps/:id"
        element={
          <RoleProtectedRoute allowedRoles={["volunteer", "it_staff", "superadmin"]}>
            <Dashboard page="my-camp-detail" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/volunteer/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={["volunteer", "it_staff", "superadmin"]}>
            <Dashboard />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/volunteer/profile"
        element={
          <RoleProtectedRoute allowedRoles={["volunteer", "it_staff", "superadmin"]}>
            <Dashboard page="profile" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/volunteer/certificates"
        element={
          <RoleProtectedRoute allowedRoles={["volunteer", "it_staff", "superadmin"]}>
            <Dashboard page="certificates" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/volunteer/id-card"
        element={
          <RoleProtectedRoute allowedRoles={["volunteer", "it_staff", "superadmin"]}>
            <Dashboard page="id-card" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/volunteer/events"
        element={
          <RoleProtectedRoute allowedRoles={["volunteer", "it_staff", "superadmin"]}>
            <Dashboard page="events" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/volunteer/my-camps"
        element={
          <RoleProtectedRoute allowedRoles={["volunteer", "it_staff", "superadmin"]}>
            <Dashboard page="my-camps" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/volunteer/my-camps/:id"
        element={
          <RoleProtectedRoute allowedRoles={["volunteer", "it_staff", "superadmin"]}>
            <Dashboard page="my-camp-detail" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/volunteer/careers"
        element={
          <RoleProtectedRoute allowedRoles={["volunteer", "it_staff", "superadmin"]}>
            <Dashboard page="careers" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/volunteer/request-camp"
        element={
          <RoleProtectedRoute allowedRoles={["volunteer", "it_staff", "superadmin"]}>
            <Dashboard page="request-camp" />
          </RoleProtectedRoute>
        }
      />
      <Route path="/ngo" element={<NgoPortal />} />
      <Route
        path="/ngo/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={["ngo"]}>
            <NgoDashboard />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/ngo/dashboard/camp-requests"
        element={
          <RoleProtectedRoute allowedRoles={["ngo"]}>
            <NgoDashboard initialPage="camp-requests" />
          </RoleProtectedRoute>
        }
      />
      <Route path="/team" element={<Team />} />
      <Route path="/initiative/:slug" element={<InitiativeDetail />} />
      <Route path="/careers" element={<Careers />} />
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin"]}>
            <AdminPanel />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/membership"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin", "it_staff"]}>
            <AdminPanel initialActive="settings" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <RoleProtectedRoute allowedRoles={["it_staff"]}>
            <StaffPanel />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/staff/settings/membership"
        element={
          <RoleProtectedRoute allowedRoles={["it_staff"]}>
            <StaffPanel initialActive="settings" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/cms"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin"]}>
            <CMSConsole roleLabel="Admin" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/cms/social-links"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin", "it_staff"]}>
            <CMSConsole defaultModule="social-links" roleLabel="Admin" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/cms/team"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin", "it_staff"]}>
            <CMSConsole defaultModule="team" roleLabel="Admin" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/cms/mentors"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin", "it_staff"]}>
            <CMSConsole defaultModule="mentors" roleLabel="Admin" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/cms/initiatives"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin", "it_staff"]}>
            <CMSConsole defaultModule="initiatives" roleLabel="Admin" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/cms/reels"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin", "it_staff"]}>
            <CMSConsole defaultModule="reels" roleLabel="Admin" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/cms/testimonials"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin", "it_staff"]}>
            <CMSConsole defaultModule="testimonials" roleLabel="Admin" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/cms/careers"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin", "it_staff"]}>
            <CMSConsole defaultModule="careers" roleLabel="Admin" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/cms/id-templates"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin", "it_staff"]}>
            <CMSConsole defaultModule="id-templates" roleLabel="Admin" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/cms/certificate-templates"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin", "it_staff"]}>
            <CMSConsole defaultModule="certificate-templates" roleLabel="Admin" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/cms/email-templates"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin", "it_staff"]}>
            <CMSConsole defaultModule="email-templates" roleLabel="Admin" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/staff/cms"
        element={
          <RoleProtectedRoute allowedRoles={["it_staff"]}>
            <CMSConsole roleLabel="Staff" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/staff/cms/social-links"
        element={
          <RoleProtectedRoute allowedRoles={["it_staff"]}>
            <CMSConsole defaultModule="social-links" roleLabel="Staff" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/staff/cms/team"
        element={
          <RoleProtectedRoute allowedRoles={["it_staff"]}>
            <CMSConsole defaultModule="team" roleLabel="Staff" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/staff/cms/mentors"
        element={
          <RoleProtectedRoute allowedRoles={["it_staff"]}>
            <CMSConsole defaultModule="mentors" roleLabel="Staff" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/staff/cms/initiatives"
        element={
          <RoleProtectedRoute allowedRoles={["it_staff"]}>
            <CMSConsole defaultModule="initiatives" roleLabel="Staff" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/staff/cms/reels"
        element={
          <RoleProtectedRoute allowedRoles={["it_staff"]}>
            <CMSConsole defaultModule="reels" roleLabel="Staff" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/staff/cms/testimonials"
        element={
          <RoleProtectedRoute allowedRoles={["it_staff"]}>
            <CMSConsole defaultModule="testimonials" roleLabel="Staff" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/staff/cms/careers"
        element={
          <RoleProtectedRoute allowedRoles={["it_staff"]}>
            <CMSConsole defaultModule="careers" roleLabel="Staff" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/staff/cms/id-templates"
        element={
          <RoleProtectedRoute allowedRoles={["it_staff"]}>
            <CMSConsole defaultModule="id-templates" roleLabel="Staff" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/staff/cms/certificate-templates"
        element={
          <RoleProtectedRoute allowedRoles={["it_staff"]}>
            <CMSConsole defaultModule="certificate-templates" roleLabel="Staff" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/staff/cms/email-templates"
        element={
          <RoleProtectedRoute allowedRoles={["it_staff"]}>
            <CMSConsole defaultModule="email-templates" roleLabel="Staff" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/volunteers"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin", "it_staff"]}>
            <AdminVolunteers />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/ngos"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin", "it_staff"]}>
            <AdminNgos />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/staff/ngos"
        element={
          <RoleProtectedRoute allowedRoles={["it_staff"]}>
            <AdminNgos />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin", "it_staff"]}>
            <AdminEvents />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/events/:id/certificates"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin", "it_staff"]}>
            <AdminEventCertificates />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/staff/events"
        element={
          <RoleProtectedRoute allowedRoles={["it_staff"]}>
            <AdminEvents />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/staff/events/:id/certificates"
        element={
          <RoleProtectedRoute allowedRoles={["it_staff"]}>
            <AdminEventCertificates />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/careers"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin"]}>
            <AdminCareers />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/camp-registrations"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin"]}>
            <AdminCampRegistrations />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/announcements"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin"]}>
            <AdminAnnouncements />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/communications/announcements"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin"]}>
            <AdminAnnouncements roleLabel="Admin" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/staff/communications/announcements"
        element={
          <RoleProtectedRoute allowedRoles={["it_staff"]}>
            <AdminAnnouncements roleLabel="Staff" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/communications/email"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin", "it_staff"]}>
            <AdminEmailCenter />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/camp-requests"
        element={
          <RoleProtectedRoute allowedRoles={["superadmin", "it_staff"]}>
            <AdminCampRegistrations />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/staff/camp-requests"
        element={
          <RoleProtectedRoute allowedRoles={["it_staff"]}>
            <AdminCampRegistrations />
          </RoleProtectedRoute>
        }
      />
    </Routes>
  );
}
