<script lang="ts">
  import { onMount } from 'svelte';
  import { limitToLast, onValue, push, query, ref, type Unsubscribe } from 'firebase/database';
  import { callFunction } from '$lib/api';
  import { EVENT_TYPES, type Service, type UptimeEvent } from '$lib/events';
  import { rtdb } from '$lib/firebase';
  import { user } from '$lib/stores';

  let isAdmin: boolean | undefined;
  let serviceName = '';
  let serviceUrl = '';
  let error = '';
  let success = '';
  let checking = false;
  let events: UptimeEvent[] = [];

  onMount(() => {
    let unsubscribeAdmin: Unsubscribe | undefined;
    let unsubscribeEvents: Unsubscribe | undefined;

    const unsubscribeUser = user.subscribe((currentUser) => {
      unsubscribeAdmin?.();
      unsubscribeEvents?.();
      unsubscribeAdmin = undefined;
      unsubscribeEvents = undefined;
      events = [];
      isAdmin = undefined;
      if (!currentUser) return;

      unsubscribeAdmin = onValue(ref(rtdb, `admins/${currentUser.uid}`), (snapshot) => {
        isAdmin = snapshot.val() === true;
        unsubscribeEvents?.();
        unsubscribeEvents = undefined;

        if (isAdmin) {
          unsubscribeEvents = onValue(query(ref(rtdb, 'events'), limitToLast(50)), (eventSnapshot) => {
            const value = eventSnapshot.val() as Record<string, UptimeEvent> | null;
            events = value ? Object.values(value).sort((a, b) => b.timestamp - a.timestamp) : [];
          });
        }
      });
    });

    return () => {
      unsubscribeUser();
      unsubscribeAdmin?.();
      unsubscribeEvents?.();
    };
  });

  async function addService(): Promise<void> {
    error = '';
    success = '';
    const currentUser = $user;
    if (!currentUser || !isAdmin) {
      error = 'Administrator access required.';
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(serviceUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('Unsupported protocol');
    } catch {
      error = 'Enter a valid HTTP or HTTPS URL.';
      return;
    }

    const name = serviceName.trim();
    if (!name) {
      error = 'Service name is required.';
      return;
    }

    const service: Service = {
      id: crypto.randomUUID(),
      name,
      url: parsedUrl.toString(),
      createdAt: Date.now(),
      createdBy: currentUser.email || currentUser.uid
    };
    const event: UptimeEvent = {
      type: EVENT_TYPES.ADD_SERVICE,
      payload: service,
      timestamp: Date.now(),
      user: currentUser.email || currentUser.uid
    };

    try {
      await push(ref(rtdb, 'events'), event);
      success = `Service “${name}” queued for monitoring.`;
      serviceName = '';
      serviceUrl = '';
    } catch (caught) {
      error = caught instanceof Error ? caught.message : 'Unable to add service.';
    }
  }

  async function checkNow(): Promise<void> {
    checking = true;
    error = '';
    success = '';
    try {
      const result = await callFunction<{ checked: number }>('manualCheck');
      success = `Completed ${result.checked} service ${result.checked === 1 ? 'check' : 'checks'}.`;
    } catch (caught) {
      error = caught instanceof Error ? caught.message : 'Unable to run checks.';
    } finally {
      checking = false;
    }
  }

  function eventTarget(event: UptimeEvent): string {
    const payload = event.payload as { name?: unknown; id?: unknown } | null;
    if (typeof payload?.name === 'string') return payload.name;
    if (typeof payload?.id === 'string') return payload.id;
    return '—';
  }
</script>

<section class="page">
  <header>
    <div>
      <p class="eyebrow">Configuration</p>
      <h1>Admin Panel</h1>
    </div>
    {#if isAdmin}
      <button class="secondary" onclick={checkNow} disabled={checking}>
        {checking ? 'Checking…' : 'Check now'}
      </button>
    {/if}
  </header>

  {#if isAdmin === undefined}
    <div class="notice">Checking administrator access…</div>
  {:else if !isAdmin}
    <div class="notice denied" role="alert">
      <h2>Administrator access required</h2>
      <p>Your account is authenticated but is not listed under <code>admins/&lt;uid&gt;</code>.</p>
    </div>
  {:else}
    {#if error}<p class="feedback error" role="alert">{error}</p>{/if}
    {#if success}<p class="feedback success" role="status">{success}</p>{/if}

    <div class="columns">
      <form onsubmit={(event) => { event.preventDefault(); void addService(); }}>
        <h2>Add service</h2>
        <label for="name">Service name</label>
        <input id="name" bind:value={serviceName} maxlength="100" placeholder="Example API" required />

        <label for="url">Service URL</label>
        <input id="url" bind:value={serviceUrl} type="url" placeholder="https://example.com/health" required />

        <button type="submit">Add service</button>
      </form>

      <section class="event-log">
        <h2>Recent events</h2>
        {#if events.length === 0}
          <p class="empty">No events found.</p>
        {:else}
          <div class="table-wrap">
            <table>
              <thead><tr><th>Time</th><th>Type</th><th>Target</th></tr></thead>
              <tbody>
                {#each events as event}
                  <tr>
                    <td data-screenshot-dynamic>{new Date(event.timestamp).toLocaleString()}</td>
                    <td><code>{event.type}</code></td>
                    <td>{eventTarget(event)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </section>
    </div>
  {/if}
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
  h2,
  .eyebrow {
    margin: 0;
  }

  h1 {
    font-size: clamp(1.8rem, 5vw, 2.5rem);
    letter-spacing: -0.03em;
  }

  h2 {
    margin-bottom: 1.25rem;
    font-size: 1.15rem;
  }

  .eyebrow {
    margin-bottom: 0.35rem;
    color: #2563eb;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .columns {
    display: grid;
    grid-template-columns: minmax(18rem, 0.75fr) minmax(24rem, 1.25fr);
    gap: 1rem;
  }

  form,
  .event-log,
  .notice {
    padding: 1.4rem;
    border: 1px solid #dbe3ee;
    border-radius: 0.65rem;
    background: #ffffff;
  }

  label {
    display: block;
    margin: 0.9rem 0 0.4rem;
    color: #334155;
    font-size: 0.85rem;
    font-weight: 700;
  }

  input {
    width: 100%;
    padding: 0.7rem 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.4rem;
    color: #172033;
    background: #ffffff;
    font: inherit;
  }

  input:focus {
    border-color: #2563eb;
    outline: 2px solid #bfdbfe;
  }

  button {
    margin-top: 1.25rem;
    padding: 0.7rem 1rem;
    border: 0;
    border-radius: 0.4rem;
    color: #ffffff;
    background: #2563eb;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
  }

  form button {
    width: 100%;
  }

  button:hover:not(:disabled),
  button:focus-visible {
    background: #1d4ed8;
  }

  button:disabled {
    cursor: wait;
    opacity: 0.65;
  }

  button.secondary {
    margin: 0;
    color: #1e3a5f;
    background: #e2e8f0;
  }

  .feedback {
    margin: 0 0 1rem;
    padding: 0.8rem 1rem;
    border-radius: 0.4rem;
  }

  .feedback.error,
  .notice.denied {
    color: #991b1b;
    background: #fef2f2;
  }

  .feedback.success {
    color: #166534;
    background: #f0fdf4;
  }

  .notice p,
  .empty {
    margin: 0;
    color: #64748b;
  }

  .table-wrap {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 0.82rem;
  }

  th:first-child,
  td:first-child {
    width: 42%;
    font-variant-numeric: tabular-nums;
  }

  th:nth-child(2),
  td:nth-child(2) {
    width: 31%;
  }

  td {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  th,
  td {
    padding: 0.65rem 0.5rem;
    border-bottom: 1px solid #edf1f6;
    text-align: left;
  }

  th {
    color: #64748b;
    font-size: 0.68rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  @media (max-width: 760px) {
    .columns {
      grid-template-columns: 1fr;
    }
  }
</style>
