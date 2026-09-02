<script lang="ts">
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    void goto(`${base}/dashboard`, { replaceState: true });
  });
</script>

<p class="redirect">Opening dashboard…</p>

<style>
  .redirect {
    margin: 0;
    padding: 3rem;
    color: #64748b;
    text-align: center;
  }
</style>
