<script>
    import { base } from '$app/paths';
    import Signin from '$lib/components/Signin.svelte';
</script>

<nav>
    <div class="links">
        <a href="{base}/">Home</a>
        <a href="{base}/dashboard">Dashboard</a>
        <a href="{base}/admin">Admin</a>
    </div>
    <Signin />
</nav>

<slot />

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
</style>
