import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // need jsx

export default function Auth({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    
    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        let error;
        if (mode === 'signin') {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            error = signInError;
        } else {
            const { error: signUpError } = await supabase.auth.signUp({ email, password });
            error = signUpError;
        }

        setLoading(false);
        if (error) {
            alert(error.message);
        } else if (mode === 'signin') {
            onLoginSuccess();
        }
    };

    return (
        <div className="auth-page">
            <h2>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</h2>
            <form onSubmit={handleAuth}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Loading...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
                </button>
            </form>
        
            <p onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>
                {mode === 'signin' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </p>
        </div>
    );
}