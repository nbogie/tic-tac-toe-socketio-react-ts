import { useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ConnectionStatus, PlayerId } from "../types";
import { toast } from "react-toastify";
import { getTeamCharacterFor } from "../game";
import { TicTacToeGame } from "./TicTacToeGame";

function Lobby(): JSX.Element {
    const [connectionStatus, setConnectionStatus] =
        useState<ConnectionStatus>("disconnected");
    const [socket, setSocket] = useState<Socket>(null!);
    const [rooms, setRooms] = useState<RoomDict>({});
    const [roomId, setRoomId] = useState<string | null>(null);
    const [playerId, setPlayerId] = useState<PlayerId | null>(null);

    interface Room {
        id: string;
        players: PlayerId[];
    }

    interface RoomDict {
        [roomId: string]: Room;
    }

    const rxRoomsList = useCallback((roomsDict: RoomDict) => {
        setRooms(roomsDict);
    }, []);

    function rxNoSpaceInGame() {
        toast.error("no space in game");
    }

    const rxPlayerId = useCallback(
        (receivedPlayerId: PlayerId, receivedRoomId: string) => {
            console.log("got givePlayerId");
            setPlayerId(receivedPlayerId);
            setRoomId(receivedRoomId);
            document.title =
                "tictactoe " +
                receivedPlayerId +
                getTeamCharacterFor(receivedPlayerId);
        },
        []
    );

    useEffect(() => {
        console.log("making connection");
        const newSocket: Socket = io("http://localhost:4000");
        console.log("made connection");
        setSocket(newSocket);

        //register generic listeners
        newSocket.prependAnyOutgoing((...args) => {
            console.log("socketio outgoing: ", args);
        });
        newSocket.prependAny((...args) => {
            console.log("socketio incoming: ", args);
        });
        //register specific listeners
        newSocket.on("connect", () => {
            console.log("connected");
            setConnectionStatus("connected");
        });
        newSocket.on("disconnect", () => {
            console.log("disconnected");
            setConnectionStatus("disconnected");
        });
        newSocket.on("givePlayerId", rxPlayerId);
        newSocket.on("noSpaceInGame", rxNoSpaceInGame);
        newSocket.on("roomsList", rxRoomsList);

        newSocket.emit("listRooms");

        function cleanupSocketIO() {
            console.log(
                "disconnecting from socket.io server, deregistering listeners"
            );
            newSocket.removeAllListeners();
            newSocket.disconnect();
        }
        return cleanupSocketIO;
    }, [rxPlayerId, rxRoomsList]);

    function LobbyUI(): JSX.Element {
        return (
            <>
                <div>
                    Room list
                    {Object.entries(rooms).map(([roomId, room]) => (
                        <div key={roomId}>
                            <button
                                onClick={() => socket.emit("joinRoom", roomId)}
                                disabled={room.players.length === 2}
                            >
                                Room: {roomId}
                            </button>
                        </div>
                    ))}
                </div>
                <button onClick={() => socket.emit("createAndJoinRoom")}>
                    Create room
                </button>
                <button onClick={() => socket.emit("listRooms")}>
                    List rooms
                </button>
            </>
        );
    }
    const ready = playerId && roomId && socket;
    return (
        <div>
            {!ready ? (
                <LobbyUI />
            ) : (
                <TicTacToeGame
                    {...{ playerId, roomId, connectionStatus, socket }}
                />
            )}
        </div>
    );
}
export default Lobby;
