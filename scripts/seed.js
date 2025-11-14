const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create default users
  const adminPassword = await bcrypt.hash('admin123', 10)
  const instructorPassword = await bcrypt.hash('instructor123', 10)
  const studentPassword = await bcrypt.hash('student123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
      firstLoginRequired: false,
    },
  })

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      email: 'instructor@example.com',
      name: 'Instructor User',
      passwordHash: instructorPassword,
      role: 'INSTRUCTOR',
      firstLoginRequired: false,
    },
  })

  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      name: 'Student User',
      passwordHash: studentPassword,
      role: 'STUDENT',
      firstLoginRequired: false,
    },
  })

  console.log('Seeded users:', { admin, instructor, student })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })