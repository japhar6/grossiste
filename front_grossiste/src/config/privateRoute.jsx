

import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({alloWedRoles}) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
 if (!token) {
  return <Navigate to="/" replace /> ;
 }

 if (!alloWedRoles.includes(role))
 {
  return <Navigate to="/" replace /> ;
 }
return <Outlet /> ;

};

export default PrivateRoute;
