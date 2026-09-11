import { PrismaClient, Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@erp.com' },
    update: {},
    create: { email: 'admin@erp.com', password: passwordHash, name: 'Admin User', role: Role.ADMIN }
  });

  const sales = await prisma.user.upsert({
    where: { email: 'sales@erp.com' },
    update: {},
    create: { email: 'sales@erp.com', password: passwordHash, name: 'Sales Rep', role: Role.SALES }
  });

  const warehouse = await prisma.user.upsert({
    where: { email: 'warehouse@erp.com' },
    update: {},
    create: { email: 'warehouse@erp.com', password: passwordHash, name: 'Warehouse Mgr', role: Role.WAREHOUSE }
  });

  const accounts = await prisma.user.upsert({
    where: { email: 'accounts@erp.com' },
    update: {},
    create: { email: 'accounts@erp.com', password: passwordHash, name: 'Accountant', role: Role.ACCOUNTS }
  });

  // 2. Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      customerName: 'ABC Distributors',
      mobileNumber: '+919876543210',
      businessName: 'ABC Enterprises',
      customerType: CustomerType.DISTRIBUTOR,
      status: CustomerStatus.ACTIVE
    }
  });

  const customer2 = await prisma.customer.create({
    data: {
      customerName: 'Sri Lakshmi Wholesale',
      mobileNumber: '+919876543211',
      businessName: 'Sri Lakshmi Co',
      customerType: CustomerType.WHOLESALE,
      status: CustomerStatus.ACTIVE
    }
  });

  // 3. Create Products
  const product1 = await prisma.product.create({
    data: {
      productName: 'Wireless Mouse',
      sku: 'WM001',
      category: 'Electronics',
      unitPrice: 500,
      currentStock: 100,
      minimumStock: 10,
      warehouseLocation: 'A1-01'
    }
  });

  const product2 = await prisma.product.create({
    data: {
      productName: 'Mechanical Keyboard',
      sku: 'KB001',
      category: 'Electronics',
      unitPrice: 1500,
      currentStock: 50,
      minimumStock: 5,
      warehouseLocation: 'A1-02'
    }
  });

  const product3 = await prisma.product.create({
    data: {
      productName: 'USB-C Cable',
      sku: 'CBL001',
      category: 'Accessories',
      unitPrice: 200,
      currentStock: 500,
      minimumStock: 100,
      warehouseLocation: 'B2-01'
    }
  });

  // 4. Create initial stock movements
  await prisma.stockMovement.create({
    data: {
      productId: product1.id,
      quantity: 100,
      movementType: MovementType.IN,
      reason: 'Initial Stock',
      createdBy: admin.id
    }
  });
  
  await prisma.stockMovement.create({
    data: {
      productId: product2.id,
      quantity: 50,
      movementType: MovementType.IN,
      reason: 'Initial Stock',
      createdBy: admin.id
    }
  });

  await prisma.stockMovement.create({
    data: {
      productId: product3.id,
      quantity: 500,
      movementType: MovementType.IN,
      reason: 'Initial Stock',
      createdBy: admin.id
    }
  });

  // 5. Create a Draft Challan
  const draftChallan = await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-00001',
      customerId: customer1.id,
      totalQuantity: 7,
      status: ChallanStatus.DRAFT,
      createdBy: sales.id,
      items: {
        create: [
          {
            productId: product1.id,
            productName: product1.productName,
            sku: product1.sku,
            unitPrice: product1.unitPrice,
            quantity: 5
          },
          {
            productId: product2.id,
            productName: product2.productName,
            sku: product2.sku,
            unitPrice: product2.unitPrice,
            quantity: 2
          }
        ]
      }
    }
  });

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
