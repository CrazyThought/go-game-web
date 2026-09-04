// @ts-check
// 根目录统一 ESLint flat config：覆盖 apps/web + packages/* 的 TS / Vue 代码
// apps/server 使用独立的 next lint（eslint-config-next），此处通过 ignores 排除
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // 1) 全局忽略：依赖、构建产物、以及独立走 next lint 的 server
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      'apps/server/**',
    ],
  },
  // 2) JS 基础规则
  js.configs.recommended,
  // 3) TS 规则：base 配置（files=ALL）全局注册 @typescript-eslint 插件 + parser
  ...tseslint.configs.recommended,
  // 4) Vue 规则：自带 vue-eslint-parser，作用于 *.vue（置于 tseslint 之后，确保 .vue 用 vue 解析器）
  ...pluginVue.configs['flat/recommended'],
  // 5) 全局：环境变量 + import type 约定（TS 与 Vue 均生效）
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // 对应 02-implementation-plan 6：强制 import type 避免运行时导入
      '@typescript-eslint/consistent-type-imports': 'error',
      // 预留空壳包（network/ai）的占位参数以 _ 前缀标记故意未使用，忽略之
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  // 6) Vue 文件：让 vue-eslint-parser 用 ts parser 解析 <script lang="ts">（仅补充 parser，不重复 preset）
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  // 7) 关闭与 Prettier 冲突的格式类规则（必须置于数组末尾）
  eslintConfigPrettier,
);
