import "./Header.css"
import logoEvent from '../../assets/Camada_2-2.svg'
import { Link, NavLink, useNavigate } from "react-router-dom"
import { perfilEhAdministrador, perfilEhOrganizador, useAuth } from "../../context/auth"


function Header() {
    const { autenticado, usuario, perfil, logout } = useAuth();

    const navigate = useNavigate();
    const administrador = perfilEhAdministrador(perfil);
    const organizador = perfilEhOrganizador(perfil);

    function sair() {
        logout();
        navigate("/");
    }

    return (
        <header className="header">
            <div className="header-conteudo">
                <Link to="/home">
                    <img src={logoEvent} alt="Logo Event+" />
                </Link>
                <nav>
                    <NavLink to="/home">Home</NavLink>
                    <NavLink to="/eventos">Eventos</NavLink>
                    <NavLink to="/usuarios">Usuarios</NavLink>
                    <Link to="/home#contato">Contatos</Link>
                </nav>
                {autenticado ?
                    <>
                        <Link to="/conta">Minha Conta</Link>
                        <Link to="/login" onClick={logout}>Sair</Link>
                    </>
                    :
                    <Link to="/login">Entrar</Link>
                }
            </div>
        </header>
    )
}

export default Header;