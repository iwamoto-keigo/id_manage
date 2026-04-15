export interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  emailVerified: boolean;
  createdTimestamp?: number;
}

export interface UserWithRoles extends User {
  roles: string[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  composite: boolean;
  clientRole: boolean;
}

export interface Session {
  id: string;
  userId?: string;
  username?: string;
  ipAddress?: string;
  start?: number;
  lastAccess?: number;
  clientId?: string;
}

export interface KcEvent {
  time: number;
  type: string;
  userId?: string;
  ipAddress?: string;
  clientId?: string;
  realmId?: string;
  details?: Record<string, string>;
}
