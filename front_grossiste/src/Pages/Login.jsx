import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../Styles/Login.css';
import Swal from "sweetalert2";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import axios from '../api/axios';
import Logo from '../assets/logoo.png';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
        console.log('Show Password:', !showPassword);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/api/users/login', {
                email,
                password
            });

            const data = response.data; // Récupère directement les données

            // Stocke les informations dans le localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('email', data.user.email);
            localStorage.setItem('role', data.user.role);
            localStorage.setItem('userid', data.user._id);
            localStorage.setItem('nom', data.user.nom);
            setSuccess(true); setLoading(true);
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
                    <div className='description p-5 text-center'>
                        <div className="center">
                            <img src={Logo} alt="" width={250} className='img-fluid' />
                        </div>
                        <h1 className='mb-4 mt-5'>
                            <b className='gradient-text'>MAGASIN BAZARIKO</b><br />
                            <h2>Ho anao, Akaikinao</h2>
                        </h1>
                        <p>Optimisez la gestion et la distribution des PPN... by <b className='fw-bold'>INNOV-T Madagascar</b></p>
                        <Link to="/inscription"></Link>
                    </div>
                    <div className='formulaire p-5'>
                        <div className="form p-5">
                            <h1 className='fw-bold gradient-text text-center'>Connexion</h1>
                            <div className="hr"></div>

                            {/* Message d'erreur */}
                            {error && <div className="text-center">
                                <div className="spinner-border text-success mb-2" role="status">
                                    <span className="visually-hidden">Chargement...</span>
                                </div>
                                <p className='text-alert fw-bold'> {error}</p>
                            </div>}

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
                                <div className='text-center'>
                                    {!success && (
                                        <button type="submit" className='btn1 btn1-success p-3 mt-3 button d-flex align-items-center justify-content-center' disabled={loading}>
                                            {loading ? (
                                                <div className="spinner-border style={{ width: '2rem', height: '2rem' }}" role="status">
                                                    <span className="visually-hidden">Chargement...</span>
                                                </div>
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
