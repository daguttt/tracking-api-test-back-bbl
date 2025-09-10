// @ts-check

import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
	eslint.configs.recommended,
	tseslint.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'commonjs',
		},
	},
	globalIgnores(['src/env.d.ts'])
);
