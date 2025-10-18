
import './App.css'

import AuthRedirectListener from './Components/UAuth/AuthRedirectListener.jsx';

//import useAuthListener from './hooks/useAuthListener.js'

  export default function App() {
    // const { user, loading } = useAuthListener();

    //  if (loading) return <p>Loading...</p>;


    return (<>
    <AuthRedirectListener />
    </>
    );
  }
