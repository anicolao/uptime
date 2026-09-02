<script lang="ts">
    import { signIn, signOut } from '$lib/firebase';
    import { user } from '$lib/stores';

</script>

{#if $user}
    <div class="user-profile">
        <span>{$user.displayName || $user.email}</span>
        <button onclick={signOut}>Sign Out</button>
    </div>
{:else}
    <button onclick={signIn}>Sign in with Google</button>
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
        border-radius: 0.4rem;
        cursor: pointer;
        font-weight: bold;
    }
    button:hover {
        background: #357ae8;
    }
</style>
