import {z, ZodType} from 'zod';
import {SafeParseReturnType} from 'zod/lib/types';

const nullAsJson = JSON.stringify(null);

/**
 * The main class that should be used to wrap localStorage. This should be given a schema mapping potential
 * localStorage key names to Zod schemas.
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
	 * Retrieves an item from storage using the given key. This will return the result of Zod parsing the value
	 * retrieved from storage.
	 *
	 * NOTE: If no key exists in storage, null will be used instead, which will likely cause Zod to fail the schema
	 *       validation.
	 *
	 * @param key The key of the value to retrieve from storage.
	 */
	getItem<K extends keyof T>(key: K): SafeParseReturnType<z.infer<T[K]>, z.infer<T[K]>> {
		let data = null;

		try {
			data = JSON.parse(this.storage.getItem(key as string) ?? nullAsJson);
		} catch {/**/}

		return this.schema[key].safeParse(data);
	}

	/**
	 * Retrieves an item from storage, but rather than returning an object containing the result of Zod parsing the
	 * value, this will instead throw the schema validation Error. Prefer using {@link getItem} where possible, as this
	 * may cause breakages due to uncaught errors.
	 *
	 * Internally this calls <zod type>.parse() rather than <zod type>.safeParse().
	 *
	 * NOTE: If no key exists in storage, null will be used instead, which will likely cause Zod to fail the schema
	 *       validation.
	 *
	 * @param key The key to retrieve the value for.
	 */
	getItemOrThrow<K extends keyof T>(key: K): T[K] {
		let data = null;

		try {
			data = JSON.parse(this.storage.getItem(key as string) ?? nullAsJson);
		} catch {/**/}

		return this.schema[key].parse(data) as T[K];
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