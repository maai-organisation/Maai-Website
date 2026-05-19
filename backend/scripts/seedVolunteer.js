const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

const volunteer = {
  fullName: "Test Volunteer",
  email: "test@maai.org",
  password: "test123",
  phone: "9876543210",
  city: "Mumbai",
  college: "Test College",
  course: "MBBS",
  academicYear: "Third Year",
  skills: "Camps, Outreach",
  interests: "Healthcare camps",
  availability: "Weekends",
  role: "volunteer",
  membershipStatus: "verified",
  paymentStatus: "free",
  transactionId: "FREE",
};

async function seedVolunteer() {
  const passwordHash = await bcrypt.hash(volunteer.password, 10);

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
      volunteer.fullName,
      volunteer.email,
      passwordHash,
      volunteer.phone,
      volunteer.city,
      volunteer.college,
      volunteer.course,
      volunteer.academicYear,
      volunteer.skills,
      volunteer.interests,
      volunteer.availability,
      volunteer.role,
      volunteer.membershipStatus,
      volunteer.paymentStatus,
      volunteer.transactionId,
    ],
  );

  console.log(`Seeded verified volunteer: ${volunteer.email}`);
}

seedVolunteer()
  .catch((error) => {
    console.error("Failed to seed volunteer:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
