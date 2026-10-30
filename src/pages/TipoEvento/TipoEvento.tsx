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
import ilustracao from "../../assets/Vector (2).png";

import { tipoEventoService } from "../../services/eventPlusservice";
import { getApiErrorMessage } from "../../services/api";

import "./TipoEvento.css";

interface TipoEventoApi {
    idTipoEvento: string;
    titulo?: string;
    tituloTipoEvento?: string;
}

interface TipoEventoModel {
    idTipoEvento: string;
    titulo: string;
}

function TipoEvento() {
    const [titulo, setTitulo] = useState("");
    const [tiposEventos, setTiposEventos] = useState<TipoEventoModel[]>([]);
    const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);
    const [selecionado, setSelecionado] = useState<TipoEventoModel | null>(null);

    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState(false);

    const carregar = useCallback(async () => {
        setCarregando(true);
        setMensagem("");
        setErro(false);

        try {
            const dados = await tipoEventoService.listar() as unknown as TipoEventoApi[];

            const tiposNormalizados = dados.map((item) => ({
                idTipoEvento: item.idTipoEvento,
                titulo: item.titulo ?? item.tituloTipoEvento ?? ""
            }));

            setTiposEventos(tiposNormalizados);
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

        if (!titulo.trim()) {
            setMensagem("Informe o título do tipo de evento.");
            setErro(true);
            return;
        }

        setEnviando(true);
        setMensagem("");
        setErro(false);

        try {
            if (idEmEdicao) {
                await tipoEventoService.atualizar(idEmEdicao, titulo.trim());
                setMensagem("Tipo de evento atualizado com sucesso.");
            } else {
                await tipoEventoService.cadastrar(titulo.trim());
                setMensagem("Tipo de evento cadastrado com sucesso.");
            }

            setTitulo("");
            setIdEmEdicao(null);

            await carregar();
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
            setErro(true);
        } finally {
            setEnviando(false);
        }
    }

    function editar(item: TipoEventoModel) {
        setIdEmEdicao(item.idTipoEvento);
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
            await tipoEventoService.excluir(selecionado.idTipoEvento);

            if (idEmEdicao === selecionado.idTipoEvento) {
                setTitulo("");
                setIdEmEdicao(null);
            }

            setSelecionado(null);
            setMensagem("Tipo de evento excluído com sucesso.");

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

            <main className="tipo-evento-page">
                <section className="tipo-evento-cadastro">
                    <h1 className="tipo-evento-titulo">
                        ADMINISTRAÇÃO TIPO DE EVENTOS
                    </h1>

                    <hr className="tipo-evento-linha-titulo" />

                    <div className="tipo-evento-conteudo">
                        <div className="tipo-evento-ilustracao">
                            <img
                                src={ilustracao}
                                alt="Ilustração de administração de eventos"
                            />
                        </div>

                        <form
                            className="tipo-evento-formulario"
                            onSubmit={salvar}
                        >
                            <label
                                className="visually-hidden"
                                htmlFor="titulo-tipo-evento"
                            >
                                Título do tipo de evento
                            </label>

                            <Campo
                                id="titulo-tipo-evento"
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
                                    className="tipo-evento-cancelar"
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
                                            ? "tipo-evento-mensagem tipo-evento-mensagem-erro"
                                            : "tipo-evento-mensagem tipo-evento-mensagem-sucesso"
                                    }
                                    role="status"
                                >
                                    {mensagem}
                                </p>
                            )}
                        </form>
                    </div>
                </section>

                <section className="tipo-evento-lista-section">
                    <div className="tipo-evento-lista-container">
                        <h2>LISTA TIPO DE EVENTOS</h2>

                        <hr className="tipo-evento-linha-lista" />

                        <div className="tipo-evento-tabela-wrapper">
                            <table className="tipo-evento-tabela">
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
                                                Carregando tipos de eventos...
                                            </td>
                                        </tr>
                                    ) : tiposEventos.length === 0 ? (
                                        <tr>
                                            <td colSpan={3}>
                                                Nenhum tipo de evento cadastrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        tiposEventos.map((item) => (
                                            <tr key={item.idTipoEvento}>
                                                <td>{item.titulo}</td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="tipo-evento-acao"
                                                        aria-label={`Editar ${item.titulo}`}
                                                        onClick={() => editar(item)}
                                                        disabled={enviando}
                                                    >
                                                        <img src={lapis} alt="" />
                                                    </button>
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="tipo-evento-acao"
                                                        aria-label={`Excluir ${item.titulo}`}
                                                        onClick={() =>
                                                            setSelecionado(item)
                                                        }
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
                    titulo="Excluir Tipo de Evento"
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

export default TipoEvento;