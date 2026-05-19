const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

const superadmin = {
  fullName: "Maai Superadmin",
  email: "admin@maai.org",
  password: "admin123",
  phone: "9876543211",
  city: "Mumbai",
  college: "Maai Organisation",
  course: "Administration",
  academicYear: "Staff",
  skills: "Operations, CMS, Governance",
  interests: "Admin operations",
  availability: "Full time",
  role: "superadmin",
  membershipStatus: "verified",
  paymentStatus: "free",
  transactionId: "FREE",
};

async function seedSuperadmin() {
  const passwordHash = await bcrypt.hash(superadmin.password, 10);

  await pool.query(
    `
      INSERT INTO volunteers
        (full_name, email, password_hash, phone, city, college, course, academic_year, skills, interests, availability, role, membership_status, payment_status, transaction_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        full_name = VALUES(full_name),
        password_hash = VALUES(password_hash),
        phone = VALUES(phone),
        city = VALUES(city),
        college = VALUES(college),
        course = VALUES(course),
        academic_year = VALUES(academic_year),
        skills = VALUES(skills),
        interests = VALUES(interests),
        availability = VALUES(availability),
        role = VALUES(role),
        membership_status = VALUES(membership_status),
        payment_status = VALUES(payment_status),
        transaction_id = VALUES(transaction_id)
    `,
    [
      superadmin.fullName,
      superadmin.email,
      passwordHash,
      superadmin.phone,
      superadmin.city,
      superadmin.college,
      superadmin.course,
      superadmin.academicYear,
      superadmin.skills,
      superadmin.interests,
      superadmin.availability,
      superadmin.role,
      superadmin.membershipStatus,
      superadmin.paymentStatus,
      superadmin.transactionId,
    ],
  );

  console.log(`Seeded verified superadmin: ${superadmin.email}`);
}

seedSuperadmin()
  .catch((error) => {
    console.error("Failed to seed superadmin:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
