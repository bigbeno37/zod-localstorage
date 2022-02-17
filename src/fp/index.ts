import {z, ZodType} from "zod";
import {Either, Left, Right} from "purify-ts/es";
import {ZodError} from "zod/lib/ZodError";

const nullAsJson = JSON.stringify(null);

/**
 * The main class that should be used to wrap localStorage. This should be given a schema mapping potential
 * localStorage key names to Zod schemas.
 *
 * This differs from the regular ZodLocalStorage by modifying the behaviour of getItem and removing getItemOrThrow
 * to instead use a more functional approach via purify-ts.
 */
export class ZodLocalStorage<T extends { [key: string]: ZodType<unknown> }> {
    /**
     * @param schema The schema this storage will use to map key names to Zod schemas for validation and type-safety.
     * @param storage The storage to persist data to. This defaults to localStorage.
     */
    constructor(private schema: T, private storage = localStorage) {}

    /**
     * Clears all values in the current storage.
     */
    clear() {
        this.storage.clear();
    }

    /**
     * Retrieves an item from storage, returning an Either that contains a schema validation error on left, and a
     * successful data validation on right.
     *
     * @param key The key of the value to retrieve from storage.
     */
    getItem<K extends keyof T>(key: K): Either<ZodError, z.infer<T[K]>> {
        let data = null;

        try {
            data = JSON.parse(this.storage.getItem(key as string) ?? nullAsJson);
        } catch {}

        const result = this.schema[key].safeParse(data);

        if (!result.success) {
            return Left(result.error);
        }

        return Right(result.data);
    }

    /**
     * Assigns the given value to the given key in storage by first converting the value to a JSON string via
     * {@link JSON.stringify} and followed by persisting the value to storage.
     *
     * @param key The key to associate the value with.
     * @param value The value to be persisted.
     */
    setItem<K extends keyof T>(key: K, value: z.infer<T[K]>): void {
        this.storage.setItem(key as string, JSON.stringify(value));
    }

    /**
     * Removes an item from storage. This is identical to {@link localStorage.removeItem}.
     *
     * @param key The key to remove from storage.
     */
    removeItem<K extends keyof T>(key: K) {
        this.storage.removeItem(key as string);
    }
}