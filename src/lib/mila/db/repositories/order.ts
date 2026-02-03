import { getDB } from "../connection";
import { BaseRepository } from "./base";
import type {
  Order,
  CreateOrder,
  UpdateOrder,
  OrderStatus,
  OrderType,
} from "../../types/domain";

/**
 * Order Repository
 *
 * Manages clinical orders with full audit trail.
 * Tracks who ordered, who executed, and PIN verification.
 */
class OrderRepositoryClass extends BaseRepository<
  "orders",
  Order,
  CreateOrder,
  UpdateOrder
> {
  constructor() {
    super("orders");
  }

  /**
   * Get all orders for a patient (newest first)
   */
  async byPatient(patientId: string): Promise<Order[]> {
    const db = await getDB();
    const orders = await db.getAllFromIndex(
      "orders",
      "by-patientId",
      patientId
    );
    return orders.sort(
      (a, b) =>
        new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime()
    );
  }

  /**
   * Get orders by status
   */
  async byPatientAndStatus(
    patientId: string,
    status: OrderStatus
  ): Promise<Order[]> {
    const db = await getDB();
    const orders = await db.getAllFromIndex(
      "orders",
      "by-patientId-status",
      [patientId, status]
    );
    return orders.sort(
      (a, b) =>
        new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime()
    );
  }

  /**
   * Get orders by type
   */
  async byPatientAndType(
    patientId: string,
    orderType: OrderType
  ): Promise<Order[]> {
    const db = await getDB();
    const orders = await db.getAllFromIndex(
      "orders",
      "by-patientId-orderType",
      [patientId, orderType]
    );
    return orders.sort(
      (a, b) =>
        new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime()
    );
  }

  /**
   * Get pending orders (not yet completed or cancelled)
   */
  async getPendingOrders(patientId: string): Promise<Order[]> {
    const orders = await this.byPatient(patientId);
    return orders.filter(
      (o) => o.status === "pending" || o.status === "in_progress"
    );
  }

  /**
   * Mark order as executed by a staff member
   */
  async executeOrder(
    orderId: string,
    executedBy: string,
    executedByRole: Order["executedByRole"]
  ): Promise<Order | null> {
    return this.update(orderId, {
      status: "in_progress",
      executedBy,
      executedByRole,
      executedAt: new Date().toISOString(),
    });
  }

  /**
   * Mark order as completed
   */
  async completeOrder(orderId: string): Promise<Order | null> {
    return this.update(orderId, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  }

  /**
   * Cancel an order with reason
   */
  async cancelOrder(
    orderId: string,
    cancelledBy: string,
    reason: string
  ): Promise<Order | null> {
    return this.update(orderId, {
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancelledBy,
      cancellationReason: reason,
    });
  }

  /**
   * Get orders ordered by a specific staff member
   */
  async byOrderedBy(patientId: string, orderedBy: string): Promise<Order[]> {
    const orders = await this.byPatient(patientId);
    return orders.filter((o) => o.orderedBy === orderedBy);
  }

  /**
   * Get orders executed by a specific staff member
   */
  async byExecutedBy(patientId: string, executedBy: string): Promise<Order[]> {
    const orders = await this.byPatient(patientId);
    return orders.filter((o) => o.executedBy === executedBy);
  }

  /**
   * Get order audit trail summary
   */
  async getOrderAuditSummary(
    patientId: string
  ): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    ordersByType: Record<string, number>;
    ordersByOrderer: Record<string, number>;
    ordersByExecutor: Record<string, number>;
  }> {
    const orders = await this.byPatient(patientId);

    const ordersByType: Record<string, number> = {};
    const ordersByOrderer: Record<string, number> = {};
    const ordersByExecutor: Record<string, number> = {};

    let pendingOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;

    for (const order of orders) {
      // Count by status
      if (order.status === "pending" || order.status === "in_progress") {
        pendingOrders++;
      } else if (order.status === "completed") {
        completedOrders++;
      } else if (order.status === "cancelled") {
        cancelledOrders++;
      }

      // Count by type
      ordersByType[order.orderType] = (ordersByType[order.orderType] || 0) + 1;

      // Count by orderer
      ordersByOrderer[order.orderedBy] =
        (ordersByOrderer[order.orderedBy] || 0) + 1;

      // Count by executor
      if (order.executedBy) {
        ordersByExecutor[order.executedBy] =
          (ordersByExecutor[order.executedBy] || 0) + 1;
      }
    }

    return {
      totalOrders: orders.length,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      ordersByType,
      ordersByOrderer,
      ordersByExecutor,
    };
  }

  /**
   * Get recent orders (last 24 hours)
   */
  async getRecentOrders(patientId: string): Promise<Order[]> {
    const orders = await this.byPatient(patientId);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return orders.filter(
      (o) => new Date(o.orderedAt).getTime() > oneDayAgo.getTime()
    );
  }
}

// Export singleton instance
export const OrderRepository = new OrderRepositoryClass();

// ============================================================================
// PIN Verification Utility
// ============================================================================

/**
 * Test PIN for development/demo purposes
 * In production, this would be properly hashed and stored securely
 */
const TEST_PIN = "1234";

/**
 * Verify a PIN against the test PIN (development only)
 */
export function verifyPIN(pin: string): boolean {
  return pin === TEST_PIN;
}

/**
 * Hash a PIN for storage (placeholder - use proper hashing in production)
 */
export function hashPIN(pin: string): string {
  // In production, use bcrypt or similar
  return `hashed_${pin}`;
}

/**
 * Get the test PIN hint for development
 */
export function getTestPINHint(): string {
  return "Test PIN: 1234";
}
