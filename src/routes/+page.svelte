<script lang="ts">
  import { base } from '$app/paths';
  import { rtdb } from '$lib/firebase';
  import { ref, onValue } from 'firebase/database';
  import { onMount } from 'svelte';
  import type { Service, ServiceStatus } from '$lib/events';

  let services: Record<string, Service> = {};
  let statuses: Record<string, ServiceStatus> = {};
  let loading = true;

  onMount(() => {
    // Listen for services
    const servicesRef = ref(rtdb, 'services');
    const unsubServices = onValue(servicesRef, (snapshot) => {
      services = snapshot.val() || {};
      loading = false;
    });

    // Listen for live status
    const statusRef = ref(rtdb, 'status');
    const unsubStatus = onValue(statusRef, (snapshot) => {
      statuses = snapshot.val() || {};
    });

    return () => {
      unsubServices();
      unsubStatus();
    };
  });
</script>

<div class="container mx-auto p-4">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-4xl font-bold text-gray-800">System Status</h1>
    <div class="text-sm text-gray-500">
        Updates automatically
    </div>
  </div>

  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  {:else if Object.keys(services).length === 0}
    <div class="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
      <p class="text-xl text-gray-500">No services monitored yet.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each Object.values(services) as service}
        {@const status = statuses[service.id]}
        <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-shadow hover:shadow-lg">
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-xl font-bold text-gray-900 truncate" title={service.name}>{service.name}</h3>
              {#if status}
                <span class={`px-2 py-1 text-xs font-semibold rounded-full ${status.up ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {status.up ? 'OPERATIONAL' : 'DOWN'}
                </span>
              {:else}
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                  PENDING
                </span>
              {/if}
            </div>
            
            <a href={service.url} target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline text-sm mb-4 block truncate">
              {service.url}
            </a>

            <div class="border-t border-gray-100 pt-4 mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span class="block text-gray-500 text-xs uppercase tracking-wider">Latency</span>
                    <span class="font-medium">{status?.latency ? `${status.latency}ms` : '-'}</span>
                </div>
                <div>
                    <span class="block text-gray-500 text-xs uppercase tracking-wider">Last Checked</span>
                    <span class="font-medium">
                        {status?.lastChecked ? new Date(status.lastChecked).toLocaleTimeString() : '-'}
                    </span>
                </div>
            </div>
            
            {#if status?.error}
                <div class="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded">
                    Error: {status.error}
                </div>
            {/if}
          </div>
          <!-- History sparkline could go here -->
        </div>
      {/each}
    </div>
  {/if}
  
  <div class="mt-12 text-center text-gray-400 text-sm">
      <a href="/admin" class="hover:underline">Admin Login</a>
  </div>
</div>
