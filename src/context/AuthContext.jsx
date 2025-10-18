import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext()

export const AuthContextProvider = ({children}) => {
    const [session, setSession] = useState(undefined);

    //SignUp

    const signUpNewUser = async (full_name, email, password) => {
        const {data, error} = await supabase.auth.signUp({
            email: email.toLowerCase(),
            password: password,
            options: {
                data: {full_name}
            }
        });

        if (error) {
            console.error("there was a problem signing up" , error);
            return {success: false, error};
        }
        return {success: true, data};
    };

    useEffect(() => {
        supabase.auth.getSession().then(( {data: { session}}) => {
            setSession(session);
        })

        supabase.auth.onAuthStateChange((_envent, session) => {
            setSession(session);
        })
    }, []);

    // SignIn

    const signInUser = async (email, password) => {
        try {
            const {data, error} = await supabase.auth.signInWithPassword({
                email: email.toLowerCase(),
                password: password,
            });
            if (error) {
            console.error("sign in error occured: ", error.message)
            return {success: false, error: error.message};
            }
            console.log("sign-in success: ", data);
            return { success: true, data };
            } catch (error) {
                console.error("an error occured: ", error);
            }
        }

    // SignOut

    const signOut = () => {
        const {error} = supabase.auth.signOut();
        if(error) {
            console.error("there was an error:", error);
        }
    }

    return (
        <AuthContext.Provider value={{ session, signUpNewUser, signInUser, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext);
};