<script lang="ts">
  import { onMount } from 'svelte';
  import { callFunction } from '$lib/api';
  import type { ComponentVersions } from '$lib/events';

  const webGitSha = import.meta.env.VITE_GIT_SHA || 'development';
  let versions: ComponentVersions | null = null;
  let unavailable = false;

  function displaySha(value: string): string {
    return value.slice(0, 12).padEnd(12, '—');
  }

  onMount(() => {
    void callFunction<ComponentVersions>('version')
      .then((result) => {
        versions = result;
      })
      .catch(() => {
        unavailable = true;
      });
  });
</script>

<footer aria-label="Component versions" data-testid="component-versions">
  <span>Web <code title={webGitSha} data-screenshot-dynamic>{displaySha(webGitSha)}</code></span>
  {#if versions}
    <span>Functions <code title={versions.functions} data-screenshot-dynamic>{displaySha(versions.functions)}</code></span>
    <span>Database rules <code title={versions.databaseRules} data-screenshot-dynamic>{displaySha(versions.databaseRules)}</code></span>
  {:else if unavailable}
    <span data-testid="backend-version-unavailable">Backend versions unavailable</span>
  {:else}
    <span data-testid="backend-version-loading">Loading backend versions…</span>
  {/if}
</footer>

<style>
  footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem 1.25rem;
    padding: 1.25rem;
    color: #64748b;
    font-size: 0.75rem;
  }

  code {
    display: inline-block;
    width: 12ch;
    margin-left: 0.25rem;
    color: #334155;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }
</style>
