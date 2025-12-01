import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vehicleStatusEnum = ["available", "assigned", "maintenance", "out_of_service"] as const;
export type VehicleStatus = typeof vehicleStatusEnum[number];

export const vehicleTypeEnum = ["sedan", "suv", "truck", "van"] as const;
export type VehicleType = typeof vehicleTypeEnum[number];

export const driverRoleEnum = ["manager", "senior", "standard", "trainee"] as const;
export type DriverRole = typeof driverRoleEnum[number];

export const assignmentStatusEnum = ["active", "completed", "cancelled"] as const;
export type AssignmentStatus = typeof assignmentStatusEnum[number];

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  licensePlate: text("license_plate").notNull().unique(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  type: text("type").notNull(),
  location: text("location").notNull(),
  status: text("status").notNull().default("available"),
});

export const insertVehicleSchema = createInsertSchema(vehicles, {
  type: z.enum(vehicleTypeEnum),
  status: z.enum(vehicleStatusEnum).optional(),
}).omit({ id: true });
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

export const drivers = pgTable("drivers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
  location: text("location").notNull(),
  phone: text("phone").notNull(),
  available: boolean("available").notNull().default(true),
});

export const insertDriverSchema = createInsertSchema(drivers, {
  role: z.enum(driverRoleEnum),
}).omit({ id: true });
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Driver = typeof drivers.$inferSelect;

export const assignments = pgTable("assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  driverId: varchar("driver_id").notNull().references(() => drivers.id),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
});

export const insertAssignmentSchema = createInsertSchema(assignments, {
  status: z.enum(assignmentStatusEnum).optional(),
}).omit({ id: true, startDate: true });
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Assignment = typeof assignments.$inferSelect;

export interface AssignmentWithDetails extends Assignment {
  driverName: string;
  vehiclePlate: string;
  vehicleModel: string;
}

export interface VehicleWithAssignment extends Vehicle {
  assignedTo?: string;
}

export interface DriverWithAssignment extends Driver {
  assignedVehicle?: string;
}

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
