import CMSActionsDropdown from "./CMSActionsDropdown";
import CMSImagePreview from "./CMSImagePreview";
import CMSStatusBadge from "./CMSStatusBadge";
import Icon from "../shared/Icon";

export default function CMSTable({
  items,
  onArchive,
  onDelete,
  onDefault,
  onEdit,
  onFeature,
  onFeatured,
  onPublish,
  onCategory,
  onInitiative,
  onPlatform,
  onRating,
  onSearch,
  onSort,
  onStatus,
  onOrganization,
  onDepartment,
  onRoleType,
  onUnfeature,
  onVisibility,
  category,
  department,
  featured,
  initiativeId,
  moduleKey,
  organization,
  platform,
  rating,
  roleType,
  search,
  sort,
  status,
  visibility,
}) {
  const isSocialLinks = moduleKey === "social-links";
  const isTeam = moduleKey === "team";
  const isMentors = moduleKey === "mentors";
  const isInitiatives = moduleKey === "initiatives";
  const isReels = moduleKey === "reels";
  const isTestimonials = moduleKey === "testimonials";
  const isCareers = moduleKey === "careers";
  const isIdTemplates = moduleKey === "id-templates";
  const isCertificateTemplates = moduleKey === "certificate-templates";
  const isEmailTemplates = moduleKey === "email-templates";
  const organizations = [...new Set(items.map((item) => item.organization).filter(Boolean))].sort();
  const categories = ["awareness", "camp", "research", "education", "advocacy", "community", "conference", "other"];
  const visibilities = ["public", "volunteers", "internal"];
  const careerVisibilities = ["public", "members_only", "internal"];
  const careerRoleTypes = ["volunteer", "internship", "leadership", "research", "operations", "design", "it", "community", "other"];

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/88 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className={`grid gap-4 border-b border-slate-100 p-6 ${isMentors || isInitiatives || isReels || isTestimonials || isCareers ? "md:grid-cols-[1fr_150px_150px_180px_180px]" : "md:grid-cols-[1fr_180px_180px]"}`}>
        <input
          className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-cyan-400"
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search CMS entries"
          value={search}
        />
        <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(event) => onStatus(event.target.value)} value={status}>
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        {isMentors ? (
          <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(event) => onFeatured(event.target.value)} value={featured}>
            <option value="all">All featured</option>
            <option value="featured">Featured</option>
            <option value="false">Not featured</option>
          </select>
        ) : null}
        {isMentors ? (
          <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(event) => onOrganization(event.target.value)} value={organization}>
            <option value="all">All organizations</option>
            {organizations.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        ) : null}
        {isInitiatives ? (
          <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(event) => onCategory(event.target.value)} value={category}>
            <option value="all">All categories</option>
            {categories.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        ) : null}
        {isTestimonials ? (
          <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(event) => onCategory(event.target.value)} value={category}>
            <option value="all">All categories</option>
            {["volunteer", "mentor", "ngo", "partner", "beneficiary", "speaker", "other"].map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        ) : null}
        {isTestimonials ? (
          <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(event) => onFeatured(event.target.value)} value={featured}>
            <option value="all">All featured</option>
            <option value="featured">Featured</option>
            <option value="false">Not featured</option>
          </select>
        ) : null}
        {isTestimonials ? (
          <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(event) => onRating(event.target.value)} value={rating}>
            <option value="all">All ratings</option>
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>{value} stars</option>
            ))}
          </select>
        ) : null}
        {isReels ? (
          <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(event) => onPlatform(event.target.value)} value={platform}>
            <option value="all">All platforms</option>
            <option value="instagram">instagram</option>
            <option value="youtube">youtube</option>
            <option value="external">external</option>
          </select>
        ) : null}
        {isReels ? (
          <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(event) => onFeatured(event.target.value)} value={featured}>
            <option value="all">All featured</option>
            <option value="featured">Featured</option>
            <option value="false">Not featured</option>
          </select>
        ) : null}
        {isReels ? (
          <input
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold"
            onChange={(event) => onInitiative(event.target.value || "all")}
            placeholder="Initiative ID"
            value={initiativeId === "all" ? "" : initiativeId}
          />
        ) : null}
        {isInitiatives ? (
          <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(event) => onVisibility(event.target.value)} value={visibility}>
            <option value="all">All visibility</option>
            {visibilities.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        ) : null}
        {isCareers ? (
          <input
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold"
            onChange={(event) => onDepartment(event.target.value)}
            placeholder="Department"
            value={department}
          />
        ) : null}
        {isCareers ? (
          <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(event) => onRoleType(event.target.value)} value={roleType}>
            <option value="all">All role types</option>
            {careerRoleTypes.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        ) : null}
        {isCareers ? (
          <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(event) => onVisibility(event.target.value)} value={visibility}>
            <option value="all">All visibility</option>
            {careerVisibilities.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        ) : null}
        {isCareers ? (
          <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(event) => onFeatured(event.target.value)} value={featured}>
            <option value="all">All featured</option>
            <option value="featured">Featured</option>
            <option value="false">Not featured</option>
          </select>
        ) : null}
        {isInitiatives ? (
          <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(event) => onFeatured(event.target.value)} value={featured}>
            <option value="all">All featured</option>
            <option value="featured">Featured</option>
            <option value="false">Not featured</option>
          </select>
        ) : null}
        <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(event) => onSort(event.target.value)} value={sort}>
          {isEmailTemplates ? <option value="updated_at">Updated</option> : <option value="order_index">Order</option>}
          <option value={isSocialLinks ? "platform" : isTeam || isMentors || isTestimonials ? "full_name" : isIdTemplates || isCertificateTemplates || isEmailTemplates ? "name" : "title"}>
            {isSocialLinks ? "Platform" : isTeam || isMentors || isTestimonials || isIdTemplates || isCertificateTemplates || isEmailTemplates ? "Name" : "Title"}
          </option>
          {isIdTemplates ? <option value="is_default">Default</option> : null}
          {isCertificateTemplates ? <option value="certificate_type">Type</option> : null}
          {isCertificateTemplates ? <option value="is_default">Default</option> : null}
          {isEmailTemplates ? <option value="email_type">Email Type</option> : null}
          {isEmailTemplates ? <option value="subject">Subject</option> : null}
          {isEmailTemplates ? <option value="is_default">Default</option> : null}
          {isTeam ? <option value="department">Department</option> : null}
          {isTeam ? <option value="designation">Designation</option> : null}
          {isMentors ? <option value="organization">Organization</option> : null}
          {isMentors ? <option value="specialization">Specialization</option> : null}
          {isMentors ? <option value="featured">Featured</option> : null}
          {isInitiatives ? <option value="category">Category</option> : null}
          {isInitiatives ? <option value="visibility">Visibility</option> : null}
          {isInitiatives ? <option value="featured">Featured</option> : null}
          {isReels ? <option value="platform">Platform</option> : null}
          {isReels ? <option value="featured">Featured</option> : null}
          {isReels ? <option value="published_at">Published Date</option> : null}
          {isTestimonials ? <option value="category">Category</option> : null}
          {isTestimonials ? <option value="organization">Organization</option> : null}
          {isTestimonials ? <option value="rating">Rating</option> : null}
          {isTestimonials ? <option value="featured">Featured</option> : null}
          {isCareers ? <option value="department">Department</option> : null}
          {isCareers ? <option value="role_type">Role Type</option> : null}
          {isCareers ? <option value="visibility">Visibility</option> : null}
          {isCareers ? <option value="featured">Featured</option> : null}
          {isCareers ? <option value="application_deadline">Deadline</option> : null}
          <option value="status">Status</option>
          {!isEmailTemplates ? <option value="updated_at">Updated</option> : null}
        </select>
      </div>
      <div className="overflow-x-auto rounded-b-[28px]">
        <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="px-5 py-4">{isCareers ? "Title" : isEmailTemplates ? "Template" : isCertificateTemplates ? "Preview" : isIdTemplates ? "Template" : isSocialLinks ? "Platform" : isTeam || isMentors || isTestimonials ? "Photo" : isReels ? "Thumbnail" : "Image"}</th>
              <th className="px-5 py-4">{isCareers ? "Department" : isEmailTemplates ? "Email Type" : isCertificateTemplates ? "Template Name" : isIdTemplates ? "Header" : isSocialLinks ? "URL" : isTeam || isMentors || isTestimonials ? "Name" : "Title"}</th>
              <th className="px-5 py-4">{isCareers ? "Role Type" : isEmailTemplates ? "Subject" : isCertificateTemplates ? "Type" : isIdTemplates ? "Default" : isSocialLinks ? "Preview" : isTeam || isMentors ? "Designation" : isInitiatives || isTestimonials ? "Category" : isReels ? "Platform" : "Slug"}</th>
              {isCertificateTemplates || isEmailTemplates ? <th className="px-5 py-4">Default</th> : null}
              {isTeam ? <th className="px-5 py-4">Department</th> : null}
              {isMentors ? <th className="px-5 py-4">Organization</th> : null}
              {isMentors ? <th className="px-5 py-4">Specialization</th> : null}
              {isInitiatives ? <th className="px-5 py-4">Visibility</th> : null}
              {isMentors || isInitiatives || isReels || isTestimonials ? <th className="px-5 py-4">Featured</th> : null}
              {isReels ? <th className="px-5 py-4">Published Date</th> : null}
              {isTestimonials ? <th className="px-5 py-4">Organization</th> : null}
              {isTestimonials ? <th className="px-5 py-4">Rating</th> : null}
              {isCareers ? <th className="px-5 py-4">Visibility</th> : null}
              {isCareers ? <th className="px-5 py-4">Featured</th> : null}
              {isCareers ? <th className="px-5 py-4">Deadline</th> : null}
              <th className="px-5 py-4">Status</th>
              {!isEmailTemplates ? <th className="px-5 py-4">Order</th> : null}
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {items.map((item) => (
              <tr className="transition hover:bg-cyan-50/40" key={item.id}>
                <td className="w-36 border-t border-slate-100 px-5 py-5 font-black capitalize">
                  {isCareers ? item.title : isEmailTemplates ? item.name : isCertificateTemplates ? <CMSImagePreview url={item.backgroundUrl || item.background_url} /> : isIdTemplates ? item.name : isSocialLinks ? item.platform : <CMSImagePreview url={isTeam || isMentors || isInitiatives || isTestimonials ? item.imageUrl || item.image_url : isReels ? item.thumbnailUrl || item.thumbnail_url : item.imageUrl} />}
                </td>
                <td className="max-w-sm border-t border-slate-100 px-5 py-5 font-semibold text-slate-600">
                  {isCareers ? item.department || "-" : isEmailTemplates ? item.emailType || item.email_type : isCertificateTemplates ? item.name : isIdTemplates ? item.headerText || item.header_text || "-" : isSocialLinks ? (
                    <a className="break-all text-cyan-700 underline" href={item.url} target="_blank" rel="noreferrer">{item.url}</a>
                  ) : isTeam || isMentors || isTestimonials ? (item.fullName || item.full_name || item.name) : item.title}
                </td>
                <td className="border-t border-slate-100 px-5 py-5 font-semibold text-slate-500">
                  {isCareers ? (item.roleType || item.role_type || "-") : isEmailTemplates ? item.subject : isCertificateTemplates ? item.certificateType || item.certificate_type : isIdTemplates ? (item.isDefault || item.is_default ? "Yes" : "No") : isSocialLinks ? (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-cyan-700">
                      <Icon className="h-5 w-5" name={item.icon || item.platform} />
                    </span>
                  ) : isTeam || isMentors ? item.designation : isInitiatives || isTestimonials ? item.category : isReels ? item.platform : item.slug}
                </td>
                {isCertificateTemplates || isEmailTemplates ? <td className="border-t border-slate-100 px-5 py-5 font-semibold text-slate-600">{item.isDefault || item.is_default ? "Yes" : "No"}</td> : null}
                {isTeam ? <td className="px-5 py-4 font-semibold text-slate-600">{item.department || "-"}</td> : null}
                {isMentors ? <td className="px-5 py-4 font-semibold text-slate-600">{item.organization || "-"}</td> : null}
                {isMentors ? <td className="px-5 py-4 font-semibold text-slate-600">{item.specialization || "-"}</td> : null}
                {isInitiatives ? <td className="px-5 py-4 font-semibold text-slate-600">{item.visibility || "-"}</td> : null}
                {isMentors || isInitiatives || isReels || isTestimonials ? <td className="px-5 py-4 font-semibold text-slate-600">{item.featured ? "Yes" : "No"}</td> : null}
                {isReels ? <td className="px-5 py-4 font-semibold text-slate-600">{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "-"}</td> : null}
                {isTestimonials ? <td className="px-5 py-4 font-semibold text-slate-600">{item.organization || "-"}</td> : null}
                {isTestimonials ? <td className="px-5 py-4 font-semibold text-slate-600">{item.rating || 5}</td> : null}
                {isCareers ? <td className="px-5 py-4 font-semibold text-slate-600">{item.visibility || "-"}</td> : null}
                {isCareers ? <td className="px-5 py-4 font-semibold text-slate-600">{item.featured ? "Yes" : "No"}</td> : null}
                {isCareers ? <td className="px-5 py-4 font-semibold text-slate-600">{item.applicationDeadline ? new Date(item.applicationDeadline).toLocaleDateString() : "-"}</td> : null}
                <td className="px-5 py-4"><CMSStatusBadge status={item.status} /></td>
                {!isEmailTemplates ? <td className="px-5 py-4 font-semibold text-slate-600">{item.orderIndex ?? item.order_index ?? 0}</td> : null}
                <td className="px-5 py-4">
                  <CMSActionsDropdown
                    item={item}
                    onArchive={onArchive}
                    onDefault={isEmailTemplates ? onDefault : undefined}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onFeature={isMentors || isInitiatives || isReels || isTestimonials || isCareers ? onFeature : undefined}
                    onPublish={onPublish}
                    onUnfeature={isMentors || isInitiatives || isReels || isTestimonials || isCareers ? onUnfeature : undefined}
                  />
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td className="px-5 py-10 text-center text-sm font-bold text-slate-500" colSpan={isCareers ? 9 : isMentors || isInitiatives || isReels || isTestimonials ? 9 : isTeam ? 7 : 6}>No CMS entries found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
