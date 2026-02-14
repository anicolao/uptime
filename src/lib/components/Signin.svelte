<script lang="ts">
    import { signIn, signOut } from '$lib/firebase';
    import { user } from '$lib/stores';

    // Simple reactive logic
    // In Svelte 5, runelike reactivity is nicer but stores work seamlessly with $ prefix
</script>

{#if $user}
    <div class="user-profile">
        <span>{$user.displayName}</span>
        <button on:click={signOut}>Sign Out</button>
    </div>
{:else}
    <button on:click={signIn}>Sign in with Google</button>
{/if}

<style>
    .user-profile {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    button {
        padding: 0.5rem 1rem;
        background: #4285f4;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
    }
    button:hover {
        background: #357ae8;
    }
</style>
