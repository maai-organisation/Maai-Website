const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

const itStaff = {
  fullName: "Maai IT Staff",
  email: "itstaff@maai.org",
  password: "itstaff123",
  phone: "9876543212",
  city: "Mumbai",
  college: "Maai Organisation",
  course: "IT Operations",
  academicYear: "Staff",
  skills: "Approvals, Events, CMS",
  interests: "Operations support",
  availability: "Full time",
  role: "it_staff",
  membershipStatus: "verified",
  paymentStatus: "free",
  transactionId: "FREE",
};

async function seedItStaff() {
  const passwordHash = await bcrypt.hash(itStaff.password, 10);

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
      itStaff.fullName,
      itStaff.email,
      passwordHash,
      itStaff.phone,
      itStaff.city,
      itStaff.college,
      itStaff.course,
      itStaff.academicYear,
      itStaff.skills,
      itStaff.interests,
      itStaff.availability,
      itStaff.role,
      itStaff.membershipStatus,
      itStaff.paymentStatus,
      itStaff.transactionId,
    ],
  );

  console.log(`Seeded verified IT staff: ${itStaff.email}`);
}

seedItStaff()
  .catch((error) => {
    console.error("Failed to seed IT staff:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
