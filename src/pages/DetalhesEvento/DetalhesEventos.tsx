import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import type {
    Evento,
    Presenca,
    Comentario,
    MensagemModeracao
} from "../../types/api";
import {
    eventoService,
    presencaService,
    comentarioService
} from "../../services/eventPlusservice";
import { getApiErrorMessage } from "../../services/api";
import { useAuth } from "../../context/auth";
import imagemPadrao from "../../assets/banner-1.png";
import relogio from "../../assets/icons/relogio.svg";
import predio from "../../assets/icons/predio.svg";
import filtro from "../../assets/icons/filtro.svg";
import enviar from "../../assets/icons/enviar.svg";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { Botao } from "../../components/botao/Botao";
import "./DetalhesEventos.css";
import ModalConfirmacao from "../../components/modalConfirmacao/ModalConfirmacao";
import Campo from "../../components/campo/Campo";

export function formatarData(value: string) {
    const data = new Date(value);

    return Number.isNaN(data.getTime())
        ? "Data não informada"
        : new Intl.DateTimeFormat("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric"
          }).format(data);
}

export function formatarHora(value: string) {
    const data = new Date(value);

    return Number.isNaN(data.getTime())
        ? "Horário não informado"
        : new Intl.DateTimeFormat("pt-BR", {
              hour: "2-digit",
              minute: "2-digit"
          }).format(data);
}

function DetalhesEvento() {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { autenticado, usuario } = useAuth();

    const [evento, setEvento] = useState<Evento | null>(null);
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [secaoComentarios, setSecaoComentarios] = useState(false);

    const [novoComentario, setNovoComentario] = useState("");
    const [enviandoComentario, setEnviandoComentario] = useState(false);
    const [mensagemComentario, setMensagemComentario] = useState("");

    const [presenca, setPresenca] = useState<Presenca | null>(null);
    const [presencaCarregada, setPresencaCarregada] = useState("");
    const [confirmandoCancelamento, setConfirmandoCancelamento] =
        useState(false);
    const [enviandoInscricao, setEnviandoInscricao] = useState(false);

    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");
    const [mensagemInscricao, setMensagemInscricao] = useState("");

    const carregar = useCallback(async () => {
        if (!id) {
            setErro("Evento não encontrado.");
            return;
        }

        setCarregando(true);
        setErro("");

        try {
            const [eventoAtual, comentariosAtuais] = await Promise.all([
                eventoService.buscar(id),
                comentarioService.listarPorEvento(id)
            ]);

            setEvento(eventoAtual);
            setComentarios(comentariosAtuais);
        } catch (error) {
            setErro(getApiErrorMessage(error));
        } finally {
            setCarregando(false);
        }
    }, [id]);

    useEffect(() => {
        void carregar();
    }, [carregar]);

    function exigirLogin() {
        if (autenticado) return false;

        navigate("/login", {
            state: { from: location.pathname }
        });

        return true;
    }

    useEffect(() => {
        let ativo = true;

        async function carregarPresenca() {
            if (!autenticado || !usuario || !id) {
                setPresenca(null);
                setPresencaCarregada("");
                return;
            }

            const chave = `${usuario.idUsuario}:${id}`;

            setPresencaCarregada("");

            try {
                const presencas = await presencaService.listarPorUsuario(
                    usuario.idUsuario
                );

                if (!ativo) return;

                const encontrada = presencas.find(
                    (item) =>
                        String(item.idEvento) === String(id) &&
                        item.situacao === true
                );

                setPresenca(encontrada ?? null);
            } catch (error) {
                if (ativo) {
                    setPresenca(null);
                    console.error("Erro ao verificar inscrição:", error);
                }
            } finally {
                if (ativo) {
                    setPresencaCarregada(chave);
                }
            }
        }

        void carregarPresenca();

        return () => {
            ativo = false;
        };
    }, [autenticado, usuario, id]);

    const chavePresenca =
        autenticado && usuario && id
            ? `${usuario.idUsuario}:${id}`
            : "";

    const checandoPresenca =
        Boolean(chavePresenca) && presencaCarregada !== chavePresenca;

    async function comentar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (exigirLogin()) return;

        if (
            !usuario ||
            !evento ||
            !novoComentario.trim() ||
            enviandoComentario
        ) {
            return;
        }

        setEnviandoComentario(true);
        setMensagemComentario("");
        setErro("");

        try {
            const response = await comentarioService.cadastrar({
                descricao: novoComentario.trim(),
                idEvento: evento.idEvento,
                idUsuario: usuario.idUsuario
            });

            if ("mensagem" in response) {
                const respostaModeracao = response as MensagemModeracao;

                setMensagemComentario(respostaModeracao.mensagem);
            } else {
                setComentarios((items) => [...items, response]);
                setMensagemComentario("Comentário publicado.");
            }

            setNovoComentario("");
        } catch (error) {
            setMensagemComentario(getApiErrorMessage(error));
        } finally {
            setEnviandoComentario(false);
        }
    }

    async function inscrever() {
        if (exigirLogin()) return;

        if (
            !usuario ||
            !evento ||
            presenca ||
            enviandoInscricao ||
            checandoPresenca
        ) {
            return;
        }

        setEnviandoInscricao(true);
        setMensagemInscricao("");
        setErro("");

        try {
            const novaPresenca = await presencaService.cadastrar({
                situacao: true,
                idEvento: evento.idEvento,
                idUsuario: usuario.idUsuario
            });

            setPresenca(novaPresenca);
            setMensagemInscricao("Inscrição realizada com sucesso.");
        } catch (error) {
            setMensagemInscricao(getApiErrorMessage(error));
        } finally {
            setEnviandoInscricao(false);
        }
    }

    async function cancelarInscricao() {
        if (!presenca || enviandoInscricao) return;

        setEnviandoInscricao(true);
        setMensagemInscricao("");

        try {
            await presencaService.excluir(presenca.idPresenca);

            setPresenca(null);
            setMensagemInscricao("Inscrição cancelada com sucesso.");
        } catch (error) {
            setMensagemInscricao(getApiErrorMessage(error));
        } finally {
            setConfirmandoCancelamento(false);
            setEnviandoInscricao(false);
        }
    }

    return (
        <>
            <Header />

            <main>
                {carregando && <p>Carregando evento...</p>}

                {erro && <p role="alert">{erro}</p>}

                {!carregando && !evento && !erro && (
                    <p>Evento não encontrado.</p>
                )}

                {evento && (
                    <>
                        <img
                            src={evento.imagemUrl || imagemPadrao}
                            alt="Banner do evento"
                        />

                        <h1>{evento.nome}</h1>

                        <div>
                            <button
                                type="button"
                                onClick={() => setSecaoComentarios(false)}
                                aria-selected={!secaoComentarios}
                            >
                                Sobre o Evento
                            </button>

                            <button
                                type="button"
                                onClick={() => setSecaoComentarios(true)}
                                aria-selected={secaoComentarios}
                            >
                                Comentários
                            </button>

                            {secaoComentarios ? (
                                <section
                                    className="detalhe-evento-comentarios"
                                    role="tabpanel"
                                >
                                    <h2>Comentários</h2>

                                    {comentarios.length > 0 ? (
                                        comentarios.map((comentario) => (
                                            <article
                                                key={comentario.idComentario}
                                                className="detalhe-evento-comentario"
                                            >
                                                <div>
                                                    <strong>
                                                        {comentario.idUsuarioNavigation?.nome ||
                                                            "Usuário"}
                                                    </strong>
                                                </div>

                                                <p>{comentario.descricao}</p>
                                            </article>
                                        ))
                                    ) : (
                                        <p>Nenhum comentário publicado.</p>
                                    )}

                                    <form onSubmit={comentar}>
                                        <label
                                            className="visually-hidden"
                                            htmlFor="novo-comentario"
                                        >
                                            Escreva seu comentário
                                        </label>

                                        <Campo
                                            id="novo-comentario"
                                            value={novoComentario}
                                            maxLength={200}
                                            placeholder="Escreva seu comentário..."
                                            onChange={(event) =>
                                                setNovoComentario(
                                                    event.target.value
                                                )
                                            }
                                        />

                                        <button
                                            type="submit"
                                            aria-label="Enviar comentário"
                                            disabled={
                                                enviandoComentario ||
                                                !novoComentario.trim()
                                            }
                                        >
                                            {enviandoComentario
                                                ? "Enviando..."
                                                : "Enviar comentário"}

                                            <img src={enviar} alt="" />
                                        </button>
                                    </form>

                                    {mensagemComentario && (
                                        <p
                                            className="detalhe-evento-mensagem"
                                            role="status"
                                        >
                                            {mensagemComentario}
                                        </p>
                                    )}
                                </section>
                            ) : (
                                <section>
                                    <h2>Descrição do evento</h2>
                                    <p>{evento.descricao}</p>
                                </section>
                            )}
                        </div>

                        <div>
                            <h2>Informações principais</h2>
                            <hr />

                            <div>
                                <img src={relogio} alt="" />
                                <span>
                                    {evento.dataEvento
                                        ? `${formatarData(evento.dataEvento)} às ${formatarHora(evento.dataEvento)}`
                                        : "Data não informada"}
                                </span>
                            </div>

                            <div>
                                <img src={predio} alt="" />
                                <span>
                                    {evento.idInstituicaoNavigation
                                        ?.nomeFantasia || "Instituição não informada"}
                                </span>
                            </div>

                            <div>
                                <img src={filtro} alt="" />
                                <span>
                                    {evento.idTipoEventoNavigation?.titulo ||
                                        "Tipo de evento não informado"}
                                </span>
                            </div>

                            {autenticado ? (
                                <>
                                    <Botao
                                        className={
                                            presenca
                                                ? "detalhe-evento-cancelar"
                                                : ""
                                        }
                                        texto={
                                            checandoPresenca
                                                ? "Verificando inscrição..."
                                                : enviandoInscricao
                                                  ? "Aguarde..."
                                                  : presenca
                                                    ? "Cancelar inscrição"
                                                    : "Se inscrever"
                                        }
                                        type="button"
                                        disabled={
                                            checandoPresenca ||
                                            enviandoInscricao ||
                                            carregando
                                        }
                                        onClick={() => {
                                            if (presenca) {
                                                setConfirmandoCancelamento(true);
                                            } else {
                                                void inscrever();
                                            }
                                        }}
                                    />

                                    {mensagemInscricao && (
                                        <p
                                            className="detalhe-evento-mensagem"
                                            role="status"
                                        >
                                            {mensagemInscricao}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p>
                                    Entre na sua conta para se inscrever neste
                                    evento.
                                </p>
                            )}
                        </div>

                        <ModalConfirmacao
                            show={confirmandoCancelamento}
                            titulo="Cancelar inscrição"
                            mensagem={`Deseja cancelar sua inscrição em "${evento.nome || "este evento"}"?`}
                            textoConfirmar={
                                enviandoInscricao
                                    ? "Cancelando..."
                                    : "Cancelar inscrição"
                            }
                            textoCancelar="Manter inscrição"
                            onClose={() => {
                                if (!enviandoInscricao) {
                                    setConfirmandoCancelamento(false);
                                }
                            }}
                            onConfirm={() => void cancelarInscricao()}
                        />
                    </>
                )}
            </main>

            <Footer />
        </>
    );
}

export default DetalhesEvento;
