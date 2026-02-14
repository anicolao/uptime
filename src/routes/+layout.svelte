<nav>
    <a href="/">Home</a>
    <a href="/dashboard">Dashboard</a>
    <a href="/admin">Admin</a>
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
