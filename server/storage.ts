import { eq, and, desc, isNull } from "drizzle-orm";
import { db } from "./db";
import {
  vehicles,
  clients,
  assignments,
  type Vehicle,
  type InsertVehicle,
  type Client,
  type InsertClient,
  type Assignment,
  type InsertAssignment,
  type VehicleWithAssignment,
  type ClientWithAssignment,
  type AssignmentWithDetails,
  users,
  type User,
  type InsertUser,
} from "@shared/schema";

export interface IStorage {
  getVehicles(): Promise<VehicleWithAssignment[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;

  getClients(): Promise<ClientWithAssignment[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

  getAssignments(): Promise<AssignmentWithDetails[]>;
  getAssignment(id: string): Promise<Assignment | undefined>;
  getActiveAssignmentForClient(clientId: string): Promise<AssignmentWithDetails | undefined>;
  getAssignmentHistoryForClient(clientId: string): Promise<AssignmentWithDetails[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  completeAssignment(id: string): Promise<Assignment | undefined>;
  cancelAssignment(id: string): Promise<Assignment | undefined>;

  getUser(id: string): Promise<User | undefined>;
  updateUserPassword(id: string, hashedPassword: string): Promise<void>;
  getUserById(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getVehicles(): Promise<VehicleWithAssignment[]> {
    const allVehicles = await db.select().from(vehicles);
    const activeAssignments = await db
      .select()
      .from(assignments)
      .innerJoin(clients, eq(assignments.clientId, clients.id))
      .where(eq(assignments.status, "active"));

    return allVehicles.map((vehicle) => {
      const assignment = activeAssignments.find(
        (a) => a.assignments.vehicleId === vehicle.id
      );
      return {
        ...vehicle,
        assignedTo: assignment ? `${assignment.clients.firstName} ${assignment.clients.lastName}` : undefined,
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

  async getClients(): Promise<ClientWithAssignment[]> {
    const allClients = await db.select().from(clients);
    const activeAssignments = await db
      .select()
      .from(assignments)
      .innerJoin(vehicles, eq(assignments.vehicleId, vehicles.id))
      .where(eq(assignments.status, "active"));

    return allClients.map((client) => {
      const assignment = activeAssignments.find(
        (a) => a.assignments.clientId === client.id
      );
      return {
        ...client,
        assignedVehicle: assignment
          ? `${assignment.vehicles.make} ${assignment.vehicles.model} (${assignment.vehicles.licensePlate})`
          : undefined,
      };
    });
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [created] = await db.insert(clients).values(client as any).returning();
    return created;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined> {
    const [updated] = await db
      .update(clients)
      .set(client as any)
      .where(eq(clients.id, id))
      .returning();
    return updated;
  }

  async deleteClient(id: string): Promise<boolean> {
    await db.delete(clients).where(eq(clients.id, id));
    return true;
  }

  async getAssignments(): Promise<AssignmentWithDetails[]> {
    const results = await db
      .select()
      .from(assignments)
      .innerJoin(clients, eq(assignments.clientId, clients.id))
      .innerJoin(vehicles, eq(assignments.vehicleId, vehicles.id))
      .orderBy(desc(assignments.startDate));

    return results.map((r) => ({
      ...r.assignments,
      clientName: `${r.clients.firstName} ${r.clients.lastName}`,
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

  async getActiveAssignmentForClient(clientId: string): Promise<AssignmentWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(assignments)
      .innerJoin(clients, eq(assignments.clientId, clients.id))
      .innerJoin(vehicles, eq(assignments.vehicleId, vehicles.id))
      .where(
        and(
          eq(assignments.clientId, clientId),
          eq(assignments.status, "active")
        )
      );

    if (!result) return undefined;

    return {
      ...result.assignments,
      clientName: `${result.clients.firstName} ${result.clients.lastName}`,
      vehiclePlate: result.vehicles.licensePlate,
      vehicleModel: `${result.vehicles.make} ${result.vehicles.model}`,
    };
  }

  async getAssignmentHistoryForClient(clientId: string): Promise<AssignmentWithDetails[]> {
    const results = await db
      .select()
      .from(assignments)
      .innerJoin(clients, eq(assignments.clientId, clients.id))
      .innerJoin(vehicles, eq(assignments.vehicleId, vehicles.id))
      .where(
        and(
          eq(assignments.clientId, clientId),
          eq(assignments.status, "completed")
        )
      )
      .orderBy(desc(assignments.startDate));

    return results.map((r) => ({
      ...r.assignments,
      clientName: `${r.clients.firstName} ${r.clients.lastName}`,
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
      .update(clients)
      .set({ available: false })
      .where(eq(clients.id, assignment.clientId));

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
      .update(clients)
      .set({ available: true })
      .where(eq(clients.id, assignment.clientId));

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
      .update(clients)
      .set({ available: true })
      .where(eq(clients.id, assignment.clientId));

    const [updated] = await db
      .update(assignments)
      .set({ status: "cancelled", endDate: new Date() })
      .where(eq(assignments.id, id))
      .returning();

    return updated;
  }

  async getUser(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<void> {
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, id));
  }
}

export const storage: IStorage = new DatabaseStorage();
