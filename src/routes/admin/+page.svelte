<script lang="ts">
  import { auth, rtdb, signIn, signOut } from '$lib/firebase';
  import { onAuthStateChanged, type User } from 'firebase/auth';
  import { ref, push, onValue } from 'firebase/database';
  import { onMount } from 'svelte';
  import { EVENT_TYPES, type UptimeEvent, type Service } from '$lib/events';

  let user: User | null = null;
  let serviceName = '';
  let serviceUrl = '';
  let error = '';
  let success = '';
  let events: UptimeEvent[] = [];

  onMount(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      user = u;
    });

    // Listen to recent events (optional, for feedback)
    // In a real app we might query recent events
    // For MVP, knowing it was pushed is enough, but visualizing events is cool.
    // However, I didn't verify rule allow read of events?
    // Rule: events read: auth != null && root.child('admins').hasChild(auth.uid)
    // So if I am admin I can read.
    
    // Only subscribe if user is present
    return () => unsubscribe();
  });
  
  // Reactive subscription to events if user is logged in
  $: if (user) {
      const eventsRef = ref(rtdb, 'events');
      // Limit to last 50?
      // For MVP just simple onValue
      onValue(eventsRef, (snapshot) => {
          const val = snapshot.val();
          if (val) {
              events = Object.values(val).sort((a: any, b: any) => b.timestamp - a.timestamp) as UptimeEvent[];
          } else {
              events = [];
          }
      }, (err) => {
          console.error("Error reading events:", err);
      });
  }

  async function addService() {
    if (!serviceName || !serviceUrl) {
      error = 'Name and URL are required';
      return;
    }
    
    try {
      const newService: Service = {
        id: crypto.randomUUID(), // specific ID generation on client? Or let server? Client is fine for MVP.
        name: serviceName,
        url: serviceUrl,
        createdAt: Date.now(),
        createdBy: user?.email || user?.uid
      };

      const event: Omit<UptimeEvent, 'id'> = {
        type: EVENT_TYPES.ADD_SERVICE,
        payload: newService,
        timestamp: Date.now(),
        user: user?.email || user?.uid
      };

      // Push to events
      await push(ref(rtdb, 'events'), event);
      
      success = `Service "${serviceName}" add event dispatched!`;
      serviceName = '';
      serviceUrl = '';
      error = '';
      
      setTimeout(() => success = '', 3000);
    } catch (e: any) {
      console.error(e);
      error = e.message;
    }
  }
</script>

<div class="container mx-auto p-4 max-w-2xl">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Admin Dashboard</h1>
    {#if user}
      <button on:click={signOut} class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Sign Out</button>
    {:else}
      <button on:click={signIn} class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Sign In with Google</button>
    {/if}
  </div>

  {#if user}
    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Add New Service</h2>
      
      {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      {/if}
      
      {#if success}
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>
      {/if}

      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="name">Service Name</label>
        <input 
          bind:value={serviceName}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
          id="name" 
          type="text" 
          placeholder="e.g. Google"
        >
      </div>
      
      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="url">Service URL</label>
        <input 
          bind:value={serviceUrl}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
          id="url" 
          type="url" 
          placeholder="https://google.com"
        >
      </div>
      
      <button 
        on:click={addService}
        class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
      >
        Dispatch Add Event
      </button>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">Event Log</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full leading-normal">
          <thead>
            <tr>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Target</th>
            </tr>
          </thead>
          <tbody>
            {#each events as event}
              <tr>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {new Date(event.timestamp).toLocaleString()}
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {event.type === 'ADD_SERVICE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                    {event.type}
                  </span>
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {#if event.payload && event.payload.name}
                    {event.payload.name}
                  {:else}
                    -
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        {#if events.length === 0}
            <p class="text-center text-gray-500 py-4">No events found.</p>
        {/if}
      </div>
    </div>
  {:else}
    <div class="text-center py-20">
      <p class="text-xl text-gray-600 mb-4">Please sign in to access admin controls.</p>
    </div>
  {/if}
</div>
