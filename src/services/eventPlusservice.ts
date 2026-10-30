import { axiosInstance } from "./api";
import {
    type Comentario,
    type comentarioPayload,
    type MensagemModeracao,
    type Evento,
    type LoginPayload,
    type LoginResponse,
    type Presenca,
    type PresencaPayload,
    type Usuario,
    type UsuarioPayLoad,
    type TipoUsuario,
} from "../types/api";

export const authService = {
    async login(payload: LoginPayload) {
        const { data } = await axiosInstance.post<LoginResponse>("Login", payload);
        return data;
    }
};

export const eventoService = {
    async listar() {
        const { data } = await axiosInstance.get<Evento[]>("Evento");
        return data;
    },

async listarProximos() {
    const { data } = await axiosInstance.get<Evento[]>("Evento");

    return data
        .filter(evento => new Date(evento.dataEvento) >= new Date())
        .sort(
            (a, b) =>
                new Date(a.dataEvento).getTime() -
                new Date(b.dataEvento).getTime()
        )
        .slice(0, 3);
},


    async buscar(id: string) {
        const { data } = await axiosInstance.get<Evento>(`Evento/${id}`);
        return data;
    }
};

export const comentarioService = {
    async listarPorEvento(idEvento: string) {
        const { data } = await axiosInstance.get<Comentario[]>(
            `Comentario/ListarPorEvento/${idEvento}`
        );
        return data;
    },

    async cadastrar(payload: comentarioPayload) {
        const { data } = await axiosInstance.post<Comentario | MensagemModeracao>(
            "Comentario",
            payload
        );
        return data;
    }
};

export const presencaService = {
    async listarPorUsuario(idUsuario: string) {
        const { data } = await axiosInstance.get<Presenca[]>(
            `Presenca/usuario/${idUsuario}`
        );
        return data;
    },

    async cadastrar(payload: PresencaPayload) {
        const { data } = await axiosInstance.post<Presenca>("/Presenca", payload);
        return data;
    },

    async excluir(id: string) {
        await axiosInstance.delete(`Presenca/${id}`);
    }
};

export const usuarioService = {
    async listar() {
        const { data } = await axiosInstance.get<Usuario[]>("Usuario");
        return data;
    },

    async buscar(id: string) {
        const { data } = await axiosInstance.get<Usuario>(`Usuario/${id}`);
        return data;
    },

    async cadastrar(payload: UsuarioPayLoad) {
        const { data } = await axiosInstance.post<Usuario>("Usuario", payload);
        return data;
    },

    async atualizar(id: string, payload: UsuarioPayLoad) {
        await axiosInstance.put(`Usuario/${id}`, payload);
    },

    async excluir(id: string) {
        await axiosInstance.delete(`Usuario/${id}`);
    }
};

function tipoService<T extends { titulo: string }>(endpoint: string) {
    return {
        async listar() {
            const { data } = await axiosInstance.get<T[]>(endpoint);
            return data;
        },

        async cadastrar(titulo: string) {
            const { data } = await axiosInstance.post<T[]>(endpoint, { titulo });
            return data;
        },

        async atualizar(id: string, titulo: string) {
            await axiosInstance.put(`${endpoint}/${id}`, { titulo });
        },

        async excluir(id: string) {
            await axiosInstance.delete(`${endpoint}/${id}`);
        },
    };
}

export const tipoUsuarioService = tipoService<TipoUsuario>("TipoUsuario");