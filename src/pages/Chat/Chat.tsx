import {
    HiOutlineMagnifyingGlass,
    HiOutlinePlus,
    HiOutlineUserGroup,
    HiOutlinePaperAirplane,
    HiOutlineArrowLeft,
    HiOutlineEllipsisVertical,
    HiOutlinePencil,
    HiOutlineTrash,
} from "react-icons/hi2";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { useAuth } from "../../context/AuthContext";

import {
    getChatUsers,
    getConversations,
    getMessages,
    createDirectChat,
    createGroupChat,
    type ChatUser,
    type Conversation,
    type Message,
} from "../../services/chat";

import { io, Socket } from "socket.io-client";

export default function Chat() {
    const { user } = useAuth();

    const [conversations, setConversations] =
        useState<Conversation[]>([]);

    const [selectedConversation, setSelectedConversation] =
        useState<Conversation | null>(null);

    const [messages, setMessages] =
        useState<Message[]>([]);

    const [users, setUsers] =
        useState<ChatUser[]>([]);

    const [search, setSearch] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [messagesLoading, setMessagesLoading] =
        useState(false);

    const [showNewChat, setShowNewChat] =
        useState(false);

    const [showGroupModal, setShowGroupModal] =
        useState(false);

    const [groupName, setGroupName] =
        useState("");

    const [selectedMembers, setSelectedMembers] =
        useState<string[]>([]);

    const [typingUser, setTypingUser] =
        useState<string | null>(null);

    /*
     * EDIT MESSAGE
     */
    const [editingMessageId, setEditingMessageId] =
        useState<string | null>(null);

    const [editingContent, setEditingContent] =
        useState("");

    /*
     * MESSAGE OPTIONS
     */
    const [openMessageMenuId, setOpenMessageMenuId] =
        useState<string | null>(null);

    const socketRef =
        useRef<Socket | null>(null);

    const selectedConversationRef =
        useRef<Conversation | null>(null);

    const messagesEndRef =
        useRef<HTMLDivElement | null>(null);


    async function requestNotificationPermission() {
        if (!("Notification" in window)) {
            console.log("Browser notifications are not supported");
            return;
        }

        if (Notification.permission === "default") {
            const permission =
                await Notification.requestPermission();

            console.log(
                "Notification permission:",
                permission
            );
        }
    }

    useEffect(() => {
        requestNotificationPermission();
    }, []);

    function playNotificationSound() {
        try {
            const AudioContext =
                window.AudioContext ||
                (
                    window as typeof window & {
                        webkitAudioContext?: typeof AudioContext;
                    }
                ).webkitAudioContext;

            if (!AudioContext) {
                return;
            }

            const audioContext =
                new AudioContext();

            const oscillator =
                audioContext.createOscillator();

            const gainNode =
                audioContext.createGain();

            oscillator.type = "sine";

            // First tone
            oscillator.frequency.setValueAtTime(
                880,
                audioContext.currentTime
            );

            // Second tone
            oscillator.frequency.setValueAtTime(
                660,
                audioContext.currentTime + 0.15
            );

            gainNode.gain.setValueAtTime(
                0.0001,
                audioContext.currentTime
            );

            gainNode.gain.exponentialRampToValueAtTime(
                0.8,
                audioContext.currentTime + 0.02
            );

            gainNode.gain.exponentialRampToValueAtTime(
                0.0001,
                audioContext.currentTime + 0.45
            );

            oscillator.connect(gainNode);
            gainNode.connect(
                audioContext.destination
            );

            oscillator.start();

            oscillator.stop(
                audioContext.currentTime + 0.45
            );

            oscillator.onended = () => {
                audioContext.close();
            };
        } catch (error) {
            console.error(
                "Notification sound failed:",
                error
            );
        }
    }

    function showMessageNotification(
        newMessage: Message
    ) {
        if (!user?.id) {
            return;
        }

        if (newMessage.senderId === user.id) {
            return;
        }

        if (!("Notification" in window)) {
            return;
        }

        if (
            Notification.permission !==
            "granted"
        ) {
            return;
        }

        const currentConversation =
            selectedConversationRef.current;

        if (
            currentConversation?.id ===
            newMessage.conversationId
        ) {
            return;
        }

        const notification =
            new Notification(
                `💬 ${newMessage.sender.name}`,
                {
                    body: newMessage.content,
                    tag: `chat-${newMessage.conversationId}`,
                }
            );

        playNotificationSound();

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        setTimeout(() => {
            notification.close();
        }, 5000);
    }

    /*
     * Keep selected conversation ref
     * synchronized.
     *
     * This also prevents the Socket.IO
     * listener from using an old conversation.
     */
    useEffect(() => {
        selectedConversationRef.current =
            selectedConversation;
    }, [selectedConversation]);


    /*
     * LOAD CONVERSATIONS
     */
    async function loadConversations() {
        try {
            setLoading(true);

            const data =
                await getConversations();

            setConversations(data);
        } finally {
            setLoading(false);
        }
    }

    /*
     * LOAD REGISTERED USERS
     */
    async function loadUsers() {
        const data =
            await getChatUsers();

        setUsers(data);
    }

    useEffect(() => {
        loadConversations();
        loadUsers();
    }, []);

    /*
     * CLOSE MESSAGE MENU
     * WHEN CLICKING OUTSIDE
     */
    useEffect(() => {
        function handleDocumentClick() {
            setOpenMessageMenuId(null);
        }

        document.addEventListener(
            "click",
            handleDocumentClick
        );

        return () => {
            document.removeEventListener(
                "click",
                handleDocumentClick
            );
        };
    }, []);

    /*
     * SOCKET CONNECTION
     */
    useEffect(() => {
        // const socket = io(
        //     "http://localhost:5000",
        //     {
        //         withCredentials: true,
        //     }
        // );

        const socket = io(
            import.meta.env.VITE_API_URL,
            {
                withCredentials: true,
            }
        );

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log(
                "💬 Chat socket connected:",
                socket.id
            );
        });

        /*
         * NEW MESSAGE
         */
        socket.on(
            "new_message",
            (newMessage: Message) => {
                console.log(
                    "🔔 NEW MESSAGE EVENT:",
                    newMessage
                );

                showMessageNotification(
                    newMessage
                );

                const currentConversation =
                    selectedConversationRef.current;

                const isCurrentConversation =
                    currentConversation?.id ===
                    newMessage.conversationId;

                /*
                 * Message belongs to the currently
                 * opened conversation.
                 */
                if (isCurrentConversation) {
                    setMessages((previous) => {
                        const exists =
                            previous.some(
                                (item) =>
                                    item.id ===
                                    newMessage.id
                            );

                        if (exists) {
                            return previous;
                        }

                        return [
                            ...previous,
                            newMessage,
                        ];
                    });
                }

                /*
                 * Always update sidebar preview.
                 */
                setConversations(
                    (previous) =>
                        previous.map(
                            (conversation) => {
                                if (
                                    conversation.id !==
                                    newMessage.conversationId
                                ) {
                                    return conversation;
                                }

                                return {
                                    ...conversation,

                                    updatedAt:
                                        newMessage.createdAt,

                                    messages: [
                                        newMessage,
                                    ],

                                    unreadCount:
                                        isCurrentConversation
                                            ? 0
                                            : (
                                                conversation.unreadCount ??
                                                0
                                            ) + 1,
                                };
                            }
                        )
                );
            }
        );

        socket.on(
            "conversation_updated",
            (data: {
                conversationId: string;
                message: Message;
                unreadCount: number;
            }) => {
                const currentConversation =
                    selectedConversationRef.current;

                const isCurrentConversation =
                    currentConversation?.id ===
                    data.conversationId;

                setConversations(
                    (previous) => {
                        const existing =
                            previous.find(
                                (conversation) =>
                                    conversation.id ===
                                    data.conversationId
                            );

                        /*
                         * Conversation already exists
                         * in sidebar.
                         */
                        if (existing) {
                            const updated = {
                                ...existing,

                                updatedAt:
                                    data.message.createdAt,

                                messages: [
                                    data.message,
                                ],

                                unreadCount:
                                    isCurrentConversation
                                        ? 0
                                        : data.unreadCount,
                            };

                            return [
                                updated,

                                ...previous.filter(
                                    (conversation) =>
                                        conversation.id !==
                                        data.conversationId
                                ),
                            ];
                        }

                        /*
                         * First message / conversation
                         * isn't currently in local state.
                         *
                         * Reload conversations from API.
                         */
                        loadConversations();

                        return previous;
                    }
                );
            }
        );

        /*
         * MESSAGE UPDATED
         */
        socket.on(
            "message_updated",
            (updatedMessage: Message) => {
                setMessages((previous) =>
                    previous.map(
                        (item) =>
                            item.id ===
                                updatedMessage.id
                                ? updatedMessage
                                : item
                    )
                );

                setConversations((previous) =>
                    previous.map(
                        (conversation) => {
                            if (
                                conversation.id !==
                                updatedMessage.conversationId
                            ) {
                                return conversation;
                            }

                            const lastMessage =
                                conversation.messages?.[0];

                            if (
                                lastMessage?.id !==
                                updatedMessage.id
                            ) {
                                return conversation;
                            }

                            return {
                                ...conversation,
                                messages: [
                                    updatedMessage,
                                ],
                            };
                        }
                    )
                );

                setEditingMessageId(
                    (current) =>
                        current ===
                            updatedMessage.id
                            ? null
                            : current
                );

                setEditingContent("");
                setOpenMessageMenuId(null);
            }
        );

        /*
         * MESSAGE DELETED
         */
        socket.on(
            "message_deleted",
            (deletedMessage: {
                id: string;
                conversationId: string;
                senderId: string;
                deletedAt: string;
            }) => {
                setMessages((previous) =>
                    previous.map(
                        (item) =>
                            item.id ===
                                deletedMessage.id
                                ? {
                                    ...item,
                                    deletedAt:
                                        deletedMessage.deletedAt,
                                }
                                : item
                    )
                );

                setConversations((previous) =>
                    previous.map(
                        (conversation) => {
                            if (
                                conversation.id !==
                                deletedMessage.conversationId
                            ) {
                                return conversation;
                            }

                            const lastMessage =
                                conversation.messages?.[0];

                            if (
                                lastMessage?.id !==
                                deletedMessage.id
                            ) {
                                return conversation;
                            }

                            return {
                                ...conversation,
                                messages: [
                                    {
                                        ...lastMessage,
                                        deletedAt:
                                            deletedMessage.deletedAt,
                                        content:
                                            "This message was deleted",
                                    },
                                ],
                            };
                        }
                    )
                );

                setEditingMessageId(
                    (current) =>
                        current ===
                            deletedMessage.id
                            ? null
                            : current
                );

                setEditingContent("");
                setOpenMessageMenuId(null);
            }
        );

        /*
         * TYPING
         */
        socket.on(
            "user_typing",
            (data: {
                conversationId: string;
                userId: string;
                userName: string;
            }) => {
                const currentConversation =
                    selectedConversationRef.current;

                if (
                    data.userId !== user?.id &&
                    currentConversation?.id ===
                    data.conversationId
                ) {
                    setTypingUser(
                        data.userName
                    );
                }
            }
        );

        /*
         * STOP TYPING
         */
        socket.on(
            "user_stopped_typing",
            () => {
                setTypingUser(null);
            }
        );

        /*
         * CHAT ERROR
         */
        socket.on(
            "chat_error",
            (error: {
                message: string;
            }) => {
                console.error(
                    "Chat error:",
                    error.message
                );
            }
        );

        /*
         * DISCONNECT
         */
        socket.on(
            "disconnect",
            (reason) => {
                console.log(
                    "💬 Chat socket disconnected:",
                    reason
                );
            }
        );

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user?.id]);

    /*
     * OPEN CONVERSATION
     */
    async function openConversation(
        conversation: Conversation
    ) {
        setTypingUser(null);

        setEditingMessageId(null);
        setEditingContent("");
        setOpenMessageMenuId(null);

        setSelectedConversation(
            conversation
        );

        selectedConversationRef.current =
            conversation;

        setMessagesLoading(true);

        try {
            const data =
                await getMessages(
                    conversation.id
                );

            setMessages(data);

            socketRef.current?.emit(
                "join_conversation",
                conversation.id
            );

            /*
             * Mark everything currently in
             * this conversation as read.
             */
            socketRef.current?.emit(
                "mark_conversation_read",
                conversation.id
            );

            /*
             * Remove unread count locally
             * immediately.
             */
            setConversations(
                (previous) =>
                    previous.map(
                        (item) =>
                            item.id ===
                                conversation.id
                                ? {
                                    ...item,
                                    unreadCount: 0,
                                }
                                : item
                    )
            );
        } finally {
            setMessagesLoading(false);
        }
    }

    /*
     * SEND MESSAGE
     */
    function handleSendMessage() {
        if (
            !message.trim() ||
            !selectedConversation
        ) {
            return;
        }

        socketRef.current?.emit(
            "send_message",
            {
                conversationId:
                    selectedConversation.id,
                content:
                    message.trim(),
            }
        );

        setMessage("");

        socketRef.current?.emit(
            "stop_typing",
            selectedConversation.id
        );
    }

    /*
     * START EDITING
     */
    function startEditing(
        item: Message
    ) {
        if (
            item.senderId !== user?.id ||
            item.deletedAt
        ) {
            return;
        }

        setOpenMessageMenuId(null);

        setEditingMessageId(
            item.id
        );

        setEditingContent(
            item.content
        );
    }

    /*
     * CANCEL EDITING
     */
    function cancelEditing() {
        setEditingMessageId(null);
        setEditingContent("");
        setOpenMessageMenuId(null);
    }

    /*
     * SAVE EDITED MESSAGE
     */
    function saveEditedMessage() {
        if (
            !editingMessageId ||
            !editingContent.trim()
        ) {
            return;
        }

        socketRef.current?.emit(
            "update_message",
            {
                messageId:
                    editingMessageId,
                content:
                    editingContent.trim(),
            }
        );
    }

    /*
     * DELETE MESSAGE
     */
    function handleDeleteMessage(
        messageId: string
    ) {
        setOpenMessageMenuId(null);

        const confirmed =
            window.confirm(
                "Delete this message?"
            );

        if (!confirmed) {
            return;
        }

        socketRef.current?.emit(
            "delete_message",
            messageId
        );
    }

    /*
     * MESSAGE TYPING
     */
    function handleMessageChange(
        value: string
    ) {
        setMessage(value);

        if (
            !selectedConversation ||
            !socketRef.current
        ) {
            return;
        }

        if (value.trim()) {
            socketRef.current.emit(
                "typing",
                selectedConversation.id
            );
        } else {
            socketRef.current.emit(
                "stop_typing",
                selectedConversation.id
            );
        }
    }

    /*
     * CREATE DIRECT CHAT
     */
    async function handleCreateDirect(
        userId: string
    ) {
        const conversation =
            await createDirectChat(
                userId
            );

        setConversations(
            (previous) => {
                const exists =
                    previous.some(
                        (item) =>
                            item.id ===
                            conversation.id
                    );

                if (exists) {
                    return previous;
                }

                return [
                    conversation,
                    ...previous,
                ];
            }
        );

        setShowNewChat(false);

        await openConversation(
            conversation
        );
    }

    /*
     * CREATE GROUP
     */
    async function handleCreateGroup() {
        if (
            !groupName.trim() ||
            selectedMembers.length ===
            0
        ) {
            return;
        }

        const conversation =
            await createGroupChat(
                groupName,
                selectedMembers
            );

        setConversations(
            (previous) => [
                conversation,
                ...previous,
            ]
        );

        setGroupName("");
        setSelectedMembers([]);
        setShowGroupModal(false);

        await openConversation(
            conversation
        );
    }

    /*
     * GET CONVERSATION TITLE
     */
    function getConversationTitle(
        conversation: Conversation
    ) {
        if (
            conversation.type ===
            "GROUP"
        ) {
            return (
                conversation.name ||
                "Unnamed Group"
            );
        }

        const otherMember =
            conversation.members.find(
                (member) =>
                    member.userId !==
                    user?.id
            );

        return (
            otherMember?.user.name ||
            "Unknown User"
        );
    }

    /*
     * FILTER USERS
     */
    const filteredUsers =
        useMemo(() => {
            const value =
                search
                    .trim()
                    .toLowerCase();

            if (!value) {
                return users;
            }

            return users.filter(
                (item) =>
                    item.id !==
                    user?.id &&
                    (
                        item.name
                            .toLowerCase()
                            .includes(value) ||
                        item.email
                            .toLowerCase()
                            .includes(value)
                    )
            );
        }, [
            users,
            search,
            user?.id,
        ]);

    /*
     * AUTO SCROLL
     */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView(
            {
                behavior: "smooth",
            }
        );
    }, [messages]);

    /*
     * CONVERSATION LIST
     */
    function renderConversationList() {
        if (loading) {
            return (
                <div className="p-4 text-sm text-[var(--text-muted)]">
                    Loading chats...
                </div>
            );
        }

        if (conversations.length === 0) {
            return (
                <div className="p-6 text-center">
                    <p className="text-sm font-medium text-[var(--text-secondary)]">
                        No conversations yet
                    </p>

                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Start a conversation with a
                        team member.
                    </p>
                </div>
            );
        }



        return conversations.map(
            (conversation) => {
                const active =
                    selectedConversation?.id ===
                    conversation.id;

                const lastMessage =
                    conversation.messages?.[0];

                return (
                    <button
                        key={
                            conversation.id
                        }
                        type="button"
                        onClick={() =>
                            openConversation(
                                conversation
                            )
                        }
                        className={`
                            w-full
                            border-b
                            border-[var(--border)]
                            px-4
                            py-3
                            text-left
                            transition
                            hover:bg-[var(--surface-hover)]
                            ${active
                                ? "bg-[var(--surface-hover)]"
                                : ""
                            }
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-indigo-500/10
                                    text-sm
                                    font-semibold
                                    text-indigo-500
                                "
                            >
                                {conversation.type ===
                                    "GROUP" ? (
                                    <HiOutlineUserGroup
                                        size={19}
                                    />
                                ) : (
                                    getConversationTitle(
                                        conversation
                                    )
                                        .charAt(
                                            0
                                        )
                                        .toUpperCase()
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p
                                        className={`
                min-w-0
                flex-1
                truncate
                text-sm
                ${conversation.unreadCount &&
                                                conversation.unreadCount > 0
                                                ? "font-bold text-[var(--text-primary)]"
                                                : "font-semibold text-[var(--text-primary)]"
                                            }
            `}
                                    >
                                        {getConversationTitle(
                                            conversation
                                        )}
                                    </p>

                                    {conversation.unreadCount &&
                                        conversation.unreadCount > 0 ? (
                                        <span
                                            className="
                    flex
                    h-5
                    min-w-5
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-indigo-500
                    px-1.5
                    text-[10px]
                    font-bold
                    text-white
                "
                                        >
                                            {conversation.unreadCount > 99
                                                ? "99+"
                                                : conversation.unreadCount}
                                        </span>
                                    ) : null}
                                </div>

                                <p
                                    className={`
            mt-0.5
            truncate
            text-xs
            ${conversation.unreadCount &&
                                            conversation.unreadCount > 0
                                            ? "font-medium text-[var(--text-secondary)]"
                                            : "text-[var(--text-muted)]"
                                        }
        `}
                                >
                                    {lastMessage
                                        ? lastMessage.deletedAt
                                            ? "This message was deleted"
                                            : lastMessage.content
                                        : "No messages yet"}
                                </p>
                            </div>
                        </div>
                    </button>
                );
            }
        );
    }

    /*
     * MESSAGE LIST
     */
    function renderMessages() {
        if (messagesLoading) {
            return (
                <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">
                    Loading messages...
                </div>
            );
        }

        if (messages.length === 0) {
            return (
                <div className="flex h-full items-center justify-center px-6 text-center">
                    <div>
                        <p className="text-sm font-medium text-[var(--text-secondary)]">
                            No messages yet
                        </p>

                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                            Send the first message.
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <>
                {messages.map(
                    (item) => {
                        const own =
                            item.senderId ===
                            user?.id;

                        const isEditing =
                            editingMessageId ===
                            item.id;

                        const menuOpen =
                            openMessageMenuId ===
                            item.id;

                        return (
                            <div
                                key={
                                    item.id
                                }
                                className={`
                                    flex
                                    ${own
                                        ? "justify-end"
                                        : "justify-start"
                                    }
                                `}
                            >
                                <div
                                    className={`
                                        relative
                                        max-w-[85%]
                                        sm:max-w-[75%]
                                        lg:max-w-[65%]
                                        rounded-2xl
                                        px-4
                                        py-3
                                        ${own
                                            ? "rounded-br-md bg-indigo-500 text-white"
                                            : "rounded-bl-md border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                                        }
                                    `}
                                >
                                    {!own && (
                                        <p className="mb-1 text-[11px] font-semibold text-indigo-500">
                                            {
                                                item
                                                    .sender
                                                    .name
                                            }
                                        </p>
                                    )}

                                    {item.deletedAt ? (
                                        <>
                                            <p
                                                className={`
                                                    text-sm
                                                    italic
                                                    ${own
                                                        ? "text-white/70"
                                                        : "text-[var(--text-muted)]"
                                                    }
                                                `}
                                            >
                                                This message was
                                                deleted
                                            </p>

                                            <p
                                                className={`
                                                    mt-1
                                                    text-[10px]
                                                    ${own
                                                        ? "text-white/50"
                                                        : "text-[var(--text-muted)]"
                                                    }
                                                `}
                                            >
                                                {new Date(
                                                    item.createdAt
                                                ).toLocaleTimeString(
                                                    "en-IN",
                                                    {
                                                        hour:
                                                            "2-digit",
                                                        minute:
                                                            "2-digit",
                                                    }
                                                )}
                                            </p>
                                        </>
                                    ) : isEditing ? (
                                        /*
                                         * EDIT MODE
                                         */
                                        <div className="space-y-2">
                                            <textarea
                                                value={
                                                    editingContent
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setEditingContent(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                onKeyDown={(
                                                    event
                                                ) => {
                                                    if (
                                                        event.key ===
                                                        "Escape"
                                                    ) {
                                                        cancelEditing();
                                                    }

                                                    if (
                                                        event.key ===
                                                        "Enter" &&
                                                        !event.shiftKey
                                                    ) {
                                                        event.preventDefault();
                                                        saveEditedMessage();
                                                    }
                                                }}
                                                autoFocus
                                                rows={
                                                    2
                                                }
                                                className="
                                                    min-h-[60px]
                                                    w-full
                                                    resize-none
                                                    rounded-lg
                                                    border
                                                    border-white/30
                                                    bg-white/10
                                                    px-2
                                                    py-1.5
                                                    text-sm
                                                    text-white
                                                    outline-none
                                                    placeholder:text-white/50
                                                "
                                            />

                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={
                                                        cancelEditing
                                                    }
                                                    className="
                                                        rounded-lg
                                                        px-2
                                                        py-1
                                                        text-xs
                                                        text-white/70
                                                        hover:bg-white/10
                                                    "
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        saveEditedMessage
                                                    }
                                                    disabled={
                                                        !editingContent.trim()
                                                    }
                                                    className="
                                                        rounded-lg
                                                        bg-white
                                                        px-2
                                                        py-1
                                                        text-xs
                                                        font-medium
                                                        text-indigo-500
                                                        disabled:cursor-not-allowed
                                                        disabled:opacity-50
                                                    "
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /*
                                         * NORMAL MESSAGE
                                         */
                                        <>
                                            <p
                                                className="
                                                    whitespace-pre-wrap
                                                    break-words
                                                    pr-6
                                                    text-sm
                                                "
                                            >
                                                {
                                                    item.content
                                                }
                                            </p>

                                            <div
                                                className="
                                                    mt-1
                                                    flex
                                                    items-center
                                                    gap-2
                                                "
                                            >
                                                <p
                                                    className={`
                                                        text-[10px]
                                                        ${own
                                                            ? "text-white/70"
                                                            : "text-[var(--text-muted)]"
                                                        }
                                                    `}
                                                >
                                                    {new Date(
                                                        item.createdAt
                                                    ).toLocaleTimeString(
                                                        "en-IN",
                                                        {
                                                            hour:
                                                                "2-digit",
                                                            minute:
                                                                "2-digit",
                                                        }
                                                    )}
                                                </p>

                                                {item.updatedAt !==
                                                    item.createdAt && (
                                                        <span
                                                            className={`
                                                            text-[9px]
                                                            italic
                                                            ${own
                                                                    ? "text-white/60"
                                                                    : "text-[var(--text-muted)]"
                                                                }
                                                        `}
                                                        >
                                                            edited
                                                        </span>
                                                    )}
                                            </div>

                                            {/*
                                             * THREE DOT MENU
                                             *
                                             * Absolutely positioned
                                             * in the top-right corner.
                                             *
                                             * It does NOT create
                                             * another line.
                                             */}
                                            {own && (
                                                <div
                                                    className="
                                                        absolute
                                                        right-1.5
                                                        top-1.5
                                                    "
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={(
                                                            event
                                                        ) => {
                                                            event.stopPropagation();

                                                            setOpenMessageMenuId(
                                                                (current) =>
                                                                    current ===
                                                                        item.id
                                                                        ? null
                                                                        : item.id
                                                            );
                                                        }}
                                                        className="
                                                            flex
                                                            h-6
                                                            w-6
                                                            items-center
                                                            justify-center
                                                            rounded-full
                                                            text-white/60
                                                            transition
                                                            hover:bg-white/10
                                                            hover:text-white
                                                        "
                                                        aria-label="Message options"
                                                        aria-expanded={
                                                            menuOpen
                                                        }
                                                    >
                                                        <HiOutlineEllipsisVertical
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button>

                                                    {menuOpen && (
                                                        <div
                                                            onClick={(
                                                                event
                                                            ) =>
                                                                event.stopPropagation()
                                                            }
                                                            className="
                                                                absolute
                                                                right-0
                                                                top-7
                                                                z-[100]
                                                                w-32
                                                                overflow-hidden
                                                                rounded-xl
                                                                border
                                                                border-[var(--border)]
                                                                bg-[var(--surface-elevated)]
                                                                py-1
                                                                shadow-xl
                                                            "
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    startEditing(
                                                                        item
                                                                    )
                                                                }
                                                                className="
                                                                    flex
                                                                    w-full
                                                                    items-center
                                                                    gap-2
                                                                    px-3
                                                                    py-2
                                                                    text-left
                                                                    text-xs
                                                                    text-[var(--text-primary)]
                                                                    transition
                                                                    hover:bg-[var(--surface-hover)]
                                                                "
                                                            >
                                                                <HiOutlinePencil
                                                                    size={
                                                                        14
                                                                    }
                                                                />

                                                                <span>
                                                                    Edit
                                                                </span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteMessage(
                                                                        item.id
                                                                    )
                                                                }
                                                                className="
                                                                    flex
                                                                    w-full
                                                                    items-center
                                                                    gap-2
                                                                    px-3
                                                                    py-2
                                                                    text-left
                                                                    text-xs
                                                                    text-red-500
                                                                    transition
                                                                    hover:bg-red-500/10
                                                                "
                                                            >
                                                                <HiOutlineTrash
                                                                    size={
                                                                        14
                                                                    }
                                                                />

                                                                <span>
                                                                    Delete
                                                                </span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    }
                )}

                <div ref={messagesEndRef} />
            </>
        );
    }

    return (
        <div
            className="
                flex
                h-[calc(100dvh-140px)]
                min-h-[500px]
                overflow-hidden
                rounded-2xl
                border
                border-[var(--border)]
                bg-[var(--surface)]
                shadow-sm
            "
        >
            {/* =====================================================
                CONVERSATION PANEL
            ====================================================== */}

            <section
                className={`
                    flex
                    w-full
                    shrink-0
                    flex-col
                    border-r
                    border-[var(--border)]
                    lg:w-[340px]
                    ${selectedConversation
                        ? "hidden lg:flex"
                        : "flex"
                    }
                `}
            >
                {/* Header */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-[var(--border)]
                        px-4
                        py-4
                    "
                >


                    <div>
                        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                            Chat
                        </h1>

                        <p className="text-xs text-[var(--text-muted)]">
                            Team conversations
                        </p>
                    </div>

                    <div className="flex gap-1">
                        <button
                            type="button"
                            onClick={() =>
                                setShowNewChat(
                                    true
                                )
                            }
                            className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                text-[var(--text-secondary)]
                                transition
                                hover:bg-[var(--surface-hover)]
                            "
                            aria-label="New chat"
                        >
                            <HiOutlinePlus
                                size={19}
                            />
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setShowGroupModal(
                                    true
                                )
                            }
                            className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                text-[var(--text-secondary)]
                                transition
                                hover:bg-[var(--surface-hover)]
                            "
                            aria-label="Create group"
                        >
                            <HiOutlineUserGroup
                                size={19}
                            />
                        </button>
                    </div>
                </div>

                {/* Search */}

                <div className="p-3">
                    <div className="relative">
                        <HiOutlineMagnifyingGlass
                            className="
                                absolute
                                left-3
                                top-1/2
                                -translate-y-1/2
                                text-[var(--text-muted)]
                            "
                            size={17}
                        />

                        <input
                            value={search}
                            onChange={(
                                event
                            ) =>
                                setSearch(
                                    event
                                        .target
                                        .value
                                )
                            }
                            placeholder="Search people or chats..."
                            className="
                                h-10
                                w-full
                                rounded-xl
                                border
                                border-[var(--border)]
                                bg-[var(--surface-elevated)]
                                pl-9
                                pr-3
                                text-sm
                                text-[var(--text-primary)]
                                outline-none
                                placeholder:text-[var(--text-muted)]
                                focus:border-indigo-500
                            "
                        />
                    </div>
                </div>

                {/* Conversations */}

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {renderConversationList()}
                </div>
            </section>

            {/* =====================================================
                CHAT PANEL
            ====================================================== */}

            <section
                className={`
                    min-w-0
                    flex-1
                    flex-col
                    ${selectedConversation
                        ? "flex"
                        : "hidden lg:flex"
                    }
                `}
            >
                {!selectedConversation ? (
                    <div className="hidden h-full items-center justify-center lg:flex">
                        <div className="text-center">
                            <div
                                className="
                                    mx-auto
                                    mb-4
                                    flex
                                    h-14
                                    w-14
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-indigo-500/10
                                    text-indigo-500
                                "
                            >
                                <HiOutlineUserGroup
                                    size={26}
                                />
                            </div>

                            <h2 className="text-base font-semibold text-[var(--text-primary)]">
                                Select a conversation
                            </h2>

                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                                Choose a team member or
                                group to start chatting.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chat header */}

                        <header
                            className="
                                flex
                                h-[65px]
                                shrink-0
                                items-center
                                gap-3
                                border-b
                                border-[var(--border)]
                                px-3
                                sm:px-5
                            "
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedConversation(
                                        null
                                    );

                                    selectedConversationRef.current =
                                        null;

                                    setEditingMessageId(
                                        null
                                    );

                                    setEditingContent(
                                        ""
                                    );

                                    setOpenMessageMenuId(
                                        null
                                    );
                                }}
                                className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    text-[var(--text-secondary)]
                                    hover:bg-[var(--surface-hover)]
                                    lg:hidden
                                "
                                aria-label="Back to conversations"
                            >
                                <HiOutlineArrowLeft
                                    size={19}
                                />
                            </button>

                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-indigo-500/10
                                    text-sm
                                    font-semibold
                                    text-indigo-500
                                "
                            >
                                {selectedConversation.type ===
                                    "GROUP" ? (
                                    <HiOutlineUserGroup
                                        size={19}
                                    />
                                ) : (
                                    getConversationTitle(
                                        selectedConversation
                                    )
                                        .charAt(
                                            0
                                        )
                                        .toUpperCase()
                                )}
                            </div>

                            <div className="min-w-0">
                                <h2 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                                    {getConversationTitle(
                                        selectedConversation
                                    )}
                                </h2>

                                <p className="text-xs text-[var(--text-muted)]">
                                    {selectedConversation.type ===
                                        "GROUP"
                                        ? `${selectedConversation.members.length} members`
                                        : "Direct message"}
                                </p>
                            </div>
                        </header>

                        {/* Messages */}

                        <div
                            className="
                                min-h-0
                                flex-1
                                overflow-y-auto
                                px-3
                                py-4
                                sm:px-5
                            "
                        >
                            <div className="space-y-3">
                                {renderMessages()}
                            </div>

                            {typingUser && (
                                <p className="mt-2 text-xs text-[var(--text-muted)]">
                                    {typingUser} is
                                    typing...
                                </p>
                            )}
                        </div>

                        {/* Composer */}

                        <div
                            className="
                                shrink-0
                                border-t
                                border-[var(--border)]
                                p-3
                                sm:p-4
                            "
                        >
                            <div className="flex items-end gap-2">
                                <textarea
                                    value={
                                        message
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        handleMessageChange(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    onKeyDown={(
                                        event
                                    ) => {
                                        if (
                                            event.key ===
                                            "Enter" &&
                                            !event.shiftKey
                                        ) {
                                            event.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    rows={1}
                                    placeholder="Type a message..."
                                    className="
                                        max-h-32
                                        min-h-10
                                        flex-1
                                        resize-none
                                        rounded-xl
                                        border
                                        border-[var(--border)]
                                        bg-[var(--surface-elevated)]
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-[var(--text-primary)]
                                        outline-none
                                        placeholder:text-[var(--text-muted)]
                                        focus:border-indigo-500
                                    "
                                />

                                <button
                                    type="button"
                                    onClick={
                                        handleSendMessage
                                    }
                                    disabled={
                                        !message.trim()
                                    }
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-indigo-500
                                        text-white
                                        transition
                                        hover:bg-indigo-600
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                    aria-label="Send message"
                                >
                                    <HiOutlinePaperAirplane
                                        size={18}
                                    />
                                </button>
                            </div>

                            <p className="mt-1 hidden text-[10px] text-[var(--text-muted)] sm:block">
                                Enter to send · Shift + Enter
                                for a new line
                            </p>
                        </div>
                    </>
                )}
            </section>

            {/* =====================================================
                NEW CHAT MODAL
            ====================================================== */}

            {showNewChat && (
                <div
                    className="
                        fixed
                        inset-0
                        z-[300]
                        flex
                        items-center
                        justify-center
                        bg-black/40
                        p-4
                    "
                >
                    <div
                        className="
                            w-full
                            max-w-md
                            overflow-hidden
                            rounded-2xl
                            border
                            border-[var(--border)]
                            bg-[var(--surface-elevated)]
                            shadow-2xl
                        "
                    >
                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                border-b
                                border-[var(--border)]
                                px-5
                                py-4
                            "
                        >
                            <div>
                                <h2 className="font-semibold text-[var(--text-primary)]">
                                    New conversation
                                </h2>

                                <p className="mt-1 text-xs text-[var(--text-muted)]">
                                    Chat with a registered
                                    team member.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowNewChat(
                                        false
                                    )
                                }
                                className="text-sm text-[var(--text-muted)]"
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto">
                            {filteredUsers
                                .filter(
                                    (item) =>
                                        item.id !==
                                        user?.id
                                )
                                .map(
                                    (
                                        item
                                    ) => (
                                        <button
                                            key={
                                                item.id
                                            }
                                            type="button"
                                            onClick={() =>
                                                handleCreateDirect(
                                                    item.id
                                                )
                                            }
                                            className="
                                                flex
                                                w-full
                                                items-center
                                                gap-3
                                                border-b
                                                border-[var(--border)]
                                                px-5
                                                py-3
                                                text-left
                                                hover:bg-[var(--surface-hover)]
                                            "
                                        >
                                            <div
                                                className="
                                                    flex
                                                    h-9
                                                    w-9
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    bg-indigo-500/10
                                                    text-sm
                                                    font-semibold
                                                    text-indigo-500
                                                "
                                            >
                                                {item.name
                                                    .charAt(
                                                        0
                                                    )
                                                    .toUpperCase()}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                                                    {
                                                        item.name
                                                    }
                                                </p>

                                                <p className="truncate text-xs text-[var(--text-muted)]">
                                                    {
                                                        item.email
                                                    }
                                                </p>
                                            </div>
                                        </button>
                                    )
                                )}
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================
                GROUP MODAL
            ====================================================== */}

            {showGroupModal && (
                <div
                    className="
                        fixed
                        inset-0
                        z-[300]
                        flex
                        items-center
                        justify-center
                        bg-black/40
                        p-4
                    "
                >
                    <div
                        className="
                            w-full
                            max-w-md
                            overflow-hidden
                            rounded-2xl
                            border
                            border-[var(--border)]
                            bg-[var(--surface-elevated)]
                            shadow-2xl
                        "
                    >
                        <div
                            className="
                                border-b
                                border-[var(--border)]
                                px-5
                                py-4
                            "
                        >
                            <h2 className="font-semibold text-[var(--text-primary)]">
                                Create group
                            </h2>

                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                Add registered team members.
                            </p>
                        </div>

                        <div className="space-y-4 p-5">
                            <input
                                value={
                                    groupName
                                }
                                onChange={(
                                    event
                                ) =>
                                    setGroupName(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Group name"
                                className="
                                    h-10
                                    w-full
                                    rounded-xl
                                    border
                                    border-[var(--border)]
                                    bg-[var(--surface-elevated)]
                                    px-3
                                    text-sm
                                    text-[var(--text-primary)]
                                    outline-none
                                    focus:border-indigo-500
                                "
                            />

                            <div className="max-h-60 overflow-y-auto rounded-xl border border-[var(--border)]">
                                {users
                                    .filter(
                                        (
                                            item
                                        ) =>
                                            item.id !==
                                            user?.id
                                    )
                                    .map(
                                        (
                                            item
                                        ) => {
                                            const checked =
                                                selectedMembers.includes(
                                                    item.id
                                                );

                                            return (
                                                <label
                                                    key={
                                                        item.id
                                                    }
                                                    className="
                                                        flex
                                                        cursor-pointer
                                                        items-center
                                                        gap-3
                                                        border-b
                                                        border-[var(--border)]
                                                        px-3
                                                        py-2.5
                                                        last:border-b-0
                                                        hover:bg-[var(--surface-hover)]
                                                    "
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            checked
                                                        }
                                                        onChange={() => {
                                                            setSelectedMembers(
                                                                (
                                                                    previous
                                                                ) =>
                                                                    checked
                                                                        ? previous.filter(
                                                                            (
                                                                                id
                                                                            ) =>
                                                                                id !==
                                                                                item.id
                                                                        )
                                                                        : [
                                                                            ...previous,
                                                                            item.id,
                                                                        ]
                                                            );
                                                        }}
                                                    />

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                                                            {
                                                                item.name
                                                            }
                                                        </p>

                                                        <p className="truncate text-xs text-[var(--text-muted)]">
                                                            {
                                                                item.email
                                                            }
                                                        </p>
                                                    </div>
                                                </label>
                                            );
                                        }
                                    )}
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowGroupModal(
                                            false
                                        )
                                    }
                                    className="
                                        rounded-xl
                                        px-4
                                        py-2
                                        text-sm
                                        text-[var(--text-secondary)]
                                        hover:bg-[var(--surface-hover)]
                                    "
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        handleCreateGroup
                                    }
                                    disabled={
                                        !groupName.trim() ||
                                        selectedMembers.length ===
                                        0
                                    }
                                    className="
                                        rounded-xl
                                        bg-indigo-500
                                        px-4
                                        py-2
                                        text-sm
                                        font-medium
                                        text-white
                                        hover:bg-indigo-600
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                >
                                    Create group
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}