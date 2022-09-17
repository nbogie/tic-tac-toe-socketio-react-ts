import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { Socket } from "socket.io-client";
import {
    getTeamCharacterFor,
    getWinStatus,
    makeInitialGameState,
    textForContent,
} from "../game";
import { Cell, ConnectionStatus, GameState, PlayerId } from "../types";

interface TTTGameProps {
    socket: Socket;
    connectionStatus: ConnectionStatus;
    roomId: string;
    playerId: PlayerId;
}

export function TicTacToeGame({
    socket,
    connectionStatus,
    roomId,
    playerId,
}: TTTGameProps) {
    const [gameState, setGameState] = useState(makeInitialGameState());
    const winStatus = getWinStatus(gameState);

    function rxUpdate(receivedGameState: GameState) {
        console.log("got update", receivedGameState);
        setGameState(receivedGameState);
    }
    useEffect(() => {
        if (socket) {
            socket.on("update", rxUpdate);
        }
        function cleanup() {
            if (socket) {
                socket.removeListener("update", rxUpdate);
            }
        }
        return cleanup;
    }, [socket]);

    const isMyTurn = playerId === gameState.whoseTurn;

    function handleClickedCell(cell: Cell): void {
        if (!isMyTurn) {
            toast.error("not your turn!", { autoClose: 1000 });
            return;
        }
        if (winStatus.winStatus !== "incomplete") {
            return;
        }
        toast.success(
            `Sending cellClicked: room:${roomId}, cell:${cell.index}`,
            { autoClose: 1000 }
        );
        socket.emit("cellClicked", roomId, cell.index, gameState.whoseTurn);
    }

    function handleRestartClicked() {
        socket.emit("restartClicked");
    }

    function getTeamCharacter(): string | null {
        return playerId ? getTeamCharacterFor(playerId) : null;
    }

    return (
        <div className="ticTacToeGame">
            <div className="teamBackground">{getTeamCharacter() ?? "👀"}</div>
            <div className="connectionStatus">
                {connectionStatus === "connected" ? "🟢" : "🔴"}
            </div>

            {(winStatus.winStatus === "won" ||
                winStatus.winStatus === "draw") && (
                <>
                    <div>Game Over!</div>
                    {winStatus.winStatus === "draw"
                        ? "Draw"
                        : winStatus.winnerId === playerId
                        ? "You won!"
                        : "You lost!"}
                </>
            )}

            {winStatus.winStatus === "incomplete" && (
                <div className="whoseTurn">
                    {isMyTurn ? "It's your turn!" : "opponent's turn"}
                </div>
            )}
            <div className="whoAmI">You are {playerId}</div>

            <div className="gameBoard">
                {gameState.cells.map((c) => (
                    <div
                        className="cell"
                        key={c.index}
                        onClick={() => handleClickedCell(c)}
                    >
                        <div className="cellIndex">{c.index}</div>
                        <div className="cellStatus">
                            {textForContent(c.status)}
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={handleRestartClicked}>Restart!</button>
            <pre>{JSON.stringify(winStatus)}</pre>
        </div>
    );
}
