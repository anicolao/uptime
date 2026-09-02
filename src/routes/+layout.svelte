<script lang="ts">
  import { base } from '$app/paths';
  import ComponentVersions from '$lib/components/ComponentVersions.svelte';
  import Signin from '$lib/components/Signin.svelte';
  import { user } from '$lib/stores';
</script>

{#if $user === undefined}
  <div class="center-screen" data-testid="auth-loading">Loading…</div>
{:else if $user}
  <nav aria-label="Primary navigation">
    <div class="links">
      <a href={`${base}/dashboard`}>Dashboard</a>
      <a href={`${base}/admin`}>Admin</a>
    </div>
    <Signin />
  </nav>
  <main><slot /></main>
  <ComponentVersions />
{:else}
  <main class="center-screen">
    <section class="auth-card">
      <h1>Authentication Required</h1>
      <p>Please sign in to access the Uptime Monitor.</p>
      <Signin />
    </section>
  </main>
{/if}

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(html) {
    color-scheme: light;
    background: #f8fafc;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  :global(body) {
    min-width: 320px;
    min-height: 100vh;
    margin: 0;
    color: #172033;
    background: #f8fafc;
  }

  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 4rem;
    padding: 0.75rem clamp(1rem, 4vw, 3rem);
    border-bottom: 1px solid #dbe3ee;
    background: #ffffff;
  }

  .links {
    display: flex;
    gap: 1.25rem;
  }

  a {
    color: #1e3a5f;
    font-weight: 700;
    text-decoration: none;
  }

  a:hover,
  a:focus-visible {
    color: #2563eb;
    text-decoration: underline;
  }

  main:not(.center-screen) {
    min-height: calc(100vh - 8.25rem);
  }

  .center-screen {
    display: grid;
    min-height: 100vh;
    place-items: center;
    padding: 1rem;
  }

  .auth-card {
    width: min(100%, 30rem);
    padding: 2.5rem;
    border: 1px solid #dbe3ee;
    border-radius: 0.75rem;
    background: #ffffff;
    box-shadow: 0 1rem 2.5rem rgb(15 23 42 / 8%);
    text-align: center;
  }

  .auth-card h1 {
    margin: 0 0 0.75rem;
    font-size: 1.75rem;
  }

  .auth-card p {
    margin: 0 0 1.5rem;
    color: #64748b;
  }

  @media (max-width: 560px) {
    nav {
      align-items: flex-start;
      gap: 1rem;
    }
  }
</style>
