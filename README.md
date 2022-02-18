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

## FP (Functional Programming) Module
For those who would prefer a more functional approach, `zod-localstorage` also comes with module that is more suited to a functional style, and uses the popular `purify-ts` library. As prior, create an object containing storage keys mapped to Zod schemas:

```ts
import {generateAccessor} from "zod-localstorage/fp";

const TodoItems = z.array(z.object({
    name: z.string(),
    completed: z.boolean()
}));

const LocalStorageKeys = {
    TODO_ITEMS: TodoItems
};

const getKey = generateAccessor(LocalStorageKeys);

const todoItems = getKey("TODO_ITEMS");

todoItems.setItem([ { name: "Learn Haskell", completed: false } ]); // Sets the "TODO_ITEMS" key in localStorage to the given value

const result = todoItems.getItem(); // Currently of type Either<ZodError, Array<{ name: string, completed: boolean}>

todoItems.clear(); // Clears the todo items from local storage
```