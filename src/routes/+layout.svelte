<script>
    import { base } from '$app/paths';
    import Signin from '$lib/components/Signin.svelte';
    import { user } from '$lib/stores';
</script>

{#if $user === undefined}
    <div class="center-screen">Loading...</div>
{:else if $user}
    <nav>
        <div class="links">
            <a href="{base}/">Home</a>
            <a href="{base}/dashboard">Dashboard</a>
            <a href="{base}/admin">Admin</a>
        </div>
        <Signin />
    </nav>

    <slot />
{:else}
    <div class="center-screen">
        <h1>Authentication Required</h1>
        <p>Please sign in to access the Uptime Monitor.</p>
        <Signin />
    </div>
{/if}

<style>
    nav {
        padding: 1rem;
        background: #f4f4f4;
        margin-bottom: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    a {
        margin-right: 1rem;
        text-decoration: none;
        color: #333;
        font-weight: bold;
    }
    a:hover {
        text-decoration: underline;
    }
    .center-screen {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        gap: 1rem;
    }
</style>
