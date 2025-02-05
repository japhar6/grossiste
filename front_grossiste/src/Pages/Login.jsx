import 'react';
import '../Styles/Login.css'

function Login(){
    return(
        <main className='mainLogin center
        '>
            <section className='login'>
                <div className="container-fluid center">
                    <div className='description p-5'>
                        <h1 className='mb-4'>
                            <b className='gradient-text'>DIGITALISATION GROSSISTE PPN</b> <br /> <b className='gradient'> by INNOV-T Madagascar</b>
                        </h1>
                        <p>Optimisez la gestion et la distribution des Produits de Première Nécessité (PPN) grâce à notre application de digitalisation, offrant un suivi en temps réel des stocks, des ventes, et des livraisons pour une efficacité maximale.</p>
                        <button className='btn btn-success p-3 mt-5'>
                            <i className='fa fa-users'></i> Créer un compte pour le systéme
                        </button>
                    </div>
                    <div className='formulaire p-5'>
                        <div className="form p-5">
                            <h1 className='fw-bold gradient-text text-center '>Connexion</h1>
                            <div className="hr"></div>
                            <form action="">
                                <div className='mt-5'>
                                    <div className="form-floating mb-3">
                                        <input
                                        type="email"
                                        className="form-control"
                                        id="floatingInput"
                                        placeholder="name@example.com"
                                        required
                                        />
                                        <label htmlFor="floatingInput">Nom d&apos;utilisateur</label>
                                    </div>
                                    <div className="form-floating">
                                        <input
                                        type="password"
                                        className="form-control"
                                        id="floatingPassword"
                                        placeholder="Password"
                                        autoComplete="off"
                                        required
                                        />
                                        <label htmlFor="floatingPassword">Mot de passe</label>
                                    </div>
                                </div>
                                <div>
                                    <button className='btn btn-success p-3 mt-3'>
                                        <i className='fa fa-check-circle'></i> Se connecter
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Login;