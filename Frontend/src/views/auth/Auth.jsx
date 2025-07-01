import React from 'react'
import "./Auth.css"

const Auth = () => {

    const handelGoogleSignIn = () => {
        window.location.href = ("http://localhost:3000/api/auth/google")
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