<script lang="ts">
  import { onMount } from 'svelte';
  import { onValue, ref } from 'firebase/database';
  import { rtdb } from '$lib/firebase';
  import type { Service, ServiceStatus } from '$lib/events';

  let services: Record<string, Service> = {};
  let statuses: Record<string, ServiceStatus> = {};
  let loading = true;
  let loadError = '';

  onMount(() => {
    const unsubscribeServices = onValue(
      ref(rtdb, 'services'),
      (snapshot) => {
        services = snapshot.val() || {};
        loading = false;
      },
      () => {
        loadError = 'Unable to load monitored services.';
        loading = false;
      }
    );
    const unsubscribeStatuses = onValue(ref(rtdb, 'status'), (snapshot) => {
      statuses = snapshot.val() || {};
    });

    return () => {
      unsubscribeServices();
      unsubscribeStatuses();
    };
  });
</script>

{#if loading}
  <div class="message" data-testid="services-loading">Loading services…</div>
{:else if loadError}
  <div class="message error" role="alert">{loadError}</div>
{:else if Object.keys(services).length === 0}
  <div class="message">No services monitored yet.</div>
{:else}
  <div class="grid">
    {#each Object.values(services) as service (service.id)}
      {@const status = statuses[service.id]}
      <article>
        <header>
          <h2 title={service.name}>{service.name}</h2>
          <span class:up={status?.up} class:down={status && !status.up} class="badge">
            {status ? (status.up ? 'OPERATIONAL' : 'DOWN') : 'PENDING'}
          </span>
        </header>
        <a href={service.url} target="_blank" rel="noopener noreferrer">{service.url}</a>
        <dl>
          <div>
            <dt>Latency</dt>
            <dd data-screenshot-dynamic>{status ? `${status.latency}ms` : '—'}</dd>
          </div>
          <div>
            <dt>HTTP status</dt>
            <dd>{status?.statusCode ?? '—'}</dd>
          </div>
          <div>
            <dt>Last checked</dt>
            <dd data-screenshot-dynamic>{status ? new Date(status.lastChecked).toLocaleTimeString() : '—'}</dd>
          </div>
        </dl>
        {#if status?.error}<p class="status-error">{status.error}</p>{/if}
      </article>
    {/each}
  </div>
{/if}

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
    gap: 1rem;
  }

  article,
  .message {
    border: 1px solid #dbe3ee;
    border-radius: 0.65rem;
    background: #ffffff;
  }

  article {
    padding: 1.25rem;
    box-shadow: 0 0.4rem 1.25rem rgb(15 23 42 / 5%);
  }

  article header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
  }

  h2 {
    overflow: hidden;
    margin: 0;
    font-size: 1.15rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  article > a {
    display: block;
    overflow: hidden;
    margin-top: 0.65rem;
    color: #2563eb;
    font-size: 0.875rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .badge {
    flex: none;
    padding: 0.25rem 0.45rem;
    border-radius: 999px;
    color: #475569;
    background: #e2e8f0;
    font-size: 0.65rem;
    font-weight: 800;
  }

  .badge.up {
    color: #166534;
    background: #dcfce7;
  }

  .badge.down {
    color: #991b1b;
    background: #fee2e2;
  }

  dl {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin: 1.1rem 0 0;
    padding-top: 1rem;
    border-top: 1px solid #edf1f6;
  }

  dt {
    color: #64748b;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  dd {
    margin: 0.25rem 0 0;
    font-size: 0.85rem;
    font-weight: 700;
  }

  .message {
    min-height: 12rem;
    display: grid;
    place-items: center;
    padding: 2rem;
    color: #64748b;
    border-style: dashed;
  }

  .message.error,
  .status-error {
    color: #b91c1c;
  }

  .status-error {
    margin: 0.9rem 0 0;
    padding: 0.6rem;
    border-radius: 0.35rem;
    background: #fef2f2;
    font-size: 0.8rem;
  }
</style>
