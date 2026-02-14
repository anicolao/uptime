import { writable } from 'svelte/store';
import { auth } from './firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { browser } from '$app/environment';

export const user = writable<User | null>(null);

if (browser && auth) {
    onAuthStateChanged(auth, (u) => {
        user.set(u);
    });
}
