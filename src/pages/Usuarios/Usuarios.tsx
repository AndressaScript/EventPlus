import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import Campo from "../../components/campo/Campo";
import { Botao } from "../../components/botao/Botao";
import ListaUsuarios from "../../components/listaUsuarios/listaUsuarios";
import ModalConfirmacao from "../../components/modalConfirmacao/ModalConfirmacao";
import type { TipoUsuario, Usuario } from "../../types/api";
import { tipoUsuarioService, usuarioService } from "../../services/eventPlusservice";
import { getApiErrorMessage } from "../../services/api";
import ilustracao from "../../assets/Vector (2).png";

import "./Usuarios.css";

interface FormularioUsuario {
    nome: string;
    email: string;
    senha: string;
    idTipoUsuario: string;
}

const inicial: FormularioUsuario = {
    nome: "",
    email: "",
    idTipoUsuario: "",
    senha: ""
};

function Usuarios() {
    const [formulario, setFormulario] = useState(inicial);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [tipos, setTipos] = useState<TipoUsuario[]>([]);
    const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);
    const [selecionado, setSelecionado] = useState<Usuario | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState(false);

    const carregar = useCallback(async () => {
        setCarregando(true);
        setMensagem("");
        setErro(false);

        try {
            const [usuariosApi, tiposApi] = await Promise.all([
                usuarioService.listar(),
                tipoUsuarioService.listar()
            ]);

            setUsuarios(usuariosApi);
            setTipos(tiposApi);

            setFormulario((value) => ({
                ...value,
                idTipoUsuario: value.idTipoUsuario || tiposApi[0]?.idTipoUsuario || ""
            }));
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
            setErro(true);
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        const timeOut = window.setTimeout(() => void carregar(), 0);
        return () => window.clearTimeout(timeOut);
    }, [carregar]);

    function atualizar(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setFormulario((value) => ({
            ...value,
            [event.target.name]: event.target.value
        }));
    }

    function limpar() {
        setFormulario({
            ...inicial,
            idTipoUsuario: tipos[0]?.idTipoUsuario || ""
        });
        setIdEmEdicao(null);
        setMensagem("");
        setErro(false);
    }

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setEnviando(true);
        setMensagem("");
        setErro(false);

        try {
            const payload = {
                ...formulario,
                nome: formulario.nome.trim(),
                email: formulario.email.trim(),
                idTipoUsuario: formulario.idTipoUsuario || null
            };

            if (idEmEdicao) {
                await usuarioService.atualizar(idEmEdicao, payload);
                setMensagem("Usuário atualizado com sucesso.");
            } else {
                await usuarioService.cadastrar(payload);
                setMensagem("Usuário cadastrado com sucesso.");
            }

            limpar();
            await carregar();
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
            setErro(true);
        } finally {
            setEnviando(false);
        }
    }

    function editar(usuario: Usuario) {
        setIdEmEdicao(usuario.idUsuario);
        setFormulario({
            nome: usuario.nome,
            email: usuario.email,
            idTipoUsuario: usuario.idTipoUsuario || usuario.idTipoUsuarioNavigation?.idTipoUsuario || "",
            senha: ""
        });
        setMensagem("Informe uma nova senha para concluir a edição.");
        setErro(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function excluir() {
        if (!selecionado) return;

        setEnviando(true);
        setMensagem("");
        setErro(false);

        try {
            await usuarioService.excluir(selecionado.idUsuario);

            if (idEmEdicao === selecionado.idUsuario) limpar();

            setSelecionado(null);
            setMensagem("Usuário excluído com sucesso.");
            await carregar();
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
            setErro(true);
            setSelecionado(null);
        } finally {
            setEnviando(false);
        }
    }

    return (
        <>
            <Header />

            <main className="cadastro-usuario-page">
                <section className="cadastro-usuario-formulario-section">
                    <h1 className="cadastro-usuario-titulo">ADMINISTRAÇÃO DE USUÁRIOS</h1>
                    <hr className="cadastro-usuario-linha-titulo" />

                    <div className="cadastro-usuario-conteudo">
                        <div className="cadastro-usuario-ilustracao">
                            <img
                                src={ilustracao}
                                alt="Ilustração da administração de usuários"
                            />
                        </div>

                        <form className="cadastro-usuario-formulario" onSubmit={salvar}>
                            <h2>{idEmEdicao ? "Editar Usuário" : "Cadastrar Usuário"}</h2>

                            <label className="visually-hidden" htmlFor="usuario-nome">Nome</label>
                            <Campo
                                id="usuario-nome"
                                name="nome"
                                type="text"
                                value={formulario.nome}
                                onChange={atualizar}
                                placeholder="Nome"
                                maxLength={100}
                                required
                            />

                            <label className="visually-hidden" htmlFor="usuario-email">E-mail</label>
                            <Campo
                                id="usuario-email"
                                name="email"
                                type="email"
                                value={formulario.email}
                                onChange={atualizar}
                                placeholder="E-mail"
                                maxLength={100}
                                required
                            />

                            <label className="visually-hidden" htmlFor="usuario-tipo">Tipo de Usuário</label>
                            <select
                                name="idTipoUsuario"
                                id="usuario-tipo"
                                className="cadastro-usuario-select"
                                value={formulario.idTipoUsuario}
                                onChange={atualizar}
                                required
                            >
                                <option value="">Selecione o Tipo de Usuário</option>
                                {tipos.map((tipo) => (
                                    <option
                                        value={tipo.idTipoUsuario}
                                        key={tipo.idTipoUsuario}
                                    >
                                        {tipo.titulo}
                                    </option>
                                ))}
                            </select>

                            <label className="visually-hidden" htmlFor="usuario-senha">Senha</label>
                            <Campo
                                id="usuario-senha"
                                name="senha"
                                type="password"
                                value={formulario.senha}
                                onChange={atualizar}
                                placeholder={idEmEdicao ? "Nova Senha (opcional)" : "Senha"}
                                minLength={6}
                                maxLength={60}
                                required={!idEmEdicao}
                            />

                            <Botao
                                texto={
                                    enviando
                                        ? "Salvando..."
                                        : idEmEdicao
                                            ? "Atualizar"
                                            : "Cadastrar"
                                }
                                type="submit"
                                disabled={enviando}
                            />

                            {idEmEdicao ? (
                                <button
                                    className="cadastro-usuario-cancelar"
                                    type="button"
                                    onClick={limpar}
                                >
                                    Cancelar Edição
                                </button>
                            ) : null}

                            {mensagem ? (
                                <p
                                    className={
                                        erro
                                            ? "cadastro-usuario-mensagem cadastro-usuario-mensagem-erro"
                                            : "cadastro-usuario-mensagem cadastro-usuario-mensagem-sucesso"
                                    }
                                    role="status"
                                >
                                    {mensagem}
                                </p>
                            ) : null}
                        </form>
                    </div>
                </section>

                <ListaUsuarios
                    usuarios={usuarios}
                    idEmEdicao={idEmEdicao}
                    carregando={carregando}
                    onEditar={editar}
                    onExcluir={setSelecionado}
                />

                <ModalConfirmacao
                    show={Boolean(selecionado)}
                    titulo="Excluir Usuário"
                    mensagem={selecionado ? `Deseja realmente excluir "${selecionado.nome}"?` : ""}
                    textoConfirmar={enviando ? "Excluindo..." : "Excluir"}
                    textoCancelar="Cancelar"
                    onClose={() => setSelecionado(null)}
                    onConfirm={() => void excluir()}
                />
            </main>

            <Footer />
        </>
    );
}

export default Usuarios;
