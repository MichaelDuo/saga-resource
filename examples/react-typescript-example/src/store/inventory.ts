import {makeResource} from 'saga-resource';

export interface InventoryState {
	items: {id: string; name: string}[];
}

const inventory = makeResource<InventoryState, {}, {}>({
	name: 'inventory',
	path: 'http://localhost:8080/inventory/:username',
	state: {
		items: [
			{id: '1', name: 'item1'},
			{id: '2', name: 'item2'},
			{id: '3', name: 'item3'},
		],
	},
});

export default inventory;
