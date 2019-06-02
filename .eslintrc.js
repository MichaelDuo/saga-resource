module.exports = {
	parser: '@typescript-eslint/parser',
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
	],
	plugins: ['@typescript-eslint'],
	rules: {
		'@typescript-eslint/indent': 0, // confilict with prettier
		'@typescript-eslint/no-explicit-any': 0,
	},
};
