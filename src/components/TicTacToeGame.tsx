import React, { useCallback, useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import io, { Socket } from "socket.io-client"
import { getWinStatus, makeInitialGameState } from '../game';
import { Cell, CellStatus, GameState, PlayerId } from '../types';
type ConnectionStatus = "connected" | "disconnected";

export function TicTacToeGame() {

    const [gameState, setGameState] = useState(makeInitialGameState())
    const [playerId, setPlayerId] = useState<PlayerId | null>(null);
    const [socket, setSocket] = useState<Socket>(null!)
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected")

    const winStatus = getWinStatus(gameState);

    function rxUpdate(receivedGameState: GameState) {
        console.log("got update", receivedGameState)
        setGameState(receivedGameState)
    }

    function rxNoSpaceInGame() {
        toast.error("no space in game")
    }
    const getTeamCharacterFor = useCallback((id: PlayerId): string => {
        return textForContent(id === "p1" ? "X" : "O")
    }, []);

    const rxPlayerId = useCallback(
        (receivedPlayerId: PlayerId) => {
            console.log("got givePlayerId")
            setPlayerId(receivedPlayerId)
            document.title = "tictactoe " + receivedPlayerId + getTeamCharacterFor(receivedPlayerId)
        }, [getTeamCharacterFor]
    );

    useEffect(() => {
        console.log("making connection")
        const newSocket: Socket = io("http://localhost:4000");
        console.log("made connection")
        setSocket(newSocket)

        //register generic listeners
        newSocket.prependAnyOutgoing((...args) => { console.log("socketio outgoing: ", args) });
        newSocket.prependAny((...args) => { console.log("socketio incoming: ", args) });
        //register specific listeners
        newSocket.on("connect", () => { console.log("connected"); setConnectionStatus("connected") });
        newSocket.on("disconnect", () => { console.log("disconnected"); setConnectionStatus("disconnected") });
        newSocket.on("update", rxUpdate);
        newSocket.on("givePlayerId", rxPlayerId);
        newSocket.on("noSpaceInGame", rxNoSpaceInGame);

        newSocket.emit("join");

        function cleanupSocketIO() {
            console.log("disconnecting from socket.io server, deregistering listeners")
            newSocket.removeAllListeners()
            newSocket.disconnect();
        }
        return cleanupSocketIO
    }, [rxPlayerId])

    const isMyTurn = playerId === gameState.whoseTurn;

    function handleClickedCell(cell: Cell): void {
        if (!isMyTurn) {
            toast.error("not your turn!", { autoClose: 1000 })
            return;
        }
        if (winStatus.winStatus !== "incomplete") {
            return
        }
        console.log("cell was clicked: ", cell)
        toast.success("sent cellClicked: " + cell.index, { autoClose: 1000 })
        socket.emit("cellClicked", cell.index, gameState.whoseTurn)
    }

    function handleRestartClicked() {
        socket.emit("restartClicked");
    }

    function textForContent(st: CellStatus): string {
        if (st === "empty") {
            return " ";
        }
        if (st === "X") {
            return "🦄";
        }
        if (st === "O") {
            return "🍎";
        }
        throw new Error("should be unreachable by types but st was ", st);
    }

    function getTeamCharacter(): string | null {
        return playerId ? getTeamCharacterFor(playerId) : null
    }

    return <div className="ticTacToeGame">

        <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            pauseOnFocusLoss
            pauseOnHover
        />
        <div className="teamBackground">{getTeamCharacter() ?? "👀"}</div>
        <div className="connectionStatus">{connectionStatus === "connected" ? "🟢" : "🔴"}</div>


        {(winStatus.winStatus === "won" || winStatus.winStatus === "draw") &&
            <>
                <div>Game Over!</div>
                {winStatus.winStatus === "draw" ? "Draw" : (winStatus.winnerId === playerId ? "You won!" : "You lost!")}
            </>
        }

        {winStatus.winStatus === "incomplete" && (
            <div className="whoseTurn">{isMyTurn ? "It's your turn!" : "opponent's turn"}</div>
        )}
        <div className="whoAmI">You are {playerId}</div>

        <div className="gameBoard">
            {gameState.cells.map(c => (
                <div className="cell" key={c.index} onClick={() => handleClickedCell(c)}>
                    <div className="cellIndex">{c.index}</div>
                    <div className="cellStatus">{textForContent(c.status)}</div>
                </div>
            ))}
        </div>

        <button onClick={handleRestartClicked}>Restart!</button>
        <pre>{JSON.stringify(winStatus)}</pre>
    </div >
}


