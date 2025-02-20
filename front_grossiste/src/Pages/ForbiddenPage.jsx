import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ForbiddenPage = ({ redirectTo }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(redirectTo, { replace: true });
    }, 2000); // Redirige après 3 secondes

    return () => clearTimeout(timer);
  }, [navigate, redirectTo]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>403 - Accès Refusé</h1>
      <p>Vous serez redirigé vers votre page d'accueil...</p>
    </div>
  );
};

export default ForbiddenPage;
