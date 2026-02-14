<script>
    import { logEvent } from '$lib/events';
    
    let serviceName = '';
    let serviceUrl = '';
    let interval = 1;

    async function addService() {
        if (!serviceName || !serviceUrl) return;

        await logEvent('SERVICE_ADDED', {
            id: crypto.randomUUID(),
            name: serviceName,
            url: serviceUrl,
            interval: Number(interval)
        });
        
        serviceName = '';
        serviceUrl = '';
        alert('Service Added! (Event Logged)');
    }
</script>

<h1>Admin Panel</h1>

<div class="card">
    <h2>Add New Service</h2>
    <label>
        Name: <input bind:value={serviceName} placeholder="My API" />
    </label>
    <label>
        URL: <input bind:value={serviceUrl} placeholder="https://api.example.com" />
    </label>
    <label>
        Interval (min): <input type="number" bind:value={interval} min="1" />
    </label>
    <button on:click={addService}>Add Service</button>
</div>

<style>
    .card {
        border: 1px solid #ddd;
        padding: 1rem;
        max-width: 500px;
    }
    label {
        display: block;
        margin-bottom: 0.5rem;
    }
    input {
        margin-left: 0.5rem;
    }
</style>
