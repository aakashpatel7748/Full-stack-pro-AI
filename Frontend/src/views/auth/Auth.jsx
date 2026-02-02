import React from 'react'
import "./Auth.css"

const Auth = () => {

    const handelGoogleSignIn = () => {
        const apiBase = import.meta.env.VITE_API_URL || "https://full-stack-pro-ai.onrender.com"
        window.location.href = (`${apiBase}/api/auth/google`)
    }

    return (
        <main className='auth-main'>
            <section className='auth-section'>
                <button
                    onClick={handelGoogleSignIn}
                    className='continue-with-google'>
                    Continue With Google
                </button>
            </section>
        </main>
    )
}

export default Auth