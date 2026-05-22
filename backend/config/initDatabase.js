const { pool, testDatabaseConnection } = require("./db");

async function ensureColumn(table, column, definition) {
  const [rows] = await pool.query(
    `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
    `,
    [table, column],
  );

  if (rows.length === 0) {
    await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  }
}

async function ensureIndex(table, indexName, definition) {
  const [rows] = await pool.query(
    `
      SELECT INDEX_NAME
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND INDEX_NAME = ?
      LIMIT 1
    `,
    [table, indexName],
  );

  if (rows.length === 0) {
    await pool.query(`ALTER TABLE ${table} ADD ${definition}`);
  }
}

async function initDatabase() {
  await testDatabaseConnection();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS volunteers (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      full_name VARCHAR(180) NOT NULL,
      email VARCHAR(180) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      city VARCHAR(120) NOT NULL,
      college VARCHAR(180) NULL,
      course VARCHAR(180) NULL,
      academic_year VARCHAR(80) NULL,
      skills TEXT NULL,
      interests TEXT NULL,
      availability VARCHAR(220) NULL,
      bio TEXT NULL,
      linkedin_url TEXT NULL,
      instagram_url TEXT NULL,
      role ENUM('volunteer', 'it_staff', 'superadmin') NOT NULL DEFAULT 'volunteer',
      status ENUM('pending', 'approved', 'rejected', 'suspended') NOT NULL DEFAULT 'pending',
      approval_status ENUM('pending', 'approved', 'rejected', 'suspended') NOT NULL DEFAULT 'pending',
      membership_status ENUM('under_review', 'verified', 'rejected') NOT NULL DEFAULT 'under_review',
      payment_status ENUM('free', 'pending', 'paid', 'failed') NOT NULL DEFAULT 'free',
      transaction_id VARCHAR(255) NOT NULL DEFAULT 'FREE',
      verified_by INT UNSIGNED NULL,
      verified_at TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY volunteers_email_unique (email),
      KEY volunteers_role_status_lookup (role, status),
      KEY volunteers_city_lookup (city)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ngos (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      organization_name VARCHAR(220) NOT NULL,
      registration_number VARCHAR(180) NOT NULL,
      ngo_type ENUM('healthcare', 'education', 'community', 'research', 'environment', 'other') NOT NULL DEFAULT 'other',
      email VARCHAR(180) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      website TEXT NULL,
      city VARCHAR(120) NOT NULL,
      state VARCHAR(120) NULL,
      address TEXT NULL,
      mission TEXT NULL,
      description TEXT NULL,
      logo_url TEXT NULL,
      cover_url TEXT NULL,
      membership_status ENUM('under_review', 'verified', 'rejected', 'suspended') NOT NULL DEFAULT 'under_review',
      payment_status ENUM('free', 'pending', 'paid', 'failed') NOT NULL DEFAULT 'free',
      transaction_id VARCHAR(255) NOT NULL DEFAULT 'FREE',
      verified_by INT UNSIGNED NULL,
      verified_at TIMESTAMP NULL,
      chapter VARCHAR(180) NULL,
      partner_level VARCHAR(120) NULL,
      certificate_enabled TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY ngos_email_unique (email),
      UNIQUE KEY ngos_registration_unique (registration_number),
      KEY ngos_status_lookup (membership_status, payment_status, created_at),
      KEY ngos_city_lookup (city, state)
    )
  `);
  await ensureColumn("ngos", "password_hash", "VARCHAR(255) NOT NULL");
  await ensureColumn("ngos", "organisation_name", "VARCHAR(220) NULL");
  await ensureColumn("ngos", "organisation_type", "VARCHAR(120) NULL");
  await ensureColumn("ngos", "year_established", "INT UNSIGNED NULL");
  await ensureColumn("ngos", "founder_name", "VARCHAR(180) NULL");
  await ensureColumn("ngos", "designation", "VARCHAR(180) NULL");
  await ensureColumn("ngos", "representative_email", "VARCHAR(180) NULL");
  await ensureColumn("ngos", "representative_phone", "VARCHAR(40) NULL");
  await ensureColumn("ngos", "pincode", "VARCHAR(20) NULL");
  await ensureColumn("ngos", "country", "VARCHAR(120) NULL DEFAULT 'India'");
  await ensureColumn("ngos", "work_areas", "JSON NULL");
  await ensureColumn("ngos", "target_population", "TEXT NULL");
  await ensureColumn("ngos", "districts_served", "TEXT NULL");
  await ensureColumn("ngos", "beneficiaries_per_year", "INT UNSIGNED NULL");
  await ensureColumn("ngos", "existing_collaborations", "TEXT NULL");
  await ensureColumn("ngos", "partnership_intent", "JSON NULL");
  await ensureColumn("ngos", "camp_request", "JSON NULL");
  await ensureColumn("ngos", "uploads", "JSON NULL");
  await ensureColumn("ngos", "status", "ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'");
  await ensureColumn("ngos", "chapter", "VARCHAR(180) NULL");
  await ensureColumn("ngos", "partner_level", "VARCHAR(120) NULL");
  await ensureColumn("ngos", "certificate_enabled", "TINYINT(1) NOT NULL DEFAULT 0");
  await pool.query(`
    INSERT INTO ngos
      (organization_name, registration_number, ngo_type, email, password_hash, phone, website, city, state, address, mission, description, logo_url, cover_url, membership_status, payment_status, transaction_id, verified_at)
    SELECT 'Maai Demo Partner NGO', 'DEMO-NGO-001', 'healthcare', 'demo.ngo@maai.org', '$2a$10$kZCB4RdujMOtfb67kQwa8urshyxMnnYcBIrO8TS9g8N04arwTW6I6', '+910000000000', 'https://maai.example.org', 'Delhi', 'Delhi', 'Demo address', 'Community health collaboration.', 'Verified demo NGO partner for Maai workflows.', 'https://placehold.co/600x600?text=NGO', 'https://placehold.co/1200x500?text=Maai+NGO', 'verified', 'free', 'FREE', NOW()
    WHERE NOT EXISTS (
      SELECT 1 FROM ngos WHERE email = 'demo.ngo@maai.org' OR registration_number = 'DEMO-NGO-001' LIMIT 1
    )
  `);

  await ensureColumn("volunteers", "full_name", "VARCHAR(180) NOT NULL");
  await ensureColumn("volunteers", "password_hash", "VARCHAR(255) NOT NULL");
  await ensureColumn("volunteers", "phone", "VARCHAR(40) NOT NULL");
  await ensureColumn("volunteers", "city", "VARCHAR(120) NOT NULL");
  await ensureColumn("volunteers", "college", "VARCHAR(180) NULL");
  await ensureColumn("volunteers", "course", "VARCHAR(180) NULL");
  await ensureColumn("volunteers", "academic_year", "VARCHAR(80) NULL");
  await ensureColumn("volunteers", "skills", "TEXT NULL");
  await ensureColumn("volunteers", "interests", "TEXT NULL");
  await ensureColumn("volunteers", "availability", "VARCHAR(220) NULL");
  await ensureColumn("volunteers", "bio", "TEXT NULL");
  await ensureColumn("volunteers", "linkedin_url", "TEXT NULL");
  await ensureColumn("volunteers", "instagram_url", "TEXT NULL");
  await ensureColumn(
    "volunteers",
    "role",
    "ENUM('volunteer', 'it_staff', 'superadmin') NOT NULL DEFAULT 'volunteer'",
  );
  await ensureColumn("volunteers", "status", "ENUM('pending', 'approved', 'rejected', 'suspended') NOT NULL DEFAULT 'pending'");
  await ensureColumn(
    "volunteers",
    "approval_status",
    "ENUM('pending', 'approved', 'rejected', 'suspended') NOT NULL DEFAULT 'pending'",
  );
  await pool.query("ALTER TABLE volunteers MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'suspended') NOT NULL DEFAULT 'pending'");
  await pool.query("ALTER TABLE volunteers MODIFY COLUMN approval_status ENUM('pending', 'approved', 'rejected', 'suspended') NOT NULL DEFAULT 'pending'");
  await ensureColumn(
    "volunteers",
    "membership_status",
    "ENUM('under_review', 'verified', 'rejected') NOT NULL DEFAULT 'under_review'",
  );
  await ensureColumn(
    "volunteers",
    "payment_status",
    "ENUM('free', 'pending', 'paid', 'failed') NOT NULL DEFAULT 'free'",
  );
  await ensureColumn("volunteers", "transaction_id", "VARCHAR(255) NOT NULL DEFAULT 'FREE'");
  await ensureColumn("volunteers", "verified_by", "INT UNSIGNED NULL");
  await ensureColumn("volunteers", "verified_at", "TIMESTAMP NULL");
  await ensureColumn("volunteers", "created_at", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP");
  await ensureColumn("volunteers", "updated_at", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
  await ensureIndex("volunteers", "volunteers_email_unique", "UNIQUE KEY volunteers_email_unique (email)");
  await pool.query(`
    UPDATE volunteers
    SET membership_status = CASE
      WHEN approval_status = 'approved' OR status = 'approved' THEN 'verified'
      WHEN approval_status = 'rejected' OR status = 'rejected' THEN 'rejected'
      ELSE COALESCE(membership_status, 'under_review')
    END
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      actor_id INT UNSIGNED NULL,
      action VARCHAR(180) NOT NULL,
      entity_type VARCHAR(120) NOT NULL,
      entity_id VARCHAR(120) NULL,
      metadata_json JSON NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY audit_logs_actor_lookup (actor_id, created_at),
      KEY audit_logs_entity_lookup (entity_type, entity_id, created_at),
      CONSTRAINT audit_logs_actor_fk
        FOREIGN KEY (actor_id) REFERENCES volunteers(id)
        ON DELETE SET NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS membership_settings (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      payments_enabled TINYINT(1) NOT NULL DEFAULT 0,
      membership_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
      currency VARCHAR(10) NOT NULL DEFAULT 'INR',
      upi_qr_url TEXT NULL,
      payment_instructions TEXT NULL,
      instructions TEXT NULL,
      membership_name VARCHAR(180) NOT NULL DEFAULT 'Free Membership',
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )
  `);
  await ensureColumn("membership_settings", "currency", "VARCHAR(10) NOT NULL DEFAULT 'INR'");
  await ensureColumn("membership_settings", "payment_instructions", "TEXT NULL");
  await ensureColumn("membership_settings", "membership_name", "VARCHAR(180) NOT NULL DEFAULT 'Free Membership'");
  await ensureColumn("membership_settings", "is_active", "TINYINT(1) NOT NULL DEFAULT 1");
  await ensureColumn("membership_settings", "plan_duration", "INT NULL");
  await ensureColumn("membership_settings", "renewal_fee", "DECIMAL(10,2) NULL");
  await ensureColumn("membership_settings", "expiry_date", "DATE NULL");
  await ensureColumn("membership_settings", "chapter_pricing", "JSON NULL");
  await pool.query(
    `
      INSERT INTO membership_settings
        (id, payments_enabled, membership_fee, currency, upi_qr_url, payment_instructions, instructions, membership_name, is_active)
      VALUES (1, 0, 0, 'INR', NULL, 'Memberships are currently free.', 'Memberships are currently free.', 'Free Membership', 1)
      ON DUPLICATE KEY UPDATE id = id
    `,
  );
  await pool.query(`
    UPDATE membership_settings
    SET currency = COALESCE(NULLIF(currency, ''), 'INR'),
        membership_name = COALESCE(NULLIF(membership_name, ''), IF(payments_enabled = 1, 'Maai Membership', 'Free Membership')),
        payment_instructions = COALESCE(payment_instructions, instructions, 'Memberships are currently free.'),
        is_active = COALESCE(is_active, 1)
    WHERE id = 1
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cms_entries (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      module VARCHAR(80) NOT NULL,
      title VARCHAR(220) NOT NULL,
      slug VARCHAR(240) NOT NULL,
      description TEXT NULL,
      image_url TEXT NULL,
      status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
      order_index INT NOT NULL DEFAULT 0,
      tags_json JSON NULL,
      metadata_json JSON NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY cms_entries_module_slug_unique (module, slug),
      KEY cms_entries_module_status_order (module, status, order_index),
      KEY cms_entries_updated_lookup (module, updated_at)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS email_templates (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(180) NOT NULL,
      email_type ENUM('membership_verified', 'membership_rejected', 'membership_under_review', 'certificate_issued', 'certificate_revoked', 'camp_approved', 'camp_rejected', 'ngo_verified', 'announcement', 'event_created') NOT NULL,
      subject VARCHAR(255) NOT NULL,
      body_template TEXT NOT NULL,
      status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
      is_default TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY email_templates_type_status_updated (email_type, status, updated_at)
    )
  `);
  await ensureColumn("email_templates", "is_default", "TINYINT(1) NOT NULL DEFAULT 0");
  await pool.query(
    "ALTER TABLE email_templates MODIFY COLUMN email_type ENUM('membership_verified', 'membership_rejected', 'membership_under_review', 'certificate_issued', 'certificate_revoked', 'camp_approved', 'camp_rejected', 'ngo_verified', 'announcement', 'event_created') NOT NULL",
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS email_logs (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      template_id INT UNSIGNED NULL,
      email_type VARCHAR(80) NOT NULL,
      recipient_email VARCHAR(180) NOT NULL,
      recipient_type VARCHAR(80) NULL,
      recipient_id INT UNSIGNED NULL,
      subject VARCHAR(255) NULL,
      body TEXT NULL,
      status ENUM('sent', 'failed', 'queued') NOT NULL DEFAULT 'queued',
      error_message TEXT NULL,
      metadata_json JSON NULL,
      sent_at TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY email_logs_type_status_created (email_type, status, created_at),
      KEY email_logs_recipient_lookup (recipient_type, recipient_id, created_at),
      CONSTRAINT email_logs_template_fk
        FOREIGN KEY (template_id) REFERENCES email_templates(id)
        ON DELETE SET NULL
    )
  `);
  await pool.query("UPDATE email_logs SET status = 'queued' WHERE status = 'skipped'");
  await pool.query("ALTER TABLE email_logs MODIFY COLUMN status ENUM('sent', 'failed', 'queued') NOT NULL DEFAULT 'queued'");

  const emailTemplateSeeds = [
    [
      "Membership Verified",
      "membership_verified",
      "Your Maai membership is verified",
      "Hello {{full_name}},\n\nYour Maai membership has been verified.\n\nMembership status: {{membership_status}}\n\nYou can now access your membership benefits and certificate from your dashboard.",
    ],
    [
      "Membership Rejected",
      "membership_rejected",
      "Update on your Maai membership",
      "Hello {{full_name}},\n\nYour Maai membership request was not approved at this time.\n\nMembership status: {{membership_status}}\n\nYou may contact Maai organisation for more details.",
    ],
    [
      "Membership Under Review",
      "membership_under_review",
      "Your Maai membership is under review",
      "Hello {{full_name}},\n\nYour Maai membership request is under review.\n\nMembership status: {{membership_status}}",
    ],
    [
      "Certificate Issued",
      "certificate_issued",
      "{{certificate_name}} is ready",
      "Hello {{full_name}},\n\nYour {{certificate_name}} for {{event_name}} has been issued and is ready to claim from your Maai dashboard.",
    ],
    [
      "Certificate Revoked",
      "certificate_revoked",
      "{{certificate_name}} has been revoked",
      "Hello {{full_name}},\n\nYour {{certificate_name}} for {{event_name}} has been revoked by Maai organisation.",
    ],
    [
      "Camp Approved",
      "camp_approved",
      "Your camp request is approved",
      "Hello {{full_name}},\n\nYour camp request for {{event_name}} has been approved by Maai organisation.",
    ],
    [
      "Camp Rejected",
      "camp_rejected",
      "Update on your camp request",
      "Hello {{full_name}},\n\nYour camp request for {{event_name}} was not approved at this time.",
    ],
    [
      "NGO Verified",
      "ngo_verified",
      "Your NGO profile is verified",
      "Hello {{full_name}},\n\nYour NGO profile has been verified by Maai organisation.\n\nMembership status: {{membership_status}}",
    ],
    [
      "Announcement",
      "announcement",
      "Maai announcement: {{event_name}}",
      "Hello {{full_name}},\n\nMaai organisation has a new announcement about {{event_name}}.",
    ],
    [
      "Event Created",
      "event_created",
      "New Maai event: {{event_name}}",
      "Hello {{full_name}},\n\nA new Maai event has been created: {{event_name}}.",
    ],
  ];

  for (const [index, [name, emailType, subject, bodyTemplate]] of emailTemplateSeeds.entries()) {
    await pool.query(
      `
        INSERT INTO email_templates
          (name, email_type, subject, body_template, status, is_default)
        SELECT ?, ?, ?, ?, 'published', 1
        WHERE NOT EXISTS (
          SELECT 1 FROM email_templates WHERE email_type = ? LIMIT 1
        )
      `,
      [name, emailType, subject, bodyTemplate, emailType],
    );
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS social_links (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      platform ENUM('instagram', 'linkedin', 'youtube', 'twitter', 'facebook', 'website', 'whatsapp', 'telegram', 'discord') NOT NULL,
      url TEXT NOT NULL,
      icon VARCHAR(80) NOT NULL,
      status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published',
      order_index INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY social_links_platform_unique (platform),
      KEY social_links_status_order (status, order_index, created_at)
    )
  `);

  await pool.query(`
    INSERT INTO social_links
      (platform, url, icon, status, order_index)
    VALUES
      ('instagram', 'https://www.instagram.com/maai.cares', 'instagram', 'published', 1),
      ('linkedin', 'https://www.linkedin.com/company/maai-cares', 'linkedin', 'published', 2),
      ('youtube', 'https://www.youtube.com/@Maai.organisation', 'youtube', 'published', 3)
    ON DUPLICATE KEY UPDATE platform = platform
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      fullName VARCHAR(180) NOT NULL,
      email VARCHAR(180) NOT NULL,
      passwordHash VARCHAR(255) NOT NULL,
      accountType VARCHAR(80) NOT NULL DEFAULT 'volunteer',
      role VARCHAR(80) NOT NULL DEFAULT 'member',
      status ENUM('pending', 'active', 'suspended', 'rejected') NOT NULL DEFAULT 'pending',
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY users_email_unique (email),
      KEY users_auth_lookup (email, accountType, status)
    )
  `);

  await ensureColumn("users", "fullName", "VARCHAR(180) NOT NULL");
  await ensureColumn("users", "passwordHash", "VARCHAR(255) NOT NULL");
  await ensureColumn("users", "accountType", "VARCHAR(80) NOT NULL DEFAULT 'volunteer'");
  await ensureColumn("users", "role", "VARCHAR(80) NOT NULL DEFAULT 'member'");
  await ensureColumn("users", "status", "ENUM('pending', 'active', 'suspended', 'rejected') NOT NULL DEFAULT 'pending'");
  await ensureColumn("users", "createdAt", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP");
  await ensureColumn("users", "updatedAt", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
  await ensureIndex("users", "users_email_unique", "UNIQUE KEY users_email_unique (email)");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS volunteer_profiles (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      userId INT UNSIGNED NOT NULL,
      phone VARCHAR(40) NOT NULL,
      college VARCHAR(180) NULL,
      course VARCHAR(180) NULL,
      year VARCHAR(80) NULL,
      city VARCHAR(120) NOT NULL,
      skills TEXT NULL,
      interests TEXT NULL,
      availability VARCHAR(220) NULL,
      bio TEXT NULL,
      linkedin TEXT NULL,
      instagram TEXT NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY volunteer_profiles_user_unique (userId),
      KEY volunteer_profiles_city_lookup (city),
      CONSTRAINT volunteer_profiles_user_fk
        FOREIGN KEY (userId) REFERENCES users(id)
        ON DELETE CASCADE
    )
  `);

  await ensureColumn("volunteer_profiles", "phone", "VARCHAR(40) NOT NULL");
  await ensureColumn("volunteer_profiles", "college", "VARCHAR(180) NULL");
  await ensureColumn("volunteer_profiles", "course", "VARCHAR(180) NULL");
  await ensureColumn("volunteer_profiles", "year", "VARCHAR(80) NULL");
  await ensureColumn("volunteer_profiles", "city", "VARCHAR(120) NOT NULL");
  await ensureColumn("volunteer_profiles", "skills", "TEXT NULL");
  await ensureColumn("volunteer_profiles", "interests", "TEXT NULL");
  await ensureColumn("volunteer_profiles", "availability", "VARCHAR(220) NULL");
  await ensureColumn("volunteer_profiles", "bio", "TEXT NULL");
  await ensureColumn("volunteer_profiles", "linkedin", "TEXT NULL");
  await ensureColumn("volunteer_profiles", "instagram", "TEXT NULL");
  await ensureColumn("volunteer_profiles", "createdAt", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP");
  await ensureColumn("volunteer_profiles", "updatedAt", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
  await ensureIndex(
    "volunteer_profiles",
    "volunteer_profiles_user_unique",
    "UNIQUE KEY volunteer_profiles_user_unique (userId)",
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS careers (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      title VARCHAR(180) NOT NULL,
      slug VARCHAR(220) NULL,
      department VARCHAR(160) NULL,
      type VARCHAR(120) NULL,
      role_type ENUM('volunteer', 'internship', 'leadership', 'research', 'operations', 'design', 'it', 'community', 'other') NOT NULL DEFAULT 'volunteer',
      employmentType VARCHAR(120) NULL,
      location VARCHAR(180) NULL,
      short_description TEXT NULL,
      description TEXT NULL,
      requirements TEXT NULL,
      responsibilities TEXT NULL,
      image_url TEXT NULL,
      application_deadline DATE NULL,
      bannerUrl TEXT NULL,
      category VARCHAR(120) NULL,
      apply_url TEXT NULL,
      applyLink TEXT NULL,
      status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published',
      featured TINYINT(1) NOT NULL DEFAULT 0,
      order_index INT NOT NULL DEFAULT 0,
      visibility ENUM('public', 'members_only', 'internal') NOT NULL DEFAULT 'public',
      application_form_url TEXT NULL,
      max_positions INT NULL,
      chapter VARCHAR(180) NULL,
      certificate_enabled TINYINT(1) NOT NULL DEFAULT 0,
      active TINYINT(1) NOT NULL DEFAULT 1,
      isActive TINYINT(1) NOT NULL DEFAULT 1,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY careers_public_sort (active, featured, display_order, created_at)
    )
  `);

  await ensureColumn("careers", "employmentType", "VARCHAR(120) NULL");
  await ensureColumn("careers", "slug", "VARCHAR(220) NULL");
  await ensureColumn("careers", "role_type", "ENUM('volunteer', 'internship', 'leadership', 'research', 'operations', 'design', 'it', 'community', 'other') NOT NULL DEFAULT 'volunteer'");
  await ensureColumn("careers", "description", "TEXT NULL");
  await ensureColumn("careers", "requirements", "TEXT NULL");
  await ensureColumn("careers", "responsibilities", "TEXT NULL");
  await ensureColumn("careers", "image_url", "TEXT NULL");
  await ensureColumn("careers", "applyLink", "TEXT NULL");
  await ensureColumn("careers", "bannerUrl", "TEXT NULL");
  await ensureColumn("careers", "isActive", "TINYINT(1) NOT NULL DEFAULT 1");
  await ensureColumn("careers", "type", "VARCHAR(120) NULL");
  await ensureColumn("careers", "short_description", "TEXT NULL");
  await ensureColumn("careers", "apply_url", "TEXT NULL");
  await ensureColumn("careers", "active", "TINYINT(1) NOT NULL DEFAULT 1");
  await ensureColumn("careers", "status", "ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published'");
  await ensureColumn("careers", "featured", "TINYINT(1) NOT NULL DEFAULT 0");
  await ensureColumn("careers", "order_index", "INT NOT NULL DEFAULT 0");
  await ensureColumn("careers", "visibility", "ENUM('public', 'members_only', 'internal') NOT NULL DEFAULT 'public'");
  await ensureColumn("careers", "application_form_url", "TEXT NULL");
  await ensureColumn("careers", "max_positions", "INT NULL");
  await ensureColumn("careers", "chapter", "VARCHAR(180) NULL");
  await ensureColumn("careers", "certificate_enabled", "TINYINT(1) NOT NULL DEFAULT 0");
  await ensureColumn("careers", "display_order", "INT NOT NULL DEFAULT 0");
  await pool.query(`
    UPDATE careers
    SET slug = COALESCE(slug, LOWER(REPLACE(title, ' ', '-'))),
        role_type = CASE
          WHEN role_type IN ('volunteer', 'internship', 'leadership', 'research', 'operations', 'design', 'it', 'community', 'other') THEN role_type
          WHEN LOWER(COALESCE(type, employmentType, category, '')) IN ('volunteer', 'internship', 'leadership', 'research', 'operations', 'design', 'it', 'community') THEN LOWER(COALESCE(type, employmentType, category))
          ELSE 'other'
        END,
        description = COALESCE(description, short_description),
        image_url = COALESCE(image_url, bannerUrl),
        application_form_url = COALESCE(application_form_url, applyLink, apply_url),
        order_index = CASE WHEN order_index = 0 THEN display_order ELSE order_index END,
        status = CASE WHEN COALESCE(active, isActive, 1) = 1 THEN COALESCE(status, 'published') ELSE 'archived' END,
        visibility = COALESCE(visibility, 'public')
  `);
  await ensureIndex(
    "careers",
    "careers_status_featured_order",
    "KEY careers_status_featured_order (status, visibility, featured, order_index, created_at)",
  );
  await ensureIndex("careers", "careers_slug_lookup", "KEY careers_slug_lookup (slug)");
  const careerSeeds = [
    ["Research Volunteer", "research-volunteer", "Research", "research", "Remote / Hybrid", "Support field studies, data collection, and community health research documentation.", "Interest in public health research and responsible documentation.", "Coordinate research notes, compile observations, and support impact reports.", "https://placehold.co/900x600?text=Research+Volunteer", 1],
    ["Design Team Member", "design-team-member", "Design", "design", "Remote", "Create campaign visuals, awareness material, and volunteer communication assets.", "Comfort with design tools and clear visual communication.", "Prepare posters, social graphics, and campaign templates.", "https://placehold.co/900x600?text=Design+Team+Member", 2],
    ["Community Outreach Volunteer", "community-outreach-volunteer", "Operations", "community", "Field / Hybrid", "Help Maai connect with communities, volunteers, and local partners.", "Good communication skills and willingness to coordinate on ground.", "Support outreach calls, camp coordination, and beneficiary communication.", "https://placehold.co/900x600?text=Community+Outreach", 3],
    ["Operations Coordinator", "operations-coordinator", "Operations", "operations", "Hybrid", "Coordinate logistics, schedules, and field readiness for Maai programs.", "Organized working style and ability to track tasks across teams.", "Maintain checklists, coordinate supplies, and update program leads.", "https://placehold.co/900x600?text=Operations+Coordinator", 4],
  ];

  for (const [title, slug, department, roleType, location, description, requirements, responsibilities, imageUrl, orderIndex] of careerSeeds) {
    await pool.query(
      `
        INSERT INTO careers
          (title, slug, department, role_type, type, employmentType, location, short_description, description, requirements, responsibilities, image_url, bannerUrl, status, featured, order_index, display_order, visibility, active, isActive)
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, 'public', 1, 1
        WHERE NOT EXISTS (
          SELECT 1 FROM careers WHERE slug = ? OR title = ? LIMIT 1
        )
      `,
      [
        title,
        slug,
        department,
        roleType,
        roleType,
        roleType,
        location,
        description,
        description,
        requirements,
        responsibilities,
        imageUrl,
        imageUrl,
        orderIndex === 1 ? 1 : 0,
        orderIndex,
        orderIndex,
        slug,
        title,
      ],
    );
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS camp_registrations (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      full_name VARCHAR(180) NOT NULL,
      email VARCHAR(180) NOT NULL,
      whatsapp VARCHAR(40) NOT NULL,
      organization_name VARCHAR(180) NOT NULL,
      organization_type VARCHAR(120) NOT NULL,
      website TEXT NULL,
      camp_title VARCHAR(220) NOT NULL,
      camp_type VARCHAR(140) NOT NULL,
      location VARCHAR(220) NOT NULL,
      beneficiaries VARCHAR(120) NOT NULL,
      proposed_date DATE NOT NULL,
      description TEXT NOT NULL,
      additional_notes TEXT NULL,
      status ENUM('pending', 'reviewed', 'approved', 'rejected', 'contacted') NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY camp_registrations_admin_sort (status, proposed_date, created_at),
      KEY camp_registrations_search (full_name, organization_name, camp_title)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS camp_requests (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      ngo_id INT UNSIGNED NULL,
      volunteer_id INT UNSIGNED NULL,
      title VARCHAR(220) NULL,
      camp_name VARCHAR(180) NOT NULL,
      location VARCHAR(220) NOT NULL,
      city VARCHAR(120) NULL,
      state VARCHAR(120) NULL,
      camp_type ENUM('health', 'awareness', 'screening', 'research', 'education', 'community', 'other') NOT NULL DEFAULT 'other',
      beneficiaries VARCHAR(120) NULL,
      expected_beneficiaries INT NULL,
      volunteers_required INT NULL,
      resources_needed TEXT NULL,
      description TEXT NOT NULL,
      status ENUM('submitted', 'under_review', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'submitted',
      proposed_date DATE NULL,
      review_notes TEXT NULL,
      reviewed_by INT UNSIGNED NULL,
      reviewed_at TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY camp_requests_ngo_lookup (ngo_id, status, created_at),
      KEY camp_requests_volunteer_lookup (volunteer_id, status, created_at),
      CONSTRAINT camp_requests_volunteer_fk
        FOREIGN KEY (volunteer_id) REFERENCES volunteers(id)
        ON DELETE SET NULL
    )
  `);
  await pool.query("ALTER TABLE camp_requests MODIFY COLUMN volunteer_id INT UNSIGNED NULL");
  await ensureColumn("camp_requests", "ngo_id", "INT UNSIGNED NULL");
  await ensureColumn("camp_requests", "title", "VARCHAR(220) NULL");
  await ensureColumn("camp_requests", "city", "VARCHAR(120) NULL");
  await ensureColumn("camp_requests", "state", "VARCHAR(120) NULL");
  await ensureColumn("camp_requests", "expected_beneficiaries", "INT NULL");
  await ensureColumn("camp_requests", "volunteers_required", "INT NULL");
  await ensureColumn("camp_requests", "resources_needed", "TEXT NULL");
  await ensureColumn("camp_requests", "proposed_date", "DATE NULL");
  await ensureColumn("camp_requests", "review_notes", "TEXT NULL");
  await ensureColumn("camp_requests", "reviewed_by", "INT UNSIGNED NULL");
  await ensureColumn("camp_requests", "reviewed_at", "TIMESTAMP NULL");
  await ensureColumn("camp_requests", "updated_at", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
  await pool.query("ALTER TABLE camp_requests MODIFY COLUMN status ENUM('pending', 'reviewed', 'submitted', 'under_review', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'submitted'");
  await pool.query(`
    UPDATE camp_requests
    SET title = COALESCE(title, camp_name),
        expected_beneficiaries = COALESCE(expected_beneficiaries, CAST(NULLIF(beneficiaries, '') AS UNSIGNED)),
        camp_type = CASE
          WHEN LOWER(camp_type) IN ('health', 'awareness', 'screening', 'research', 'education', 'community', 'other') THEN LOWER(camp_type)
          WHEN LOWER(camp_type) LIKE '%aware%' THEN 'awareness'
          WHEN LOWER(camp_type) LIKE '%screen%' THEN 'screening'
          WHEN LOWER(camp_type) LIKE '%research%' THEN 'research'
          WHEN LOWER(camp_type) LIKE '%education%' THEN 'education'
          WHEN LOWER(camp_type) LIKE '%community%' THEN 'community'
          ELSE 'health'
        END,
        status = CASE
          WHEN status = 'pending' THEN 'submitted'
          WHEN status = 'reviewed' THEN 'under_review'
          ELSE status
        END
  `);
  await pool.query("ALTER TABLE camp_requests MODIFY COLUMN camp_type ENUM('health', 'awareness', 'screening', 'research', 'education', 'community', 'other') NOT NULL DEFAULT 'other'");
  await pool.query("ALTER TABLE camp_requests MODIFY COLUMN status ENUM('submitted', 'under_review', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'submitted'");
  await ensureIndex("camp_requests", "camp_requests_ngo_lookup", "KEY camp_requests_ngo_lookup (ngo_id, status, created_at)");
  const [demoNgoRows] = await pool.query("SELECT id FROM ngos ORDER BY id ASC LIMIT 1");
  const demoNgoId = demoNgoRows[0]?.id || null;
  if (demoNgoId) {
    const campSeeds = [
      ["Community Health Camp", "health", "Primary health awareness and screening camp.", "Community Center", "Delhi", "Delhi", 150, 12, "Basic screening desks, volunteer support", "submitted", 7],
      ["Awareness Camp", "awareness", "Public awareness session for preventive healthcare.", "School Auditorium", "Delhi", "Delhi", 200, 8, "Projector, registration desk", "under_review", 12],
    ];
    for (const [title, campType, description, location, city, state, expectedBeneficiaries, volunteersRequired, resourcesNeeded, status, daysFromNow] of campSeeds) {
      await pool.query(
        `
          INSERT INTO camp_requests
            (ngo_id, title, camp_name, camp_type, description, location, city, state, proposed_date, expected_beneficiaries, beneficiaries, volunteers_required, resources_needed, status)
          SELECT ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, ?, ?, ?, ?
          WHERE NOT EXISTS (
            SELECT 1 FROM camp_requests WHERE ngo_id = ? AND title = ? LIMIT 1
          )
        `,
        [
          demoNgoId,
          title,
          title,
          campType,
          description,
          location,
          city,
          state,
          daysFromNow,
          expectedBeneficiaries,
          String(expectedBeneficiaries),
          volunteersRequired,
          resourcesNeeded,
          status,
          demoNgoId,
          title,
        ],
      );
    }
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ngo_camps (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      ngo_id INT UNSIGNED NOT NULL,
      title VARCHAR(220) NOT NULL,
      camp_type ENUM('health', 'awareness', 'screening', 'research', 'education', 'community', 'other') NOT NULL DEFAULT 'other',
      description TEXT NOT NULL,
      location VARCHAR(220) NOT NULL,
      city VARCHAR(120) NOT NULL,
      state VARCHAR(120) NULL,
      proposed_date DATE NOT NULL,
      scheduled_date DATE NULL,
      expected_beneficiaries INT NOT NULL DEFAULT 0,
      volunteers_required INT NOT NULL DEFAULT 0,
      resources_needed TEXT NULL,
      status ENUM('draft', 'submitted', 'under_review', 'approved', 'scheduled', 'completed', 'rejected') NOT NULL DEFAULT 'submitted',
      workflow_step TINYINT UNSIGNED NOT NULL DEFAULT 2,
      review_notes TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY ngo_camps_ngo_status_lookup (ngo_id, status, created_at),
      KEY ngo_camps_schedule_lookup (scheduled_date, proposed_date),
      CONSTRAINT ngo_camps_ngo_fk
        FOREIGN KEY (ngo_id) REFERENCES ngos(id)
        ON DELETE CASCADE
    )
  `);
  await ensureColumn("ngo_camps", "scheduled_date", "DATE NULL");
  await ensureColumn("ngo_camps", "workflow_step", "TINYINT UNSIGNED NOT NULL DEFAULT 2");
  await ensureColumn("ngo_camps", "review_notes", "TEXT NULL");
  await ensureIndex("ngo_camps", "ngo_camps_ngo_status_lookup", "KEY ngo_camps_ngo_status_lookup (ngo_id, status, created_at)");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ngo_camp_documents (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      camp_id INT UNSIGNED NOT NULL,
      document_type VARCHAR(80) NOT NULL DEFAULT 'supporting',
      file_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(120) NOT NULL DEFAULT 'application/octet-stream',
      file_size INT UNSIGNED NOT NULL DEFAULT 0,
      file_data LONGTEXT NOT NULL,
      uploaded_by INT UNSIGNED NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY ngo_camp_documents_camp_lookup (camp_id, created_at),
      CONSTRAINT ngo_camp_documents_camp_fk
        FOREIGN KEY (camp_id) REFERENCES ngo_camps(id)
        ON DELETE CASCADE,
      CONSTRAINT ngo_camp_documents_uploader_fk
        FOREIGN KEY (uploaded_by) REFERENCES ngos(id)
        ON DELETE SET NULL
    )
  `);
  await ensureColumn("ngo_camp_documents", "document_type", "VARCHAR(80) NOT NULL DEFAULT 'supporting'");
  await ensureColumn("ngo_camp_documents", "file_data", "LONGTEXT NOT NULL");
  await ensureIndex("ngo_camp_documents", "ngo_camp_documents_camp_lookup", "KEY ngo_camp_documents_camp_lookup (camp_id, created_at)");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ngo_notifications (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      ngo_id INT UNSIGNED NOT NULL,
      title VARCHAR(220) NOT NULL,
      message TEXT NOT NULL,
      notification_type VARCHAR(80) NOT NULL DEFAULT 'camp_request',
      read_at TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY ngo_notifications_lookup (ngo_id, read_at, created_at),
      CONSTRAINT ngo_notifications_ngo_fk
        FOREIGN KEY (ngo_id) REFERENCES ngos(id)
        ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      recipient_type ENUM('volunteer', 'ngo', 'it_staff', 'superadmin') NOT NULL,
      recipient_id INT UNSIGNED NOT NULL,
      title VARCHAR(220) NOT NULL,
      message TEXT NOT NULL,
      notification_type ENUM('membership', 'certificate', 'camp_request', 'event', 'ngo', 'system') NOT NULL DEFAULT 'system',
      status ENUM('unread', 'read', 'archived') NOT NULL DEFAULT 'unread',
      action_url TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      read_at TIMESTAMP NULL,
      PRIMARY KEY (id),
      KEY notifications_recipient_status (recipient_type, recipient_id, status, created_at),
      KEY notifications_type_lookup (notification_type, created_at)
    )
  `);
  await pool.query(
    "ALTER TABLE notifications MODIFY COLUMN notification_type ENUM('membership', 'certificate', 'camp_request', 'event', 'ngo', 'announcement', 'system') NOT NULL DEFAULT 'system'",
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      title VARCHAR(220) NOT NULL,
      message TEXT NOT NULL,
      announcement_type ENUM('general', 'membership', 'event', 'camp', 'certificate', 'system') NOT NULL DEFAULT 'general',
      audience ENUM('volunteers', 'ngos', 'all', 'admins') NOT NULL DEFAULT 'all',
      priority ENUM('info', 'important', 'urgent') NOT NULL DEFAULT 'info',
      send_email TINYINT(1) NOT NULL DEFAULT 0,
      publish_at TIMESTAMP NULL,
      expire_at TIMESTAMP NULL,
      status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
      created_by INT UNSIGNED NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY announcements_audience_created (audience, created_at),
      CONSTRAINT announcements_created_by_fk
        FOREIGN KEY (created_by) REFERENCES volunteers(id)
        ON DELETE SET NULL
    )
  `);
  await ensureColumn("announcements", "message", "TEXT NULL");
  await ensureColumn("announcements", "body", "TEXT NULL");
  await pool.query("UPDATE announcements SET message = COALESCE(message, body, '')");
  await ensureColumn(
    "announcements",
    "announcement_type",
    "ENUM('general', 'membership', 'event', 'camp', 'certificate', 'system') NOT NULL DEFAULT 'general'",
  );
  await ensureColumn("announcements", "priority", "ENUM('info', 'important', 'urgent') NOT NULL DEFAULT 'info'");
  await ensureColumn("announcements", "publish_at", "TIMESTAMP NULL");
  await ensureColumn("announcements", "expire_at", "TIMESTAMP NULL");
  await ensureColumn("announcements", "status", "ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft'");
  await ensureColumn("announcements", "event_id", "INT UNSIGNED NULL");
  await pool.query("ALTER TABLE announcements MODIFY COLUMN message TEXT NOT NULL");
  await pool.query("ALTER TABLE announcements MODIFY COLUMN audience ENUM('volunteers', 'ngos', 'all', 'admins', 'event_participants') NOT NULL DEFAULT 'all'");
  await ensureIndex("announcements", "announcements_event_lookup", "KEY announcements_event_lookup (event_id, audience, status)");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS announcement_reads (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      announcement_id INT UNSIGNED NOT NULL,
      user_id INT UNSIGNED NOT NULL,
      read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY announcement_reads_unique (announcement_id, user_id),
      KEY announcement_reads_user_lookup (user_id, read_at),
      CONSTRAINT announcement_reads_announcement_fk
        FOREIGN KEY (announcement_id) REFERENCES announcements(id)
        ON DELETE CASCADE,
      CONSTRAINT announcement_reads_user_fk
        FOREIGN KEY (user_id) REFERENCES volunteers(id)
        ON DELETE CASCADE
    )
  `);
  await pool.query(`
    INSERT INTO announcements
      (title, message, announcement_type, audience, priority, send_email, publish_at, status, created_by)
    SELECT ?, ?, ?, ?, ?, 0, NOW(), 'published', NULL
    WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = ? LIMIT 1)
  `, [
    "YouthCon Registration Open",
    "YouthCon registration is now open for Maai members and partner organisations.",
    "event",
    "all",
    "important",
    "YouthCon Registration Open",
  ]);
  await pool.query(`
    INSERT INTO announcements
      (title, message, announcement_type, audience, priority, send_email, publish_at, status, created_by)
    SELECT ?, ?, ?, ?, ?, 0, NOW(), 'published', NULL
    WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = ? LIMIT 1)
  `, [
    "Project Bandhan Applications",
    "Applications for Project Bandhan are open. Interested volunteers can apply from the opportunities section.",
    "general",
    "volunteers",
    "info",
    "Project Bandhan Applications",
  ]);
  await pool.query(`
    INSERT INTO announcements
      (title, message, announcement_type, audience, priority, send_email, publish_at, status, created_by)
    SELECT ?, ?, ?, ?, ?, 0, NOW(), 'published', NULL
    WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = ? LIMIT 1)
  `, [
    "Membership Verification Update",
    "Membership verification updates will be sent through your notification center and email where applicable.",
    "membership",
    "volunteers",
    "important",
    "Membership Verification Update",
  ]);

  const [notificationSeedVolunteers] = await pool.query("SELECT id FROM volunteers WHERE role = 'volunteer' ORDER BY id ASC LIMIT 1");
  if (notificationSeedVolunteers[0]) {
    const [[existingNotification]] = await pool.query(
      "SELECT COUNT(*) AS count FROM notifications WHERE recipient_type = 'volunteer' AND recipient_id = ?",
      [notificationSeedVolunteers[0].id],
    );
    if (existingNotification.count === 0) {
      await pool.query(
        `
          INSERT INTO notifications
            (recipient_type, recipient_id, title, message, notification_type, action_url)
          VALUES ('volunteer', ?, 'Welcome to Maai', 'Your Maai notification inbox is ready.', 'system', '/volunteer/dashboard')
        `,
        [notificationSeedVolunteers[0].id],
      );
    }
  }

  const [sampleAdmins] = await pool.query("SELECT id, role FROM volunteers WHERE role IN ('superadmin', 'it_staff') ORDER BY id ASC LIMIT 2");
  for (const admin of sampleAdmins) {
    const [[existingNotification]] = await pool.query(
      "SELECT COUNT(*) AS count FROM notifications WHERE recipient_type = ? AND recipient_id = ?",
      [admin.role, admin.id],
    );
    if (existingNotification.count === 0) {
      await pool.query(
        `
          INSERT INTO notifications
            (recipient_type, recipient_id, title, message, notification_type, action_url)
          VALUES (?, ?, 'Admin notifications enabled', 'New registrations, camp requests, and operational events will appear here.', 'system', '/admin')
        `,
        [admin.role, admin.id],
      );
    }
  }

  const [sampleNgos] = await pool.query("SELECT id FROM ngos ORDER BY id ASC LIMIT 1");
  if (sampleNgos[0]) {
    const [[existingNotification]] = await pool.query(
      "SELECT COUNT(*) AS count FROM notifications WHERE recipient_type = 'ngo' AND recipient_id = ?",
      [sampleNgos[0].id],
    );
    if (existingNotification.count === 0) {
      await pool.query(
        `
          INSERT INTO notifications
            (recipient_type, recipient_id, title, message, notification_type, action_url)
          VALUES ('ngo', ?, 'NGO inbox ready', 'Camp request updates and partnership notifications will appear here.', 'system', '/ngo/dashboard')
        `,
        [sampleNgos[0].id],
      );
    }
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      title VARCHAR(220) NOT NULL,
      slug VARCHAR(240) NULL,
      description TEXT NULL,
      event_type ENUM('camp', 'workshop', 'awareness', 'conference', 'research', 'meeting', 'training', 'other') NOT NULL DEFAULT 'other',
      banner_url TEXT NULL,
      event_date DATE NULL,
      start_datetime DATETIME NULL,
      end_datetime DATETIME NULL,
      location VARCHAR(220) NULL,
      capacity INT NULL,
      visibility ENUM('public', 'members_only', 'internal') NOT NULL DEFAULT 'members_only',
      status ENUM('draft', 'published', 'upcoming', 'ongoing', 'completed', 'cancelled', 'archived') NOT NULL DEFAULT 'draft',
      certificate_enabled TINYINT(1) NOT NULL DEFAULT 0,
      certificate_template_id VARCHAR(120) NULL,
      initiative_id INT UNSIGNED NULL,
      qr_enabled TINYINT(1) NOT NULL DEFAULT 0,
      ngo_id INT UNSIGNED NULL,
      camp_request_id INT UNSIGNED NULL,
      public_registration TINYINT(1) NOT NULL DEFAULT 0,
      feedback_enabled TINYINT(1) NOT NULL DEFAULT 0,
      whatsapp_group_link TEXT NULL,
      registration_deadline DATETIME NULL,
      volunteer_instructions TEXT NULL,
      required_skills TEXT NULL,
      coordinator_contact VARCHAR(180) NULL,
      created_by INT UNSIGNED NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY events_date_lookup (event_date, certificate_enabled),
      KEY events_status_datetime_lookup (status, visibility, start_datetime),
      KEY events_created_by_lookup (created_by)
    )
  `);
  await ensureColumn("events", "slug", "VARCHAR(240) NULL");
  await ensureColumn("events", "banner_url", "TEXT NULL");
  await ensureColumn("events", "start_datetime", "DATETIME NULL");
  await ensureColumn("events", "end_datetime", "DATETIME NULL");
  await ensureColumn("events", "capacity", "INT NULL");
  await ensureColumn("events", "visibility", "ENUM('public', 'members_only', 'internal') NOT NULL DEFAULT 'members_only'");
  await ensureColumn("events", "status", "ENUM('draft', 'published', 'upcoming', 'ongoing', 'completed', 'cancelled', 'archived') NOT NULL DEFAULT 'draft'");
  await ensureColumn("events", "initiative_id", "INT UNSIGNED NULL");
  await ensureColumn("events", "qr_enabled", "TINYINT(1) NOT NULL DEFAULT 0");
  await ensureColumn("events", "ngo_id", "INT UNSIGNED NULL");
  await ensureColumn("events", "camp_request_id", "INT UNSIGNED NULL");
  await ensureColumn("events", "public_registration", "TINYINT(1) NOT NULL DEFAULT 0");
  await ensureColumn("events", "feedback_enabled", "TINYINT(1) NOT NULL DEFAULT 0");
  await ensureColumn("events", "whatsapp_group_link", "TEXT NULL");
  await ensureColumn("events", "type", "VARCHAR(50) NULL");
  await ensureColumn("events", "camp_type", "VARCHAR(100) NULL");
  await ensureColumn("events", "whatsapp_link", "TEXT NULL");
  await ensureColumn("events", "max_volunteers", "INT NULL");
  await ensureColumn("events", "certificate_eligible", "TINYINT(1) NOT NULL DEFAULT 0");
  await ensureColumn("events", "banner", "TEXT NULL");
  await ensureColumn("events", "registration_deadline", "DATETIME NULL");
  await ensureColumn("events", "volunteer_instructions", "TEXT NULL");
  await ensureColumn("events", "required_skills", "TEXT NULL");
  await ensureColumn("events", "coordinator_contact", "VARCHAR(180) NULL");
  await ensureIndex("events", "events_status_datetime_lookup", "KEY events_status_datetime_lookup (status, visibility, start_datetime)");
  await ensureIndex("events", "events_slug_lookup", "KEY events_slug_lookup (slug)");
  await pool.query(`
    UPDATE events
    SET slug = COALESCE(slug, LOWER(REPLACE(title, ' ', '-'))),
        event_type = CASE
          WHEN event_type IN ('camp', 'workshop', 'awareness', 'conference', 'research', 'meeting', 'training', 'other') THEN event_type
          WHEN LOWER(COALESCE(event_type, '')) LIKE '%camp%' THEN 'camp'
          WHEN LOWER(COALESCE(event_type, '')) LIKE '%workshop%' THEN 'workshop'
          WHEN LOWER(COALESCE(event_type, '')) LIKE '%conference%' THEN 'conference'
          ELSE 'other'
        END,
        start_datetime = COALESCE(start_datetime, CASE WHEN event_date IS NOT NULL THEN TIMESTAMP(event_date) ELSE NULL END),
        status = COALESCE(status, 'published'),
        type = COALESCE(type, event_type),
        camp_type = COALESCE(camp_type, event_type),
        whatsapp_link = COALESCE(whatsapp_link, whatsapp_group_link),
        max_volunteers = COALESCE(max_volunteers, capacity),
        certificate_eligible = COALESCE(certificate_eligible, certificate_enabled),
        banner = COALESCE(banner, banner_url),
        visibility = COALESCE(visibility, 'members_only')
  `);
  await pool.query("ALTER TABLE events MODIFY COLUMN event_type ENUM('camp', 'workshop', 'awareness', 'conference', 'research', 'meeting', 'training', 'other') NOT NULL DEFAULT 'other'");
  await pool.query("ALTER TABLE events MODIFY COLUMN status ENUM('draft', 'published', 'upcoming', 'ongoing', 'completed', 'cancelled', 'archived') NOT NULL DEFAULT 'draft'");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_participants (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      event_id INT UNSIGNED NOT NULL,
      volunteer_id INT UNSIGNED NOT NULL,
      role VARCHAR(140) NULL,
      attendance_status ENUM('registered', 'attended', 'absent') NOT NULL DEFAULT 'registered',
      participation_status ENUM('pending', 'approved', 'rejected', 'registered', 'participated', 'completed', 'cancelled') NOT NULL DEFAULT 'registered',
      joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL,
      added_by INT UNSIGNED NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY event_participants_unique (event_id, volunteer_id),
      KEY event_participants_event_lookup (event_id, attendance_status),
      KEY event_participants_participation_lookup (event_id, participation_status),
      KEY event_participants_volunteer_lookup (volunteer_id),
      CONSTRAINT event_participants_event_fk
        FOREIGN KEY (event_id) REFERENCES events(id)
        ON DELETE CASCADE,
      CONSTRAINT event_participants_volunteer_fk
        FOREIGN KEY (volunteer_id) REFERENCES volunteers(id)
        ON DELETE CASCADE
    )
  `);
  await ensureColumn("event_participants", "joined_at", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP");
  await ensureColumn(
    "event_participants",
    "participation_status",
    "ENUM('pending', 'approved', 'rejected', 'registered', 'participated', 'completed', 'cancelled') NOT NULL DEFAULT 'registered'",
  );
  await pool.query("ALTER TABLE event_participants MODIFY COLUMN participation_status ENUM('pending', 'approved', 'rejected', 'registered', 'participated', 'completed', 'cancelled') NOT NULL DEFAULT 'registered'");
  await ensureColumn("event_participants", "completed_at", "TIMESTAMP NULL");
  await pool.query(`
    UPDATE event_participants
    SET participation_status = CASE
      WHEN participation_status IN ('pending', 'approved', 'rejected', 'registered', 'participated', 'completed', 'cancelled') THEN participation_status
      WHEN attendance_status = 'attended' THEN 'participated'
      WHEN attendance_status = 'absent' THEN 'cancelled'
      ELSE COALESCE(participation_status, 'registered')
    END
  `);
  await ensureIndex("event_participants", "event_participants_participation_lookup", "KEY event_participants_participation_lookup (event_id, participation_status)");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_certificates (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      event_id INT UNSIGNED NULL,
      volunteer_id INT UNSIGNED NOT NULL,
      certificate_type VARCHAR(120) NOT NULL DEFAULT 'event',
      status ENUM('eligible', 'claimed', 'revoked') NOT NULL DEFAULT 'eligible',
      verification_code VARCHAR(40) NOT NULL,
      issued_by INT UNSIGNED NULL,
      claimed_at TIMESTAMP NULL,
      issued_at TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY event_certificates_unique (event_id, volunteer_id, certificate_type),
      UNIQUE KEY event_certificates_code_unique (verification_code),
      KEY event_certificates_volunteer_lookup (volunteer_id, status),
      CONSTRAINT event_certificates_event_fk
        FOREIGN KEY (event_id) REFERENCES events(id)
        ON DELETE CASCADE,
      CONSTRAINT event_certificates_volunteer_fk
        FOREIGN KEY (volunteer_id) REFERENCES volunteers(id)
        ON DELETE CASCADE
    )
  `);
  await pool.query("ALTER TABLE event_certificates MODIFY COLUMN event_id INT UNSIGNED NULL");
  await pool.query("UPDATE event_certificates SET certificate_type = 'membership' WHERE certificate_type = 'welcome'");
  await ensureColumn("event_certificates", "claimed_at", "TIMESTAMP NULL");
  await ensureColumn("event_certificates", "issued_at", "TIMESTAMP NULL");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS certificate_templates (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(180) NOT NULL,
      certificate_type ENUM('membership', 'event', 'participation', 'leadership', 'recognition', 'volunteer_hours', 'other') NOT NULL DEFAULT 'other',
      background_url TEXT NULL,
      logo_url TEXT NULL,
      header_text VARCHAR(220) NULL,
      body_template TEXT NULL,
      footer_text VARCHAR(500) NULL,
      signature_name VARCHAR(180) NULL,
      signature_designation VARCHAR(180) NULL,
      field_config JSON NULL,
      status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
      is_default TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY certificate_templates_lookup (certificate_type, status, is_default)
    )
  `);
  await ensureColumn("certificate_templates", "field_config", "JSON NULL");

  const certificateTemplateSeeds = [
    ["Membership Certificate", "membership", "Maai Membership Certificate", "This certifies that {{full_name}} is a verified member of Maai organisation.\nMembership: {{membership_number}}\nCertificate ID: {{certificate_id}}", "Issued by Maai organisation.", "Maai Team", "Membership Cell", 1],
    ["Event Participation", "event", "Certificate of Participation", "This certifies that {{full_name}} participated in {{event_name}} on {{date}}.\nCertificate ID: {{certificate_id}}", "Thank you for serving with Maai.", "Maai Events", "Operations", 1],
    ["Recognition Certificate", "recognition", "Certificate of Recognition", "This certificate recognizes {{full_name}} for meaningful contribution to {{event_name}}.\nCertificate ID: {{certificate_id}}", "Presented by Maai organisation.", "Maai Leadership", "Recognition Committee", 1],
  ];
  for (const [name, type, header, body, footer, signatureName, signatureDesignation, isDefault] of certificateTemplateSeeds) {
    await pool.query(
      `
        INSERT INTO certificate_templates
          (name, certificate_type, background_url, logo_url, header_text, body_template, footer_text, signature_name, signature_designation, status, is_default)
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?
        WHERE NOT EXISTS (
          SELECT 1 FROM certificate_templates WHERE name = ? AND certificate_type = ? LIMIT 1
        )
      `,
      [
        name,
        type,
        `https://placehold.co/1200x850/e0f2fe/0f172a?text=${encodeURIComponent(name)}`,
        "https://placehold.co/160x160/ffffff/0891b2?text=Maai",
        header,
        body,
        footer,
        signatureName,
        signatureDesignation,
        isDefault,
        name,
        type,
      ],
    );
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS id_card_templates (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(180) NOT NULL,
      template_type VARCHAR(80) NOT NULL DEFAULT 'membership',
      front_background_url TEXT NULL,
      back_background_url TEXT NULL,
      logo_url TEXT NULL,
      header_text VARCHAR(220) NULL,
      footer_text VARCHAR(500) NULL,
      field_config JSON NULL,
      status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
      is_default TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY id_card_templates_status_lookup (status, is_default, created_at)
    )
  `);
  await ensureColumn("id_card_templates", "field_config", "JSON NULL");

  const defaultIdCardFieldConfig = {
    full_name: { enabled: true, x: 96, y: 170, width: 640, height: 54, fontSize: 34, color: "#0f172a", side: "front" },
    membership_number: { enabled: true, x: 96, y: 285, width: 420, height: 40, fontSize: 24, color: "#0f172a", side: "front" },
    college: { enabled: true, x: 96, y: 435, width: 620, height: 36, fontSize: 22, color: "#0f172a", side: "front" },
    role: { enabled: true, x: 96, y: 345, width: 320, height: 34, fontSize: 22, color: "#0f172a", side: "front" },
    status: { enabled: true, x: 96, y: 390, width: 320, height: 34, fontSize: 22, color: "#0f766e", side: "front" },
    verification_code: { enabled: true, x: 96, y: 520, width: 420, height: 34, fontSize: 20, color: "#0f172a", side: "front" },
    barcode: { enabled: true, x: 96, y: 600, width: 260, height: 46, fontSize: 18, color: "#000000", side: "front", type: "barcode" },
    qr: { enabled: true, x: 900, y: 245, width: 154, height: 154, fontSize: 18, color: "#000000", side: "back", type: "qr" },
  };

  await pool.query(`
    INSERT INTO id_card_templates
      (name, template_type, front_background_url, back_background_url, logo_url, header_text, footer_text, status, is_default)
    SELECT 'Maai Membership Card', 'membership', 'https://placehold.co/900x540/e0f2fe/0f172a?text=Maai+ID+Front', 'https://placehold.co/900x540/f8fafc/0f172a?text=Maai+ID+Back', 'https://placehold.co/160x160/ffffff/0891b2?text=Maai', 'Maai Membership Card', 'If found, please contact Maai organisation.', 'published', 1
    WHERE NOT EXISTS (
      SELECT 1 FROM id_card_templates WHERE name = 'Maai Membership Card' LIMIT 1
    )
  `);
  await pool.query("UPDATE id_card_templates SET field_config = ? WHERE field_config IS NULL", [
    JSON.stringify(defaultIdCardFieldConfig),
  ]);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS volunteer_ids (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      volunteer_id INT UNSIGNED NOT NULL,
      template_id INT UNSIGNED NOT NULL,
      membership_number VARCHAR(40) NOT NULL,
      verification_code VARCHAR(40) NOT NULL,
      issued_at TIMESTAMP NULL,
      status ENUM('active', 'expired', 'revoked') NOT NULL DEFAULT 'active',
      photo_url TEXT NULL,
      blood_group VARCHAR(20) NULL,
      emergency_contact VARCHAR(80) NULL,
      chapter VARCHAR(180) NULL,
      state VARCHAR(120) NULL,
      PRIMARY KEY (id),
      UNIQUE KEY volunteer_ids_volunteer_unique (volunteer_id),
      UNIQUE KEY volunteer_ids_membership_unique (membership_number),
      UNIQUE KEY volunteer_ids_code_unique (verification_code),
      KEY volunteer_ids_status_lookup (status, issued_at),
      CONSTRAINT volunteer_ids_volunteer_fk
        FOREIGN KEY (volunteer_id) REFERENCES volunteers(id)
        ON DELETE CASCADE,
      CONSTRAINT volunteer_ids_template_fk
        FOREIGN KEY (template_id) REFERENCES id_card_templates(id)
        ON DELETE RESTRICT
    )
  `);
  await ensureColumn("volunteer_ids", "photo_url", "TEXT NULL");
  await ensureColumn("volunteer_ids", "blood_group", "VARCHAR(20) NULL");
  await ensureColumn("volunteer_ids", "emergency_contact", "VARCHAR(80) NULL");
  await ensureColumn("volunteer_ids", "chapter", "VARCHAR(180) NULL");
  await ensureColumn("volunteer_ids", "state", "VARCHAR(120) NULL");
  await pool.query(`
    INSERT IGNORE INTO volunteer_ids
      (volunteer_id, template_id, membership_number, verification_code, issued_at, status)
    SELECT v.id, t.id, CONCAT('MAAI-VOL-', LPAD(v.id, 4, '0')), CONCAT('MAAI-ID-', UPPER(SUBSTRING(MD5(CONCAT(v.id, v.email)), 1, 6))), NOW(), 'active'
    FROM volunteers v
    INNER JOIN id_card_templates t ON t.is_default = 1 AND t.status = 'published'
    WHERE v.membership_status = 'verified'
  `);

  const [demoEvents] = await pool.query("SELECT id FROM events WHERE title = ? LIMIT 1", ["Community Health Camp"]);
  let demoEventId = demoEvents[0]?.id;
  if (!demoEventId) {
    const [demoResult] = await pool.query(
      `
        INSERT INTO events
          (title, slug, description, event_type, event_date, start_datetime, end_datetime, location, visibility, status, certificate_enabled, certificate_template_id)
        VALUES (?, ?, ?, ?, CURDATE(), NOW(), DATE_ADD(NOW(), INTERVAL 4 HOUR), ?, 'public', 'published', 1, ?)
      `,
      [
        "Community Health Camp",
        "community-health-camp",
        "Demo event for event-based volunteer certificate eligibility.",
        "camp",
        "Community Outreach Center",
        "default-event",
      ],
    );
    demoEventId = demoResult.insertId;
  }

  const eventSeeds = [
    ["Project Suraksha Drive", "project-suraksha-drive", "camp", "Community safety and public health awareness drive.", "Maai Community Center", 1, -4],
    ["YouthCon Orientation", "youthcon-orientation", "conference", "Orientation for YouthCon volunteers, coordinators, and speakers.", "Online", 0, 3],
  ];

  for (const [title, slug, eventType, description, location, certificateEnabled, daysFromNow] of eventSeeds) {
    await pool.query(
      `
        INSERT INTO events
          (title, slug, description, event_type, start_datetime, end_datetime, location, visibility, status, certificate_enabled)
        SELECT ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL ? DAY), INTERVAL 2 HOUR), ?, 'members_only', 'published', ?
        WHERE NOT EXISTS (
          SELECT 1 FROM events WHERE slug = ? OR title = ? LIMIT 1
        )
      `,
      [title, slug, description, eventType, daysFromNow, daysFromNow, location, certificateEnabled, slug, title],
    );
  }

  const [sampleVolunteers] = await pool.query("SELECT id FROM volunteers ORDER BY id ASC LIMIT 3");
  for (const volunteer of sampleVolunteers) {
    await pool.query(
      `
        INSERT IGNORE INTO event_participants
          (event_id, volunteer_id, role, attendance_status, participation_status, completed_at)
        VALUES (?, ?, 'Volunteer', 'attended', 'completed', NOW())
      `,
      [demoEventId, volunteer.id],
    );
  }

  for (const [index, volunteer] of sampleVolunteers.entries()) {
    await pool.query(
      `
        INSERT IGNORE INTO event_certificates
          (event_id, volunteer_id, certificate_type, status, verification_code, issued_at)
        VALUES (?, ?, 'event', 'eligible', ?, NOW())
      `,
      [demoEventId, volunteer.id, `MAAI-EVT-000${index + 1}`],
    );
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS impact_stats (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      volunteers_count INT UNSIGNED NOT NULL DEFAULT 0,
      ngo_count INT UNSIGNED NOT NULL DEFAULT 0,
      events_count INT UNSIGNED NOT NULL DEFAULT 0,
      certificates_count INT UNSIGNED NOT NULL DEFAULT 0,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )
  `);
  await pool.query(`
    INSERT INTO impact_stats
      (id, volunteers_count, ngo_count, events_count, certificates_count)
    VALUES (1, 0, 0, 0, 0)
    ON DUPLICATE KEY UPDATE id = id
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS initiatives (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      title VARCHAR(180) NOT NULL,
      subtitle VARCHAR(255) NULL,
      short_description TEXT NULL,
      description TEXT NULL,
      image_url TEXT NULL,
      imageUrl TEXT NULL,
      banner_url TEXT NULL,
      bannerUrl TEXT NULL,
      category ENUM('awareness', 'camp', 'research', 'education', 'advocacy', 'community', 'conference', 'other') NOT NULL DEFAULT 'other',
      beneficiaries VARCHAR(120) NULL,
      status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published',
      featured TINYINT(1) NOT NULL DEFAULT 0,
      isFeatured TINYINT(1) NOT NULL DEFAULT 0,
      slug VARCHAR(220) NULL,
      visibility ENUM('public', 'volunteers', 'internal') NOT NULL DEFAULT 'public',
      order_index INT NOT NULL DEFAULT 0,
      start_date DATE NULL,
      end_date DATE NULL,
      certificate_enabled TINYINT(1) NOT NULL DEFAULT 0,
      event_link TEXT NULL,
      chapter VARCHAR(180) NULL,
      impact_stats JSON NULL,
      visible TINYINT(1) NOT NULL DEFAULT 1,
      active TINYINT(1) NOT NULL DEFAULT 1,
      isActive TINYINT(1) NOT NULL DEFAULT 1,
      date DATE NULL,
      location VARCHAR(180) NULL,
      volunteers_needed INT NULL,
      registration_open TINYINT(1) NOT NULL DEFAULT 0,
      tags JSON NULL,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY initiatives_public_sort (visible, featured, display_order, created_at),
      KEY initiatives_status_featured_order (status, visibility, featured, order_index, created_at),
      KEY initiatives_slug_lookup (slug)
    )
  `);

  await ensureColumn("initiatives", "short_description", "TEXT NULL");
  await ensureColumn("initiatives", "image_url", "TEXT NULL");
  await ensureColumn("initiatives", "banner_url", "TEXT NULL");
  await ensureColumn("initiatives", "beneficiaries", "VARCHAR(120) NULL");
  await ensureColumn("initiatives", "imageUrl", "TEXT NULL");
  await ensureColumn("initiatives", "bannerUrl", "TEXT NULL");
  await ensureColumn("initiatives", "isFeatured", "TINYINT(1) NOT NULL DEFAULT 0");
  await ensureColumn("initiatives", "isActive", "TINYINT(1) NOT NULL DEFAULT 1");
  await ensureColumn("initiatives", "slug", "VARCHAR(220) NULL");
  await ensureColumn("initiatives", "visibility", "ENUM('public', 'volunteers', 'internal') NOT NULL DEFAULT 'public'");
  await ensureColumn("initiatives", "order_index", "INT NOT NULL DEFAULT 0");
  await ensureColumn("initiatives", "start_date", "DATE NULL");
  await ensureColumn("initiatives", "end_date", "DATE NULL");
  await ensureColumn("initiatives", "certificate_enabled", "TINYINT(1) NOT NULL DEFAULT 0");
  await ensureColumn("initiatives", "event_link", "TEXT NULL");
  await ensureColumn("initiatives", "chapter", "VARCHAR(180) NULL");
  await ensureColumn("initiatives", "impact_stats", "JSON NULL");
  await ensureColumn("initiatives", "active", "TINYINT(1) NOT NULL DEFAULT 1");
  await ensureColumn("initiatives", "date", "DATE NULL");
  await ensureColumn("initiatives", "location", "VARCHAR(180) NULL");
  await ensureColumn("initiatives", "volunteers_needed", "INT NULL");
  await ensureColumn("initiatives", "registration_open", "TINYINT(1) NOT NULL DEFAULT 0");
  await ensureColumn("initiatives", "tags", "JSON NULL");
  await pool.query(`
    UPDATE initiatives
    SET category = CASE
      WHEN LOWER(category) IN ('awareness', 'camp', 'research', 'education', 'advocacy', 'community', 'conference', 'other')
        THEN LOWER(category)
      ELSE 'other'
    END
  `);
  await pool.query("ALTER TABLE initiatives MODIFY COLUMN category ENUM('awareness', 'camp', 'research', 'education', 'advocacy', 'community', 'conference', 'other') NOT NULL DEFAULT 'other'");
  await pool.query(`
    UPDATE initiatives
    SET status = CASE
      WHEN LOWER(status) IN ('draft', 'published', 'archived') THEN LOWER(status)
      WHEN active = 1 AND visible = 1 THEN 'published'
      ELSE 'archived'
    END
  `);
  await pool.query("ALTER TABLE initiatives MODIFY COLUMN status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published'");
  await pool.query(`
    UPDATE initiatives
    SET image_url = COALESCE(image_url, imageUrl),
        banner_url = COALESCE(banner_url, bannerUrl),
        short_description = COALESCE(short_description, subtitle),
        order_index = CASE WHEN order_index = 0 THEN display_order ELSE order_index END,
        start_date = COALESCE(start_date, date),
        visibility = COALESCE(visibility, 'public'),
        isFeatured = featured,
        active = CASE WHEN status = 'archived' THEN 0 ELSE 1 END,
        visible = CASE WHEN status = 'published' AND visibility = 'public' THEN 1 ELSE visible END
  `);
  await ensureIndex("initiatives", "initiatives_status_featured_order", "KEY initiatives_status_featured_order (status, visibility, featured, order_index, created_at)");
  await ensureIndex("initiatives", "initiatives_slug_lookup", "KEY initiatives_slug_lookup (slug)");

  const initiativeSeeds = [
    ["Project Bandhan", "project-bandhan", "education", 1],
    ["Project Suraksha", "project-suraksha", "awareness", 2],
    ["YouthCon", "youthcon", "conference", 3],
  ];

  for (const [title, slug, category, orderIndex] of initiativeSeeds) {
    await pool.query(
      `
        INSERT INTO initiatives
          (title, slug, category, short_description, description, image_url, imageUrl, banner_url, bannerUrl, status, featured, order_index, display_order, visibility, visible, active, isActive)
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 0, ?, ?, 'public', 1, 1, 1
        WHERE NOT EXISTS (
          SELECT 1 FROM initiatives WHERE slug = ? OR title = ? LIMIT 1
        )
      `,
      [
        title,
        slug,
        category,
        `${title} is a Maai organisation initiative.`,
        `${title} is a Maai organisation initiative prepared for community impact.`,
        `https://placehold.co/900x600?text=${encodeURIComponent(title).replace(/%20/g, "+")}`,
        `https://placehold.co/900x600?text=${encodeURIComponent(title).replace(/%20/g, "+")}`,
        `https://placehold.co/1400x700?text=${encodeURIComponent(title).replace(/%20/g, "+")}`,
        `https://placehold.co/1400x700?text=${encodeURIComponent(title).replace(/%20/g, "+")}`,
        orderIndex,
        orderIndex,
        slug,
        title,
      ],
    );
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mentors (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      full_name VARCHAR(180) NULL,
      name VARCHAR(180) NOT NULL,
      role VARCHAR(180) NULL,
      chapter VARCHAR(180) NULL,
      state VARCHAR(120) NULL,
      region VARCHAR(180) NULL,
      mentorship_type VARCHAR(180) NULL,
      designation VARCHAR(180) NULL,
      organization VARCHAR(180) NULL,
      specialization VARCHAR(180) NULL,
      bio TEXT NULL,
      image_url TEXT NULL,
      imageUrl TEXT NULL,
      linkedin_url TEXT NULL,
      linkedin TEXT NULL,
      instagram_url TEXT NULL,
      instagram TEXT NULL,
      email VARCHAR(180) NULL,
      status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published',
      category VARCHAR(120) NULL,
      featured TINYINT(1) NOT NULL DEFAULT 0,
      order_index INT NOT NULL DEFAULT 0,
      visible TINYINT(1) NOT NULL DEFAULT 1,
      isActive TINYINT(1) NOT NULL DEFAULT 1,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY mentors_public_sort (visible, featured, display_order, created_at),
      KEY mentors_status_featured_order (status, featured, order_index, created_at)
    )
  `);

  await ensureColumn("mentors", "full_name", "VARCHAR(180) NULL");
  await ensureColumn("mentors", "role", "VARCHAR(180) NULL");
  await ensureColumn("mentors", "chapter", "VARCHAR(180) NULL");
  await ensureColumn("mentors", "region", "VARCHAR(180) NULL");
  await ensureColumn("mentors", "mentorship_type", "VARCHAR(180) NULL");
  await ensureColumn("mentors", "specialization", "VARCHAR(180) NULL");
  await ensureColumn("mentors", "imageUrl", "TEXT NULL");
  await ensureColumn("mentors", "image_url", "TEXT NULL");
  await ensureColumn("mentors", "linkedin_url", "TEXT NULL");
  await ensureColumn("mentors", "instagram_url", "TEXT NULL");
  await ensureColumn("mentors", "instagram", "TEXT NULL");
  await ensureColumn("mentors", "email", "VARCHAR(180) NULL");
  await ensureColumn(
    "mentors",
    "status",
    "ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published'",
  );
  await ensureColumn("mentors", "order_index", "INT NOT NULL DEFAULT 0");
  await ensureColumn("mentors", "isActive", "TINYINT(1) NOT NULL DEFAULT 1");
  await ensureIndex("mentors", "mentors_status_featured_order", "KEY mentors_status_featured_order (status, featured, order_index, created_at)");
  await pool.query(`
    UPDATE mentors
    SET full_name = COALESCE(full_name, name),
        image_url = COALESCE(image_url, imageUrl),
        linkedin_url = COALESCE(linkedin_url, linkedin),
        instagram_url = COALESCE(instagram_url, instagram),
        specialization = COALESCE(specialization, category),
        order_index = CASE WHEN order_index = 0 THEN display_order ELSE order_index END,
        status = CASE WHEN visible = 1 AND isActive = 1 THEN COALESCE(status, 'published') ELSE 'archived' END
  `);

  const mentorSeeds = [
    ["Dr. A Sharma", "Public Health Specialist", "Public Health", "https://placehold.co/600x600?text=Dr.+A+Sharma", 1],
    ["Dr. Priya Mehta", "Community Medicine Mentor", "Community Medicine", "https://placehold.co/600x600?text=Dr.+Priya+Mehta", 2],
  ];

  for (const [fullName, designation, specialization, imageUrl, orderIndex] of mentorSeeds) {
    await pool.query(
      `
        INSERT INTO mentors
          (full_name, name, designation, organization, specialization, category, bio, image_url, imageUrl, status, featured, order_index, display_order, visible, isActive)
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 0, ?, ?, 1, 1
        WHERE NOT EXISTS (
          SELECT 1 FROM mentors WHERE full_name = ? OR name = ? LIMIT 1
        )
      `,
      [
        fullName,
        fullName,
        designation,
        "Maai organisation",
        specialization,
        specialization,
        "Mentor supporting Maai organisation's community health mission.",
        imageUrl,
        imageUrl,
        orderIndex,
        orderIndex,
        fullName,
        fullName,
      ],
    );
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS team_members (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      full_name VARCHAR(180) NULL,
      name VARCHAR(180) NOT NULL,
      role VARCHAR(180) NULL,
      designation VARCHAR(180) NULL,
      department VARCHAR(160) NULL,
      image_url TEXT NULL,
      imageUrl TEXT NULL,
      bio TEXT NULL,
      linkedin_url TEXT NULL,
      linkedin TEXT NULL,
      instagram_url TEXT NULL,
      email VARCHAR(180) NULL,
      status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published',
      order_index INT NOT NULL DEFAULT 0,
      instagram TEXT NULL,
      priority INT NOT NULL DEFAULT 0,
      featured TINYINT(1) NOT NULL DEFAULT 0,
      active TINYINT(1) NOT NULL DEFAULT 1,
      isActive TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY team_public_sort (active, featured, priority, created_at),
      KEY team_members_status_order (status, department, order_index, created_at)
    )
  `);

  await ensureColumn("team_members", "full_name", "VARCHAR(180) NULL");
  await ensureColumn("team_members", "role", "VARCHAR(180) NULL");
  await ensureColumn("team_members", "chapter", "VARCHAR(180) NULL");
  await ensureColumn("team_members", "state", "VARCHAR(120) NULL");
  await ensureColumn("team_members", "imageUrl", "TEXT NULL");
  await ensureColumn("team_members", "image_url", "TEXT NULL");
  await ensureColumn("team_members", "linkedin_url", "TEXT NULL");
  await ensureColumn("team_members", "instagram_url", "TEXT NULL");
  await ensureColumn("team_members", "email", "VARCHAR(180) NULL");
  await ensureColumn(
    "team_members",
    "status",
    "ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published'",
  );
  await ensureColumn("team_members", "order_index", "INT NOT NULL DEFAULT 0");
  await ensureColumn("team_members", "isActive", "TINYINT(1) NOT NULL DEFAULT 1");
  await ensureIndex("team_members", "team_members_status_order", "KEY team_members_status_order (status, department, order_index, created_at)");
  await pool.query(`
    UPDATE team_members
    SET full_name = COALESCE(full_name, name),
        image_url = COALESCE(image_url, imageUrl),
        linkedin_url = COALESCE(linkedin_url, linkedin),
        instagram_url = COALESCE(instagram_url, instagram),
        order_index = CASE WHEN order_index = 0 THEN priority ELSE order_index END,
        status = CASE WHEN active = 1 THEN COALESCE(status, 'published') ELSE 'archived' END
  `);
  const teamSeeds = [
    ["Abhishek Kashyap", "GAIMS President", "Leadership", "https://placehold.co/600x600?text=Abhishek+Kashyap", 1],
    ["Oluwasola Victor", "CEO of BlueOzone", "Leadership", "https://placehold.co/600x600?text=Oluwasola+Victor", 2],
  ];

  for (const [fullName, designation, department, imageUrl, orderIndex] of teamSeeds) {
    await pool.query(
      `
        INSERT INTO team_members
          (full_name, name, designation, department, bio, image_url, imageUrl, status, order_index, active, isActive)
        SELECT ?, ?, ?, ?, ?, ?, ?, 'published', ?, 1, 1
        WHERE NOT EXISTS (
          SELECT 1 FROM team_members WHERE full_name = ? OR name = ? LIMIT 1
        )
      `,
      [
        fullName,
        fullName,
        designation,
        department,
        "Leadership team member at Maai organisation.",
        imageUrl,
        imageUrl,
        orderIndex,
        fullName,
        fullName,
      ],
    );
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS team (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(180) NOT NULL,
      role VARCHAR(180) NULL,
      bio TEXT NULL,
      imageUrl TEXT NULL,
      linkedin TEXT NULL,
      email VARCHAR(180) NULL,
      isActive TINYINT(1) NOT NULL DEFAULT 1,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY team_active_sort (isActive, createdAt)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reels (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      title VARCHAR(180) NOT NULL,
      slug VARCHAR(220) NULL,
      platform ENUM('instagram', 'youtube', 'external') NOT NULL DEFAULT 'external',
      description TEXT NULL,
      caption TEXT NULL,
      thumbnail_url TEXT NULL,
      thumbnailUrl TEXT NULL,
      video_url TEXT NULL,
      videoUrl TEXT NULL,
      initiative_id INT UNSIGNED NULL,
      status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published',
      location VARCHAR(180) NULL,
      eventName VARCHAR(180) NULL,
      published_at TIMESTAMP NULL,
      upload_date TIMESTAMP NULL,
      featured TINYINT(1) NOT NULL DEFAULT 0,
      order_index INT NOT NULL DEFAULT 0,
      views INT NOT NULL DEFAULT 0,
      likes INT NOT NULL DEFAULT 0,
      engagement DECIMAL(10,2) NOT NULL DEFAULT 0,
      chapter VARCHAR(180) NULL,
      active TINYINT(1) NOT NULL DEFAULT 1,
      category VARCHAR(120) NULL,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY reels_public_sort (active, featured, display_order, upload_date, created_at),
      KEY reels_status_featured_order (status, featured, order_index, published_at, created_at),
      KEY reels_initiative_lookup (initiative_id, status)
    )
  `);

  await ensureColumn("reels", "slug", "VARCHAR(220) NULL");
  await ensureColumn("reels", "platform", "ENUM('instagram', 'youtube', 'external') NOT NULL DEFAULT 'external'");
  await ensureColumn("reels", "caption", "TEXT NULL");
  await ensureColumn("reels", "thumbnail_url", "TEXT NULL");
  await ensureColumn("reels", "thumbnailUrl", "TEXT NULL");
  await ensureColumn("reels", "video_url", "TEXT NULL");
  await ensureColumn("reels", "videoUrl", "TEXT NULL");
  await ensureColumn("reels", "initiative_id", "INT UNSIGNED NULL");
  await ensureColumn("reels", "status", "ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published'");
  await ensureColumn("reels", "location", "VARCHAR(180) NULL");
  await ensureColumn("reels", "eventName", "VARCHAR(180) NULL");
  await ensureColumn("reels", "published_at", "TIMESTAMP NULL");
  await ensureColumn("reels", "order_index", "INT NOT NULL DEFAULT 0");
  await ensureColumn("reels", "views", "INT NOT NULL DEFAULT 0");
  await ensureColumn("reels", "likes", "INT NOT NULL DEFAULT 0");
  await ensureColumn("reels", "engagement", "DECIMAL(10,2) NOT NULL DEFAULT 0");
  await ensureColumn("reels", "chapter", "VARCHAR(180) NULL");
  await pool.query(`
    UPDATE reels
    SET slug = COALESCE(slug, LOWER(REPLACE(title, ' ', '-'))),
        thumbnail_url = COALESCE(thumbnail_url, thumbnailUrl),
        video_url = COALESCE(video_url, videoUrl),
        caption = COALESCE(caption, description),
        published_at = COALESCE(published_at, upload_date),
        order_index = CASE WHEN order_index = 0 THEN display_order ELSE order_index END,
        status = CASE WHEN active = 1 THEN COALESCE(status, 'published') ELSE 'archived' END,
        platform = CASE
          WHEN video_url LIKE '%instagram.com%' OR videoUrl LIKE '%instagram.com%' THEN 'instagram'
          WHEN video_url LIKE '%youtube.com%' OR videoUrl LIKE '%youtube.com%' OR video_url LIKE '%youtu.be%' OR videoUrl LIKE '%youtu.be%' THEN 'youtube'
          ELSE COALESCE(platform, 'external')
        END
  `);
  await ensureIndex("reels", "reels_status_featured_order", "KEY reels_status_featured_order (status, featured, order_index, published_at, created_at)");
  await ensureIndex("reels", "reels_initiative_lookup", "KEY reels_initiative_lookup (initiative_id, status)");

  const reelSeeds = [
    ["Project Suraksha Awareness Reel", "project-suraksha-awareness-reel", "instagram", "https://www.instagram.com/reel/example-suraksha/", 1],
    ["Volunteer Camp Reel", "volunteer-camp-reel", "youtube", "https://www.youtube.com/shorts/example-camp", 2],
    ["YouthCon Highlights", "youthcon-highlights", "external", "https://example.com/youthcon-highlights", 3],
  ];

  for (const [title, slug, platform, videoUrl, orderIndex] of reelSeeds) {
    await pool.query(
      `
        INSERT INTO reels
          (title, slug, platform, video_url, videoUrl, thumbnail_url, thumbnailUrl, caption, description, status, featured, order_index, display_order, published_at, upload_date, active)
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 0, ?, ?, NOW(), NOW(), 1
        WHERE NOT EXISTS (
          SELECT 1 FROM reels WHERE slug = ? OR title = ? LIMIT 1
        )
      `,
      [
        title,
        slug,
        platform,
        videoUrl,
        videoUrl,
        `https://placehold.co/900x1200?text=${encodeURIComponent(title).replace(/%20/g, "+")}`,
        `https://placehold.co/900x1200?text=${encodeURIComponent(title).replace(/%20/g, "+")}`,
        `${title} from Maai organisation.`,
        `${title} from Maai organisation.`,
        orderIndex,
        orderIndex,
        slug,
        title,
      ],
    );
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      full_name VARCHAR(180) NULL,
      name VARCHAR(180) NOT NULL,
      role VARCHAR(180) NULL,
      designation VARCHAR(180) NULL,
      organization VARCHAR(180) NULL,
      testimonial TEXT NULL,
      quote TEXT NOT NULL,
      image_url TEXT NULL,
      imageUrl TEXT NULL,
      category ENUM('volunteer', 'mentor', 'ngo', 'partner', 'beneficiary', 'speaker', 'other') NOT NULL DEFAULT 'other',
      status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published',
      featured TINYINT(1) NOT NULL DEFAULT 0,
      active TINYINT(1) NOT NULL DEFAULT 1,
      isActive TINYINT(1) NOT NULL DEFAULT 1,
      rating INT NOT NULL DEFAULT 5,
      order_index INT NOT NULL DEFAULT 0,
      event_id INT UNSIGNED NULL,
      initiative_id INT UNSIGNED NULL,
      chapter VARCHAR(180) NULL,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY testimonials_public_sort (active, featured, display_order, created_at),
      KEY testimonials_status_featured_order (status, category, featured, order_index, created_at)
    )
  `);

  await ensureColumn("testimonials", "full_name", "VARCHAR(180) NULL");
  await ensureColumn("testimonials", "designation", "VARCHAR(180) NULL");
  await ensureColumn("testimonials", "organization", "VARCHAR(180) NULL");
  await ensureColumn("testimonials", "testimonial", "TEXT NULL");
  await ensureColumn("testimonials", "image_url", "TEXT NULL");
  await ensureColumn("testimonials", "imageUrl", "TEXT NULL");
  await ensureColumn("testimonials", "category", "ENUM('volunteer', 'mentor', 'ngo', 'partner', 'beneficiary', 'speaker', 'other') NOT NULL DEFAULT 'other'");
  await ensureColumn("testimonials", "status", "ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published'");
  await ensureColumn("testimonials", "rating", "INT NOT NULL DEFAULT 5");
  await ensureColumn("testimonials", "order_index", "INT NOT NULL DEFAULT 0");
  await ensureColumn("testimonials", "event_id", "INT UNSIGNED NULL");
  await ensureColumn("testimonials", "initiative_id", "INT UNSIGNED NULL");
  await ensureColumn("testimonials", "chapter", "VARCHAR(180) NULL");
  await ensureColumn("testimonials", "isActive", "TINYINT(1) NOT NULL DEFAULT 1");
  await pool.query(`
    UPDATE testimonials
    SET category = CASE
      WHEN LOWER(category) IN ('volunteer', 'mentor', 'ngo', 'partner', 'beneficiary', 'speaker', 'other')
        THEN LOWER(category)
      ELSE 'other'
    END
  `);
  await pool.query("ALTER TABLE testimonials MODIFY COLUMN category ENUM('volunteer', 'mentor', 'ngo', 'partner', 'beneficiary', 'speaker', 'other') NOT NULL DEFAULT 'other'");
  await pool.query(`
    UPDATE testimonials
    SET full_name = COALESCE(full_name, name),
        designation = COALESCE(designation, role),
        testimonial = COALESCE(testimonial, quote),
        image_url = COALESCE(image_url, imageUrl),
        rating = LEAST(GREATEST(COALESCE(rating, 5), 1), 5),
        order_index = CASE WHEN order_index = 0 THEN display_order ELSE order_index END,
        status = CASE WHEN active = 1 AND isActive = 1 THEN COALESCE(status, 'published') ELSE 'archived' END
  `);
  await ensureIndex("testimonials", "testimonials_status_featured_order", "KEY testimonials_status_featured_order (status, category, featured, order_index, created_at)");

  const testimonialSeeds = [
    ["Volunteer feedback", "Volunteer", "Maai Volunteers", "volunteer", "Volunteering with Maai helped me contribute to meaningful community health work.", 1],
    ["Mentor feedback", "Mentor", "Maai Mentors", "mentor", "Maai's commitment to structured community impact makes mentoring deeply rewarding.", 2],
    ["NGO partner feedback", "NGO Partner", "Partner Organization", "ngo", "The collaboration with Maai brought clarity, compassion, and execution strength to our outreach.", 3],
  ];

  for (const [fullName, designation, organization, category, testimonial, orderIndex] of testimonialSeeds) {
    await pool.query(
      `
        INSERT INTO testimonials
          (full_name, name, designation, role, organization, category, testimonial, quote, image_url, imageUrl, rating, status, featured, order_index, display_order, active, isActive)
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5, 'published', 0, ?, ?, 1, 1
        WHERE NOT EXISTS (
          SELECT 1 FROM testimonials WHERE full_name = ? OR name = ? LIMIT 1
        )
      `,
      [
        fullName,
        fullName,
        designation,
        designation,
        organization,
        category,
        testimonial,
        testimonial,
        `https://placehold.co/600x600?text=${encodeURIComponent(fullName).replace(/%20/g, "+")}`,
        `https://placehold.co/600x600?text=${encodeURIComponent(fullName).replace(/%20/g, "+")}`,
        orderIndex,
        orderIndex,
        fullName,
        fullName,
      ],
    );
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS socials (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      platform VARCHAR(120) NOT NULL,
      handle VARCHAR(180) NULL,
      url TEXT NULL,
      iconUrl TEXT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      isActive TINYINT(1) NOT NULL DEFAULT 1,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY socials_public_sort (is_active, display_order, created_at)
    )
  `);

  await ensureColumn("socials", "isActive", "TINYINT(1) NOT NULL DEFAULT 1");
  await ensureColumn("socials", "iconUrl", "TEXT NULL");

  console.log("Database initialized successfully");
}

module.exports = initDatabase;
