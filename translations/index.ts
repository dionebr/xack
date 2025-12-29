import { legalTranslations } from './legal';

export const translations = {
    en: {
        ...legalTranslations.en,
        friends: {
            breadcrumb: {
                xack: 'xack',
                network: 'network',
                home: 'home'
            },
            profile: {
                edit: 'Edit Profile',
                myFriends: 'My Friends',
                myPhotos: 'My Photos',
                privacy: 'Privacy Settings',
                noReputation: 'No reputation data yet.'
            },
            tabs: {
                alliance: 'Alliance',
                activity: 'Activity',
                duels: 'Duels',
                network: 'Network'
            },
            welcome: 'Welcome back',
            online: 'Online',
            requests: {
                title: 'Friend Requests',
                noRequests: 'No pending requests',
                accept: 'Accept',
                ignore: 'Ignore'
            },
            status: {
                online: 'Online',
                busy: 'Busy',
                away: 'Away',
                offline: 'Offline'
            },
            network: {
                myAllies: "My Allies",
                findOperatives: "Find Operatives",
                requests: "Requests",
                searchPlaceholder: "Search by ID (e.g. 51823) or Username...",
                noOperativesFound: "No operatives found.",
                enterCoordinates: "Enter coordinates to locate operatives.",
                pendingRequests: "Pending Requests",
                noPendingRequests: "No pending requests.",
                noFriendsConnected: "No friends connected. Switch to 'Find Operatives' to expand your network.",
                recentVisitors: "Recent Visitors",
                noRecentSignals: "No recent signals.",
                you: "You"
            },
            alliance: {
                ranking: "Alliance Ranking",
                topAgent: "Top Agent",
                operatives: "Operatives",
                weeklyReset: "WEEKLY RESET",
                globalRank: "GLOBAL RANK",
                loading: "Loading ranking...",
                noOperatives: "No operatives in alliance yet.",
                active: "ACTIVE",
                table: {
                    flg: "FLG",
                    sys: "SYS",
                    bld: "BLD",
                    pts: "PTS"
                }
            },
            duels: {
                active: "Active Duels",
                create: "Create Duel",
                noDuels: "No active duels found. Be the challenger."
            },
            filters: {
                allTime: "All Time",
                weekly: "Weekly"
            }
        },
        quotes: {
            stupidity: "There is no patch for human stupidity.",
            bug: "It's not a bug, it's a feature.",
            hacking: "Hacking is the art of creative problem solving.",
            dance: "Dance like nobody is watching. Encrypt like everyone is.",
            social: "Social Engineering: Because there is no patch for human stupidity.",
            email: "I read your email.",
            admin: "Admin is watching you."
        },
        actions: {
            allyAdded: "Ally added.",
            connectionSevered: "Connection severed.",
            confirmSever: "Sever connection?",
            actionFailed: "Action failed",
            buzzSent: "Buzz sent!",
            searchFailed: "Search failed",
            friendRequestSent: "Friend request sent!",
            failedToSendRequest: "Failed to send request",
            alreadyConnected: "You are already connected or request is pending.",
            scanning: "Scanning...",
            search: "Search",
            addFriend: "Add Friend",
            connected: "Connected",
            wantsToBeFriend: "Wants to be your friend",
            viewAll: "view all",
            copyId: "Copy ID",
            posted: "Posted to network",
            deleted: "Post deleted"
        },
        community: {
            title: "Communities",
            seeAll: "See All",
            loading: "Loading...",
            noCommunities: "No communities yet",
            joinCreate: "Join / Create",
            manage: "Manage Communities",
            hub: {
                title: "Community Hub",
                subtitle: "Join the underground networks or create your own faction.",
                create: "Create Community",
                browse: "All Communities",
                search_placeholder: "Search operations...",
                no_results: "No communities found matching criteria."
            },
            modal: {
                title: "Initialize Community",
                name_placeholder: "Community Name",
                desc_placeholder: "Description (Mission objective, protocols...)",
                create_btn: "Initialize Community",
                cancel_btn: "Abort"
            },
            detail: {
                back: "COMMUNITIES",
                join: "Join Community",
                leave: "Leave Community",
                request: "Request Entry",
                pending: "Pending Approval",
                actions: "Actions",
                edit: "Edit Community",
                report: "Report Abuse",
                members_count: "Members",
                about: "About",
                recent_discussions: "Recent Discussions",
                new_topic: "New Topic",
                no_topics: "No topics yet. Start the transmission.",
                related: "Related",
                view_all: "view all",
                created: "Created",
                language: "Language",
                access: "Access",
                private: "Private"
            },
            types: {
                discussion: "Msg",
                help: "SOS",
                debate: "Debate",
                analysis: "Intel"
            },
            role: {
                owner: "Owner",
                moderator: "Moderator",
                member: "Member"
            },
            topic: {
                loading: "Loading transmission...",
                breadcrumb: "TOPIC",
                responses: "Responses",
                no_replies: "No transmissions yet. Channel is open.",
                reply_placeholder: "Transmit your response...",
                secure_log: "Encrypted Connection • Logged",
                transmitting: "Transmitting...",
                send_reply: "Send Reply",
                view_all: "View all topics",
                delete: "Delete Topic",
                pin: "Pin Topic",
                unpin: "Unpin Topic",
                modal: {
                    title: "Transmit New Topic",
                    subject: "Subject",
                    type: "Type",
                    content: "Payload Content",
                    send: "Send Transmission",
                    cancel: "Cancel"
                }
            },
            members: {
                title: "Member List",
                pending: "Pending Approvals",
                requesting: "Requesting to join",
                approve: "Approve",
                reject: "Reject",
                promote: "Promote to Moderator",
                demote: "Demote to Member",
                kick: "Kick Member",
                ban: "Ban User"
            }
        },
        post: {
            create_button: "Create Article",
            placeholder: "Share your knowledge...",
            article: {
                title_placeholder: "Article Title",
                content_placeholder: "Write your masterpiece...",
                cover_image: "Add Cover Image",
                publish: "Publish Article",
                cancel: "Cancel"
            },
            types: {
                explain: "Explain",
                question: "Question",
                guide: "Guide",
                payload: "Payload",
                insight: "Insight"
            },
            actions: {
                edit: "Edit",
                delete: "Delete",
                cancel: "Cancel",
                save: "Save",
                confirm: "Confirm",
                close: "Close",
                continue: "Continue",
                back: "Back",
                deleted: "Deleted successfully",
                actionFailed: "Action failed"
            },
            filters: {
                allTypes: "All Types"
            },
            readMore: "Unlock Reading",
            readLess: "Hide Reading"
        },
        feed: {
            scanning: "Scanning network...",
            noSignals: "No signals detected"
        },
        profile: {
            specializations: "Specializations"
        },
        main: {
            brazil: "Brazil",
            english: "English"
        },
        notifications: {
            title: 'NOTIFICATIONS',
            empty: 'No new notifications',
            mark_read: 'Mark all Read',
            view_all: 'View All',
            types: {
                friend_request: 'wants to connect',
                new_post: 'posted a new transmission',
                reply_post: 'replied to your post',
                reply_activity: 'replied to your activity',
                like_post: 'liked your post',
                like_activity: 'liked your activity',
                community_request: 'requests to join',
                captured_flag: 'captured the flag',
                unlocked_machine: 'unlocked intel',
                purchased_exploit: 'purchased an exploit',
            },
            actions: {
                approve: 'Approve',
                reject: 'Reject',
                accept: 'Accept',
                ignore: 'Ignore',
            },
            time: {
                just_now: 'just now',
                ago: 'ago'
            }
        }
    },
    pt: {
        ...legalTranslations.pt,
        friends: {
            breadcrumb: {
                xack: 'xack',
                network: 'rede',
                home: 'início'
            },
            profile: {
                edit: 'Editar Perfil',
                myFriends: 'Meus Amigos',
                myPhotos: 'Minhas Fotos',
                privacy: 'Configurações de Privacidade',
                noReputation: 'Sem dados de reputação ainda.'
            },
            tabs: {
                alliance: 'Aliança',
                activity: 'Atividade',
                duels: 'Duelos',
                network: 'Rede'
            },
            welcome: 'Bem-vindo de volta',
            online: 'Online',
            requests: {
                title: 'Solicitações de Amizade',
                noRequests: 'Nenhuma solicitação pendente',
                accept: 'Aceitar',
                ignore: 'Ignorar'
            },
            status: {
                online: 'Online',
                busy: 'Ocupado',
                away: 'Ausente',
                offline: 'Offline'
            },
            network: {
                myAllies: "Meus Aliados",
                findOperatives: "Encontrar Operativos",
                requests: "Solicitações",
                searchPlaceholder: "Buscar por ID (ex: 51823) ou Username...",
                noOperativesFound: "Nenhum operativo encontrado.",
                enterCoordinates: "Insira coordenadas para localizar operativos.",
                pendingRequests: "Solicitações Pendentes",
                noPendingRequests: "Nenhuma solicitação pendente.",
                noFriendsConnected: "Nenhum amigo conectado. Mude para 'Encontrar Operativos' para expandir sua rede.",
                recentVisitors: "Visitantes Recentes",
                noRecentSignals: "Sem sinais recentes.",
                you: "Você"
            },
            alliance: {
                ranking: "Ranking da Aliança",
                topAgent: "Agente Top",
                operatives: "Operativos",
                weeklyReset: "RESET SEMANAL",
                globalRank: "RANK GLOBAL",
                loading: "Carregando ranking...",
                noOperatives: "Nenhum operativo na aliança ainda.",
                active: "ATIVO",
                table: {
                    flg: "FLG",
                    sys: "SYS",
                    bld: "BLD",
                    pts: "PTS"
                }
            },
            duels: {
                active: "Duelos Ativos",
                create: "Criar Duelo",
                noDuels: "Nenhum duelo encontrado. Seja o desafiante."
            },
            filters: {
                allTime: "Todo o Tempo",
                weekly: "Semanal"
            }
        },
        quotes: {
            stupidity: "Não existe patch para a estupidez humana.",
            bug: "Não é um bug, é uma feature.",
            hacking: "Hacking é a arte da resolução criativa de problemas.",
            dance: "Dance como se ninguém estivesse olhando. Criptografe como se todos estivessem.",
            social: "Engenharia Social: Porque não existe patch para a estupidez humana.",
            email: "Eu li seu email.",
            admin: "O Admin está vigiando você."
        },
        actions: {
            allyAdded: "Aliado adicionado.",
            connectionSevered: "Conexão cortada.",
            confirmSever: "Cortar conexão?",
            actionFailed: "Ação falhou",
            buzzSent: "Buzz enviado!",
            searchFailed: "Busca falhou",
            friendRequestSent: "Solicitação de amizade enviada!",
            failedToSendRequest: "Falha ao enviar solicitação",
            alreadyConnected: "Você já está conectado ou a solicitação está pendente.",
            scanning: "Escaneando...",
            search: "Buscar",
            addFriend: "Adicionar Amigo",
            back: "Voltar",
            deleted: "Excluído com sucesso",
            continue: "Continuar",
            cancel: "Cancelar",
            connected: "Conectado",
            wantsToBeFriend: "Quer ser seu amigo",
            viewAll: "ver todos",
            copyId: "Copiar ID",
            posted: "Postado na rede",
            deleted: "Postagem excluída"
        },
        community: {
            title: "Comunidades",
            seeAll: "Ver Todas",
            loading: "Carregando...",
            noCommunities: "Nenhuma comunidade ainda",
            joinCreate: "Entrar / Criar",
            manage: "Gerenciar Comunidades",
            hub: {
                title: "Central da Comunidade",
                subtitle: "Junte-se às redes subterrâneas ou crie sua própria facção.",
                create: "Criar Comunidade",
                browse: "Todas as Comunidades",
                search_placeholder: "Buscar operações...",
                no_results: "Nenhuma comunidade encontrada."
            },
            modal: {
                title: "Inicializar Comunidade",
                name_placeholder: "Nome da Comunidade",
                desc_placeholder: "Descrição (Objetivo da missão, protocolos...)",
                create_btn: "Inicializar Comunidade",
                cancel_btn: "Abortar"
            },
            detail: {
                back: "COMUNIDADES",
                join: "Participar",
                leave: "Sair da Comunidade",
                request: "Solicitar Entrada",
                pending: "Aprovação Pendente",
                actions: "Ações",
                edit: "Editar Comunidade",
                report: "Reportar Abuso",
                members_count: "Membros",
                about: "Sobre",
                recent_discussions: "Discussões Recentes",
                new_topic: "Novo Tópico",
                no_topics: "Nenhum tópico ainda. Inicie a transmissão.",
                related: "Relacionados",
                view_all: "ver todos",
                created: "Criado",
                language: "Idioma",
                access: "Acesso",
                private: "Privado"
            },
            types: {
                discussion: "Msg",
                help: "SOS",
                debate: "Debate",
                analysis: "Intel"
            },
            role: {
                owner: "Dono",
                moderator: "Moderador",
                member: "Membro"
            },
            topic: {
                loading: "Carregando transmissão...",
                breadcrumb: "TÓPICO",
                responses: "Respostas",
                no_replies: "Sem transmissões ainda. Canal aberto.",
                reply_placeholder: "Transmita sua resposta...",
                secure_log: "Conexão Criptografada • Logado",
                transmitting: "Transmitindo...",
                send_reply: "Enviar Resposta",
                view_all: "Ver todos os tópicos",
                delete: "Apagar Tópico",
                pin: "Fixar Tópico",
                unpin: "Desafixar Tópico",
                modal: {
                    title: "Transmitir Novo Tópico",
                    subject: "Assunto",
                    type: "Tipo",
                    content: "Conteúdo do Payload",
                    send: "Enviar Transmissão",
                    cancel: "Cancelar"
                }
            },
            members: {
                title: "Lista de Membros",
                pending: "Aprovações Pendentes",
                requesting: "Solicitando entrada",
                approve: "Aprovar",
                reject: "Rejeitar",
                promote: "Promover a Moderador",
                demote: "Rebaixar a Membro",
                kick: "Expulsar Membro",
                ban: "Banir Usuário"
            }
        },
        post: {
            create_button: "Criar Artigo",
            placeholder: "Compartilhe seu conhecimento...",
            article: {
                title_placeholder: "Título do Artigo",
                content_placeholder: "Que experiência merece ser registrada?",
                cover_image: "Adicionar Capa",
                publish: "Publicar Artigo",
                cancel: "Cancelar"
            },
            types: {
                explain: "Explicação",
                question: "Pergunta",
                guide: "Guia",
                payload: "Payload",
                insight: "Insight"
            },
            areas: {
                all: "Todas as Áreas",
                web: "Web",
                ad: "AD",
                cloud: "Cloud",
                crypto: "Cripto",
                mobile: "Mobile",
                reverse: "Reverso",
                general: "Geral"
            },
            filters: {
                allTypes: "Todos os Tipos"
            },
            readMore: "Desbloquear Leitura",
            readLess: "Ocultar Leitura"
        },
        feed: {
            scanning: "Escaneando rede...",
            noSignals: "Nenhum sinal detectado"
        },
        profile: {
            specializations: "Especializações"
        },
        main: {
            brazil: "Brasil",
            english: "Inglês"
        },
        notifications: {
            title: 'NOTIFICAÇÕES',
            empty: 'Sem novas notificações',
            mark_read: 'Marcar todas como lidas',
            view_all: 'Ver todas',
            types: {
                friend_request: 'quer conectar-se',
                new_post: 'postou uma nova transmissão',
                reply_post: 'respondeu ao seu post',
                reply_activity: 'respondeu à sua atividade',
                like_post: 'curtiu seu post',
                like_activity: 'curtiu sua atividade',
                community_request: 'solicita participar de',
                captured_flag: 'capturou a flag',
                unlocked_machine: 'desbloqueou intel',
                purchased_exploit: 'comprou um exploit',
            },
            actions: {
                approve: 'Aprovar',
                reject: 'Rejeitar',
                accept: 'Aceitar',
                ignore: 'Ignorar',
            },
            time: {
                just_now: 'agora',
                ago: 'atrás'
            }
        }
    }
};
