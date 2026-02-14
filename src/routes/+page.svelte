<script>
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { onMount } from 'svelte';

    onMount(() => {
        goto(`${base}/dashboard`);
    });
</script>

<div class="center-screen">
    <p>Redirecting to Dashboard...</p>
</div>

<style>
    .center-screen {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }
</style>
