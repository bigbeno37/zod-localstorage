import {z} from 'zod';
import {ZodLocalStorage} from '../src';
import {LocalStorage} from 'node-localstorage';

// The schema for a todo items array.
const TodoItems = z.array(z.object({
	name: z.string(),
	completed: z.boolean()
}));

// An object containing every key that will appear in storage
const LocalStorageKeys = {
	TODO_ITEMS: TodoItems
};

const Storage = new ZodLocalStorage(LocalStorageKeys, new LocalStorage('./scratch'));

let todoItems: z.infer<typeof TodoItems> = [];

const result = Storage.getItem('TODO_ITEMS');

if (result.success) todoItems = result.data;

todoItems.push({ name: 'Write some code', completed: false });

console.log('setting item in localstorage');
Storage.setItem('TODO_ITEMS', todoItems);

const newResult = Storage.getItem('TODO_ITEMS');
if (!newResult.success) process.exit();

console.log(newResult.data);