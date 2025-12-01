import { eq, and, desc, isNull } from "drizzle-orm";
import { db } from "./db";
import {
  vehicles,
  drivers,
  assignments,
  type Vehicle,
  type InsertVehicle,
  type Driver,
  type InsertDriver,
  type Assignment,
  type InsertAssignment,
  type VehicleWithAssignment,
  type DriverWithAssignment,
  type AssignmentWithDetails,
} from "@shared/schema";

export interface IStorage {
  getVehicles(): Promise<VehicleWithAssignment[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;

  getDrivers(): Promise<DriverWithAssignment[]>;
  getDriver(id: string): Promise<Driver | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriver(id: string, driver: Partial<InsertDriver>): Promise<Driver | undefined>;
  deleteDriver(id: string): Promise<boolean>;

  getAssignments(): Promise<AssignmentWithDetails[]>;
  getAssignment(id: string): Promise<Assignment | undefined>;
  getActiveAssignmentForDriver(driverId: string): Promise<AssignmentWithDetails | undefined>;
  getAssignmentHistoryForDriver(driverId: string): Promise<AssignmentWithDetails[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  completeAssignment(id: string): Promise<Assignment | undefined>;
  cancelAssignment(id: string): Promise<Assignment | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getVehicles(): Promise<VehicleWithAssignment[]> {
    const allVehicles = await db.select().from(vehicles);
    const activeAssignments = await db
      .select()
      .from(assignments)
      .innerJoin(drivers, eq(assignments.driverId, drivers.id))
      .where(eq(assignments.status, "active"));

    return allVehicles.map((vehicle) => {
      const assignment = activeAssignments.find(
        (a) => a.assignments.vehicleId === vehicle.id
      );
      return {
        ...vehicle,
        assignedTo: assignment?.drivers.name,
      };
    });
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [created] = await db.insert(vehicles).values(vehicle as any).returning();
    return created;
  }

  async updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const [updated] = await db
      .update(vehicles)
      .set(vehicle as any)
      .where(eq(vehicles.id, id))
      .returning();
    return updated;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id));
    return true;
  }

  async getDrivers(): Promise<DriverWithAssignment[]> {
    const allDrivers = await db.select().from(drivers);
    const activeAssignments = await db
      .select()
      .from(assignments)
      .innerJoin(vehicles, eq(assignments.vehicleId, vehicles.id))
      .where(eq(assignments.status, "active"));

    return allDrivers.map((driver) => {
      const assignment = activeAssignments.find(
        (a) => a.assignments.driverId === driver.id
      );
      return {
        ...driver,
        assignedVehicle: assignment
          ? `${assignment.vehicles.make} ${assignment.vehicles.model} (${assignment.vehicles.licensePlate})`
          : undefined,
      };
    });
  }

  async getDriver(id: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    return driver;
  }

  async createDriver(driver: InsertDriver): Promise<Driver> {
    const [created] = await db.insert(drivers).values(driver as any).returning();
    return created;
  }

  async updateDriver(id: string, driver: Partial<InsertDriver>): Promise<Driver | undefined> {
    const [updated] = await db
      .update(drivers)
      .set(driver as any)
      .where(eq(drivers.id, id))
      .returning();
    return updated;
  }

  async deleteDriver(id: string): Promise<boolean> {
    await db.delete(drivers).where(eq(drivers.id, id));
    return true;
  }

  async getAssignments(): Promise<AssignmentWithDetails[]> {
    const results = await db
      .select()
      .from(assignments)
      .innerJoin(drivers, eq(assignments.driverId, drivers.id))
      .innerJoin(vehicles, eq(assignments.vehicleId, vehicles.id))
      .orderBy(desc(assignments.startDate));

    return results.map((r) => ({
      ...r.assignments,
      driverName: r.drivers.name,
      vehiclePlate: r.vehicles.licensePlate,
      vehicleModel: `${r.vehicles.make} ${r.vehicles.model}`,
    }));
  }

  async getAssignment(id: string): Promise<Assignment | undefined> {
    const [assignment] = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, id));
    return assignment;
  }

  async getActiveAssignmentForDriver(driverId: string): Promise<AssignmentWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(assignments)
      .innerJoin(drivers, eq(assignments.driverId, drivers.id))
      .innerJoin(vehicles, eq(assignments.vehicleId, vehicles.id))
      .where(
        and(
          eq(assignments.driverId, driverId),
          eq(assignments.status, "active")
        )
      );

    if (!result) return undefined;

    return {
      ...result.assignments,
      driverName: result.drivers.name,
      vehiclePlate: result.vehicles.licensePlate,
      vehicleModel: `${result.vehicles.make} ${result.vehicles.model}`,
    };
  }

  async getAssignmentHistoryForDriver(driverId: string): Promise<AssignmentWithDetails[]> {
    const results = await db
      .select()
      .from(assignments)
      .innerJoin(drivers, eq(assignments.driverId, drivers.id))
      .innerJoin(vehicles, eq(assignments.vehicleId, vehicles.id))
      .where(
        and(
          eq(assignments.driverId, driverId),
          eq(assignments.status, "completed")
        )
      )
      .orderBy(desc(assignments.startDate));

    return results.map((r) => ({
      ...r.assignments,
      driverName: r.drivers.name,
      vehiclePlate: r.vehicles.licensePlate,
      vehicleModel: `${r.vehicles.make} ${r.vehicles.model}`,
    }));
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    await db
      .update(vehicles)
      .set({ status: "assigned" })
      .where(eq(vehicles.id, assignment.vehicleId));

    await db
      .update(drivers)
      .set({ available: false })
      .where(eq(drivers.id, assignment.driverId));

    const [created] = await db.insert(assignments).values(assignment as any).returning();
    return created;
  }

  async completeAssignment(id: string): Promise<Assignment | undefined> {
    const [assignment] = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, id));

    if (!assignment) return undefined;

    await db
      .update(vehicles)
      .set({ status: "available" })
      .where(eq(vehicles.id, assignment.vehicleId));

    await db
      .update(drivers)
      .set({ available: true })
      .where(eq(drivers.id, assignment.driverId));

    const [updated] = await db
      .update(assignments)
      .set({ status: "completed", endDate: new Date() })
      .where(eq(assignments.id, id))
      .returning();

    return updated;
  }

  async cancelAssignment(id: string): Promise<Assignment | undefined> {
    const [assignment] = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, id));

    if (!assignment) return undefined;

    await db
      .update(vehicles)
      .set({ status: "available" })
      .where(eq(vehicles.id, assignment.vehicleId));

    await db
      .update(drivers)
      .set({ available: true })
      .where(eq(drivers.id, assignment.driverId));

    const [updated] = await db
      .update(assignments)
      .set({ status: "cancelled", endDate: new Date() })
      .where(eq(assignments.id, id))
      .returning();

    return updated;
  }
}

export const storage = new DatabaseStorage();
