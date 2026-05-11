# Architectural Decisions

## 1. Authentication: JWT Rotation & Reuse Detection
- **Decision**: Use short-lived Access Tokens (15m) and long-lived Refresh Tokens (7d) with automatic rotation.
- **Rationale**: Industry best practice for balancing security and user experience.
- **Security**: 
    - Refresh tokens are stored as **SHA-256 hashes** in the database.
    - Token Family ID tracks rotations. If an old token is reused, the entire family is revoked (anti-theft).
    - Cookies are `HttpOnly`, `Secure`, and `SameSite=Strict`.

## 2. Global Soft Delete
- **Decision**: Implement `deletedAt` field on all primary models (`User`, `Post`, `Comment`).
- **Rationale**: Protect against accidental data loss and maintain historical integrity.
- **Implementation**: Service layer filters with `deletedAt: null`. Database uniqueness constraints (like email) are handled by checking active records first.

## 3. Caching Strategy
- **Decision**: In-memory caching using `node-cache` with an Express middleware.
- **Rationale**: Drastically reduces DB load for read-heavy blog operations.
- **Strategy**:
    - Cache GET requests automatically.
    - Flush/Invalidate cache on any POST/PATCH/DELETE operation on the related resource.

## 4. Prisma Migrations
- **Decision**: Transitioned from `db push` to `migrate dev`.
- **Rationale**: Mandatory for production environments to ensure consistent schema across all environments and maintain an audit trail of changes.

## 5. Admin Alerts & Notifications
- **Decision**: Webhook-based alerting for admins + DB-backed notifications for users.
- **Rationale**: Real-time awareness of critical system events (security breaches, new registrations).
