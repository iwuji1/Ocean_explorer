import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Signup from "./Components/UAuth/Signup";
import Signin from "./Components/UAuth/Signin";
import Dashboard from "./Components/UAuth/Dashboard";
import PrivateRoute from "./Components/UAuth/PrivateRoute";
import HomeMap from "./Components/MapModes/HomeMap";
import MainMap from "./Components/MapModes/MainMap";

export const router = createBrowserRouter([
    {path: "/", element: <HomeMap />},
    {path: "/signup", element: <Signup />},
    {path: "/signin", element: <Signin />},
    {
        path: "/dashboard", 
        element: (
        <PrivateRoute>
            <Dashboard />
        </PrivateRoute>
        ),
    },
    {path: "/mainmap", element: (
        <PrivateRoute>
         <MainMap />
        </PrivateRoute>
        )},
]);