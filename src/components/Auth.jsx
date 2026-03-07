import { useState } from 'react';
import { supabase } from '../supabaseClient'; 

export default function Auth({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        
        if (password.length < 6) {
            setLoading(false);
            setErrorMessage('Password must be at least 6 characters long.');
            return;
        }
        
        setLoading(true);

        let error, data;
        if (mode === 'signin') {
            const res = await supabase.auth.signInWithPassword({ email, password });
            error = res.error;
            data = res.data;
        } else {
            const res = await supabase.auth.signUp({ email, password });
            error = res.error;
            data = res.data;
        }
        setLoading(false);
        if (error) {
            if (mode === 'signup' && error.code === 'user_already_exists' || error.message.includes('already registered')) {
                setErrorMessage('User already exists. Please sign in instead.');
            } else {
                setErrorMessage(error.message);
            }
            return;
        } else if (mode === 'signin') {
            onLoginSuccess();
        } else if (data?.user) { // signup success
            setSuccessMessage('Sign up successful! Please check your email to confirm your account.');
            setMode('signin');
            setEmail('');
            setPassword('');
        }
    };

    // const googleLogin = async () => {
    //     try {
    //         setLoading(true);
    //         setError(null);

    //         const redirectUrl = Chrome.identity.getRedirectURL();

    //         const { data, error: signInError } = await supabase.auth.signInwithOAuth({
    //             provider: 'google',

    //         })
    //     }
    // }

    return (
        <div className="auth-page">
            <h3>{mode === 'signin' ? 'Welcome back to LangNudge!' : 'Welcome to LangNudge!'}</h3>
            <p style={{ fontSize: 12, marginBottom: 20, marginInline: '10px' }}>Get microdoses of vocabulary during your day</p>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', rowGap: '7px', marginBottom: 0}}>
                {errorMessage && <p style={{ color: 'red', fontSize: '9px', padding: 0, margin: 0 }}>{errorMessage}</p>}
                {successMessage && <p style={{ color: 'green', fontSize: '9px', padding: 0, margin: 0 }}>{successMessage}</p>}
                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', rowGap: '7px', marginBottom: '0px' }}>
                    <input type="email" placeholder="Email" className='text-input' value={email} onChange={(e) => setEmail(e.target.value)} required style={{width: '80%'}}/>
                    <input type="password" placeholder="Password" className='text-input' value={password} onChange={(e) => setPassword(e.target.value)} required style={{width: '80%'}}/>
                    <button type="submit" style={{marginBottom: '0px'}} disabled={loading}>
                        {loading ? 'Loading...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>
            
                <p style={{display: 'flex', flexDirection: 'row', fontSize: '10px', marginTop: '0px', columnGap: '3px'}}>
                    <span>{mode === 'signin' ? "Don't have an account?" : "Already have an account?"}</span>
                    <span 
                        onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
                        style={{ 
                            color: '#007bff',      
                            cursor: 'pointer',     
                            textDecoration: 'underline', 
                            fontWeight: 'bold'
                        }}
                    >
                        {mode === 'signin' ? "Sign Up" : "Sign In"}
                    </span>
                </p>
            </div>
        </div>
    );
}


