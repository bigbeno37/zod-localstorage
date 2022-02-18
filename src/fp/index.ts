import {z, ZodType} from 'zod';
import {Either, Left, Right} from 'purify-ts/es';
import {ZodError} from 'zod/lib/ZodError';

/**
 * Generates a storage accessor that allows for runtime type safety and type coercion in Typescript.
 *
 * NOTE: Unless an alternative {@link Storage} than {@link localStorage} is being used, it's recommended to use
 * {@link generateAccessor} instead.
 *
 * @param storage The {@link Storage} to use. Generally, this will be {@link localStorage}.
 */
export const generateAccessorForStorage = (storage: Storage) => <T extends { [key: string]: ZodType<unknown> }>(keys: T) => <K extends keyof T>(key: K) => ({
	/**
     * Validates the value in storage associated with the given key, and on validation error returns a {@link Left} with
     * the error, or a {@link Right} with the parsed value from storage.
     */
	getItem(): Either<ZodError, z.infer<T[K]>> {
		let data = null;

		try {
			data = JSON.parse(storage.getItem(key as string) ?? JSON.stringify(null));
		} catch {/**/}

		const result = keys[key].safeParse(data);

		if (!result.success) {
			return Left(result.error);
		}

		return Right(result.data);
	},
	/**
     * Sets the value associated with the given key in storage. This will automatically call {@link JSON.stringify}
     * on the given value to put into storage.
     *
     * @param value The value to be associated with the given key in storage.
     */
	setItem(value: z.infer<T[K]>) {
		storage.setItem(key as string, JSON.stringify(value));
	},
	/**
     * Clears the value associated with the given key in storage.
     *
     * NOTE: This does NOT clear ALL items in storage!
     */
	clear() {
		storage.removeItem(key as string);
	}
});

/**
 * A convenience function that calls {@link generateAccessorForStorage} with {@link localStorage} automatically.
 * This is the most common method of generating an accessor.
 */
export const generateAccessor = generateAccessorForStorage(localStorage);