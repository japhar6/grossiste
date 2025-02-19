// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { useNavigate ,Link} from 'react-router-dom';
import '../Styles/Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false); 
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur de connexion');
            }

            localStorage.setItem('token', data.token);
             localStorage.setItem('email', data.user.email);
            localStorage.setItem('role', data.user.role);
            localStorage.setItem('userid', data.user._id);
            

            setSuccess(true);  
            setTimeout(() => {
                switch (data.user.role) {
                    case 'admin':
                        navigate('/admin');
                        break;
                    case 'magasinier':
                        navigate('/SortieCommande');
                        break;
                    case 'vendeur':
                        navigate('/vente');
                        break;
                    case 'caissier':
                        navigate('/caisse');
                        break;
                    default:
                        navigate('/dashboard');
                }
            }, 1000);

        } catch (error) {
            setError(error.message);
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
                                    <div className="form-floating">
                                        <input type="password" className="form-control" placeholder="Password" autoComplete="off" required
                                            value={password} onChange={(e) => setPassword(e.target.value)} />
                                        <label>Mot de passe</label>
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
