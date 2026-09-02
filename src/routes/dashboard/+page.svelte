<script lang="ts">
  import StatusDashboard from '$lib/components/StatusDashboard.svelte';
</script>

<section class="page">
  <header>
    <div>
      <p class="eyebrow">Live monitoring</p>
      <h1>Uptime Dashboard</h1>
    </div>
    <span>Updates automatically</span>
  </header>
  <StatusDashboard />
</section>

<style>
  .page {
    width: min(100% - 2rem, 72rem);
    margin: 0 auto;
    padding: 2.5rem 0;
  }

  header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.75rem;
  }

  h1,
  .eyebrow {
    margin: 0;
  }

  h1 {
    font-size: clamp(1.8rem, 5vw, 2.5rem);
    letter-spacing: -0.03em;
  }

  .eyebrow {
    margin-bottom: 0.35rem;
    color: #2563eb;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  header span {
    color: #64748b;
    font-size: 0.875rem;
  }
</style>
