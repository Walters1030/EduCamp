

import './index.css';
import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";
import VerifyEmail from "./components/VerifyEmail";
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Addproduct from './components/Addproduct';
import Liked from './components/Liked';
import Productdetails from './components/Productdetails';
import Category from './components/Category';
import Myproducts from './components/Myproducts';
import Myprofile from './components/Myprofile';
import Tutor from './components/Tutor';
import Tutordetails from './components/Tutordetails';
import Userproducts from './components/Userproducts'; 
import ResetPassword from "./components/ResetPassword";
import MyTeaching from './components/MyTeaching';
import UserProfile from './components/UserProfile';
import ChatPage from './components/chat';
import Dashboard from './components/Dashboard';


const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Home />
    ),
  },
  {
    path: "about",
    element: <div>About</div>,
  },
  {
    path: "/login",
    element: (<Login />),
  },
  {
    path: "/Signup",
    element: (<Signup />),
  },
  {
    path: "/Addproduct",
    element: (<Addproduct />),
  },
  {
    path: "/Liked",
    element: (<Liked />),
  },
  {
    path: "/product/:productId",
    element: (<Productdetails />),
  },
  {
    path: "/Category/:catName",
    element: (<Category />),
  },
  {
    path: "/Myproducts",
    element: (<Myproducts />),
  },
  {
    path: "/Myprofile",
    element: (<Myprofile />),
  },
  {
    path: "/Tutor",
    element: (<Tutor />),
  },
  {
    path: "/Tutordetails/:productId",
    element: (<Tutordetails />),
  },
  {
    path: "/userproducts/:userId",  // Updated route
    element: <Userproducts />,
  },{
 path: "/verify-email" ,
 element: <VerifyEmail />},
 {
  path: "/reset-password/:token" ,
  element: <ResetPassword />
 },
 {
  path: "/MyTeaching",
  element: <MyTeaching />
 },{
 path: "/userprofile/:userId",
 element: <UserProfile />
},{
  path: "/chat",
  element: <ChatPage />
 },{
  path: "/admin",
  element: <Dashboard />
 }
]);



createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);




