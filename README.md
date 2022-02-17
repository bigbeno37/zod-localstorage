# zod-localstorage
A Typescript library to allow typesafe access to localstorage using schema validation from Zod

## Usage
Create an object mapping every key to appear in localStorage to a Zod schema:
```ts
const TodoItems = z.array(z.object({
    name: z.string(),
    completed: z.boolean()
}));

const LocalStorageKeys = {
    TODO_ITEMS: TodoItems
};
```

Create a `ZodLocalStorage` instance using this object:
```ts
const Storage = new ZodLocalStorage(LocalStorageKeys);
```

To retrieve items, first verify that the retrieved item matches the given schema:
```ts
const validationResult = Storage.getItem("TODO_ITEMS");

if (!validationResult.success) {
    // log error, show notification, etc.
    return;
}

// Validation must be successful here
const { data } = validationResult; // Will be of type Array<{ name: string, completed: boolean }>
```

If you'd prefer a more traditional try-catch approach, use `ZodLocalStorage.getItemOrThrow`:
```ts
try {
    const validationResult = Storage.getItem("TODO_ITEMS");

    // Validation must be successful here
    const { data } = validationResult; // Will be of type Array<{ name: string, completed: boolean }>
} catch (e) {
    // handle error
    return;
}
```

To set items, use `ZodLocalStorage.setItem()`. NOTE: There is no need to use JSON.stringify for the value; it will automatically be called on the given value. 
```ts
const todoItems = [{ name: "Write some code", completed: false }];

Storage.setItem("TODO_ITEMS", todoItems);
```

## FP Module
For a more functional approach, there is also the `ZodLocalStorage` class found within `zod-localstorage/fp`. This has the same API as described above, with a couple major differences.
 - `ZodLocalStorage.getItemOrThrow()` has been removed.
 - `ZodLocalStorage.getItem()` utilises the `purify-ts` library to return an `Either`, rather than a custom validation object.
```ts
import { ZodLocalStorage } from "zod-localstorage/fp";

const Storage = new ZodLocalStorage(LocalStorageKeys);

const validationResult = Storage.getItem("TODO_ITEMS"); // Returns Either<ZodError, Array<{ name: string, completed: boolean }>>
```