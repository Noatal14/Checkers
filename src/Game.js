import React from 'react';
import Board from './Board';

const BOARD_ROWS = 8;
const BOARD_COLS = 8;

const initboard = () => {
  let board = [];
  for(let i = 0; i < BOARD_ROWS; i++) {
    board[i] = [];
    for(let j = 0; j < BOARD_COLS; j++) {
      let pieceToPush = null;

      // Black checker
      if(i % 2 === j % 2) {
        // White piece
        if(i <= 2) {
          pieceToPush = {pieceColor: 'white', winner: false, row: i, col: j};
        } else {
          // Black piece
          if(i >= 5) {
            pieceToPush = {pieceColor: 'black', winner: false, row: i, col: j};
          }
        }
      }
      board[i].push(pieceToPush);
    }
  }
  return board;
}

export default class Game extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      currentPlayer: 'black',
      activePiece: null,
      deadPiece: null,
      landingLocation: null,
      validMove: true,
      winner: null,
      boardState: initboard()
    }
  }

  handleClick(e) {
    if(this.state.winner !== null) {
      return;
    }

    let target = e.target;

    const regex = /\d+/g;
    const targetLocation = {row: Number(target.id.match(regex)[0]), col: Number(target.id.match(regex)[1])};

    // Chosen piece
    let piece = this.state.boardState[targetLocation.row][targetLocation.col];

    // Hasn't chose a piece yet
    if(this.state.activePiece === null) {
      // Can't choose an empty square
      if(piece !== null) {
        // Can't choose an opponent or winner piece
        if(!piece.winner && piece.pieceColor === this.state.currentPlayer) {
          this.setState({activePiece: piece, validMove: true});
        }
      }
    }

    // Already chose a piece and needs to land it
    else {
      const pieceLocation = {row: Number(this.state.activePiece.row), col: Number(this.state.activePiece.col)};
      const deadPiece = this.findDeadPiece(this.state.currentPlayer, pieceLocation, targetLocation);
      
      // Didn't eat
      if(deadPiece === null) {
        // If movement is valid
        if(this.isValidMovement(this.state.currentPlayer, pieceLocation, targetLocation)) {
          this.setState({landingLocation: targetLocation});
        } else {
          this.setState({activePiece: null, validMove: false});
        }
      } 
      
      // Eat
      else {
        this.setState({deadPiece: deadPiece, landingLocation: targetLocation});
      }
    }
  }

  // This function checkes if there is a kill. If true, returns the dead piece. Else, returns null.
  findDeadPiece(player, pieceLocation, landingLocation) {
    if(this.state.boardState[landingLocation.row][landingLocation.col] === null && Math.abs(pieceLocation.col - landingLocation.col) === 2 && Math.abs(pieceLocation.row - landingLocation.row) === 2) {
      // The location of the (maybe) dead piece
      const deadLocation = {row: (landingLocation.row + pieceLocation.row) / 2 ,col: (landingLocation.col + pieceLocation.col) / 2};
      const deadPiece = this.state.boardState[deadLocation.row][deadLocation.col];

      // If it's a legal kill
      if(deadPiece && deadPiece.pieceColor !== player && ((player === 'white' && deadLocation.row > pieceLocation.row) || (player === 'black' && deadLocation.row < pieceLocation.row))) {
        return deadPiece;
      }
    }
    return null;
  }

  // This function returns if movement is valid (assuming there is no kill)
  isValidMovement(player, pieceLocation, landingLocation) {
    if(this.state.boardState[landingLocation.row][landingLocation.col] === null && Math.abs(pieceLocation.col - landingLocation.col) === 1) {
      return ((player === 'white' && landingLocation.row === pieceLocation.row + 1) || (player === 'black' && landingLocation.row === pieceLocation.row - 1));
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Round is finished
    if(prevState.landingLocation !== this.state.landingLocation && this.state.landingLocation !== null) {
      this.finishRound();
    }
  }

  finishRound() {
    const prevLocation = {row: this.state.activePiece.row, col: this.state.activePiece.col};
    const nextLocation = {row: this.state.landingLocation.row, col: this.state.landingLocation.col};

    let isWinnerPiece = (this.state.currentPlayer === 'black' && nextLocation.row === 0) || (this.state.currentPlayer === 'white' && nextLocation.row === 7);

    if(isWinnerPiece) {
      // Check if the player has another winner piece
      this.state.boardState.forEach(row => {
        row.forEach(cell => {
          if(cell && cell.winner && cell.pieceColor === this.state.currentPlayer) {

            // Win
            this.setState({winner: this.state.currentPlayer});
          }
        })
      })
    }

    let newBoard = this.state.boardState;
    newBoard[prevLocation.row][prevLocation.col] = null;
    newBoard[nextLocation.row][nextLocation.col] = {...this.state.activePiece, winner: isWinnerPiece, row: nextLocation.row, col: nextLocation.col};
    
    if(this.state.deadPiece !== null) {
      newBoard[this.state.deadPiece.row][this.state.deadPiece.col] = null;
    }

    let newPlayer = this.state.currentPlayer === 'black' ? 'white' : 'black';

    // Update state
    this.setState({
      currentPlayer: newPlayer,
      activePiece: null,
      landingLocation: null,
      deadPiece: null,
      validMove: true,
      boardState: newBoard
    });
  }

  render() {
    return (
      <div id='app'>
        <div className='header'>
          <h1>{this.state.currentPlayer}'s turn</h1>
          <button disabled={!this.state.activePiece} onClick={e => this.setState({activePiece: null})}>Cancel</button>
        </div>

        <Board 
          onClick={e => this.handleClick(e)} 
          boardState={this.state.boardState} 
        />

        {!this.state.validMove && <h3 className='red-message'>Movement is not valid</h3>}

        {this.state.winner && <div id='win-message'><h1>congratulations!</h1><h2>{this.state.winner} player won the game</h2></div>}
      </div>
    )
  }
}
