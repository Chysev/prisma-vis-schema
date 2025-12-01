/**
 * @file bcrypt.ts
 * @description Wrapper around bcrypt library providing password hashing and comparison functionality
 * @module lib/bcrypt
 */
import bcrypt from 'bcrypt';

/**
 * Default number of salt rounds for bcrypt
 * Higher values increase security but also increase computational cost
 * OWASP recommends at least 10 rounds in 2025
 */
const DEFAULT_SALT_ROUNDS = 12;

/**
 * Maximum password length to prevent DoS attacks
 * bcrypt has a hard limit of 72 bytes
 */
const MAX_PASSWORD_LENGTH = 72;

/**
 * Configuration options for the Bcrypt class
 */
export interface BcryptOptions {
    /** Number of salt rounds to use (default: 12) */
    saltRounds?: number;
}

/**
 * Error class for Bcrypt-related errors
 */
export class BcryptError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BcryptError';
        Object.setPrototypeOf(this, BcryptError.prototype);
    }
}

/**
 * Bcrypt wrapper class for password hashing and comparison
 * Provides both synchronous and asynchronous methods
 */
export class Bcrypt {
    private static instance: Bcrypt;
    private readonly saltRounds: number;

    /**
     * Creates a new Bcrypt instance
     * @param options - Configuration options
     */
    constructor(options?: BcryptOptions) {
        this.saltRounds = options?.saltRounds ?? DEFAULT_SALT_ROUNDS;
    }

    /**
     * Get the singleton instance of Bcrypt
     * @param options - Configuration options
     * @returns The Bcrypt instance
     */
    public static getInstance(options?: BcryptOptions): Bcrypt {
        if (!Bcrypt.instance) {
            Bcrypt.instance = new Bcrypt(options);
        }
        return Bcrypt.instance;
    }

    /**
     * Validates if the provided password is within acceptable length
     * @param plainPassword - The password to validate
     * @throws {BcryptError} If the password is too long
     */
    private validatePassword(plainPassword: string): void {
        if (!plainPassword) {
            throw new BcryptError('Password cannot be empty');
        }
        if (plainPassword.length > MAX_PASSWORD_LENGTH) {
            throw new BcryptError(`Password exceeds maximum length of ${MAX_PASSWORD_LENGTH} characters`);
        }
    }

    /**
     * Asynchronously hashes a plain password
     * @param plainPassword - The password to hash
     * @returns Promise resolving to the hashed password
     * @throws {BcryptError} If hashing fails
     */
    async hash(plainPassword: string): Promise<string> {
        try {
            this.validatePassword(plainPassword);
            const salt = await bcrypt.genSalt(this.saltRounds);
            return bcrypt.hash(plainPassword, salt);
        } catch (error) {
            if (error instanceof BcryptError) {
                throw error;
            }
            throw new BcryptError(`Failed to hash password: ${(error as Error).message}`);
        }
    }

    /**
     * Synchronously hashes a plain password
     * @param plainPassword - The password to hash
     * @returns The hashed password
     * @throws {BcryptError} If hashing fails
     */
    hashSync(plainPassword: string): string {
        try {
            this.validatePassword(plainPassword);
            const salt = bcrypt.genSaltSync(this.saltRounds);
            return bcrypt.hashSync(plainPassword, salt);
        } catch (error) {
            if (error instanceof BcryptError) {
                throw error;
            }
            throw new BcryptError(`Failed to hash password: ${(error as Error).message}`);
        }
    }

    /**
     * Asynchronously compares a plain password with a hashed password
     * @param plainPassword - The plain password to compare
     * @param hashedPassword - The hashed password to compare against
     * @returns Promise resolving to true if passwords match, false otherwise
     * @throws {BcryptError} If comparison fails
     */
    async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
        try {
            this.validatePassword(plainPassword);
            if (!hashedPassword) {
                throw new BcryptError('Hashed password cannot be empty');
            }
            return bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            if (error instanceof BcryptError) {
                throw error;
            }
            throw new BcryptError(`Failed to compare passwords: ${(error as Error).message}`);
        }
    }

    /**
     * Synchronously compares a plain password with a hashed password
     * @param plainPassword - The plain password to compare
     * @param hashedPassword - The hashed password to compare against
     * @returns True if passwords match, false otherwise
     * @throws {BcryptError} If comparison fails
     */
    compareSync(plainPassword: string, hashedPassword: string): boolean {
        try {
            this.validatePassword(plainPassword);
            if (!hashedPassword) {
                throw new BcryptError('Hashed password cannot be empty');
            }
            return bcrypt.compareSync(plainPassword, hashedPassword);
        } catch (error) {
            if (error instanceof BcryptError) {
                throw error;
            }
            throw new BcryptError(`Failed to compare passwords: ${(error as Error).message}`);
        }
    }

    /**
     * Asynchronously generates a salt
     * @returns Promise resolving to the generated salt
     * @throws {BcryptError} If salt generation fails
     */
    async generateSalt(): Promise<string> {
        try {
            return bcrypt.genSalt(this.saltRounds);
        } catch (error) {
            throw new BcryptError(`Failed to generate salt: ${(error as Error).message}`);
        }
    }

    /**
     * Synchronously generates a salt
     * @returns The generated salt
     * @throws {BcryptError} If salt generation fails
     */
    generateSaltSync(): string {
        try {
            return bcrypt.genSaltSync(this.saltRounds);
        } catch (error) {
            throw new BcryptError(`Failed to generate salt: ${(error as Error).message}`);
        }
    }

    /**
     * Gets the configured number of salt rounds
     * @returns The number of salt rounds
     */
    getSaltRounds(): number {
        return this.saltRounds;
    }
}

// Export a default instance for convenience
export default Bcrypt.getInstance();