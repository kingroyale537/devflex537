/**
 * Database client provider.
 * This is a placeholder for your database configuration (e.g. Prisma, Drizzle, or Mongoose).
 * Set up and configure your database provider here.
 */

// Placeholder database configuration interface
export interface DatabaseClient {
  connect: () => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  isConnected: boolean;
}

class PortfolioDatabaseClient implements DatabaseClient {
  public isConnected: boolean = false;

  async connect(): Promise<boolean> {
    if (this.isConnected) return true;
    
    // Simulate database connection
    console.log("Connecting to database database...");
    this.isConnected = true;
    return true;
  }

  async disconnect(): Promise<boolean> {
    if (!this.isConnected) return true;

    console.log("Disconnecting from database...");
    this.isConnected = false;
    return true;
  }
}

// Global variable to persist database connection in development (prevents hot-reloading connection leaks)
const globalForDb = globalThis as unknown as {
  db: PortfolioDatabaseClient | undefined;
};

export const db = globalForDb.db ?? new PortfolioDatabaseClient();

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
