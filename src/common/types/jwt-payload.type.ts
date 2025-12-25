export interface JwtPayload {
    /** Internal DB primary key */
    sub: number;

    /** Public identifier exposed to clients */
    uuid: string;

    /** Login identity */
    email: string;

    /** Issued at (unix) */
    iat?: number;

    /** Expiry (unix) */
    exp?: number;

    /** Token ID (for refresh tokens only) */
    jti?: string;
}
