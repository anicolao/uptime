<script lang="ts">
  import StatusDashboard from '$lib/components/StatusDashboard.svelte';
</script>

<div class="container mx-auto p-4">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-4xl font-bold text-gray-800">System Status</h1>
    <div class="text-sm text-gray-500">
        Updates automatically
    </div>
  </div>

  <StatusDashboard />
  
  <div class="mt-12 text-center text-gray-400 text-sm">
      <a href="/admin" class="hover:underline">Admin Login</a>
  </div>
</div>
