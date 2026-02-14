<script>
    import { base } from '$app/paths';
</script>

<nav>
    <a href="{base}/">Home</a>
    <a href="{base}/dashboard">Dashboard</a>
    <a href="{base}/admin">Admin</a>
</nav>

<slot />

<style>
    nav {
        padding: 1rem;
        background: #f4f4f4;
        margin-bottom: 2rem;
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
