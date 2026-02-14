
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```sh
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const VITE_FIREBASE_API_KEY: string;
	export const VITE_FIREBASE_AUTH_DOMAIN: string;
	export const VITE_FIREBASE_PROJECT_ID: string;
	export const VITE_FIREBASE_STORAGE_BUCKET: string;
	export const VITE_FIREBASE_MESSAGING_SENDER_ID: string;
	export const VITE_FIREBASE_APP_ID: string;
	export const VITE_FIREBASE_DATABASE_URL: string;
	export const SHELL: string;
	export const npm_command: string;
	export const USER_ZDOTDIR: string;
	export const npm_config_userconfig: string;
	export const COLORTERM: string;
	export const __HM_SESS_VARS_SOURCED: string;
	export const XDG_CONFIG_DIRS: string;
	export const npm_config_cache: string;
	export const XPC_FLAGS: string;
	export const TERM_PROGRAM_VERSION: string;
	export const CURRENT_AGENT_FILE: string;
	export const HISTSIZE: string;
	export const NODE: string;
	export const __CFBundleIdentifier: string;
	export const SSH_AUTH_SOCK: string;
	export const MallocNanoZone: string;
	export const COLOR: string;
	export const npm_config_local_prefix: string;
	export const PLAYWRIGHT_TEST: string;
	export const npm_config_globalconfig: string;
	export const ANTIGRAVITY_CLI_ALIAS: string;
	export const EDITOR: string;
	export const HIST_REDUCE_BLANKS: string;
	export const PWD: string;
	export const NIX_PROFILES: string;
	export const LOGNAME: string;
	export const NIX_PATH: string;
	export const npm_config_init_module: string;
	export const __NIX_DARWIN_SET_ENVIRONMENT_DONE: string;
	export const _: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const DEBUG_COLORS: string;
	export const VSCODE_INJECTION: string;
	export const PICO_SDK_PATH: string;
	export const COMMAND_MODE: string;
	export const HOME: string;
	export const LANG: string;
	export const npm_package_version: string;
	export const VSCODE_PROFILE_INITIALIZED: string;
	export const NIX_SSL_CERT_FILE: string;
	export const FORCE_COLOR: string;
	export const TMPDIR: string;
	export const GIT_ASKPASS: string;
	export const PROMPT_COMMAND: string;
	export const SAVEHIST: string;
	export const INIT_CWD: string;
	export const NIX_USER_PROFILE_DIR: string;
	export const npm_lifecycle_script: string;
	export const VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
	export const VSCODE_PYTHON_AUTOACTIVATE_GUARD: string;
	export const npm_config_npm_version: string;
	export const TERM: string;
	export const npm_package_name: string;
	export const npm_config_prefix: string;
	export const ZDOTDIR: string;
	export const USER: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const npm_lifecycle_event: string;
	export const SHLVL: string;
	export const __HM_ZSH_SESS_VARS_SOURCED: string;
	export const PAGER: string;
	export const ANTIGRAVITY_AGENT: string;
	export const XPC_SERVICE_NAME: string;
	export const npm_config_user_agent: string;
	export const TERMINFO_DIRS: string;
	export const npm_execpath: string;
	export const npm_package_json: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const XDG_DATA_DIRS: string;
	export const BROWSER: string;
	export const npm_config_noproxy: string;
	export const PATH: string;
	export const npm_config_node_gyp: string;
	export const npm_config_global_prefix: string;
	export const npm_node_execpath: string;
	export const __CF_USER_TEXT_ENCODING: string;
	export const TERM_PROGRAM: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		VITE_FIREBASE_API_KEY: string;
		VITE_FIREBASE_AUTH_DOMAIN: string;
		VITE_FIREBASE_PROJECT_ID: string;
		VITE_FIREBASE_STORAGE_BUCKET: string;
		VITE_FIREBASE_MESSAGING_SENDER_ID: string;
		VITE_FIREBASE_APP_ID: string;
		VITE_FIREBASE_DATABASE_URL: string;
		SHELL: string;
		npm_command: string;
		USER_ZDOTDIR: string;
		npm_config_userconfig: string;
		COLORTERM: string;
		__HM_SESS_VARS_SOURCED: string;
		XDG_CONFIG_DIRS: string;
		npm_config_cache: string;
		XPC_FLAGS: string;
		TERM_PROGRAM_VERSION: string;
		CURRENT_AGENT_FILE: string;
		HISTSIZE: string;
		NODE: string;
		__CFBundleIdentifier: string;
		SSH_AUTH_SOCK: string;
		MallocNanoZone: string;
		COLOR: string;
		npm_config_local_prefix: string;
		PLAYWRIGHT_TEST: string;
		npm_config_globalconfig: string;
		ANTIGRAVITY_CLI_ALIAS: string;
		EDITOR: string;
		HIST_REDUCE_BLANKS: string;
		PWD: string;
		NIX_PROFILES: string;
		LOGNAME: string;
		NIX_PATH: string;
		npm_config_init_module: string;
		__NIX_DARWIN_SET_ENVIRONMENT_DONE: string;
		_: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		DEBUG_COLORS: string;
		VSCODE_INJECTION: string;
		PICO_SDK_PATH: string;
		COMMAND_MODE: string;
		HOME: string;
		LANG: string;
		npm_package_version: string;
		VSCODE_PROFILE_INITIALIZED: string;
		NIX_SSL_CERT_FILE: string;
		FORCE_COLOR: string;
		TMPDIR: string;
		GIT_ASKPASS: string;
		PROMPT_COMMAND: string;
		SAVEHIST: string;
		INIT_CWD: string;
		NIX_USER_PROFILE_DIR: string;
		npm_lifecycle_script: string;
		VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
		VSCODE_PYTHON_AUTOACTIVATE_GUARD: string;
		npm_config_npm_version: string;
		TERM: string;
		npm_package_name: string;
		npm_config_prefix: string;
		ZDOTDIR: string;
		USER: string;
		VSCODE_GIT_IPC_HANDLE: string;
		npm_lifecycle_event: string;
		SHLVL: string;
		__HM_ZSH_SESS_VARS_SOURCED: string;
		PAGER: string;
		ANTIGRAVITY_AGENT: string;
		XPC_SERVICE_NAME: string;
		npm_config_user_agent: string;
		TERMINFO_DIRS: string;
		npm_execpath: string;
		npm_package_json: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		XDG_DATA_DIRS: string;
		BROWSER: string;
		npm_config_noproxy: string;
		PATH: string;
		npm_config_node_gyp: string;
		npm_config_global_prefix: string;
		npm_node_execpath: string;
		__CF_USER_TEXT_ENCODING: string;
		TERM_PROGRAM: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
