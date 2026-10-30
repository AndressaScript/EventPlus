import {
    useCallback,
    useEffect,
    useState,
    type ChangeEvent,
    type FormEvent
} from "react";

import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Campo from "../../components/campo/Campo";
import { Botao } from "../../components/botao/Botao";
import ModalConfirmacao from "../../components/modalConfirmacao/ModalConfirmacao";

import lapis from "../../assets/Icons/lapis.svg";
import lixeira from "../../assets/Icons/lixeira.svg";
import ilustracao from "../../assets/Vector.png";

import { tipoUsuarioService } from "../../services/eventPlusservice";
import { getApiErrorMessage } from "../../services/api";

import "./TipoUsuario.css";

interface TipoUsuarioModel {
    idTipoUsuario: string;
    titulo: string;
}

function TipoUsuario() {
    const [titulo, setTitulo] = useState("");
    const [tiposUsuarios, setTiposUsuarios] = useState<TipoUsuarioModel[]>([]);
    const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);
    const [selecionado, setSelecionado] = useState<TipoUsuarioModel | null>(null);

    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState(false);

    const carregar = useCallback(async (limparMensagem = true) => {
        setCarregando(true);

        if (limparMensagem) {
            setMensagem("");
            setErro(false);
        }

        try {
            const dados = await tipoUsuarioService.listar();
            setTiposUsuarios(dados);
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
            setErro(true);
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        void carregar();
    }, [carregar]);

    function limpar() {
        setTitulo("");
        setIdEmEdicao(null);
        setMensagem("");
        setErro(false);
    }

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const tituloFormatado = titulo.trim();

        if (!tituloFormatado) {
            setMensagem("Informe o título do tipo de usuário.");
            setErro(true);
            return;
        }

        setEnviando(true);
        setMensagem("");
        setErro(false);

        try {
            if (idEmEdicao) {
                await tipoUsuarioService.atualizar(
                    idEmEdicao,
                    tituloFormatado
                );

                await carregar(false);

                setMensagem("Tipo de usuário atualizado com sucesso.");
            } else {
                await tipoUsuarioService.cadastrar(tituloFormatado);

                await carregar(false);

                setMensagem("Tipo de usuário cadastrado com sucesso.");
            }

            setTitulo("");
            setIdEmEdicao(null);
            setErro(false);

        } catch (error) {
            setMensagem(getApiErrorMessage(error));
            setErro(true);
        } finally {
            setEnviando(false);
        }
    }

    function editar(item: TipoUsuarioModel) {
        setIdEmEdicao(item.idTipoUsuario);
        setTitulo(item.titulo);
        setMensagem("");
        setErro(false);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    async function excluir() {
        if (!selecionado) return;

        setEnviando(true);
        setMensagem("");
        setErro(false);

        try {
            await tipoUsuarioService.excluir(
                selecionado.idTipoUsuario
            );

            if (idEmEdicao === selecionado.idTipoUsuario) {
                setTitulo("");
                setIdEmEdicao(null);
            }

            setSelecionado(null);

            await carregar(false);

            setMensagem("Tipo de usuário excluído com sucesso.");
            setErro(false);

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

            <main className="tipo-usuario-page">

                <section className="tipo-usuario-cadastro">

                    <h1 className="tipo-usuario-titulo">
                        ADMINISTRAÇÃO TIPO DE USUÁRIOS
                    </h1>

                    <hr className="tipo-usuario-linha-titulo" />

                    <div className="tipo-usuario-conteudo">

                        <div className="tipo-usuario-ilustracao">
                            <img
                                src={ilustracao}
                                alt="Ilustração de administração de usuários"
                            />
                        </div>

                        <form
                            className="tipo-usuario-formulario"
                            onSubmit={salvar}
                        >

                            <label
                                className="visually-hidden"
                                htmlFor="titulo-tipo-usuario"
                            >
                                Título do tipo de usuário
                            </label>

                            <Campo
                                id="titulo-tipo-usuario"
                                name="titulo"
                                type="text"
                                value={titulo}
                                onChange={(
                                    event: ChangeEvent<HTMLInputElement>
                                ) => setTitulo(event.target.value)}
                                placeholder="Título"
                                maxLength={100}
                                required
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

                            {idEmEdicao && (
                                <button
                                    type="button"
                                    className="tipo-usuario-cancelar"
                                    onClick={limpar}
                                    disabled={enviando}
                                >
                                    Cancelar edição
                                </button>
                            )}

                            {mensagem && (
                                <p
                                    className={
                                        erro
                                            ? "tipo-usuario-mensagem tipo-usuario-mensagem-erro"
                                            : "tipo-usuario-mensagem tipo-usuario-mensagem-sucesso"
                                    }
                                    role="status"
                                >
                                    {mensagem}
                                </p>
                            )}

                        </form>

                    </div>
                </section>

                <section className="tipo-usuario-lista-section">

                    <div className="tipo-usuario-lista-container">

                        <h2>LISTA TIPO DE USUÁRIOS</h2>

                        <hr className="tipo-usuario-linha-lista" />

                        <div className="tipo-usuario-tabela-wrapper">

                            <table className="tipo-usuario-tabela">

                                <thead>
                                    <tr>
                                        <th scope="col">Título</th>
                                        <th scope="col">Editar</th>
                                        <th scope="col">Deletar</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {carregando ? (
                                        <tr>
                                            <td colSpan={3}>
                                                Carregando tipos de usuários...
                                            </td>
                                        </tr>
                                    ) : tiposUsuarios.length === 0 ? (
                                        <tr>
                                            <td colSpan={3}>
                                                Nenhum tipo de usuário cadastrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        tiposUsuarios.map((item) => (
                                            <tr key={item.idTipoUsuario}>

                                                <td>
                                                    {item.titulo}
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="tipo-usuario-acao"
                                                        aria-label={`Editar ${item.titulo}`}
                                                        onClick={() => editar(item)}
                                                        disabled={enviando}
                                                    >
                                                        <img
                                                            src={lapis}
                                                            alt=""
                                                        />
                                                    </button>
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="tipo-usuario-acao"
                                                        aria-label={`Excluir ${item.titulo}`}
                                                        onClick={() => setSelecionado(item)}
                                                        disabled={enviando}
                                                    >
                                                        <img
                                                            src={lixeira}
                                                            alt=""
                                                        />
                                                    </button>
                                                </td>

                                            </tr>
                                        ))
                                    )}

                                </tbody>
                            </table>

                        </div>
                    </div>
                </section>

                <ModalConfirmacao
                    show={Boolean(selecionado)}
                    titulo="Excluir Tipo de Usuário"
                    mensagem={
                        selecionado
                            ? `Deseja excluir "${selecionado.titulo}"?`
                            : ""
                    }
                    textoCancelar="Cancelar"
                    onClose={() => setSelecionado(null)}
                    onConfirm={() => void excluir()}
                />

            </main>

            <Footer />
        </>
    );
}

export default TipoUsuario;