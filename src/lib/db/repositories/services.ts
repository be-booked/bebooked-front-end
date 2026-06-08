import { eq, and, asc } from "drizzle-orm";
import { db } from "../client";
import { services } from "../schema";

export type Service = typeof services.$inferSelect;

type ServicePayload = {
  name: string;
  durationMins: number;
  priceCents: number;
};

export async function getServicesByStylistId(stylistId: number): Promise<Service[]> {
  return db
    .select()
    .from(services)
    .where(eq(services.stylistId, stylistId))
    .orderBy(asc(services.id));
}

export async function insertService(
  stylistId: number,
  data: ServicePayload
): Promise<Service> {
  const [row] = await db
    .insert(services)
    .values({ stylistId, ...data })
    .returning();
  return row;
}

export async function bulkInsertServices(
  stylistId: number,
  items: ServicePayload[]
): Promise<void> {
  if (items.length === 0) return;
  await db.insert(services).values(items.map((s) => ({ stylistId, ...s })));
}

export async function updateService(
  serviceId: number,
  stylistId: number,
  data: ServicePayload
): Promise<void> {
  await db
    .update(services)
    .set(data)
    .where(and(eq(services.id, serviceId), eq(services.stylistId, stylistId)));
}

export async function deleteService(
  serviceId: number,
  stylistId: number
): Promise<void> {
  await db
    .delete(services)
    .where(and(eq(services.id, serviceId), eq(services.stylistId, stylistId)));
}
