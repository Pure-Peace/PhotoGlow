import { PrismaClient as AdminClient, AdminRole } from 'photoglow-admin-prisma-client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import 'dotenv/config'

const prisma = new AdminClient()

const adminSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  role: z
    .enum([
      AdminRole.SUPER_ADMIN,
      AdminRole.CONTENT_MODERATOR,
      AdminRole.USER_MANAGER,
      AdminRole.ANALYST,
    ])
    .default(AdminRole.SUPER_ADMIN),
})

async function createAdmin() {
  // Get admin data from command line arguments
  const args = process.argv.slice(2)
  const email = args[0]
  const name = args[1]
  const password = args[2]
  const role = args[3] as AdminRole | undefined

  if (!email || !name || !password) {
    console.error(
      'Usage: bun scripts/create-admin.ts <email> <name> <password> [role]'
    )
    console.error(
      'Example: bun scripts/create-admin.ts admin@example.com "Admin User" password123 SUPER_ADMIN'
    )
    process.exit(1)
  }

  try {
    // Validate admin data
    const adminData = adminSchema.parse({
      email,
      name,
      password,
      role: role || AdminRole.SUPER_ADMIN,
    })

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminData.email },
    })

    if (existingAdmin) {
      console.error(`Admin with email ${adminData.email} already exists`)
      process.exit(1)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10)

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email: adminData.email,
        name: adminData.name,
        password: hashedPassword,
        role: adminData.role,
      },
    })

    console.log(`Created admin: ${admin.email} with role ${admin.role}`)
  } catch (error) {
    console.error('Error creating admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
