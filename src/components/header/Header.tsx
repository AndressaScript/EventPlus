import { Link, NavLink, useNavigate } from "react-router-dom";

import logoEvent from "../../assets/Camada_2-2.svg";
import "./Header.css";

import {
    perfilEhAdministrador,
    perfilEhOrganizador,
    useAuth
} from "../../context/auth";

function Header() {
    const { autenticado, perfil, logout } = useAuth();

    const navigate = useNavigate();
    const administrador = perfilEhAdministrador(perfil);
    const organizador = perfilEhOrganizador(perfil);

    function sair() {
        logout();
        navigate("/login");
    }

    return (
        <header className="header">
            <div className="header-conteudo">
                <Link to="/home" aria-label="Ir para a página inicial">
                    <img src={logoEvent} alt="Logo Event+" />
                </Link>

                <nav>
                    <NavLink to="/home">Home</NavLink>
                    <NavLink to="/eventos">Eventos</NavLink>
                    {administrador ? (
                        <>
                            <NavLink to="/tipoevento">Tipos de Evento</NavLink>
                            <NavLink to="/tipousuario">Tipos de Usuário</NavLink>
                            <NavLink to="/usuarios">Usuários</NavLink>
                        </>
                    ) : null}
                    {organizador ? (
                        <NavLink to="/cadastroEvento">Cadastro de Eventos</NavLink>
                    ) : null}
                    <Link to="/home#contato">Contatos</Link>
                </nav>

                <div className="header-acoes">
                    {autenticado ? (
                        <button type="button" onClick={sair} aria-label="Encerrar sessão">
                            Sair
                        </button>
                    ) : (
                        <Link to="/login">Entrar</Link>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
