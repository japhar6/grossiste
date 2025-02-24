// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { useNavigate ,Link} from 'react-router-dom';
import '../Styles/Login.css';
import Swal from "sweetalert2";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import axios from '../api/axios';


function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false); 
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState); // Met à jour l'état pour afficher/masquer le mot de passe
        console.log('Show Password:', !showPassword); // Affiche l'état dans la console
    };
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
    
        try {
            const response = await axios.post('/users/login', {
                email,
                password
            });
    
            // Pas besoin de faire await response.json()
            const data = response.data; // Récupère directement les données
    
            // Pas besoin de vérifier response.ok, Axios lancera une erreur si la réponse n'est pas 2xx
            // Donc, tu peux supprimer ce bloc :
            // if (!response.ok) {
            //     throw new Error(data.message || 'Erreur de connexion');
            // }
    
            // Stocke les informations dans le localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('email', data.user.email);
            localStorage.setItem('role', data.user.role);
            localStorage.setItem('userid', data.user._id);
            localStorage.setItem('nom', data.user.nom);
    
            setSuccess(true);
            setTimeout(() => {
                switch (data.user.role) {
                    case 'admin':
                        navigate('/admin');
                        break;
                    case 'magasinier':
                        navigate('/magasinier');
                        break;
                    case 'vendeur':
                        navigate('/vendeur');
                        break;
                    case 'caissier':
                        navigate('/caissier');
                        break;
                    case 'gestion_prix':
                        navigate('/gestionprix');
                        break;
                    default:
                        navigate('/dashboard');
                }
            }, 1000);
    
        } catch (error) {
            console.log("Erreur de connexion:", error);
    
            Swal.fire({
                title: "Erreur!",
                text: error.response?.data?.message || 'Une erreur est survenue',
                icon: "error",
                confirmButtonText: "Réessayer",
            });
    
            setLoading(false);
        }
    };
    

    return (
        <main className='mainLogin center'>
            <section className='login'>
                <div className="container-fluid center cont">
                    <div className='description p-5'>
                        <h1 className='mb-4'>
                            <b className='gradient-text'>DIGITALISATION GROSSISTE PPN</b> <br />
                            <b className='gradient'> by INNOV-T Madagascar</b>
                        </h1>
                        <p>Optimisez la gestion et la distribution des Produits de Première Nécessité (PPN)...</p>
                        <Link to="/inscription">

                      
                        </Link>
                    </div>
                    <div className='formulaire p-5'>
                        <div className="form p-5">
                            <h1 className='fw-bold gradient-text text-center'>Connexion</h1>
                            <div className="hr"></div>

                            {/* Message d'erreur */}
                            {error && <p className='text-danger text-center'>{error}</p>}

                            {/* Animation de chargement + Message de succès */}
                            {success && (
                                <div className="text-center">
                                    <div className="spinner-border text-success mb-2" role="status">
                                        <span className="visually-hidden">Chargement...</span>
                                    </div>
                                    <p className='text-success fw-bold'>Connexion réussie ✅</p>
                                </div>
                            )}

                            <form onSubmit={handleLogin}>
                                <div className='mt-5'>
                                    <div className="form-floating mb-3">
                                        <input type="email" className="form-control" placeholder="name@example.com" required
                                            value={email} onChange={(e) => setEmail(e.target.value)} />
                                        <label>Nom d'utilisateur</label>
                                    </div>
                                    <div className="form-floating mb-3" style={{ position: 'relative' }}>
            <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Password"
                autoComplete="off"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
            />
            <label>Mot de passe</label>
            <span 
                className="input-icon" 
                onClick={togglePasswordVisibility} 
                style={{ cursor: 'pointer', position: 'absolute', right: '20px', top: '20px' }}
            >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
        </div>
                                </div>
                                <div>
                                    {!success && (
                                        <button type="submit" className='btn1 btn1-success p-3 mt-3' disabled={loading}>
                                            {loading ? (
                                                <span>
                                                    <i className="fa fa-spinner fa-spin"></i> Connexion...
                                                </span>
                                            ) : (
                                                <span>
                                                    <i className='fa fa-check-circle'></i> Se connecter
                                                </span>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Login;
